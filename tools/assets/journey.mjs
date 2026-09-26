import { measure, textPath } from '../lib/fonts.mjs';
import { colors, stops } from '../lib/palette.mjs';
import { blackCard, document, round } from '../lib/svg.mjs';

const WIDTH = 1200;
const HEIGHT = 500;
const RAIL_X = 92;
const LANE_X = 132;
const HASH_X = 172;
const TEXT_X = 270;
const TAGS_RIGHT = 1120;
const FIRST_ROW = 110;
const ROW_GAP = 80;
const DRAW_SECONDS = 2;

// Newest first, like `git log`. The work-study branch was abandoned after a few weeks.
const COMMITS = [
  {
    hash: '601dc0d',
    title: 'Building financial futures at Kettner Edelmetalle',
    body: 'E-commerce meets livestream selling: gold investing made easy for everyone.',
    tags: [{ text: 'HEAD', filled: true }, { text: 'TODAY' }],
  },
  {
    hash: 'c011e9e',
    title: 'Tried a work-study program',
    body: 'Dropped out within weeks. Four years of full-time experience, no time to wait.',
    tags: [{ text: 'WORK-STUDY' }],
    abandoned: true,
  },
  {
    hash: '5ca1ab1',
    title: 'Working for startups',
    body: 'Shipping real products for startups while still in high school.',
    tags: [{ text: 'HIGH SCHOOL' }],
  },
  {
    hash: '5aa5c0d',
    title: 'Our own game server, our first SaaS',
    body: 'Taught myself to code in forums, then sold subscriptions inside the game.',
    tags: [{ text: 'AGE 14' }],
  },
  {
    hash: 'a3a3a3a',
    title: 'Hooked on Arma 3',
    body: 'Gaming is what pulled me into tech. Turns out I loved building even more.',
    tags: [{ text: 'AGE 13' }],
  },
];

const rowY = (index) => FIRST_ROW + index * ROW_GAP;
const ROOT_Y = rowY(COMMITS.length - 1);

/**
 * Fades an element in once the rail has grown up to it. The base opacity
 * stays 1, so renderers without SMIL still show everything.
 */
function appear(y, duration = 0.45) {
  const delay = round(((ROOT_Y - y) / (ROOT_Y - FIRST_ROW)) * DRAW_SECONDS, 2);
  const split = round(delay / (delay + duration), 3);
  return `<animate attributeName="opacity" values="0;0;1" keyTimes="0;${split};1" dur="${round(delay + duration, 2)}s" fill="freeze"/>`;
}

function tags(fonts, list, y) {
  const size = 12;
  const tracking = 0.14;
  let right = TAGS_RIGHT;

  return [...list]
    .reverse()
    .map(({ text, filled = false }) => {
      const width = round(measure(fonts.label, text, size, tracking) + 24);
      right -= width;
      const label = textPath(fonts.label, text, { x: right + 12, y: y + 4.4, size, tracking });
      const markup = `<rect x="${round(right)}" y="${y - 13}" width="${width}" height="26" rx="13" fill="${filled ? colors.gold : 'none'}" stroke="${colors.gold}" stroke-opacity="${filled ? 1 : 0.45}"/>
<path d="${label.d}" fill="${filled ? colors.ink : colors.goldPale}"/>`;
      right -= 8;
      return markup;
    })
    .join('\n');
}

function node(commit, x, y) {
  if (commit.tags.some((tag) => tag.text === 'HEAD')) {
    return `<circle cx="${x}" cy="${y}" r="10" stroke="${colors.goldLight}" stroke-width="2">
<animate attributeName="r" values="10;22" dur="2.4s" repeatCount="indefinite"/>
<animate attributeName="opacity" values="0.8;0" dur="2.4s" repeatCount="indefinite"/>
</circle>
<circle cx="${x}" cy="${y}" r="10" fill="${colors.goldLight}"/>
<circle cx="${x}" cy="${y}" r="4" fill="${colors.ink}"/>`;
  }

  if (commit.abandoned) {
    return `<circle cx="${x}" cy="${y}" r="7" fill="${colors.ink}" stroke="${colors.goldDark}" stroke-width="2" stroke-dasharray="3 3"/>`;
  }

  return `<circle cx="${x}" cy="${y}" r="8" fill="${colors.ink}" stroke="${colors.gold}" stroke-width="2.5"/>
<circle cx="${x}" cy="${y}" r="3.5" fill="${colors.goldLight}"/>`;
}

