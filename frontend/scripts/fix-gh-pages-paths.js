// GitHub Pages project sites are served under /<repo-name>/, but Expo's web
// export emits root-absolute asset paths (e.g. "/assets/...", "/_expo/...").
// This rewrites those to be prefixed with the repo's base path so fonts,
// icons, and the JS bundle all resolve correctly once deployed.
const fs = require('fs');
const path = require('path');

const BASE_PATH = process.argv[2] || '/tazkiyah';
const DIST_DIR = path.join(__dirname, '..', 'dist');

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, callback);
    else callback(fullPath);
  }
}

let filesChanged = 0;

walk(DIST_DIR, (filePath) => {
  if (!/\.(html|js)$/.test(filePath)) return;
  const original = fs.readFileSync(filePath, 'utf8');
  const rewritten = original
    .replaceAll('"/assets/', `"${BASE_PATH}/assets/`)
    .replaceAll('"/_expo/', `"${BASE_PATH}/_expo/`)
    .replaceAll("src=\"/_expo/", `src="${BASE_PATH}/_expo/`);
  if (rewritten !== original) {
    fs.writeFileSync(filePath, rewritten);
    filesChanged++;
  }
});

console.log(`Rewrote absolute asset paths to "${BASE_PATH}" prefix in ${filesChanged} file(s).`);

// GitHub Pages runs Jekyll by default, which silently excludes any
// directory starting with an underscore (e.g. "_expo/") from the published
// output — causing 404s on the JS bundle even though it's in the branch.
// This opts out of Jekyll processing entirely.
fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '');
console.log('Added .nojekyll to disable Jekyll processing.');
