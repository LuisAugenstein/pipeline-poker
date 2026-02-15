import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export type PRStatus = 'success' | 'failure' | 'pending' | 'unknown';
export type BranchStatus = 'updated' | 'outdated' | 'conflict' | 'unknown';

export interface WatchedPR {
  id: number;
  repo: string;
  owner: string;
  status: PRStatus;
  branchStatus: BranchStatus;
  pipelineUrl?: string;
  openComments?: number;
}

export interface Watchlist {
  prs: WatchedPR[];
}

function getConfigDir(): string {
  return path.join(os.homedir(), '.pipeline-poker');
}

function getWatchlistPath(): string {
  return path.join(getConfigDir(), 'watchlist.json');
}

export function loadWatchlist(): Watchlist {
  const watchlistPath = getWatchlistPath();
  
  if (!fs.existsSync(watchlistPath)) {
    return { prs: [] };
  }

  const data = fs.readFileSync(watchlistPath, 'utf8');
  return JSON.parse(data);
}

export function saveWatchlist(watchlist: Watchlist): void {
  const configDir = getConfigDir();
  fs.mkdirSync(configDir, { recursive: true });
  
  const watchlistPath = getWatchlistPath();
  fs.writeFileSync(watchlistPath, JSON.stringify(watchlist, null, 2));
}

export function addToWatchlist(pr: WatchedPR): void {
  const watchlist = loadWatchlist();
  
  const existing = watchlist.prs.find(p => p.id === pr.id && p.owner === pr.owner && p.repo === pr.repo);
  if (existing) {
    console.log('PR already in watchlist');
    return;
  }

  watchlist.prs.push(pr);
  saveWatchlist(watchlist);
}

export function removeFromWatchlist(prId: number, owner: string, repo: string): void {
  const watchlist = loadWatchlist();
  watchlist.prs = watchlist.prs.filter(p => !(p.id === prId && p.owner === owner && p.repo === repo));
  saveWatchlist(watchlist);
}

export function updatePRStatus(prId: number, owner: string, repo: string, status: Partial<WatchedPR>): void {
  const watchlist = loadWatchlist();
  
  const pr = watchlist.prs.find(p => p.id === prId && p.owner === owner && p.repo === repo);
  if (pr) {
    Object.assign(pr, status);
    saveWatchlist(watchlist);
  }
}
