const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove the fixed top-24 div entirely
code = code.replace(/\{\/\* YÖNETİCİ BUTONLARI - SAYFANIN SAĞ ÜSTÜNE SABİTLENDİ \*\/\}[\s\S]*?\{\/\* EĞER PORTAL AÇIKSA/, '{/* EĞER PORTAL AÇIKSA');

// 2. Insert the Manager buttons right before btn-print-action
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
                  <span className="hidden sm:inline tracking-wider">YÖNETİCİ GİRİŞ</span>
                </button>
              )}
`;

code = code.replace(/<button\s+id="btn-print-action"/, `${managerButtons}\n              <button id="btn-print-action"`);

fs.writeFileSync('src/App.tsx', code);
