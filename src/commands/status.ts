import { Command } from 'commander';
import { Octokit } from '@octokit/rest';
import chalk from 'chalk';
import { getToken } from '../auth';
import { Watchlist } from '../model/watchlist';
import { PullRequest } from '../model/pull-request';
import { StatusTable } from '../model/status-table';

export function createStatusCommand(): Command {
  return new Command('status')
    .description('Show the watchlist with branch and pipeline status')
    .action(async () => {
      const token = await getToken();
      const octokit = new Octokit({ auth: token });

      try {
        await showStatus(octokit);
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });
}

async function showStatus(octokit: Octokit): Promise<void> {
  const watchlist = Watchlist.load();
  if (watchlist.getAll().length === 0) {
    console.log(chalk.yellow('No PRs in watchlist. Run "pp watch <pr-id>" to add one.'));
    return;
  }

  console.log(chalk.blue('Fetching latest status...\n'));
  for (const pr of watchlist.getAll()) {
    const prToUpdate = await PullRequest.loadFromGithub(octokit, pr.id, pr.owner, pr.repo);
    watchlist.update(pr.id, pr.owner, pr.repo, {
      status: prToUpdate.status,
      pipelineUrl: prToUpdate.pipelineUrl,
      reviewComments: prToUpdate.reviewComments,
    });
  }
  watchlist.save();

  for (const [repoFullName, prs] of watchlist.getAllGroupedByRepository()) {
    console.log(chalk.white.bold(`${repoFullName}`));
    const table = new StatusTable(prs);
    console.log(table.toString());
    console.log();
  }
}
