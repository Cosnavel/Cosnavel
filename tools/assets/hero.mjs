import { fitSize, textPath } from '../lib/fonts.mjs';
import { silhouette } from '../lib/logo.mjs';
import { colors, goldStops, silverStops, stops } from '../lib/palette.mjs';
import { blackCard, document, particles, random, round, shine } from '../lib/svg.mjs';

const WIDTH = 1200;
const HEIGHT = 440;
const LEFT = 72;

const TYPE_Y = 326;
const TYPE_SIZE = 24;

const PHRASES = [
  'Building the tech behind Kettner Edelmetalle',
  'Making gold investing easy for everyone',
  'Live shopping for 30,000 viewers at once',
  'Gold savings plans from €10 a month',
  'Good with AI? Be a 100x developer.',
  'From Arma 3 game servers to gold',
];

const COIN = { x: 1000, y: 222, scale: 2.45 };

/**
 * Keyframes for a typewriter that types, holds, erases and moves on to the
 * next phrase. Returns per-phrase reveal widths plus the cursor position.
 */
function typewriter(lines, next) {
  const reveal = lines.map(() => []);
  const cursor = [];
  let t = 0;

  const frame = (index, line, width) => {
    reveal[index].push({ t, value: width });
    cursor.push({ t, value: line.x + width });
  };

  lines.forEach((line, index) => {
    const widths = line.ends.map((end) => end - line.x);

    frame(index, line, 0);
    widths.forEach((width) => {
      t += 0.045 + next() * 0.05;
      frame(index, line, width);
    });

    t += 1.8;
    for (let c = widths.length - 2; c >= -1; c--) {
      t += 0.022;
      frame(index, line, c >= 0 ? widths[c] : 0);
    }

    t += 0.45;
  });

  return { reveal, cursor, duration: round(t, 2) };
}

function keyframes(frames, duration) {
  const list = frames[0].t > 0 ? [{ t: 0, value: frames[0].value }, ...frames] : frames;
  const keyTimes = [];
  const values = [];

  for (const { t, value } of list) {
    const keyTime = round(t / duration, 5);
    if (keyTimes.length && keyTime <= keyTimes.at(-1)) {
      values[values.length - 1] = round(value);
      continue;
    }
    keyTimes.push(keyTime);
    values.push(round(value));
  }

  return `calcMode="discrete" keyTimes="${keyTimes.join(';')}" values="${values.join(';')}"`;
}

function coinEdge(ticks = 144) {
  const edge = Array.from({ length: ticks }, (_, i) => {
    const angle = (i / ticks) * Math.PI * 2;
    const point = (r) => `${round(COIN.x + r * Math.cos(angle))} ${round(COIN.y + r * Math.sin(angle))}`;
    return `M${point(152)}L${point(161)}`;
  }).join('');

  return `
<circle cx="${COIN.x}" cy="${COIN.y}" r="210" fill="url(#coin-glow)">
<animate attributeName="opacity" values="0.55;1;0.55" dur="5s" repeatCount="indefinite"/>
</circle>
<circle cx="${COIN.x}" cy="${COIN.y}" r="144" stroke="${colors.gold}" stroke-opacity="0.22"/>
<circle cx="${COIN.x}" cy="${COIN.y}" r="169" stroke="${colors.gold}" stroke-opacity="0.18"/>
<path d="${edge}" stroke="${colors.gold}" stroke-opacity="0.4" stroke-width="1.6" stroke-linecap="round">
<animateTransform attributeName="transform" type="rotate" values="0 ${COIN.x} ${COIN.y};360 ${COIN.x} ${COIN.y}" dur="120s" repeatCount="indefinite"/>
</path>`;
}

