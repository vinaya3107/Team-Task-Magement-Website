const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir(path.join(__dirname, 'frontend', 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    if (file.endsWith('axios.js')) return;

    // 1. Rename import api -> import API
    content = content.replace(/import\s+api\s+from\s+['"](\.\.?\/api\/axios)['"];?/g, "import API from '$1';");

    // 2. Change api. -> API.
    content = content.replace(/\bapi\.(get|post|put|delete)/g, 'API.$1');

    // 3. Fix the previously broken template literals (e.g. '/api/projects/${id}\` -> `/api/projects/${id}`)
    // Let's just fix the bad single quotes around template literals
    content = content.replace(/API\.(get|post|put|delete)\(\s*['"]\/api\/(.*?)\`\)/g, "API.$1(`/api/$2`)");
    content = content.replace(/API\.(get|post|put|delete)\(\s*['"]\/api\/(.*?)\\\`\)/g, "API.$1(`/api/$2`)");
    content = content.replace(/API\.(get|post|put|delete)\(\s*['"]\/api\/(.*?\$\{.*?\}.*?)['"]/g, "API.$1(`/api/$2`)");

    // 4. Strip out any existing /api/ to normalize
    content = content.replace(/API\.(get|post|put|delete)\(\s*(['"`])\/api\/(.*?)\2/g, "API.$1($2/$3$2");

    // 5. Safely prepend /api/ to the normalized routes
    content = content.replace(/API\.(get|post|put|delete)\(\s*(['"`])\/(.*?)\2/g, "API.$1($2/api/$3$2");

    fs.writeFileSync(file, content);
    console.log('Fixed:', path.basename(file));
});
