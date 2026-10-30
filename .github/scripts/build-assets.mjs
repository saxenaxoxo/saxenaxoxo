// Builds the static profile artwork in assets/. Run: node .github/scripts/build-assets.mjs
// Edit the text here, not in the SVGs.

import { writeFileSync } from 'node:fs';
import { C, SANS, MONO, esc, svg, canvas, pills, tile, wire, port, node, arrow } from './theme.mjs';

const out = (name, s) => writeFileSync(new URL(`../../assets/${name}`, import.meta.url), s);

// ---------- header: an editing app window on a dotted canvas, wired to nodes ----------

function header() {
  const W = 1200, H = 420;
  const wx = 200, wy = 40, ww = 800, wh = 340, bar = 44;
  const tl = wx + 44, tr = wx + ww - 30; // timeline left and right

  // V1 clips and an A1 waveform under them
  const clips = [
    [tl, 200, C.lime], [tl + 206, 128, C.blue], [tl + 340, 196, C.lime], [tl + 542, tr - (tl + 542), C.purple],
  ].map(([x, w, c]) => `<rect x="${x}" y="300" width="${w - 6}" height="24" rx="5" fill="${c}" fill-opacity="${c === C.lime ? 0.85 : 0.55}"/>`).join('\n');

  let wave = '';
  for (let x = tl; x < tr; x += 5) {
    const t = (x - tl) / 22;
    const a = Math.abs(Math.sin(t) * 0.6 + Math.sin(t * 2.7) * 0.3 + Math.sin(t * 0.37) * 0.35);
    const h = Math.max(2, Math.min(20, a * 20));
    wave += `<rect x="${x}" y="${342 - h / 2}" width="3" height="${h.toFixed(1)}" rx="1.5" fill="${C.green}" fill-opacity="0.75"/>`;
  }

  let ticks = '';
  for (let x = tl, i = 0; x <= tr; x += 20, i++) {
    ticks += `<line x1="${x}" y1="${i % 5 ? 286 : 280}" x2="${x}" y2="290" stroke="${C.muted}" stroke-opacity="0.5"/>`;
  }
  const ph = tl + 410; // playhead

  const body = `${canvas(W, H)}
<circle cx="760" cy="150" r="380" fill="url(#glow)"/>

${wire(146, 128, wx, 312, C.lime)}
${wire(146, 300, wx, 342, C.green)}
${wire(wx + ww, 200, 1054, 270, C.lime)}
${node(36, 111, 110, 'footage', C.lime)}
${node(36, 283, 110, 'music', C.green)}
${node(1054, 253, 110, 'render', C.lime)}

<g>
  <rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="14" fill="${C.surface}"/>
  <path d="M${wx} ${wy + bar} V${wy + 14} Q${wx} ${wy} ${wx + 14} ${wy} H${wx + ww - 14} Q${wx + ww} ${wy} ${wx + ww} ${wy + 14} V${wy + bar} Z" fill="${C.bar}"/>
  <line x1="${wx}" y1="${wy + bar}" x2="${wx + ww}" y2="${wy + bar}" stroke="${C.line}"/>
  <rect x="${wx + 0.5}" y="${wy + 0.5}" width="${ww - 1}" height="${wh - 1}" rx="13.5" fill="none" stroke="${C.card}"/>
  <circle cx="${wx + 24}" cy="${wy + 22}" r="5.5" fill="#3a3a3a"/>
  <circle cx="${wx + 42}" cy="${wy + 22}" r="5.5" fill="#3a3a3a"/>
  <circle cx="${wx + 60}" cy="${wy + 22}" r="5.5" fill="#3a3a3a"/>
  <text x="${wx + 92}" y="${wy + 28}" font-family="${SANS}" font-size="16" font-weight="600" fill="${C.text}">Timeline: aryan-saxena</text>
  <rect x="${wx + 92}" y="${wy + bar - 3}" width="186" height="3" rx="1.5" fill="${C.lime}"/>
  <text x="${wx + 302}" y="${wy + 28}" font-family="${SANS}" font-size="16" fill="${C.muted}">Effects</text>
  <text x="${wx + ww - 24}" y="${wy + 28}" text-anchor="end" font-family="${MONO}" font-size="16" fill="${C.lime}">01:00:00:00 <tspan fill="${C.muted}">· 25 fps</tspan></text>

  <text x="${wx + 40}" y="166" font-family="${SANS}" font-size="76" font-weight="700" letter-spacing="-1.5" fill="${C.text}">Aryan Saxena</text>
  <text x="${wx + 42}" y="212" font-family="${SANS}" font-size="26" fill="${C.soft}">Senior video editor, Bengaluru.</text>
  <text x="${wx + 42}" y="246" font-family="${SANS}" font-size="26" fill="${C.soft}">Trying to solve editing problems by <tspan fill="${C.lime}" font-weight="600">vibe coding</tspan>.</text>

  ${ticks}
  <text x="${tl - 30}" y="318" font-family="${MONO}" font-size="11" fill="${C.muted}">V1</text>
  <text x="${tl - 30}" y="346" font-family="${MONO}" font-size="11" fill="${C.muted}">A1</text>
  ${clips}
  ${wave}
  <line x1="${ph}" y1="282" x2="${ph}" y2="360" stroke="${C.lime}" stroke-width="2"/>
  <path d="M${ph - 7} 274 H${ph + 7} V281 L${ph} 287 L${ph - 7} 281 Z" fill="${C.lime}"/>
</g>
${port(wx, 312, C.lime)}
${port(wx, 342, C.green)}
${port(wx + ww, 200, C.lime)}`;

  return svg({
    w: W, h: H,
    title: 'Aryan Saxena',
    desc: 'Senior video editor, Bengaluru. Trying to solve editing problems by vibe coding. Drawn as an editing app timeline on a dotted canvas, wired to footage, music and render nodes.',
    body,
  });
}

