const fs = require('fs');
let code = fs.readFileSync('src/components/DepartmentPortal.tsx', 'utf-8');

const regex1 = /className=\{\`group relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-4 \$\{\s*isDark\s*\?\s*'bg-\\[#111827\\]\/90 border-slate-800 hover:border-slate-600 hover:bg-\\[#162032\\] hover:-translate-y-1'\s*:\s*'bg-white border-slate-200\/90 hover:border-indigo-300 hover:bg-slate-50\/80 hover:-translate-y-1 shadow-sm'\s*\}\`\}/m;

const replacement1 = `className={\`group relative p-6 sm:p-7 rounded-3xl border text-left transition-all duration-300 cursor-pointer flex items-center gap-5 \${
                    isDark
                      ? 'bg-gradient-to-br from-slate-900 to-slate-800/80 border-slate-700/80 hover:border-indigo-500/50 hover:bg-slate-800 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5'
                      : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/10 hover:shadow-2xl hover:shadow-indigo-600/10 hover:-translate-y-1.5 shadow-md'
                  }\`}`;

code = code.replace(regex1, replacement1);

const regex2 = /<div className=\{\`p-2\.5 rounded-xl transition-all duration-200 \$\{\s*isDark\s*\?\s*'bg-slate-800 text-slate-300 border border-slate-700\/60 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500'\s*:\s*'bg-indigo-50 text-indigo-700 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500'\s*\}\`\}>/m;

const replacement2 = `<div className={\`p-3 sm:p-4 rounded-2xl transition-all duration-300 \${
                    isDark
                      ? 'bg-slate-800/80 text-slate-300 border border-slate-700 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-400 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                      : 'bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 group-hover:shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                  }\`}>`;

code = code.replace(regex2, replacement2);

code = code.replace(/<h3 className=\{\`text-sm font-black tracking-tight/g, '<h3 className={`text-base sm:text-lg font-black tracking-tight');
code = code.replace(/<p className=\{\`text-\\[11px\\] font-medium/g, '<p className={`text-xs sm:text-sm mt-0.5 font-bold');

fs.writeFileSync('src/components/DepartmentPortal.tsx', code);
