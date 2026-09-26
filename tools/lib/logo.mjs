import fs from 'node:fs';

const LOGO = new URL('../../assets/kettner-logo.svg', import.meta.url);
const GRADIENT = /<linearGradient\b[^>]*\/>|<linearGradient\b[\s\S]*?<\/linearGradient>/g;
const PATH = /<path\b([^>]*?)\/>/g;

// Gradient ids of the round emblem (arcs + bars) inside the wordmark logo.
const EMBLEM_FILLS = new Set(['d', 'e', 'j', 'l', 'm', 'n', 'o']);

function attribute(attributes, name) {
  return attributes.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1];
}

/**
 * Parses the official Kettner Edelmetalle logo and namespaces its gradient ids
 * with `prefix`, so it can be embedded next to other gradients in one SVG.
 */
export function loadLogo(prefix = 'k') {
  const raw = fs.readFileSync(LOGO, 'utf8');
  const [, , width, height] = raw.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);

  const namespace = (markup) =>
    markup
      .replace(/\bid="([^"]+)"/g, `id="${prefix}-$1"`)
      .replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`)
      .replace(/xlink:href="#([^"]+)"/g, `xlink:href="#${prefix}-$1"`);

  const body = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(GRADIENT, '');

  const shapes = [...body.matchAll(PATH)].map(([markup, attributes]) => ({
    markup,
    d: attribute(attributes, 'd'),
    transform: attribute(attributes, 'transform'),
    fillId: attribute(attributes, 'fill')?.match(/url\(#([^)]+)\)/)?.[1],
  }));

  const emblemShapes = shapes.filter((shape) => EMBLEM_FILLS.has(shape.fillId));

  return {
    width,
    height,
    defs: namespace((raw.match(GRADIENT) ?? []).join('')),
    markup: namespace(body),
    shapes,
    emblem: {
      width: 92,
      height: 94,
      markup: namespace(emblemShapes.map((shape) => shape.markup).join('')),
      shapes: emblemShapes,
    },
  };
}

/**
 * Re-draws logo shapes with a single fill, e.g. a moving highlight on top of the logo.
 */
export function silhouette(shapes, fill) {
  const paths = shapes
    .map(({ d, transform }) => `<path d="${d}"${transform ? ` transform="${transform}"` : ''}/>`)
    .join('');
  return `<g fill="${fill}">${paths}</g>`;
}