export function journey({ fonts }) {
  const card = blackCard({
    width: WIDTH,
    height: HEIGHT,
    glows: [{ x: RAIL_X, y: FIRST_ROW, r: 380, opacity: 0.1 }],
    runnerDuration: 14,
  });

  const command = textPath(fonts.mono, 'git log --graph --oneline --all', { x: 100, y: 60, size: 16 });

  const branchFrom = rowY(COMMITS.findIndex((commit, i) => i > 0 && !commit.abandoned));
  const abandonedIndex = COMMITS.findIndex((commit) => commit.abandoned);
  const abandonedY = rowY(abandonedIndex);
  const railLength = ROOT_Y - FIRST_ROW;

  const rows = COMMITS.map((commit, index) => {
    const y = rowY(index);
    const x = commit.abandoned ? LANE_X : RAIL_X;
    const hash = textPath(fonts.mono, commit.hash, { x: HASH_X, y: y + 6, size: 17 });
    const title = textPath(fonts.heading, commit.title, { x: TEXT_X, y: y + 7, size: 22 });
    const body = textPath(fonts.body, commit.body, { x: TEXT_X, y: y + 33, size: 16 });

    return `<g>
${appear(y)}
${node(commit, x, y)}
<path d="${hash.d}" fill="${colors.gold}"/>
<path d="${title.d}" fill="${colors.white}"${commit.abandoned ? ' fill-opacity="0.85"' : ''}/>
<path d="${body.d}" fill="${colors.muted}"/>
${tags(fonts, commit.tags, y)}
</g>`;
  }).join('\n');

  const defs = `${card.defs}
<linearGradient id="rail" gradientUnits="userSpaceOnUse" x1="0" y1="${ROOT_Y}" x2="0" y2="${FIRST_ROW}">${stops([[0, colors.goldDark, 0.6], [1, colors.goldLight]])}</linearGradient>
<radialGradient id="spark">${stops([[0, colors.goldLight], [1, colors.goldLight, 0]])}</radialGradient>`;

  const body = `${card.back}
<path d="M72 ${60 - 11}l7 6l-7 6" stroke="${colors.goldDark}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${command.d}" fill="${colors.muted}"/>
<rect class="cursor" x="${round(command.x + command.width + 6)}" y="${60 - 14}" width="9" height="18" rx="1" fill="${colors.goldLight}"/>

<path d="M${RAIL_X} ${ROOT_Y}V${FIRST_ROW}" stroke="url(#rail)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${railLength}">
<animate attributeName="stroke-dashoffset" values="${railLength};0" dur="${DRAW_SECONDS}s" fill="freeze"/>
</path>
<path d="M${RAIL_X} ${branchFrom}C${RAIL_X} ${branchFrom - 45} ${LANE_X} ${branchFrom - 35} ${LANE_X} ${abandonedY + 7}" stroke="${colors.goldDark}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="4 6">
${appear(abandonedY)}
</path>
<circle cx="${RAIL_X}" cy="${ROOT_Y}" r="16" fill="url(#spark)" opacity="0">
<animate attributeName="cy" values="${ROOT_Y};${FIRST_ROW}" dur="3.2s" begin="${DRAW_SECONDS + 0.6}s" repeatCount="indefinite"/>
<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="3.2s" begin="${DRAW_SECONDS + 0.6}s" repeatCount="indefinite"/>
</circle>
${rows}
${card.front}`;

  return document({
    width: WIDTH,
    height: HEIGHT,
    title: 'My journey as a git log',
    description: COMMITS.map((commit) => `${commit.tags.map((tag) => tag.text).join(', ')}: ${commit.title}. ${commit.body}`).join(' '),
    style: '.cursor{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}',
    defs,
    body,
  });
}
