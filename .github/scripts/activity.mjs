// Builds activity.svg from public GitHub activity only: contributions in public repos,
// public repo count, stars on public repos, top languages of public repos.
// Private repos are dropped by their isPrivate flag, whatever token runs this.
// Usage: GITHUB_TOKEN=... node .github/scripts/activity.mjs <out-dir>

import { mkdirSync, writeFileSync } from 'node:fs';
import { C, SANS, MONO, esc, svg, canvas } from './theme.mjs';

const LOGIN = process.env.PROFILE_LOGIN || 'saxenaxoxo';
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = process.argv[2] || 'out';
if (!TOKEN) throw new Error('GITHUB_TOKEN is not set');

async function gql(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': LOGIN },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors || json));
  return json.data;
}

// ---------- contributions (public repos only) ----------

const day = (iso) => iso.slice(0, 10);
const perDay = new Map();
const add = (iso, n = 1) => perDay.set(day(iso), (perDay.get(day(iso)) || 0) + n);

// Commits: one node per repo per day, paged per repo.
const COMMITS = `query($login:String!, $after:String) { user(login:$login) { contributionsCollection {
  commitContributionsByRepository(maxRepositories: 100) {
    repository { nameWithOwner isPrivate }
    contributions(first: 100, after: $after) { pageInfo { hasNextPage endCursor } nodes { occurredAt commitCount } }
  } } } }`;

const first = (await gql(COMMITS, { login: LOGIN })).user.contributionsCollection.commitContributionsByRepository;
for (let i = 0; i < first.length; i++) {
  let entry = first[i];
  if (entry.repository.isPrivate) continue;
  for (;;) {
    for (const n of entry.contributions.nodes) add(n.occurredAt, n.commitCount);
    if (!entry.contributions.pageInfo.hasNextPage) break;
    const next = await gql(COMMITS, { login: LOGIN, after: entry.contributions.pageInfo.endCursor });
    entry = next.user.contributionsCollection.commitContributionsByRepository
      .find((e) => e.repository.nameWithOwner === entry.repository.nameWithOwner);
    if (!entry) break;
  }
}

