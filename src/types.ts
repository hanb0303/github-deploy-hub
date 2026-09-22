export type DeploymentPlatform = 
  | 'github-pages' 
  | 'vercel' 
  | 'netlify' 
  | 'cloudflare' 
  | 'render' 
  | 'custom' 
  | 'unknown';

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
}

export interface Folder {
  id: string;
  name: string;
}

export interface ProjectItem {
  id: string | number;
  name: string;
  fullName: string;
  description: string;
  deployUrl: string | null;
  repoUrl: string;
  platform: DeploymentPlatform;
  language: string | null;
  folderId?: string;
  isPinned?: boolean;
  updatedAt: string;
  isCustom?: boolean;
}
