import React, { useState, useRef, useEffect } from 'react';
import { ProjectItem, Folder } from '../types';
import { 
  ArrowUpRight, 
  Github, 
  Folder as FolderIcon, 
  ChevronDown, 
  Check, 
  Star, 
  Pencil,
  GripVertical 
} from 'lucide-react';

interface ProjectRowProps {
  project: ProjectItem;
  folders: Folder[];
  onFolderChange: (projectId: string | number, newFolderId: string) => void;
  onTogglePin: (projectId: string | number) => void;
  onDescriptionChange: (projectId: string | number, newDesc: string) => void;
  onReorderProject: (sourceId: string | number, targetId: string | number) => void;
}

export const ProjectRow: React.FC<ProjectRowProps> = ({
  project,
  folders,
  onFolderChange,
  onTogglePin,
  onDescriptionChange,
  onReorderProject,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState(project.description || '');
  const [isDragOver, setIsDragOver] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const isDeployed = !!project.deployUrl;
  const currentFolder = folders.find(f => f.id === project.folderId) || folders.find(f => f.id === 'default');

  useEffect(() => {
    setDescInput(project.description || '');
  }, [project.description]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSaveDesc = () => {
    setIsEditingDesc(false);
    if (descInput !== project.description) {
      onDescriptionChange(project.id, descInput.trim());
    }
  };

  const handleDescKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveDesc();
    } else if (e.key === 'Escape') {
      setDescInput(project.description || '');
      setIsEditingDesc(false);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/project-id', String(project.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const sourceId = e.dataTransfer.getData('text/project-id');
    if (sourceId && sourceId !== String(project.id)) {
      onReorderProject(sourceId, project.id);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group flex items-center justify-between px-3.5 py-3 rounded-2xl bg-white dark:bg-[#18191E] border transition-all duration-150 ${
        isDragOver 
          ? 'border-blue-500 ring-2 ring-blue-500/20 scale-[1.01]' 
          : 'border-gray-200/60 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 hover:shadow-sm'
      }`}
    >
      
      {/* Left: Drag Handle, Star, Status, Name, Description */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-4">
        {/* Grip Drag Handle */}
        <div 
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 transition-colors"
          title="드래그하여 순서 변경"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Pin button */}
        <button
          onClick={() => onTogglePin(project.id)}
          title={project.isPinned ? "상단 고정 해제" : "폴더 맨 위로 고정"}
          className="p-1 rounded-lg text-gray-300 hover:text-amber-500 transition-colors"
        >
          <Star className={`w-3.5 h-3.5 ${project.isPinned ? 'text-amber-500 fill-amber-500' : ''}`} />
        </button>

        {/* Live dot */}
        {isDeployed ? (
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="배포됨" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-neutral-600 shrink-0" title="미배포" />
        )}

        {/* Project Name */}
        <span className="font-bold text-sm text-gray-900 dark:text-white truncate shrink-0">
          {project.name}
        </span>

        {/* Editable Description */}
        {isEditingDesc ? (
          <input
            type="text"
            autoFocus
            value={descInput}
            onChange={(e) => setDescInput(e.target.value)}
            onKeyDown={handleDescKeyDown}
            onBlur={handleSaveDesc}
            placeholder="설명 입력 (Enter 저장)"
            className="flex-1 max-w-md px-2.5 py-0.5 text-xs rounded-lg border border-blue-500 bg-white dark:bg-[#20222A] text-gray-900 dark:text-white outline-none"
          />
        ) : (
          <div
            onClick={() => setIsEditingDesc(true)}
            title="클릭하여 설명 입력"
            className={`flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer truncate max-w-md hidden lg:flex group/desc py-0.5 px-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${
              !project.description ? 'min-w-[24px] min-h-[22px]' : ''
            }`}
          >
            {project.description && (
              <span className="truncate">
                {project.description}
              </span>
            )}
            <Pencil className={`w-2.5 h-2.5 text-blue-500 shrink-0 transition-opacity ${
              project.description 
                ? 'opacity-0 group-hover/desc:opacity-100' 
                : 'opacity-0 group-hover:opacity-60 hover:opacity-100'
            }`} />
          </div>
        )}
      </div>

      {/* Right: Folder Selector, Buttons */}
      <div className="flex items-center gap-2.5 shrink-0">

        {/* Custom Folder Dropdown Chip */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100/80 dark:bg-white/5 hover:bg-gray-200/80 dark:hover:bg-white/10 text-[11px] font-medium text-gray-600 dark:text-gray-300 transition-colors"
          >
            <FolderIcon className="w-3 h-3 text-gray-400" />
            <span>{currentFolder?.name || '기타'}</span>
            <ChevronDown className={`w-2.5 h-2.5 text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Floating Popover Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-36 py-1 bg-white dark:bg-[#20222A] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 border-b border-gray-100 dark:border-white/5">
                폴더 이동
              </div>
              <div className="p-1 space-y-0.5">
                {folders.filter(f => f.id !== 'all').map(f => {
                  const isSelected = (project.folderId || 'default') === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        onFolderChange(project.id, f.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>{f.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action button: Site Visit */}
        {isDeployed ? (
          <a
            href={project.deployUrl!}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#3182F6] hover:bg-[#1B64DA] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>방문</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        ) : (
          <a
            href={`${project.repoUrl}/settings/pages`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-gray-400 hover:text-blue-500"
          >
            <span>배포</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        )}

        {/* GitHub link */}
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noreferrer"
          title="GitHub"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
        </a>

      </div>

    </div>
  );
};