// Issues, pull requests, reviews and new repositories: one node each.
const KINDS = {
  issueContributions: 'issue { repository { isPrivate } }',
  pullRequestContributions: 'pullRequest { repository { isPrivate } }',
  pullRequestReviewContributions: 'pullRequestReview { repository { isPrivate } }',
  repositoryContributions: 'repository { isPrivate }',
};
for (const [kind, sel] of Object.entries(KINDS)) {
  let after = null;
  for (;;) {
    const q = `query($login:String!, $after:String) { user(login:$login) { contributionsCollection {
      ${kind}(first: 100, after: $after) { pageInfo { hasNextPage endCursor } nodes { occurredAt ${sel} } } } } }`;
    const conn = (await gql(q, { login: LOGIN, after })).user.contributionsCollection[kind];
    for (const n of conn.nodes) {
      const repo = n.repository || n.issue?.repository || n.pullRequest?.repository || n.pullRequestReview?.repository;
      if (repo && !repo.isPrivate) add(n.occurredAt);
    }
    if (!conn.pageInfo.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
}

// ---------- repos, stars, languages ----------

const repoData = (await gql(`query($login:String!) { user(login:$login) {
  all: repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
  own: repositories(first: 100, privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false) { nodes {
    name stargazerCount
    languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name } } }
  } } } }`, { login: LOGIN })).user;

const stars = repoData.own.nodes.reduce((s, r) => s + r.stargazerCount, 0);
const langBytes = new Map();
for (const r of repoData.own.nodes) {
  if (r.name === LOGIN) continue; // this profile repo's own scripts are not a project
  for (const e of r.languages.edges) langBytes.set(e.node.name, (langBytes.get(e.node.name) || 0) + e.size);
}
const totalBytes = [...langBytes.values()].reduce((a, b) => a + b, 0) || 1;
const languages = [...langBytes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
  .map(([name, bytes]) => ({ name, pct: Math.round((bytes / totalBytes) * 100) }));

// ---------- weekly buckets over the last 52 weeks ----------

const today = new Date();
const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
start.setUTCDate(start.getUTCDate() - start.getUTCDay() - 51 * 7); // a Sunday, 52 weeks back
const weeks = Array.from({ length: 52 }, (_, i) => {
  const d = new Date(start); d.setUTCDate(d.getUTCDate() + i * 7);
  return { start: d.toISOString().slice(0, 10), count: 0 };
});
let contributions = 0;
for (const [d, n] of perDay) {
  contributions += n;
  const i = Math.floor((Date.parse(d) - start.getTime()) / (7 * 864e5));
  if (i >= 0 && i < 52) weeks[i].count += n;
}
const best = weeks.reduce((a, w) => (w.count > a.count ? w : a), weeks[0]);

const stats = { contributions, publicRepos: repoData.all.totalCount, stars, bestWeek: best.count, bestWeekStart: best.start, languages, weeks: weeks.map((w) => w.count) };

// ---------- draw ----------

const fmtDate = (d, opts) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', ...opts }).format(d);
const asOf = fmtDate(today, { day: 'numeric', month: 'short', year: 'numeric' });
const bestLabel = best.count ? `week of ${fmtDate(new Date(best.start + 'T12:00:00Z'), { day: 'numeric', month: 'short' })}` : 'no activity yet';

const W = 1200, H = 490;
const figures = [
  [contributions.toLocaleString('en-US'), 'public contributions'],
  [String(stats.publicRepos), 'public repos'],
  [String(stars), stars === 1 ? 'star earned' : 'stars earned'],
  [String(best.count), `best week, ${bestLabel}`],
];
const colW = (W - 112) / 4;
let fig = '';
figures.forEach(([n, label], i) => {
  const x = 56 + i * colW;
  fig += `<text x="${x}" y="176" font-family="${SANS}" font-size="64" font-weight="700" letter-spacing="-1" fill="${i === 0 ? C.lime : C.text}">${esc(n)}</text>
<text x="${x}" y="210" font-family="${SANS}" font-size="19" fill="${C.muted}">${esc(label)}</text>\n`;
});

const cx = 56, cw = W - 112, base = 376, ch = 100, bw = cw / 52;
const max = Math.max(1, ...stats.weeks);
let bars = `<line x1="${cx}" y1="${base + 0.5}" x2="${cx + cw}" y2="${base + 0.5}" stroke="${C.line}"/>\n`;
stats.weeks.forEach((n, i) => {
  const h = n ? Math.max(4, (n / max) * ch) : 2;
  const isBest = n && n === best.count && weeks[i].start === best.start;
  bars += `<rect x="${(cx + i * bw + 2).toFixed(1)}" y="${(base - h).toFixed(1)}" width="${(bw - 4).toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${n ? C.lime : C.card}" fill-opacity="${isBest ? 1 : n ? 0.55 : 1}"/>\n`;
});

const LANG_COLORS = [C.lime, C.blue, C.amber, C.purple];
let lx = 56, langs = `<text x="${lx}" y="${H - 44}" font-family="${MONO}" font-size="15" letter-spacing="1.5" fill="${C.muted}">LANGUAGES</text>\n`;
lx += 130;
languages.forEach((l, i) => {
  const label = `${l.name} ${l.pct}%`;
  langs += `<circle cx="${lx + 6}" cy="${H - 49}" r="6" fill="${LANG_COLORS[i]}"/>
<text x="${lx + 20}" y="${H - 43}" font-family="${SANS}" font-size="19" fill="${C.soft}">${esc(label)}</text>\n`;
  lx += 20 + label.length * 10.5 + 34;
});

const body = `${canvas(W, H, C.surface)}
<text x="56" y="70" font-family="${SANS}" font-size="30" font-weight="700" fill="${C.text}">GitHub activity, last 12 months</text>
<text x="${W - 56}" y="70" text-anchor="end" font-family="${MONO}" font-size="16" fill="${C.muted}">as of ${esc(asOf)} · public repos only</text>
${fig}
<text x="56" y="${base - ch - 20}" font-family="${MONO}" font-size="14" letter-spacing="1.5" fill="${C.muted}">CONTRIBUTIONS PER WEEK</text>
${bars}
${langs}`;

const activity = svg({
  w: W, h: H,
  title: 'GitHub activity, last 12 months',
  desc: `As of ${asOf}, public repos only: ${contributions} contributions, ${stats.publicRepos} public repos, ${stars} stars earned, best week ${best.count} contributions (${bestLabel}). Top languages: ${languages.map((l) => `${l.name} ${l.pct}%`).join(', ')}.`,
  body,
});

mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/activity.svg`, activity);
// The date is left out so an unchanged day can be skipped.
writeFileSync(`${OUT}/stats.json`, JSON.stringify(stats, null, 2) + '\n');
console.log(JSON.stringify({ ...stats, weeks: undefined }));