// ---------- featured tool cards ----------

const ASSET_LIBRARY_ICON = (x, y, s) => `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="100 100 824 824">
  <rect x="100" y="100" width="824" height="824" rx="185" fill="#17181A"/>
  <rect x="100.5" y="100.5" width="823" height="823" rx="184.5" fill="none" stroke="#FFFFFF" stroke-opacity="0.08"/>
  <g transform="translate(232 232) scale(8.75)">
    <rect x="7" y="28" width="7" height="26" rx="3.5" fill="#EEFFC2"/>
    <rect x="17" y="14" width="7" height="40" rx="3.5" fill="#DDFF8A"/>
    <rect x="27" y="22" width="7" height="32" rx="3.5" fill="#FFFFFF"/>
    <rect x="37" y="9" width="7" height="45" rx="3.5" fill="#C6FF3D"/>
    <rect x="47" y="30" width="7" height="24" rx="3.5" fill="#A3DB1F" transform="rotate(16 47 54)"/>
  </g>
</svg>`;

// Code brackets wired into stacked layer bars: HTML in, After Effects layers out.
const ARTIFACT_BRIDGE_ICON = (x, y, s) => `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 100 100">
  <rect x="0" y="0" width="100" height="100" rx="22" fill="#17181A"/>
  <rect x="0.5" y="0.5" width="99" height="99" rx="21.5" fill="none" stroke="#FFFFFF" stroke-opacity="0.08"/>
  <path d="M27 36 L17 50 L27 64" fill="none" stroke="${C.periwinkle}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M40 50 C50 50 50 34 60 34 M40 50 H60 M40 50 C50 50 50 66 60 66" fill="none" stroke="${C.lime}" stroke-opacity="0.8" stroke-width="2.5"/>
  <circle cx="40" cy="50" r="4" fill="${C.lime}"/>
  <rect x="60" y="29" width="24" height="10" rx="3" fill="${C.purple}"/>
  <rect x="60" y="45" width="24" height="10" rx="3" fill="${C.purple}" fill-opacity="0.7"/>
  <rect x="60" y="61" width="24" height="10" rx="3" fill="${C.purple}" fill-opacity="0.45"/>
</svg>`;

