import { Command } from 'commander';

export function createWatchCommand(): Command {
  return new Command('watch')
    .description('Add a PR to the watchlist for tracking')
    .argument('<pr-id>', 'The PR ID to watch')
    .action((prId: string) => {
      console.log('hello world');
    });
}
