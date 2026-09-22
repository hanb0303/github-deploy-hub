import React, { useState } from 'react';
import { Search, Moon, Sun, RotateCw } from 'lucide-react';

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
}) => {
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [inputUser, setInputUser] = useState(username);

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUser.trim()) {
      onUsernameChange(inputUser.trim());
      setIsEditingUser(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F9FAFB]/80 dark:bg-[#0E1015]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 transition-colors">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-18 py-4 flex items-center justify-between gap-4">
        
        {/* Left: Brand / User Title */}
        <div className="flex items-center gap-3">
          {isEditingUser ? (
            <form onSubmit={handleUserSubmit} className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                value={inputUser}
                onChange={(e) => setInputUser(e.target.value)}
                placeholder="GitHub ID 입력"
                className="px-3 py-1.5 text-sm rounded-xl border border-blue-500 bg-white dark:bg-[#1c1e24] text-gray-900 dark:text-white outline-none w-32"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white"
              >
                변경
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 dark:text-white">
                프로젝트
              </h1>
              <button
                onClick={() => setIsEditingUser(true)}
                title="GitHub ID 변경"
                className="px-2.5 py-1 rounded-full bg-gray-200/70 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
              >
                @{username}
              </button>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold ml-1">
                {totalDeployed}개 배포중
              </span>
            </div>
          )}
        </div>

        {/* Right: Search & Minimal Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Apple / Toss style Minimal Search */}
          <div className="relative w-40 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="검색"
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-white dark:bg-[#1c1e24] border border-gray-200/80 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-sm"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="새로고침"
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 transition-all"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? '라이트 모드' : '다크 모드'}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 transition-all"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

        </div>

      </div>
    </header>
  );
};
