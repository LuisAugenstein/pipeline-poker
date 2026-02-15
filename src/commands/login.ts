import { Command } from 'commander';
import { login, logout } from '../auth';

export function createLoginCommand(): Command {
  return new Command('login')
    .description('Authenticate with GitHub via device flow')
    .action(async () => {
      await login();
    });
}

export function createLogoutCommand(): Command {
  return new Command('logout')
    .description('Clear stored authentication token')
    .action(() => {
      logout();
    });
}
