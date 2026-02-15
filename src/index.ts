#!/usr/bin/env node

import { Command } from 'commander';
import { createWatchCommand } from './commands/watch';
import { createStatusCommand } from './commands/status';
import { createPokeCommand } from './commands/poke';
import { createLoginCommand, createLogoutCommand } from './commands/login';

const program = new Command();

program
  .name('pp')
  .description('Poke your flaky pipelines back to life')
  .version('0.1.0');

program.addCommand(createLoginCommand());
program.addCommand(createLogoutCommand());
program.addCommand(createPokeCommand());
program.addCommand(createWatchCommand());
program.addCommand(createStatusCommand());

program.parse();
