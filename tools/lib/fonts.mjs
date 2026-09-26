import fs from 'node:fs';
import opentype from 'opentype.js';

const CACHE_DIR = new URL('../.cache/fonts/', import.meta.url);
const CDN = 'https://cdn.jsdelivr.net/fontsource/fonts/';

const FONT_FILES = {
  display: 'space-grotesk@latest/latin-700-normal.ttf',
  heading: 'space-grotesk@latest/latin-600-normal.ttf',
  label: 'inter@latest/latin-600-normal.ttf',
  body: 'inter@latest/latin-500-normal.ttf',
  mono: 'jetbrains-mono@latest/latin-500-normal.ttf',
};

async function loadFont(file) {
  const cached = new URL(file.replace(/[@/]/g, '_'), CACHE_DIR);

  if (!fs.existsSync(cached)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    const response = await fetch(CDN + file);
    if (!response.ok) {
      throw new Error(`Font download failed: ${file} (${response.status})`);
    }
    fs.writeFileSync(cached, Buffer.from(await response.arrayBuffer()));
  }

  const buffer = fs.readFileSync(cached);
  return opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
}

export async function loadFonts() {
  const entries = await Promise.all(
    Object.entries(FONT_FILES).map(async ([role, file]) => [role, await loadFont(file)]),
  );
  return Object.fromEntries(entries);
}

/**
 * Glyph positions for a single line. `tracking` is extra letter spacing in em.
 *
 * @returns {{ glyphs: opentype.Glyph[], offsets: number[], ends: number[], width: number }}
 */
export function layout(font, text, size, tracking = 0) {
  const scale = size / font.unitsPerEm;
  // charToGlyph skips GSUB processing: no ligatures wanted, and opentype.js
  // cannot parse some of the lookups in these fonts anyway.
  const glyphs = Array.from(text, (char) => font.charToGlyph(char));
  const offsets = [];
  const ends = [];
  let x = 0;

  glyphs.forEach((glyph, i) => {
    offsets.push(x);
    x += glyph.advanceWidth * scale;
    ends.push(x);
    if (i < glyphs.length - 1) {
      x += font.getKerningValue(glyph, glyphs[i + 1]) * scale + tracking * size;
    }
  });

  return { glyphs, offsets, ends, width: x };
}

export function measure(font, text, size, tracking = 0) {
  return layout(font, text, size, tracking).width;
}

/**
 * Converts a line of text into SVG path data so the SVG renders identically
 * everywhere: GitHub serves repo SVGs with `default-src 'none'`, which rules
 * out web fonts, and system fonts differ per OS.
 */
export function textPath(font, text, { x = 0, y = 0, size, tracking = 0, anchor = 'start' }) {
  const line = layout(font, text, size, tracking);
  const shift = { start: 0, middle: line.width / 2, end: line.width }[anchor];
  const left = x - shift;

  const d = line.glyphs
    .map((glyph, i) =>
      glyph.getPath(left + line.offsets[i], y, size).toPathData({ decimalPlaces: 1, flipY: false }),
    )
    .join('');

  return {
    d,
    x: left,
    width: line.width,
    ends: line.ends.map((end) => left + end),
  };
}

/**
 * Largest font size (<= max) at which the text fits into `maxWidth`.
 */
export function fitSize(font, text, maxWidth, max, tracking = 0) {
  const width = measure(font, text, max, tracking);
  return width <= maxWidth ? max : Math.floor((max * maxWidth) / width);
}

export function wrap(font, text, size, maxWidth, tracking = 0) {
  const lines = [];
  let current = '';

  for (const word of text.split(' ')) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && measure(font, candidate, size, tracking) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}
