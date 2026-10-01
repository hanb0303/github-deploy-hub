import React, { useState } from 'react';
import { Search, Moon, Sun, RotateCw, Check, Cloud, Download, Upload, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  username: string;
  onUsernameChange: (newUsername: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  totalDeployed: number;
  syncStatus?: 'idle' | 'saving' | 'saved' | 'error';
  onBackup?: () => void;
  onRestore?: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({
  username,
  onUsernameChange,
  search,
  onSearchChange,
  darkMode,
  onToggleDarkMode,
  onRefresh,
  isLoading,
  totalDeployed,
  syncStatus = 'idle',
  onBackup,
  onRestore,
}) => {
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [inputUser, setInputUser] = useState(username);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettingsMenu]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onRestore) {
      onRestore(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowSettingsMenu(false);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUser.trim()) {
      onUsernameChange(inputUser.trim());
      setIsEditingUser(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F9FAFB]/80 dark:bg-[#0E1015]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Left / Mobile Top Bar: Brand, Username, Count & Mobile Quick Controls */}
        <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
          {isEditingUser ? (
            <form onSubmit={handleUserSubmit} className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                value={inputUser}
                onChange={(e) => setInputUser(e.target.value)}
                placeholder="GitHub ID 입력"
                className="px-3 py-1 text-sm rounded-xl border border-blue-500 bg-white dark:bg-[#1c1e24] text-gray-900 dark:text-white outline-none w-32"
              />
              <button
                type="submit"
                className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-blue-600 text-white"
              >
                변경
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 sm:gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 dark:text-white">
                프로젝트
              </h1>
              <button
                onClick={() => setIsEditingUser(true)}
                title="GitHub ID 변경"
                className="px-2.5 py-0.5 sm:py-1 rounded-full bg-gray-200/70 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
              >
                @{username}
              </button>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold ml-0.5 sm:ml-1">
                {totalDeployed}개
              </span>

              {/* Discreet auto-sync status badge */}
              {syncStatus === 'saving' && (
                <span className="flex items-center gap-1 text-[11px] text-blue-500 font-medium ml-1.5 animate-pulse">
                  <Cloud className="w-3 h-3 animate-bounce" />
                  <span className="hidden sm:inline">클라우드 저장 중</span>
                </span>
              )}
              {syncStatus === 'saved' && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium ml-1.5">
                  <Check className="w-3 h-3" />
                  <span className="hidden sm:inline">동기화 완료</span>
                </span>
              )}
              {syncStatus === 'error' && (
                <span className="flex items-center gap-1 text-[11px] text-rose-500 font-medium ml-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="hidden sm:inline">동기화 실패</span>
                </span>
              )}
            </div>
          )}

          {/* Quick controls on mobile top right (Settings, Refresh, DarkMode) */}
          <div className="flex items-center gap-1 sm:hidden">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              title="백업 및 설정"
              className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="새로고침"
              className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
            <button
              onClick={onToggleDarkMode}
              title={darkMode ? '라이트 모드' : '다크 모드'}
              className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Right / Mobile Bottom Bar: Search & Desktop Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto relative">
          
          {/* Apple / Toss style Minimal Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="검색"
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-white dark:bg-[#1c1e24] border border-gray-200/80 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-sm"
            />
          </div>

          {/* Desktop Controls (hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              title="백업 및 데이터 복원"
              className={`p-2 rounded-full transition-all ${showSettingsMenu ? 'bg-gray-200 dark:bg-white/15 text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="새로고침"
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 transition-all"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            </button>

            <button
              onClick={onToggleDarkMode}
              title={darkMode ? '라이트 모드' : '다크 모드'}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 transition-all"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Hidden File Input for Restore */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          {/* Backup & Restore Dropdown Menu */}
          {showSettingsMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 top-11 sm:top-12 z-50 w-56 rounded-2xl bg-white dark:bg-[#1a1c23] shadow-xl border border-gray-100 dark:border-white/10 p-1.5 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-3 py-2 border-b border-gray-100 dark:border-white/5 mb-1">
                <p className="font-bold text-gray-900 dark:text-white">데이터 백업 및 복원</p>
                <p className="text-[11px] text-gray-400 mt-0.5">폴더링과 메모를 안전하게 보관하세요</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onBackup) onBackup();
                  setShowSettingsMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-medium"
              >
                <Download className="w-4 h-4 text-blue-500" />
                <span>설정 백업 (.json 다운로드)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-medium"
              >
                <Upload className="w-4 h-4 text-emerald-500" />
                <span>백업 파일 복원 (.json 업로드)</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
