import { colors, stops } from './palette.mjs';

export const round = (value, decimals = 1) => Number(value.toFixed(decimals));

export function random(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const escapeXml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function document({ width, height, title, description, style = '', defs = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="title desc">
<title id="title">${escapeXml(title)}</title>
<desc id="desc">${escapeXml(description)}</desc>
${style ? `<style>${style}</style>\n` : ''}<defs>${defs}</defs>
${body}
</svg>
`;
}

export function roundedRect(x, y, width, height, r) {
  const right = x + width;
  const bottom = y + height;
  return `M${x + r} ${y}H${right - r}A${r} ${r} 0 0 1 ${right} ${y + r}V${bottom - r}A${r} ${r} 0 0 1 ${right - r} ${bottom}H${x + r}A${r} ${r} 0 0 1 ${x} ${bottom - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
}

/**
 * The shared "black card" look: dark metal surface, warm glows, a brushed
 * texture, a gold hairline and a light that keeps running around the edge.
 * The card stays dark in GitHub's light theme on purpose (black & gold).
 */
export function blackCard({ width, height, radius = 28, glows = [], runnerDuration = 10 }) {
  const inset = 4;
  const shape = roundedRect(inset, inset, width - inset * 2, height - inset * 2, radius);

  const runner = (strokeWidth, opacity, filter = '') => `
<path d="${shape}" stroke="${colors.goldLight}" stroke-width="${strokeWidth}" stroke-linecap="round" pathLength="1000" stroke-dasharray="70 930" opacity="${opacity}"${filter}>
<animate attributeName="stroke-dashoffset" values="1000;0" dur="${runnerDuration}s" repeatCount="indefinite"/>
</path>`;

  return {
    clip: 'url(#card-clip)',
    defs: `
<clipPath id="card-clip"><path d="${shape}"/></clipPath>
<linearGradient id="card-fill" x1="0" y1="0" x2="0" y2="1">${stops([[0, '#131315'], [1, '#08080A']])}</linearGradient>
<linearGradient id="card-border" x1="0" y1="0" x2="1" y2="1">${stops([[0, colors.goldDark, 0.7], [0.5, colors.goldLight, 0.5], [1, colors.goldDark, 0.7]])}</linearGradient>
<pattern id="card-brush" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(32)"><path d="M0 0V6" stroke="#FFFFFF" stroke-opacity="0.025"/></pattern>
<filter id="card-blur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.5"/></filter>
${glows.map((glow, i) => `<radialGradient id="card-glow-${i}">${stops([[0, colors.gold, glow.opacity], [1, colors.gold, 0]])}</radialGradient>`).join('')}`,
    back: `
<path d="${shape}" fill="url(#card-fill)"/>
<g clip-path="url(#card-clip)">
${glows.map((glow, i) => `<circle cx="${glow.x}" cy="${glow.y}" r="${glow.r}" fill="url(#card-glow-${i})"/>`).join('\n')}
<rect width="${width}" height="${height}" fill="url(#card-brush)"/>
</g>`,
    front: `
<path d="${shape}" stroke="url(#card-border)" stroke-width="1.5"/>${runner(5, 0.4, ' filter="url(#card-blur)"')}${runner(1.6, 0.9)}`,
  };
}

/**
 * A bright band that sweeps from left to right and then rests. `origin`/`scale`
 * describe the coordinate system of the element using it, so several elements
 * inside differently transformed groups can share one continuous sweep.
 */
export function shine({ id, width, band = 240, duration = 8, delay = 0, opacity = 0.6, origin = 0, scale = 1 }) {
  const local = (x) => round((x - origin) / scale, 2);
  const distance = round((width + band * 2) / scale, 2);

  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${local(-band)}" y1="0" x2="${local(0)}" y2="${round(band / scale / 3, 2)}">
${stops([[0, '#FFFFFF', 0], [0.5, '#FFFFFF', opacity], [1, '#FFFFFF', 0]])}
<animateTransform attributeName="gradientTransform" type="translate" values="0 0;${distance} 0;${distance} 0" keyTimes="0;0.5;1" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
</linearGradient>`;
}

export function particles({ count, width, height, seed = 7, color = colors.goldLight }) {
  const next = random(seed);

  return Array.from({ length: count }, () => {
    const x = round(next() * width);
    const r = round(0.7 + next() * 1.5, 2);
    const duration = round(10 + next() * 12);
    const begin = round(-next() * duration);
    const drift = round((next() - 0.5) * 70);
    const timing = `dur="${duration}s" begin="${begin}s" repeatCount="indefinite"`;

    return `<circle cx="${x}" cy="${height + 10}" r="${r}" fill="${color}" opacity="0">
<animate attributeName="cy" values="${height + 10};-10" ${timing}/>
<animate attributeName="cx" values="${x};${round(x + drift)}" ${timing}/>
<animate attributeName="opacity" values="0;0.9;0.5;0" keyTimes="0;0.25;0.75;1" ${timing}/>
</circle>`;
  }).join('\n');
}
