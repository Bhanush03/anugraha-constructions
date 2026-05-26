const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Usage: node copy-local-image.js <absolute-source-path> [destFilename]');
  console.error('Example: node copy-local-image.js "C:\\Users\\BHANUSH GOWDA\\OneDrive\\Pictures\\imggggg.png" imggggg.png');
  process.exit(1);
}

const src = process.argv[2];
const destName = process.argv[3] || path.basename(src);
const destDir = path.join(__dirname, '..', 'public', 'images');
const dest = path.join(destDir, destName);

if (!fs.existsSync(src)) {
  console.error('Source file does not exist:', src);
  process.exit(2);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log('Copied', src, '->', dest);
console.log('\nNow reload your dev server and open http://localhost:5174 to see the new hero image.');
