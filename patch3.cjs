const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/<AlertCircle className="w-6 h-6" \/>/g, '');
fs.writeFileSync('src/App.tsx', code);
