import Table from 'cli-table3';
import chalk from 'chalk';
import { PullRequest, PRStatus } from './pull-request';

export class StatusTable extends Table {
  constructor(prs: PullRequest[]) {
    super({
      head: [
        chalk.white('PR'),
        chalk.white('Status'),
        chalk.white('Mergeable State'),
        chalk.white('Review Comments'),
      ],
      colWidths: [8, 15, 20, 18],
      style: {
        head: [],
      },
    });

    for (const pr of prs) {
      this.push([
        { content: `#${pr.id}`, href: `https://github.com/${pr.owner}/${pr.repo}/pull/${pr.id}` },
        { content: formatPRStatus(pr.status), href: pr.pipelineUrl },
        pr.mergeableState,
        pr.reviewComments?.toString() || '0',
      ]);
    }
  }
}

function formatPRStatus(status?: PRStatus): string {
  switch (status) {
    case 'success':
      return chalk.green('success');
    case 'failure':
      return chalk.red('failure');
    case 'pending':
      return chalk.yellow('pending');
    default:
      return chalk.gray('unknown');
  }
}
