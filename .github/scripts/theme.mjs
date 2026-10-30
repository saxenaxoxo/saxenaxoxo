// Shared look for every profile SVG: colours, fonts and small drawing helpers.

export const C = {
  bg: '#0d0d0d',
  surface: '#141414',
  bar: '#1b1b1b',
  card: '#262626',
  line: '#2a2a2a',
  text: '#F5F5F5',
  soft: '#C9C9C9',
  muted: '#9C9C9C',
  lime: '#C6FF3D',
  orange: '#ff9f6b',
  amber: '#ffb547',
  periwinkle: '#9999ff',
  blue: '#31a8ff',
  purple: '#d291ff',
  green: '#6fd3a0',
};

// System fonts only: an SVG shown as an <img> on GitHub cannot load web fonts.
export const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
export const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function svg({ w, h, title, desc, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<defs>
  <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
    <circle cx="12" cy="12" r="1.3" fill="#ffffff" fill-opacity="0.09"/>
  </pattern>
  <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.lime}" stop-opacity="0.16"/>
    <stop offset="1" stop-color="${C.lime}" stop-opacity="0"/>
  </radialGradient>
</defs>
${body}
</svg>
`;
}

// Dark rounded canvas with the dotted grid.
export const canvas = (w, h, fill = C.bg) =>
  `<rect width="${w}" height="${h}" rx="24" fill="${fill}"/>
<rect width="${w}" height="${h}" rx="24" fill="url(#dots)"/>
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="23.5" fill="none" stroke="${C.line}"/>`;

// Rough text width, used to size pills. Generous on purpose: fonts differ per OS.
export const textWidth = (s, size, k = 0.6) => s.length * size * k;

export function pill(x, y, label, { color = C.lime, filled = false, size = 15 } = {}) {
  const w = Math.round(textWidth(label, size, 0.66) + 30);
  const h = size + 17;
  return {
    w,
    svg: `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${filled ? color : 'none'}" stroke="${color}" stroke-opacity="${filled ? 1 : 0.55}"/>
  <text x="${x + w / 2}" y="${y + h / 2 + size * 0.36}" text-anchor="middle" font-family="${MONO}" font-size="${size}" font-weight="600" letter-spacing="1" fill="${filled ? C.bg : color}">${esc(label)}</text>
</g>`,
  };
}

export function pills(x, y, items, gap = 10) {
  let out = '';
  for (const it of items) {
    const p = pill(x, y, it.label, it);
    out += p.svg + '\n';
    x += p.w + gap;
  }
  return out;
}

// A small square app tile with a short glyph, like Pr or TS.
export function tile(x, y, size, glyph, color) {
  const fs = glyph.length > 2 ? size * 0.34 : size * 0.42;
  return `<g>
  <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.24}" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-opacity="0.6"/>
  <text x="${x + size / 2}" y="${y + size / 2 + fs * 0.36}" text-anchor="middle" font-family="${SANS}" font-size="${fs}" font-weight="700" fill="${color}">${esc(glyph)}</text>
</g>`;
}

// A wire between two points, drawn as a horizontal S-curve like a node editor.
export function wire(x1, y1, x2, y2, color = C.lime, opacity = 0.7) {
  const dx = Math.max(30, Math.abs(x2 - x1) * 0.5);
  return `<path d="M${x1} ${y1} C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="2"/>`;
}

export const port = (x, y, color = C.lime) =>
  `<circle cx="${x}" cy="${y}" r="6" fill="${C.surface}" stroke="${color}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="2.2" fill="${color}"/>`;

// A labelled node box, like a node in a compositing graph.
export function node(x, y, w, label, color = C.lime) {
  return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="34" rx="9" fill="${C.surface}" stroke="${color}" stroke-opacity="0.45"/>
  <circle cx="${x + 16}" cy="${y + 17}" r="4" fill="${color}"/>
  <text x="${x + 28}" y="${y + 22}" font-family="${MONO}" font-size="14" fill="${C.soft}">${esc(label)}</text>
</g>`;
}

export const arrow = (cx, cy, color = C.lime) =>
  `<g>
  <circle cx="${cx}" cy="${cy}" r="26" fill="none" stroke="${color}" stroke-opacity="0.6" stroke-width="2"/>
  <path d="M${cx - 8} ${cy + 8} L${cx + 8} ${cy - 8} M${cx - 5} ${cy - 8} H${cx + 8} V${cy + 5}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>`;
