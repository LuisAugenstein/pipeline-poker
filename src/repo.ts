import { execSync } from 'child_process';
import chalk from 'chalk';

export interface RepoInfo {
  owner: string;
  repo: string;
}

/**
 * Gets the repository owner and name from the git remote origin.
 * 
 * @returns Promise resolving to RepoInfo with owner and repo
 * 
 * @example
 * const info = await getRepoInfo();
 */
export async function getRepoInfo(): Promise<RepoInfo> {
  const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  
  const match = remoteUrl.match(/github\.com[/:]([\w-]+)\/([\w-]+?)(?:\.git)?$/);
  if (!match) {
    console.error(chalk.red('Error: Could not determine repo from git remote'));
    process.exit(1);
  }

  return { owner: match[1], repo: match[2] };
}