function card({ W, H, icon, iconSize, badges, name, pitch, lines, tech, glow }) {
  const ix = 48, iy = (H - iconSize) / 2, tx = ix + iconSize + 44;
  const techRow = tech.map((t, i) => t).reduce(
    (acc, t) => {
      let s = '';
      if (t.glyph) {
        s += tile(acc.x, acc.y - 3, 38, t.glyph, t.color);
        s += `<text x="${acc.x + 48}" y="${acc.y + 22}" font-family="${SANS}" font-size="19" font-weight="600" fill="${C.text}">${esc(t.label)}</text>`;
        acc.x += 48 + t.label.length * 10.5 + 18;
      } else {
        const w = t.label.length * 11 + 30;
        s += `<rect x="${acc.x}" y="${acc.y - 1}" width="${w}" height="34" rx="9" fill="${C.card}"/>`;
        s += `<text x="${acc.x + w / 2}" y="${acc.y + 22}" text-anchor="middle" font-family="${SANS}" font-size="18" fill="${C.soft}">${esc(t.label)}</text>`;
        acc.x += w + 10;
      }
      acc.s += s;
      return acc;
    },
    { x: tx, y: H - 74, s: '' },
  ).s;

  const body = `${canvas(W, H, C.surface)}
${glow ? `<circle cx="${ix + iconSize / 2}" cy="${H / 2}" r="230" fill="url(#glow)"/>` : ''}
${icon(ix, iy, iconSize)}
${pills(tx, 40, badges)}
<text x="${tx}" y="${H > 300 ? 138 : 128}" font-family="${SANS}" font-size="52" font-weight="700" letter-spacing="-1" fill="${C.text}">${esc(name)}</text>
<text x="${tx}" y="${H > 300 ? 182 : 170}" font-family="${SANS}" font-size="27" font-weight="600" fill="${C.lime}">${esc(pitch)}</text>
${lines.map((l, i) => `<text x="${tx}" y="${(H > 300 ? 220 : 206) + i * 30}" font-family="${SANS}" font-size="21" fill="${C.muted}">${esc(l)}</text>`).join('\n')}
${techRow}
${arrow(W - 62, 62)}`;
  return body;
}

function assetLibrary() {
  const W = 1200, H = 340;
  return svg({
    w: W, h: H,
    title: 'Asset Library',
    desc: 'Flagship tool. Free and open source, MIT license. Every asset you own, one search away: a Premiere Pro panel to search, preview and place your own footage, music, sound effects and images. Built with TypeScript and Electron, for macOS.',
    body: card({
      W, H, glow: true,
      icon: ASSET_LIBRARY_ICON, iconSize: 190,
      badges: [{ label: 'FLAGSHIP', filled: true }, { label: 'FREE AND OPEN SOURCE' }, { label: 'MIT LICENSE' }],
      name: 'Asset Library',
      pitch: 'Every asset you own, one search away.',
      lines: ['Search, preview and place your own footage, music,', 'sound effects and images inside Premiere Pro.'],
      tech: [{ glyph: 'Pr', color: C.periwinkle, label: 'Premiere Pro' }, { label: 'TypeScript' }, { label: 'Electron' }, { label: 'macOS' }],
    }),
  });
}

function artifactBridge() {
  const W = 1200, H = 340;
  return svg({
    w: W, h: H,
    title: 'Artifact Bridge',
    desc: 'Open source, MIT license, not in active development. Turns Claude artifacts and other HTML designs into native, editable After Effects compositions with real text layers, shape layers and keyframes. Node.js and ExtendScript.',
    body: card({
      W, H, glow: false,
      icon: ARTIFACT_BRIDGE_ICON, iconSize: 190,
      badges: [{ label: 'OPEN SOURCE' }, { label: 'MIT LICENSE' }, { label: 'NOT IN ACTIVE DEVELOPMENT', color: C.amber }],
      name: 'Artifact Bridge',
      pitch: 'HTML designs in, editable After Effects comps out.',
      lines: ['Turns Claude artifacts into real text layers, shape layers', 'and keyframes, not a video. Shared as is.'],
      tech: [{ glyph: 'Ae', color: C.purple, label: 'After Effects' }, { label: 'Node.js' }, { label: 'ExtendScript' }],
    }),
  });
}

