const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove the fixed top-24 div entirely
code = code.replace(/\{\/\* YÖNETİCİ BUTONLARI - SAYFANIN SAĞ ÜSTÜNE SABİTLENDİ \*\/\}\s*<div className="fixed top-24 right-4 sm:right-6 flex flex-col items-end gap-3 z-50">[\s\S]*?<\/div>\s*\{\/\* EĞER PORTAL AÇIKSA/, '{/* EĞER PORTAL AÇIKSA');

// 2. Insert the Manager buttons into the header, right after the theme toggle
const managerButtons = `
              {currentManager ? (
                <button
                  type="button"
                  onClick={handleManagerLogout}
                  className={\`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer shadow-xs \${
                    isDarkMode
                      ? 'bg-rose-950/40 border-rose-800/50 hover:bg-rose-900/60 text-rose-300'
                      : 'bg-white border-rose-200 hover:bg-rose-50 text-rose-700'
                  }\`}
                  title="Yönetici Çıkışı"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ÇIKIŞ</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer shadow-md bg-slate-900 hover:bg-indigo-600 text-white shadow-slate-900/20 active:scale-95 border border-slate-800"
                  title="Yönetici Girişi"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline tracking-wider">YÖNETİCİ GİRİŞİ</span>
                </button>
              )}
`;

code = code.replace(/<span className="hidden xl:inline">Açık<\/span>\s*<\/>\s*\)\}\s*<\/button>/, `$&${managerButtons}`);

fs.writeFileSync('src/App.tsx', code);
