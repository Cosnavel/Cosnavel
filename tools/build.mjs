// Regenerates the static SVGs in ../assets:  cd tools && npm install && npm run build
import fs from 'node:fs';
import { badges } from './assets/badges.mjs';
import { divider } from './assets/divider.mjs';
import { hero } from './assets/hero.mjs';
import { journey } from './assets/journey.mjs';
import { kettner } from './assets/kettner.mjs';
import { loadFonts } from './lib/fonts.mjs';
import { loadLogo } from './lib/logo.mjs';

const fonts = await loadFonts();
const logo = loadLogo();

const assets = {
  'hero.svg': hero({ fonts, logo }),
  'kettner.svg': kettner({ fonts, logo }),
  'journey.svg': journey({ fonts }),
  'divider.svg': divider(),
  ...badges({ fonts, logo }),
};

for (const [file, svg] of Object.entries(assets)) {
  fs.writeFileSync(new URL(`../assets/${file}`, import.meta.url), svg);
  console.log(`assets/${file}  ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
}
