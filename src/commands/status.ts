import { Command } from 'commander';

export function createStatusCommand(): Command {
  return new Command('status')
    .description('Show the watchlist, last known status, and retry counts')
    .action(() => {
      console.log('hello world');
    });
}