// ---------- toolbox ----------

function stack() {
  const W = 1200;
  const groups = [
    { label: 'EDITING AND MOTION', items: [['Pr', 'Premiere Pro', C.periwinkle], ['Ae', 'After Effects', C.purple], ['Ps', 'Photoshop', C.blue]] },
    { label: 'CODE AND AUTOMATION', items: [
      ['TS', 'TypeScript', C.blue], ['JS', 'JavaScript', C.amber], ['Nd', 'Node.js', C.green],
      ['El', 'Electron', C.periwinkle], ['As', 'Astro', C.orange], ['Jsx', 'ExtendScript', C.purple],
    ] },
  ];
  const colW = 369, x0 = 56, rowH = 84;
  let y = 64, s = '';
  for (const g of groups) {
    s += `<text x="${x0}" y="${y}" font-family="${MONO}" font-size="16" font-weight="600" letter-spacing="2" fill="${C.lime}">${g.label}</text>\n`;
    s += `<line x1="${x0 + g.label.length * 11.5}" y1="${y - 6}" x2="${W - 56}" y2="${y - 6}" stroke="${C.line}"/>\n`;
    y += 22;
    g.items.forEach(([glyph, label, color], i) => {
      const cx = x0 + (i % 3) * colW, cy = y + Math.floor(i / 3) * rowH;
      s += `<rect x="${cx}" y="${cy}" width="${colW - 20}" height="66" rx="14" fill="${C.card}" fill-opacity="0.6"/>\n`;
      s += tile(cx + 12, cy + 11, 44, glyph, color) + '\n';
      s += `<text x="${cx + 72}" y="${cy + 42}" font-family="${SANS}" font-size="25" font-weight="600" fill="${C.text}">${esc(label)}</text>\n`;
    });
    y += Math.ceil(g.items.length / 3) * rowH + 44;
  }
  const H = y - 18;
  return svg({
    w: W, h: H,
    title: 'Toolbox',
    desc: 'Editing and motion: Premiere Pro, After Effects, Photoshop. Code and automation: TypeScript, JavaScript, Node.js, Electron, Astro, ExtendScript.',
    body: `${canvas(W, H, C.surface)}\n${s}`,
  });
}

// ---------- footer ----------

function footer() {
  const W = 1200, H = 220;
  const body = `${canvas(W, H)}
<circle cx="980" cy="110" r="260" fill="url(#glow)"/>
<text x="64" y="98" font-family="${SANS}" font-size="44" font-weight="700" letter-spacing="-0.5" fill="${C.text}">Building free tools for editors</text>
<text x="64" y="152" font-family="${SANS}" font-size="44" font-weight="700" letter-spacing="-0.5" fill="${C.text}">at <tspan fill="${C.lime}">saxenascreation.in</tspan></text>
${wire(760, 132, 880, 70, C.lime, 0.6)}
${wire(760, 132, 880, 160, C.green, 0.6)}
${port(760, 132)}
${node(880, 53, 150, 'idea', C.lime)}
${node(880, 143, 150, 'free tool', C.green)}
${arrow(W - 82, H / 2)}`;
  return svg({
    w: W, h: H,
    title: 'Building free tools for editors at saxenascreation.in',
    desc: 'Footer card linking to saxenascreation.in, where Aryan builds free tools for editors.',
    body,
  });
}

out('header.svg', header());
out('card-asset-library.svg', assetLibrary());
out('card-artifact-bridge.svg', artifactBridge());
out('stack.svg', stack());
out('footer.svg', footer());
console.log('assets written');
