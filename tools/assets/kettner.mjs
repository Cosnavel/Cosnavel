import { textPath } from '../lib/fonts.mjs';
import { silhouette } from '../lib/logo.mjs';
import { colors } from '../lib/palette.mjs';
import { blackCard, document, particles, round, shine } from '../lib/svg.mjs';

const WIDTH = 1200;
const HEIGHT = 300;
const LOGO_WIDTH = 540;

export function kettner({ fonts, logo }) {
  const card = blackCard({
    width: WIDTH,
    height: HEIGHT,
    glows: [{ x: WIDTH / 2, y: 130, r: 520, opacity: 0.12 }],
    runnerDuration: 12,
  });

  const scale = LOGO_WIDTH / logo.width;
  const origin = { x: round((WIDTH - LOGO_WIDTH) / 2), y: 44 };

  const tagline = textPath(fonts.label, 'E-COMMERCE  ×  LIVESTREAM SELLING  ×  GOLD SAVINGS PLANS', {
    x: WIDTH / 2,
    y: 262,
    size: 14,
    tracking: 0.26,
    anchor: 'middle',
  });

  const defs = `${card.defs}
${logo.defs}
${shine({ id: 'shine-logo', width: WIDTH, duration: 9, delay: 0.8, opacity: 0.55, origin: origin.x, scale })}`;

  const body = `${card.back}
<g clip-path="${card.clip}">
${particles({ count: 14, width: WIDTH, height: HEIGHT, seed: 23 })}
</g>
<g transform="translate(${origin.x} ${origin.y}) scale(${round(scale, 4)})">
${logo.markup}
${silhouette(logo.shapes, 'url(#shine-logo)')}
</g>
<path d="${tagline.d}" fill="${colors.silver}" fill-opacity="0.8"/>
${card.front}`;

  return document({
    width: WIDTH,
    height: HEIGHT,
    title: 'Kettner Edelmetalle',
    description: 'Logo of Kettner Edelmetalle, precious metals since 2011: e-commerce, livestream selling and gold savings plans.',
    defs,
    body,
  });
}
