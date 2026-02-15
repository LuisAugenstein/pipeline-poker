import { Command } from 'commander';
import { Octokit } from '@octokit/rest';
import chalk from 'chalk';
import { getToken } from '../auth';

export function createPokeCommand(): Command {
  return new Command('poke')
    .description('Manually retrigger a pipeline by merging main into the PR branch')
    .argument('<pr-id>', 'The PR ID to poke')
    .option('-o, --owner <owner>', 'Repository owner (default: from git remote)')
    .option('-r, --repo <repo>', 'Repository name (default: from git remote)')
    .action(async (prId: string, options: { owner?: string; repo?: string }) => {
      const token = await getToken();

      const octokit = new Octokit({ auth: token });

      const [owner, repo] = await getRepoInfo(options.owner, options.repo);

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

async function getRepoInfo(cliOwner?: string, cliRepo?: string): Promise<[string, string]> {
  if (cliOwner && cliRepo) {
    return [cliOwner, cliRepo];
  }

  const { execSync } = await import('child_process');
  const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  
  const match = remoteUrl.match(/github\.com[/:]([\w-]+)\/([\w-]+?)(?:\.git)?$/);
  if (!match) {
    console.error(chalk.red('Error: Could not determine repo from git remote'));
    process.exit(1);
  }

  return [match[1], match[2]];
}
