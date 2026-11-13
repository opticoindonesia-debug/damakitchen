// Creates the image fixtures used by acceptance.cjs (run from the repo root).
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const dir = path.join(__dirname, 'fixtures');
fs.mkdirSync(dir, { recursive: true });
(async () => {
  await sharp({ create: { width: 1600, height: 1000, channels: 3, background: { r: 198, g: 91, b: 62 } } })
    .jpeg({ quality: 80 })
    .withMetadata({ exif: { IFD0: { Copyright: 'test' } } })
    .toFile(path.join(dir, 'hero.jpg'));
  await sharp({ create: { width: 900, height: 900, channels: 3, background: { r: 31, g: 77, b: 77 } } }).png().toFile(path.join(dir, 'product.png'));
  fs.writeFileSync(path.join(dir, 'evil.svg'), '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>');
  fs.writeFileSync(path.join(dir, 'fake.jpg'), 'this is not an image');
  console.log('fixtures written to', dir);
})();
