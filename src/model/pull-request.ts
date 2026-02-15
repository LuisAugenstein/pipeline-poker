import { Octokit } from "@octokit/rest";

export type PRStatus = 'success' | 'failure' | 'pending' | undefined;
export type MergeableState = 'updated' | 'outdated' | 'conflict' | undefined;

export class PullRequest {
  id: number;
  repo: string;
  owner: string;
  status?: PRStatus;
  mergeableState?: MergeableState;
  pipelineUrl?: string;
  reviewComments?: number;

  constructor(id: number, owner: string, repo: string) {
    this.id = id;
    this.owner = owner;
    this.repo = repo;
  }

  static async loadFromGithub(octokit: Octokit, prId: number, owner: string, repo: string): Promise<PullRequest> {
    const prResponse = await octokit.pulls.get({
      owner,
      repo,
      pull_number: prId,
    });
    const pr = prResponse.data;

    const statusResponse = await octokit.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      branch: pr.head.ref,
      status: 'completed',
      per_page: 1,
    });
    const latestRun = statusResponse.data.workflow_runs.length > 0 ? statusResponse.data.workflow_runs[0] : undefined;

    const pullRequest = new PullRequest(prId, owner, repo);
    pullRequest.mergeableState = pr.mergeable_state as MergeableState;
    pullRequest.pipelineUrl = latestRun?.html_url;
    pullRequest.status = latestRun?.conclusion as PRStatus;
    pullRequest.reviewComments = pr.review_comments;

    return pullRequest;
  }
}