export function hero({ fonts, logo }) {
  const card = blackCard({
    width: WIDTH,
    height: HEIGHT,
    glows: [
      { x: COIN.x, y: COIN.y, r: 460, opacity: 0.13 },
      { x: 40, y: 480, r: 420, opacity: 0.07 },
    ],
  });

  const chipLabel = textPath(fonts.label, 'CURRENTLY @ KETTNER EDELMETALLE', {
    x: LEFT + 40,
    y: 80,
    size: 13,
    tracking: 0.16,
  });

  const nameText = 'Niclas Kahlmeier';
  const name = textPath(fonts.display, nameText, {
    x: LEFT - 3,
    y: 190,
    size: fitSize(fonts.display, nameText, 720, 86, -0.01),
    tracking: -0.01,
  });

  const tagline = textPath(fonts.label, 'BUILDING FINANCIAL FUTURES', {
    x: LEFT,
    y: 238,
    size: 21,
    tracking: 0.3,
  });

  const comment = textPath(fonts.mono, '// based in germany · shipping code since age 14', {
    x: LEFT,
    y: 384,
    size: 15,
  });

  const lines = PHRASES.map((phrase) => textPath(fonts.mono, phrase, { x: LEFT + 28, y: TYPE_Y, size: TYPE_SIZE }));
  const typing = typewriter(lines, random(14));
  const timing = `dur="${typing.duration}s" repeatCount="indefinite"`;

  const emblemOrigin = {
    x: round(COIN.x - (logo.emblem.width / 2) * COIN.scale),
    y: round(COIN.y - (logo.emblem.height / 2) * COIN.scale),
  };

  const defs = `${card.defs}
${logo.defs}
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">${stops(goldStops)}</linearGradient>
<linearGradient id="silver" x1="0" y1="0" x2="1" y2="0">${stops(silverStops)}</linearGradient>
<linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">${stops([[0, colors.gold], [1, colors.gold, 0]])}</linearGradient>
<radialGradient id="coin-glow">${stops([[0, colors.gold, 0.3], [0.6, colors.goldDark, 0.08], [1, colors.goldDark, 0]])}</radialGradient>
${shine({ id: 'shine', width: WIDTH, delay: 1.2 })}
${shine({ id: 'shine-emblem', width: WIDTH, delay: 1.2, origin: emblemOrigin.x, scale: COIN.scale })}
<path id="name" d="${name.d}"/>
${lines
  .map(
    (line, i) =>
      `<clipPath id="type-${i}"><rect x="${round(line.x - 4)}" y="${TYPE_Y - 26}" width="0" height="36"><animate attributeName="width" ${keyframes(
        typing.reveal[i].map((frame) => ({ t: frame.t, value: frame.value > 0 ? frame.value + 4 : 0 })),
        typing.duration,
      )} ${timing}/></rect></clipPath>`,
  )
  .join('\n')}`;

  const body = `${card.back}
<g clip-path="${card.clip}">
${particles({ count: 22, width: WIDTH, height: HEIGHT, seed: 11 })}
${coinEdge()}
</g>
<g transform="translate(${emblemOrigin.x} ${emblemOrigin.y}) scale(${COIN.scale})">
${logo.emblem.markup}
${silhouette(logo.emblem.shapes, 'url(#shine-emblem)')}
</g>

<rect x="${LEFT}" y="56" width="${round(chipLabel.width + 58)}" height="34" rx="17" fill="#FFFFFF" fill-opacity="0.04" stroke="${colors.gold}" stroke-opacity="0.35"/>
<circle cx="${LEFT + 20}" cy="73" r="4.5" fill="${colors.goldLight}"/>
<circle cx="${LEFT + 20}" cy="73" r="4.5" stroke="${colors.goldLight}" stroke-width="1.5">
<animate attributeName="r" values="4.5;12" dur="2.2s" repeatCount="indefinite"/>
<animate attributeName="opacity" values="0.9;0" dur="2.2s" repeatCount="indefinite"/>
</circle>
<path d="${chipLabel.d}" fill="${colors.silver}"/>

<use href="#name" fill="url(#gold)"/>
<use href="#name" fill="url(#shine)"/>
<path d="${tagline.d}" fill="url(#silver)"/>
<rect x="${LEFT}" y="262" width="96" height="2" rx="1" fill="url(#accent)"/>

<path d="M${LEFT + 2} ${TYPE_Y - 17}l9 8.5l-9 8.5" stroke="${colors.goldDark}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
${lines.map((line, i) => `<path d="${line.d}" fill="${colors.goldPale}" clip-path="url(#type-${i})"/>`).join('\n')}
<rect class="cursor" x="${lines[0].x}" y="${TYPE_Y - 21}" width="12" height="27" rx="1.5" fill="${colors.goldLight}">
<animate attributeName="x" ${keyframes(
    typing.cursor.map((frame) => ({ t: frame.t, value: frame.value + 3 })),
    typing.duration,
  )} ${timing}/>
</rect>
<path d="${comment.d}" fill="${colors.muted}" fill-opacity="0.75"/>
${card.front}`;

  return document({
    width: WIDTH,
    height: HEIGHT,
    title: 'Niclas Kahlmeier · Building Financial Futures',
    description: `Currently building the tech behind Kettner Edelmetalle. Typing: ${PHRASES.join(' / ')}`,
    style: '.cursor{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}',
    defs,
    body,
  });
}
