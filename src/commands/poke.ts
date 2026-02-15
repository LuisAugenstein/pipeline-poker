import { Command } from 'commander';
import { Octokit } from '@octokit/rest';
import chalk from 'chalk';
import { getToken } from '../auth';
import { getRepoInfo } from '../repo';

export function createPokeCommand(): Command {
  return new Command('poke')
    .description('Manually retrigger a pipeline by merging main into the PR branch')
    .argument('<pr-id>', 'The PR ID to poke')
    .option('-o, --owner <owner>', 'Repository owner')
    .option('-r, --repo <repo>', 'Repository name')
    .action(async (prId: string, options: { owner?: string; repo?: string }) => {
      const token = await getToken();

      const octokit = new Octokit({ auth: token });

      const { owner, repo} = (options.owner && options.repo)
        ? { owner: options.owner, repo: options.repo }
        : await getRepoInfo();


      try {
        console.log(chalk.white(`Updating PR #${prId} branch...`));
        
        await octokit.pulls.updateBranch({
          owner,
          repo,
          pull_number: parseInt(prId, 10),
        });

        console.log(chalk.green('Branch updated successfully!'));
      } catch (error: any) {
        if (error.status === 422) {
          console.log(chalk.yellow('Branch is already up to date with main'));
        } else {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
      }
    });
}
