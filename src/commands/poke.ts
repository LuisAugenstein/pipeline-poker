import { Command } from 'commander';

export function createPokeCommand(): Command {
  return new Command('poke')
    .description('Manually retrigger a pipeline by merging main into the PR branch')
    .argument('<pr-id>', 'The PR ID to poke')
    .action((prId: string) => {
      console.log('hello world');
    });
}
