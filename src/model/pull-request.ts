import { Octokit } from "@octokit/rest";

// see documentation for these types in
// https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks#check-statuses-and-conclusions
export type PRStatusStatus = 'completed' | 'action_required' | 'cancelled' | 'failure' | 'neutral' | 'skipped' | 'stale' | 'success' | 'timed_out' | 'in_progress' | 'queued' | 'requested' | 'waiting' | 'pending';
export type PRStatusConclusion = 'action_required' | 'cancelled' | 'failure' | 'neutral' | 'skipped' | 'stale' | 'success' | 'timed_out';

export type PRStatus = {
  status: PRStatusStatus;
  conclusion?: PRStatusConclusion;
};

/**
 * clean: The pull request has no conflicts and can be merged.
 * unstable: The pull request has merge conflicts but can be resolved.
 * dirty: The pull request has merge conflicts that cannot be resolved.
 */
export type MergeableState = 'clean' | 'unstable' | 'dirty';

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
      per_page: 1,
    });
    const latestRun = statusResponse.data.workflow_runs.length > 0 ? statusResponse.data.workflow_runs[0] : undefined;

    const pullRequest = new PullRequest(prId, owner, repo);
    pullRequest.mergeableState = pr.mergeable_state as MergeableState;
    pullRequest.pipelineUrl = latestRun?.html_url;
    pullRequest.status = {
      status: latestRun?.status as PRStatusStatus,
      conclusion: latestRun?.conclusion as PRStatusConclusion,
    };
    pullRequest.reviewComments = pr.review_comments;

    return pullRequest;
  }
}
