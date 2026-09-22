import { useState, useEffect, useMemo } from 'react';
import { 
  ProjectItem, 
  Folder 
} from './types';
import { 
  fetchGitHubRepos, 
  getFolders, 
  saveFolder, 
  deleteFolder, 
  saveFoldersOrder,
  setProjectFolder,
  getPinnedIds,
  togglePinnedId,
  getCollapsedFolders,
  toggleCollapsedFolder,
  setCustomDescription,
  getProjectOrder,
  saveProjectOrder
} from './services/github';
import { Header } from './components/Header';
import { FolderTabs } from './components/FolderTabs';
import { ProjectRow } from './components/ProjectRow';
import { 
  Loader2, 
  FolderOpen, 
  ChevronRight,
  Folder as FolderIcon
} from 'lucide-react';

const DEFAULT_USERNAME = 'hanb0303';

export function App() {
  const [username, setUsername] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('user') || DEFAULT_USERNAME;
  });

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>(getFolders());
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pinned (Favorites)
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => getPinnedIds());

  // Collapsed folders in All view
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>(() => getCollapsedFolders());

  // Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('gitdeploy_dark_mode');
    return saved !== null ? saved === 'true' : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('gitdeploy_dark_mode', String(darkMode));
  }, [darkMode]);

  // Load data
  const loadData = async (targetUser: string, force = false) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const repos = await fetchGitHubRepos(targetUser, force);
      
      // Apply saved project order if available
      const savedOrder = getProjectOrder();
      if (savedOrder.length > 0) {
        const orderMap = new Map(savedOrder.map((id, index) => [id, index]));
        repos.sort((a, b) => {
          const orderA = orderMap.has(String(a.id)) ? orderMap.get(String(a.id))! : 9999;
          const orderB = orderMap.has(String(b.id)) ? orderMap.get(String(b.id))! : 9999;
          return orderA - orderB;
        });
      }
      setProjects(repos);
    } catch (err: any) {
      setErrorMsg(err.message || '데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(username);
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('user', username);
    window.history.replaceState({}, '', currentUrl.toString());
  }, [username]);

  // Folder Operations
  const handleAddFolder = (name: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
    };
    const updated = saveFolder(newFolder);
    setFolders(updated);
    setActiveFolderId(newFolder.id);
  };

  const handleDeleteFolder = (id: string) => {
    const updated = deleteFolder(id);
    setFolders(updated);
    if (activeFolderId === id) {
      setActiveFolderId('all');
    }
    setProjects(prev => prev.map(p => {
      if (p.folderId === id) {
        setProjectFolder(p.id, 'default');
        return { ...p, folderId: 'default' };
      }
      return p;
    }));
  };

  const handleReorderFolders = (newFolders: Folder[]) => {
    setFolders(newFolders);
    saveFoldersOrder(newFolders);
  };

  const handleProjectFolderChange = (projectId: string | number, newFolderId: string) => {
    setProjectFolder(projectId, newFolderId);
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, folderId: newFolderId };
      }
      return p;
    }));
  };

  // Drag & drop project reordering
  const handleReorderProject = (sourceId: string | number, targetId: string | number) => {
    const sourceIndex = projects.findIndex(p => String(p.id) === String(sourceId));
    const targetIndex = projects.findIndex(p => String(p.id) === String(targetId));
    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;

    const updated = [...projects];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setProjects(updated);
    saveProjectOrder(updated.map(p => p.id));
  };

  // Pin Toggle: pins item and moves it to the top of its folder
  const handleTogglePin = (projectId: string | number) => {
    const updated = togglePinnedId(projectId);
    setPinnedIds(updated);
    const isNowPinned = updated.includes(String(projectId));

    setProjects(prev => {
      const updatedProjects = prev.map(p => {
        if (p.id === projectId) {
          return { ...p, isPinned: isNowPinned };
        }
        return p;
      });

      // If newly pinned, move it to the top of its folder in project order
      if (isNowPinned) {
        const itemIdx = updatedProjects.findIndex(p => String(p.id) === String(projectId));
        if (itemIdx > -1) {
          const [pinnedItem] = updatedProjects.splice(itemIdx, 1);
          const firstInFolderIdx = updatedProjects.findIndex(
            p => (p.folderId || 'default') === (pinnedItem.folderId || 'default')
          );
          if (firstInFolderIdx > -1) {
            updatedProjects.splice(firstInFolderIdx, 0, pinnedItem);
          } else {
            updatedProjects.unshift(pinnedItem);
          }
          saveProjectOrder(updatedProjects.map(p => p.id));
        }
      }
      return updatedProjects;
    });
  };

  // Folder Collapse Toggle
  const handleToggleCollapse = (folderId: string) => {
    const updated = toggleCollapsedFolder(folderId);
    setCollapsedFolders(updated);
  };

  // Description Change
  const handleDescriptionChange = (projectId: string | number, newDesc: string) => {
    setCustomDescription(projectId, newDesc);
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, description: newDesc };
      }
      return p;
    }));
  };

  // Always show deployed projects
  const deployedProjects = useMemo(() => {
    return projects.filter(p => !!p.deployUrl);
  }, [projects]);

  // Counts per folder
  const projectCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    folders.forEach(f => {
      counts[f.id] = 0;
    });

    deployedProjects.forEach(p => {
      counts.all = (counts.all || 0) + 1;
      const fId = p.folderId || 'default';
      counts[fId] = (counts[fId] || 0) + 1;
    });

    return counts;
  }, [deployedProjects, folders]);

  // Total Deployed
  const totalDeployed = deployedProjects.length;

  // Filtered projects with pinned items at the top
  const filteredProjects = useMemo(() => {
    const list = deployedProjects.filter(p => {
      if (activeFolderId !== 'all') {
        const currentFId = p.folderId || 'default';
        if (currentFId !== activeFolderId) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchLang = p.language?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchLang) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      const pinA = pinnedIds.includes(String(a.id)) ? 1 : 0;
      const pinB = pinnedIds.includes(String(b.id)) ? 1 : 0;
      return pinB - pinA;
    });
  }, [deployedProjects, activeFolderId, search, pinnedIds]);

  // Grouped by folder for 'all' view (with pinned items at the top of each folder)
  const groupedByFolder = useMemo(() => {
    if (activeFolderId !== 'all') return [];

    const groupMap = new Map<string, ProjectItem[]>();
    folders.filter(f => f.id !== 'all').forEach(f => {
      groupMap.set(f.id, []);
    });

    filteredProjects.forEach(p => {
      const fId = p.folderId || 'default';
      if (!groupMap.has(fId)) {
        groupMap.set(fId, []);
      }
      groupMap.get(fId)!.push(p);
    });

    return folders
      .filter(f => f.id !== 'all')
      .map(f => ({
        folder: f,
        items: (groupMap.get(f.id) || []).sort((a, b) => {
          const pinA = pinnedIds.includes(String(a.id)) ? 1 : 0;
          const pinB = pinnedIds.includes(String(b.id)) ? 1 : 0;
          return pinB - pinA;
        }),
      }))
      .filter(g => g.items.length > 0);
  }, [filteredProjects, folders, activeFolderId, pinnedIds]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0E1015] text-gray-900 dark:text-white transition-colors duration-200">
      
      {/* Sleek Minimal Header */}
      <Header
        username={username}
        onUsernameChange={setUsername}
        search={search}
        onSearchChange={setSearch}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onRefresh={() => loadData(username, true)}
        isLoading={isLoading}
        totalDeployed={totalDeployed}
      />

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8 space-y-6">
        
        {/* Error notice */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm font-medium border border-rose-100 dark:border-rose-900/40">
            {errorMsg}
          </div>
        )}

        {/* Folder Navigation Tabs */}
        <div className="flex items-center justify-between gap-4">
          <FolderTabs
            folders={folders}
            activeFolderId={activeFolderId}
            onSelectFolder={setActiveFolderId}
            onAddFolder={handleAddFolder}
            onDeleteFolder={handleDeleteFolder}
            onReorderFolders={handleReorderFolders}
            onDropProjectOnFolder={handleProjectFolderChange}
            projectCounts={projectCounts}
          />
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-gray-400">프로젝트 목록을 불러오는 중</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          
          /* When viewing 'all' folder -> Accordion Folder Grouping */
          activeFolderId === 'all' && !search.trim() ? (
            <div className="space-y-6">
              {groupedByFolder.map(({ folder, items }) => {
                const isCollapsed = !!collapsedFolders[folder.id];

                return (
                  <div key={folder.id} className="space-y-2.5">
                    
                    {/* Accordion Header */}
                    <button
                      type="button"
                      onClick={() => handleToggleCollapse(folder.id)}
                      className="w-full flex items-center justify-between py-1 px-1 group cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
                        <FolderIcon className="w-4 h-4 text-blue-500" />
                        <span className="font-bold text-base text-gray-900 dark:text-white">
                          {folder.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200/60 dark:bg-white/10 text-gray-500 dark:text-gray-400 font-semibold">
                          {items.length}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">
                        {isCollapsed ? '펼치기' : '접기'}
                      </span>
                    </button>

                    {/* Folder Items (Compact List Rows with Drag and Drop) */}
                    {!isCollapsed && (
                      <div className="space-y-2">
                        {items.map((project) => (
                          <ProjectRow
                            key={project.id}
                            project={project}
                            folders={folders}
                            onFolderChange={handleProjectFolderChange}
                            onTogglePin={handleTogglePin}
                            onDescriptionChange={handleDescriptionChange}
                            onReorderProject={handleReorderProject}
                          />
                        ))}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          ) : (
            /* Single Folder View or Search Active */
            <div className="space-y-2">
              {filteredProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  folders={folders}
                  onFolderChange={handleProjectFolderChange}
                  onTogglePin={handleTogglePin}
                  onDescriptionChange={handleDescriptionChange}
                  onReorderProject={handleReorderProject}
                />
              ))}
            </div>
          )

        ) : (
          <div className="py-24 text-center rounded-3xl bg-white dark:bg-[#1c1e24] border border-gray-100 dark:border-white/5 p-8">
            <FolderOpen className="w-10 h-10 mx-auto text-gray-300 dark:text-neutral-600 mb-3" />
            <p className="text-base font-bold text-gray-900 dark:text-white">이 폴더에 배포된 프로젝트가 없습니다</p>
            <p className="text-xs text-gray-400 mt-1">다른 폴더를 선택하거나 프로젝트를 드래그해서 이 폴더로 옮겨보세요.</p>
          </div>
        )}

      </main>

    </div>
  );
}

export default App;
