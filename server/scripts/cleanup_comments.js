const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.join(__dirname, '../../frontend/src'),
    path.join(__dirname, '../../server/src'),
    path.join(__dirname, '../../server/scripts')
];

function removeComments(string) {
    // Matches strings (double, single, backtick) OR comments (multi-line, single-line)
    return string.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\/\*[\s\S]*?\*\/|\/\/.*)/g, (match, str, comment) => {
        if (str) return str; // It was a string, keep it
        return ''; // It was a comment, remove it
    });
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            // Skip this script itself so it doesn't lose its instructions if run multiple times
            if (file === 'cleanup_comments.js') continue;

            console.log('Processing:', filePath);
            const content = fs.readFileSync(filePath, 'utf8');
            const clean = removeComments(content);
            // Remove empty lines left by full-line comments
            const compacted = clean.replace(/^\s*[\r\n]/gm, '');
            fs.writeFileSync(filePath, compacted);
        }
    }
}

console.log('Starting comment cleanup...');
targetDirs.forEach(dir => {
    console.log('Scanning directory:', dir);
    walkDir(dir);
});
console.log('Cleanup complete.');
