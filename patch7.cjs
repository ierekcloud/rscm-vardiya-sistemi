const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/<div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500\/30 mt-1">\s*<\/div>/, '<div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/30 mt-1">\n<AlertTriangle className="w-6 h-6" />\n</div>');
fs.writeFileSync('src/App.tsx', code);
