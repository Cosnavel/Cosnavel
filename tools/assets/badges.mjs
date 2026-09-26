import fs from 'node:fs';
import { measure, textPath } from '../lib/fonts.mjs';
import { colors, goldStops, stops } from '../lib/palette.mjs';
import { document, round, roundedRect, shine } from '../lib/svg.mjs';

const HEIGHT = 36;
const ICON = 16;
const TEXT_SIZE = 12.5;
const TRACKING = 0.14;

// 24x24 Simple Icons glyphs stored in ../icons.
function glyph(name) {
  const svg = fs.readFileSync(new URL(`../icons/${name}.svg`, import.meta.url), 'utf8');
  return svg.match(/<path d="([^"]+)"/)[1];
}

function icon(name, logo, x, fill) {
  const y = (HEIGHT - ICON) / 2;

  if (name === 'kettner') {
    const scale = round((ICON + 3) / logo.emblem.height, 4);
    return `<g transform="translate(${x - 1} ${y - 1.5}) scale(${scale})">${logo.emblem.markup}</g>`;
  }

  return `<path d="${glyph(name)}" transform="translate(${x} ${y}) scale(${ICON / 24})" fill="${fill}"/>`;
}

function badge({ fonts, logo }, { label, iconName, filled = false }) {
  const left = 14;
  const textX = left + ICON + 10;
  const width = round(textX + measure(fonts.label, label, TEXT_SIZE, TRACKING) + 18);
  const text = textPath(fonts.label, label, { x: textX, y: HEIGHT / 2 + 4.6, size: TEXT_SIZE, tracking: TRACKING });
  const shape = roundedRect(1, 1, width - 2, HEIGHT - 2, (HEIGHT - 2) / 2);

  const defs = `${iconName === 'kettner' ? logo.defs : ''}
<linearGradient id="badge-gold" x1="0" y1="0" x2="1" y2="1">${stops(goldStops)}</linearGradient>
${filled ? shine({ id: 'badge-shine', width, band: 60, duration: 5, delay: 1.5, opacity: 0.7 }) : ''}`;

  const body = `<path d="${shape}" fill="${filled ? 'url(#badge-gold)' : colors.ink}" stroke="${filled ? colors.goldLight : colors.gold}" stroke-opacity="${filled ? 0.9 : 0.55}"/>
${filled ? `<path d="${shape}" fill="url(#badge-shine)"/>` : ''}
${icon(iconName, logo, left, filled ? colors.ink : colors.gold)}
<path d="${text.d}" fill="${filled ? colors.ink : colors.goldPale}"/>`;

  return document({ width, height: HEIGHT, title: label, description: label, defs, body });
}

export function badges(context) {
  return {
    'badge-linkedin.svg': badge(context, { label: 'LINKEDIN', iconName: 'linkedin' }),
    'badge-x.svg': badge(context, { label: '@NICLASKAHLMEIER', iconName: 'x' }),
    'badge-kettner.svg': badge(context, { label: 'KETTNER-EDELMETALLE.DE', iconName: 'kettner' }),
    'badge-talk.svg': badge(context, { label: "LET'S TALK", iconName: 'linkedin', filled: true }),
    'badge-cursor.svg': badge(context, { label: 'CURSOR', iconName: 'cursor' }),
    'badge-claude.svg': badge(context, { label: 'CLAUDE', iconName: 'claude' }),
  };
}
