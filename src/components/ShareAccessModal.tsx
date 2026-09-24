import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  FolderDown, 
  FileCode, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface ShareAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const ShareAccessModal: React.FC<ShareAccessModalProps> = ({
  isOpen,
  onClose,
  isDark = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const SHARE_URL = 'https://ierekcloud.github.io/rscm-vardiya-sistemi/';

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(SHARE_URL);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
        return;
      }
    } catch {
      // fallback
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = SHARE_URL;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
        return;
      }
    } catch {
      // ignore
    }

    const input = document.getElementById('modal-share-url-input') as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  };

  // Windows Masaüstü / Ağ Paylaşım Klasörü için .URL Kısayol Dosyası İndir
  const handleDownloadShortcutUrl = () => {
    const fileContent = `[InternetShortcut]\r\nURL=${SHARE_URL}\r\nIconIndex=0\r\n`;
    const blob = new Blob([fileContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'RSMC_Vardiya_Sistemi.url';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Ortak Klasör İçin Çift Tıklayınca Açılan HTML Yönlendirme Dosyası İndir
  const handleDownloadHtml = () => {
    const fileContent = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=${SHARE_URL}">
  <title>RSMC Vardiya Sistemi</title>
  <script>window.location.href = "${SHARE_URL}";</script>
</head>
<body style="font-family:sans-serif; text-align:center; padding-top:60px; background:#0f172a; color:#ffffff;">
  <div style="max-width:500px; margin:0 auto; background:#1e293b; padding:30px; border-radius:16px; border:1px solid #334155;">
    <h2 style="margin-top:0; color:#38bdf8;">RSMC Vardiya Sistemi</h2>
    <p style="color:#94a3b8; font-size:15px;">Sisteme yönlendiriliyorsunuz, lütfen bekleyin...</p>
    <p style="margin-top:20px;">
      <a href="${SHARE_URL}" style="display:inline-block; background:#4f46e5; color:#ffffff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:bold;">
        Doğrudan Aç
      </a>
    </p>
  </div>
</body>
</html>`;
    const blob = new Blob([fileContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'RSMC_Vardiya_Sistemi.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark 
            ? 'bg-slate-900 border-slate-700 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Ortak Paylaşım ve Klasör Kısayolu</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Personelin ağ klasöründen veya doğrudan erişmesi için araçlar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gövde */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* 1. Kutu: Doğrudan URL Kopyalama */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>1. Doğrudan Web Adresi (Link)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="modal-share-url-input"
                type="text"
                readOnly
                value={SHARE_URL}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 px-3.5 py-2.5 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 select-all cursor-pointer"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
              <a
                href={SHARE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0"
                title="Yeni Sekmede Aç"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 2. Kutu: Ortak Klasöre Dosya Koyma (Kısayol ve HTML İndir) */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-4">
            <div className="flex items-center gap-2">
              <FolderDown className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <h3 className="text-sm font-black text-indigo-950 dark:text-indigo-200">
                  2. Ortak Ağ / Bilgisayar Klasörüne Koyma Dosyaları
                </h3>
                <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 font-medium">
                  Aşağıdaki hazır dosyalardan birini indirip ortak klasörünüze bırakın. Klasördeki kullanıcılar çift tıklayarak siteye girebilir.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* HTML Dosyası İndir */}
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="flex flex-col items-start gap-1 p-3.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-indigo-500/40 hover:border-indigo-600 hover:shadow-md transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-1.5 text-xs font-black text-indigo-700 dark:text-indigo-300">
                    <FileCode className="w-4 h-4" />
                    <span>Web Dosyası (.html) İndir</span>
                  </span>
                  <Download className="w-4 h-4 text-indigo-500 group-hover:translate-y-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                  Tüm tarayıcılarda sorunsuz çalışır, klasöre koyup çift tıklanır.
                </p>
              </button>

              {/* Windows .URL Kısayolu İndir */}
              <button
                type="button"
                onClick={handleDownloadShortcutUrl}
                className="flex flex-col items-start gap-1 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:shadow-md transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                    <FolderDown className="w-4 h-4 text-slate-500" />
                    <span>Klasör Kısayolu (.url) İndir</span>
                  </span>
                  <Download className="w-4 h-4 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                  Windows standart internet kısayol dosyasıdır.
                </p>
              </button>
            </div>
          </div>

          {/* 3. Kutu: Nasıl Kullanılır Rehberi */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-100">Nasıl Kullanılır?</div>
              <div>
                1. Yukarıdaki <strong>"Web Dosyası (.html) İndir"</strong> butonuna basın.<br />
                2. Bilgisayarınıza inen <code>RSMC_Vardiya_Sistemi.html</code> dosyasını ortak paylaşılan klasöre atın.<br />
                3. Personel o dosyaya çift tıkladığında sistem anında açılır.
              </div>
            </div>
          </div>
        </div>

        {/* Kapat Butonu */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 transition-all cursor-pointer shadow-xs"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
