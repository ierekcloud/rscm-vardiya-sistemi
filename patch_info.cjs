const fs = require('fs');
let code = fs.readFileSync('src/components/DepartmentPortal.tsx', 'utf-8');

const regex = /<div className=\{\`max-w-2xl mx-auto p-4 rounded-2xl border-2 shadow-lg \$\{\s*isDark\s*\?\s*'bg-rose-950\/30 border-rose-500\/40 text-rose-200 shadow-rose-900\/20'\s*:\s*'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-500\/10'\s*\}\`\}>/m;

const replacement = `<div className={\`max-w-2xl mx-auto p-5 rounded-2xl border-2 shadow-xl \${
            isDark 
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-amber-900/20' 
              : 'bg-amber-100 border-amber-400 text-amber-900 shadow-amber-500/20'
          }\`}>`;

code = code.replace(regex, replacement);

code = code.replace(/<p className="text-sm sm:text-base font-bold leading-relaxed">/, '<p className="text-base sm:text-lg font-black leading-relaxed">');

fs.writeFileSync('src/components/DepartmentPortal.tsx', code);
