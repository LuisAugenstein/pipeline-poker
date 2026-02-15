import { Command } from 'commander';
import { Octokit } from '@octokit/rest';
import chalk from 'chalk';
import { getToken } from '../auth';
import { Watchlist } from '../model/watchlist';
import { PullRequest } from '../model/pull-request';
import { getRepoInfo } from '../repo';
import { StatusTable } from '../model/status-table';

export function createWatchCommand(): Command {
  return new Command('watch')
    .description('Add a PR to the watchlist for tracking')
    .argument('<pr-id>', 'The PR ID to watch')
    .option('-o, --owner <owner>', 'Repository owner')
    .option('-r, --repo <repo>', 'Repository name')
    .action(async (prId: string, options: { owner?: string; repo?: string }) => {
      const token = await getToken();
      const octokit = new Octokit({ auth: token });

      const prIdNum = parseInt(prId, 10);
      const { owner, repo } = (options.owner && options.repo)
        ? { owner: options.owner, repo: options.repo }
        : await getRepoInfo();

      try {
        const watchlist = Watchlist.load();
        if (watchlist.find(prIdNum, owner, repo)) {
          console.log(chalk.yellow(`PR already in watchlist`));
          return;
        }

        console.log(chalk.blue(`Fetching PR #${prId}...`));
        const pr = await PullRequest.loadFromGithub(octokit, prIdNum, owner, repo);
        watchlist.add(pr);
        watchlist.save();
        
        console.log(chalk.green(`PR #${pr.id} added to watchlist!`));
        console.log(chalk.white.bold(`${pr.owner}/${pr.repo}\n`));
        const table = new StatusTable([pr]);
        console.log(table.toString());
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });
}
