import { GitHubUser, ProjectItem, DeploymentPlatform, Folder } from '../types';

const CACHE_PREFIX = 'gitdeploy_hub_cache_';
const CACHE_EXPIRY_MS = 15 * 60 * 1000;
const FOLDERS_KEY = 'gitdeploy_folders_v1';
const PROJECT_FOLDER_MAP_KEY = 'gitdeploy_project_folders_map_v1';

export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'all', name: '전체' },
  { id: 'default', name: '기타' },
  { id: 'ai', name: 'AI 자동화' },
  { id: 'side', name: '사이드 프로젝트' },
];

export function getFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (!raw) {
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(DEFAULT_FOLDERS));
      return DEFAULT_FOLDERS;
    }
    const parsed: Folder[] = JSON.parse(raw);
    // Automatically update '미분류' to '기타'
    let hasChanged = false;
    const migrated = parsed.map(f => {
      if (f.id === 'default' && f.name === '미분류') {
        hasChanged = true;
        return { ...f, name: '기타' };
      }
      return f;
    });
    if (hasChanged) {
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return DEFAULT_FOLDERS;
  }
}

export function saveFolder(folder: Folder): Folder[] {
  const folders = getFolders();
  const index = folders.findIndex(f => f.id === folder.id);
  if (index >= 0) {
    folders[index] = folder;
  } else {
    folders.push(folder);
  }
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  return folders;
}

export function deleteFolder(folderId: string): Folder[] {
  let folders = getFolders().filter(f => f.id !== folderId);
  if (folders.length === 0) {
    folders = DEFAULT_FOLDERS;
  }
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  return folders;
}

export function saveFoldersOrder(folders: Folder[]): void {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

const PROJECT_ORDER_KEY = 'gitdeploy_project_order_v1';
export function getProjectOrder(): string[] {
  try {
    const raw = localStorage.getItem(PROJECT_ORDER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProjectOrder(order: (string | number)[]): void {
  localStorage.setItem(PROJECT_ORDER_KEY, JSON.stringify(order.map(String)));
}

export function getProjectFolderMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PROJECT_FOLDER_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setProjectFolder(projectId: string | number, folderId: string): void {
  const map = getProjectFolderMap();
  map[String(projectId)] = folderId;
  localStorage.setItem(PROJECT_FOLDER_MAP_KEY, JSON.stringify(map));
}

const PINNED_KEY = 'gitdeploy_pinned_ids_v1';
export function getPinnedIds(): string[] {
  try {
    const raw = localStorage.getItem(PINNED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function togglePinnedId(projectId: string | number): string[] {
  const current = getPinnedIds();
  const idStr = String(projectId);
  const exists = current.includes(idStr);
  const updated = exists ? current.filter(id => id !== idStr) : [...current, idStr];
  localStorage.setItem(PINNED_KEY, JSON.stringify(updated));
  return updated;
}

const COLLAPSED_KEY = 'gitdeploy_collapsed_folders_v1';
export function getCollapsedFolders(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function toggleCollapsedFolder(folderId: string): Record<string, boolean> {
  const current = getCollapsedFolders();
  current[folderId] = !current[folderId];
  localStorage.setItem(COLLAPSED_KEY, JSON.stringify(current));
  return { ...current };
}

const DESCRIPTIONS_KEY = 'gitdeploy_custom_descriptions_v1';
export function getCustomDescriptionMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(DESCRIPTIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setCustomDescription(projectId: string | number, desc: string): void {
  const map = getCustomDescriptionMap();
  map[String(projectId)] = desc;
  localStorage.setItem(DESCRIPTIONS_KEY, JSON.stringify(map));
}

export function detectPlatform(url: string | null): DeploymentPlatform {
  if (!url) return 'unknown';
  const lower = url.toLowerCase();
  if (lower.includes('github.io')) return 'github-pages';
  if (lower.includes('vercel.app')) return 'vercel';
  if (lower.includes('netlify.app')) return 'netlify';
  if (lower.includes('pages.dev')) return 'cloudflare';
  if (lower.includes('onrender.com') || lower.includes('render.com')) return 'render';
  if (lower.startsWith('http://') || lower.startsWith('https://')) return 'custom';
  return 'unknown';
}

export function formatPlatform(platform: DeploymentPlatform): string {
  switch (platform) {
    case 'github-pages': return 'GitHub Pages';
    case 'vercel': return 'Vercel';
    case 'netlify': return 'Netlify';
    case 'cloudflare': return 'Cloudflare';
    case 'render': return 'Render';
    case 'custom': return 'Web';
    default: return '';
  }
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: { 'Accept': 'application/vnd.github.v3+json' },
  });
  if (!res.ok) {
    throw new Error(`사용자 '${username}'을 조회할 수 없습니다.`);
  }
  return await res.json();
}

export async function fetchGitHubRepos(username: string, force = false): Promise<ProjectItem[]> {
  const cacheKey = `${CACHE_PREFIX}raw_repos_${username}`;
  let rawRepos: any[] | null = null;
  
  if (!force) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY_MS && Array.isArray(data)) {
          rawRepos = data;
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }

  if (!rawRepos) {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });
    if (!res.ok) {
      throw new Error('레포지토리 목록을 가져오지 못했습니다.');
    }
    rawRepos = await res.json();
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: rawRepos,
      }));
    } catch (e) {
      console.warn(e);
    }
  }

  // Always apply the latest user settings (folder, pin, description) in real-time
  const folderMap = getProjectFolderMap();
  const pinnedIds = getPinnedIds();
  const descMap = getCustomDescriptionMap();

  const projects: ProjectItem[] = (rawRepos || []).map((repo: any) => {
    let deployUrl: string | null = null;

    if (repo.homepage && typeof repo.homepage === 'string') {
      const clean = repo.homepage.trim();
      if (clean.length > 0 && !clean.includes(repo.html_url) && clean.startsWith('http')) {
        deployUrl = clean;
      }
    }

    if (!deployUrl && repo.has_pages) {
      deployUrl = `https://${username}.github.io/${repo.name}/`;
    }

    const platform = detectPlatform(deployUrl);
    const assignedFolder = folderMap[String(repo.id)] || 'default';
    const isPinned = pinnedIds.includes(String(repo.id));
    const customDesc = descMap[String(repo.id)];
    const description = customDesc !== undefined ? customDesc : (repo.description || '');

    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description,
      deployUrl,
      repoUrl: repo.html_url,
      platform,
      language: repo.language,
      folderId: assignedFolder,
      isPinned,
      updatedAt: repo.updated_at,
    };
  });

  return projects;
}
