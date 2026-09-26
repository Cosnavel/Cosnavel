import { colors, stops } from '../lib/palette.mjs';
import { document } from '../lib/svg.mjs';

const WIDTH = 1200;
const HEIGHT = 24;
const MIDDLE = WIDTH / 2;

export function divider() {
  const defs = `
<linearGradient id="line" x1="0" y1="0" x2="1" y2="0">${stops([[0, colors.goldDark, 0], [0.5, colors.gold, 0.9], [1, colors.goldDark, 0]])}</linearGradient>
<radialGradient id="glint">${stops([[0, colors.goldLight], [1, colors.goldLight, 0]])}</radialGradient>`;

  const body = `<rect y="11.5" width="${WIDTH}" height="1" fill="url(#line)"/>
<path d="M${MIDDLE} 4l8 8l-8 8l-8-8Z" stroke="${colors.gold}" stroke-opacity="0.7"/>
<path d="M${MIDDLE} 8.5l3.5 3.5l-3.5 3.5l-3.5-3.5Z" fill="${colors.goldLight}"/>
<circle cx="0" cy="12" r="10" fill="url(#glint)" opacity="0">
<animate attributeName="cx" values="120;${WIDTH - 120}" dur="7s" repeatCount="indefinite"/>
<animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.2;0.8;1" dur="7s" repeatCount="indefinite"/>
</circle>`;

  return document({
    width: WIDTH,
    height: HEIGHT,
    title: 'Divider',
    description: 'A thin gold line',
    defs,
    body,
  });
}
