const fs = require('fs');
let code = fs.readFileSync('src/components/DepartmentPortal.tsx', 'utf-8');

const regex = /className=\{\`group relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-4 \$\{\s*isDark\s*\?\s*'bg-\\[#111827\\]\/90 border-slate-800 hover:border-slate-600 hover:bg-\\[#162032\\] hover:-translate-y-1'\s*:\s*'bg-white border-slate-200\/90 hover:border-indigo-300 hover:bg-slate-50\/80 hover:-translate-y-1 shadow-sm'\s*\}\`\}/m;

const replacement = `className={\`group relative p-6 sm:p-7 rounded-3xl border text-left transition-all duration-300 cursor-pointer flex items-center gap-5 \${
                    isDark
                      ? 'bg-gradient-to-br from-slate-900 to-slate-800/80 border-slate-700/80 hover:border-indigo-500/50 hover:bg-slate-800 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5'
                      : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/10 hover:shadow-2xl hover:shadow-indigo-600/10 hover:-translate-y-1.5 shadow-md'
                  }\`}`;

// Wait, the actual text in file is:
// className={`group relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-4 ${
//                     isDark
//                       ? 'bg-[#111827]/90 border-slate-800 hover:border-slate-600 hover:bg-[#162032] hover:-translate-y-1'
//                       : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:bg-slate-50/80 hover:-translate-y-1 shadow-sm'
//                   }`}

code = code.replace(/className=\{\`group relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-4 \$\{[^}]+\}\`\}/m, replacement);

fs.writeFileSync('src/components/DepartmentPortal.tsx', code);
