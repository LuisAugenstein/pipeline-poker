import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { PullRequest } from './pull-request';

export class Watchlist {
  private prs: PullRequest[];
  private static configDir = path.join(os.homedir(), '.pipeline-poker');
  private static savePath = path.join(Watchlist.configDir, 'watchlist.json');

  constructor(prs: PullRequest[] = []) {
    this.prs = prs;
  }

  static load(): Watchlist {
    if (!fs.existsSync(Watchlist.savePath)) {
      return new Watchlist();
    }
    const data = fs.readFileSync(Watchlist.savePath, 'utf8');
    const parsed = JSON.parse(data);
    return new Watchlist(parsed.prs || []);
  }

  save(): void {
    fs.mkdirSync(Watchlist.configDir, { recursive: true });
    fs.writeFileSync(Watchlist.savePath, JSON.stringify({ prs: this.prs }, null, 2));
  }

  add(pr: PullRequest): void {
    const existing = this.prs.find(p => p.id === pr.id && p.owner === pr.owner && p.repo === pr.repo);
    if (existing) {
      return;
    }
    this.prs.push(pr);
  }

  update(prId: number, owner: string, repo: string, updatedPr: Partial<PullRequest>): void {
    const pr = this.find(prId, owner, repo);
    if (!pr) {
      return;
    }
    Object.assign(pr, updatedPr);
  }

  find(prId: number, owner: string, repo: string): PullRequest | undefined {
    return this.prs.find(p => p.id === prId && p.owner === owner && p.repo === repo);
  }

  getAll(): PullRequest[] {
    return this.prs;
  }

  remove(prId: number, owner: string, repo: string): void {
    const index = this.prs.findIndex(p => p.id === prId && p.owner === owner && p.repo === repo);
    if (index === -1) {
      return;
    }
    this.prs.splice(index, 1);
  }

  getAllGroupedByRepository(): Map<string, PullRequest[]> {
    const grouped = new Map<string, PullRequest[]>();
    for (const pr of this.prs) {
      const key = `${pr.owner}/${pr.repo}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(pr);
    }
    return grouped;
  }
}
