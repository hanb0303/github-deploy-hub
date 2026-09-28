import React, { useState } from 'react';
import { X, QrCode, Cloud, Copy, Check, Download, Send, Loader2 } from 'lucide-react';
import { exportFullConfig, encodeConfigForSync, commitConfigToGitHub } from '../services/github';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'github'>('qr');
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('gitdeploy_gh_pat') || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const config = exportFullConfig();
  const encoded = encodeConfigForSync(config);
  
  // Current live URL with sync payload
  const currentBase = window.location.origin + window.location.pathname;
  const syncUrl = `${currentBase}?sync=${encoded}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(syncUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(syncUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onSuccessToast('동기화 링크가 클립보드에 복사되었습니다.');
  };

  const handleDownloadConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onSuccessToast('config.json 파일이 다운로드되었습니다.');
  };

  const handleGitHubCommit = async () => {
    if (!token.trim()) {
      setErrorMsg('GitHub Personal Access Token을 입력해주세요.');
      return;
    }
    setErrorMsg(null);
    setIsSaving(true);
    try {
      localStorage.setItem('gitdeploy_gh_pat', token.trim());
      await commitConfigToGitHub(token.trim(), config);
      onSuccessToast('GitHub 저장소(config.json)에 성공적으로 동기화되었습니다!');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'GitHub 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#18191E] rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              기기 간 폴더 동기화
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-4">
          <div className="flex p-1 rounded-2xl bg-gray-100 dark:bg-white/5">
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'qr'
                  ? 'bg-white dark:bg-[#252830] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>모바일 즉시 적용 (QR)</span>
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'github'
                  ? 'bg-white dark:bg-[#252830] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>GitHub 클라우드 영구 저장</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {activeTab === 'qr' ? (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 dark:border-white/10">
                <img 
                  src={qrCodeUrl} 
                  alt="Sync QR Code" 
                  className="w-44 h-44 rounded-xl"
                  loading="lazy"
                />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  스마트폰 카메라로 QR코드를 스캔하세요
                </p>
                <p className="text-xs text-gray-400 max-w-xs">
                  PC에서 정리한 폴더 목록, 분류 위치, 별 고정 상태가 모바일에 즉시 1초 만에 복제됩니다.
                </p>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 text-xs font-bold transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                <span>{copied ? '링크가 복사되었습니다!' : '카카오톡 공유용 동기화 링크 복사'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-300 space-y-1">
                <p className="font-bold">💡 GitHub 영구 동기화 안내</p>
                <p className="text-blue-700/80 dark:text-blue-300/70 leading-relaxed">
                  GitHub에 저장하면 어떤 스마트폰이나 새 컴퓨터에서 접속하더라도 자동으로 이 폴더 구조가 기본 로드됩니다.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-100 dark:border-rose-900/40">
                  {errorMsg}
                </div>
              )}

              {/* Token Direct Commit */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  GitHub Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_... (브라우저 로컬에만 안전하게 저장)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#20222A] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleGitHubCommit}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>GitHub 저장소(config.json)에 1클릭 저장</span>
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-white/5"></div>
                <span className="flex-shrink mx-3 text-[11px] text-gray-400">또는 수동 다운로드</span>
                <div className="flex-grow border-t border-gray-200 dark:border-white/5"></div>
              </div>

              <button
                onClick={handleDownloadConfig}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
              >
                <Download className="w-4 h-4 text-gray-400" />
                <span>config.json 다운로드 (deploy.bat 실행용)</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
