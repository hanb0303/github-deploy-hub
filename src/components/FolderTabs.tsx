import React, { useState } from 'react';
import { Folder } from '../types';
import { Plus, X } from 'lucide-react';

interface FolderTabsProps {
  folders: Folder[];
  activeFolderId: string;
  onSelectFolder: (id: string) => void;
  onAddFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onReorderFolders: (folders: Folder[]) => void;
  onDropProjectOnFolder: (projectId: string | number, folderId: string) => void;
  projectCounts: Record<string, number>;
}

export const FolderTabs: React.FC<FolderTabsProps> = ({
  folders,
  activeFolderId,
  onSelectFolder,
  onAddFolder,
  onDeleteFolder,
  onReorderFolders,
  onDropProjectOnFolder,
  projectCounts,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [draggedFolderIndex, setDraggedFolderIndex] = useState<number | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName('');
      setIsAdding(false);
    }
  };

  // Drag Folder handlers
  const handleFolderDragStart = (e: React.DragEvent, index: number, folderId: string) => {
    if (folderId === 'all') return;
    e.dataTransfer.setData('text/folder-index', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedFolderIndex(index);
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverFolderId !== folderId) {
      setDragOverFolderId(folderId);
    }
  };

  const handleFolderDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleFolderDrop = (e: React.DragEvent, targetIndex: number, targetFolderId: string) => {
    e.preventDefault();
    setDragOverFolderId(null);

    // 1. Check if it's a project being dropped onto this folder
    const projectId = e.dataTransfer.getData('text/project-id');
    if (projectId && targetFolderId !== 'all') {
      onDropProjectOnFolder(projectId, targetFolderId);
      return;
    }

    // 2. Check if it's a folder being reordered
    const sourceIndexStr = e.dataTransfer.getData('text/folder-index');
    if (sourceIndexStr !== '') {
      const sourceIndex = parseInt(sourceIndexStr, 10);
      if (!isNaN(sourceIndex) && sourceIndex !== targetIndex && targetFolderId !== 'all') {
        const newFolders = [...folders];
        const [moved] = newFolders.splice(sourceIndex, 1);
        newFolders.splice(targetIndex, 0, moved);
        onReorderFolders(newFolders);
      }
    }
    setDraggedFolderIndex(null);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {folders.map((folder, index) => {
        const isActive = activeFolderId === folder.id;
        const count = projectCounts[folder.id] ?? 0;
        const canDelete = folder.id !== 'all' && folder.id !== 'default';
        const isDragging = draggedFolderIndex === index;
        const isDragOver = dragOverFolderId === folder.id;

        return (
          <div
            key={folder.id}
            draggable={folder.id !== 'all'}
            onDragStart={(e) => handleFolderDragStart(e, index, folder.id)}
            onDragOver={(e) => handleFolderDragOver(e, folder.id)}
            onDragLeave={handleFolderDragLeave}
            onDrop={(e) => handleFolderDrop(e, index, folder.id)}
            onDragEnd={() => {
              setDraggedFolderIndex(null);
              setDragOverFolderId(null);
            }}
            className={`relative group shrink-0 transition-all ${
              folder.id !== 'all' ? 'cursor-grab active:cursor-grabbing' : ''
            } ${isDragging ? 'opacity-40' : 'opacity-100'} ${
              isDragOver ? 'ring-2 ring-blue-500 scale-105' : ''
            }`}
          >
            <button
              onClick={() => onSelectFolder(folder.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                  : 'bg-white dark:bg-[#1c1e24] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#252830] border border-gray-200/80 dark:border-white/10'
              }`}
            >
              <span>{folder.name}</span>
              {canDelete ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`'${folder.name}' 폴더를 삭제할까요? (해당 프로젝트는 '기타'로 이동됩니다)`)) {
                      onDeleteFolder(folder.id);
                    }
                  }}
                  className={`text-[11px] min-w-[20px] h-5 px-1 rounded-full font-normal inline-flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-white/20 dark:bg-black/10 text-white dark:text-gray-900 group-hover:bg-rose-500 group-hover:text-white'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-400 group-hover:bg-rose-500/10 group-hover:text-rose-500'
                  }`}
                  title="클릭 시 폴더 삭제"
                >
                  <span className="group-hover:hidden">{count}</span>
                  <X className="w-3 h-3 hidden group-hover:block" />
                </span>
              ) : (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-normal ${
                    isActive
                      ? 'bg-white/20 dark:bg-black/10 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          </div>
        );
      })}

      {/* Add New Folder */}
      {isAdding ? (
        <form onSubmit={handleAddSubmit} className="flex items-center gap-1.5 shrink-0">
          <input
            type="text"
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="폴더명 입력"
            className="px-3 py-1.5 text-xs rounded-full border border-blue-500 bg-white dark:bg-[#1c1e24] text-gray-900 dark:text-white outline-none w-28"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 text-xs rounded-full bg-blue-600 text-white font-medium"
          >
            확인
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 border border-dashed border-gray-300 dark:border-neutral-700 hover:border-blue-500 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>폴더 추가</span>
        </button>
      )}
    </div>
  );
};
