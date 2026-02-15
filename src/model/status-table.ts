import Table from 'cli-table3';
import chalk from 'chalk';
import { PullRequest, PRStatus } from './pull-request';

export class StatusTable extends Table {
  constructor(prs: PullRequest[]) {
    super({
      head: [
        chalk.white('PR'),
        chalk.white('Status'),
        chalk.white('Review Comments'),
      ],
      colWidths: [8, 15, 18],
      style: {
        head: [],
      },
    });

    for (const pr of prs) {
      this.push([
        { content: `#${pr.id}`, href: `https://github.com/${pr.owner}/${pr.repo}/pull/${pr.id}` },
        { content: formatPRStatus(pr.status), href: pr.pipelineUrl },
        pr.reviewComments?.toString() || '0',
      ]);
    }
  }
}

function formatPRStatus(prStatus?: PRStatus): string {
  if (!prStatus) {
    return chalk.gray('unknown');
  }

  const { status, conclusion } = prStatus;

  if (status === 'completed' && conclusion) {
    switch (conclusion) {
      case 'success':
        return chalk.green('success');
      case 'action_required':
        return chalk.yellow('action_required');
      case 'cancelled':
        return chalk.red('cancelled');
      case 'failure':
        return chalk.red('failure');
      case 'neutral':
        return chalk.green('neutral');
      case 'skipped':
        return chalk.red('skipped');
      case 'stale':
        return chalk.red('stale');
      case 'timed_out':
        return chalk.red('timed_out');
      default:
        console.warn(chalk.gray(`Unknown conclusion: ${conclusion}`));
        return chalk.gray('unknown');
    }
  }

  switch (status) {
    case 'success':
      return chalk.green('success');
    case 'in_progress':
      return chalk.yellow('in_progress');
    case 'action_required':
      return chalk.yellow('action_required');
    case 'queued':
      return chalk.yellow('queued');
    case 'requested':
      return chalk.yellow('requested');
    case 'waiting':
      return chalk.yellow('waiting');
    case 'pending':
      return chalk.yellow('pending');
    case 'completed':
      return chalk.green('completed');
    default:
      console.warn(chalk.gray(`Unknown status: ${status}`));
      return chalk.gray('unknown');
  }
}