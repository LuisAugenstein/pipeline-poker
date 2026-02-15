# pipeline-poker Architecture

## Overview

Flaky CI pipelines fail unpredictably, forcing developers to constantly monitor PRs and manually retrigger builds. `pipeline-poker` automates this retriggering by merging `main` into PR branches and tracking retry history.

**Current MVP goals:**
- CLI-based interaction only (no background daemon yet)
- Minimal commands: `watch <pr-id>`, `status`, `poke <pr-id>`
- Persistent state stored locally in the user’s home directory
- GitHub Actions integration via `@octokit/rest`

---

## MVP Scope

1. **CLI Commands**
   - `pp watch <pr-id>`: Add a PR to the watchlist for tracking
   - `pp status`: Show the watchlist, last known status, and retry counts
   - `pp poke <pr-id>`: Manually retrigger a pipeline by merging `main` into the PR branch

2. **Persistent State**
   - Location: `~/.pipeline-poker/`
   - Files:
     - `state.json`: Stores PR watchlist, retry counts, last error messages, and paused state
     - `config.json`: Stores GitHub token, default repo/org, polling interval
   - JSON example for `state.json`:
     ```json
     {
       "prs": [
         {
           "id": 142,
           "repo": "my-org/my-repo",
           "lastStatus": "failure",
           "retries": 1,
           "paused": false,
           "lastError": "Unit tests failed"
         }
       ]
     }
     ```

3. **GitHub Integration**
   - Use `@octokit/rest` for:
     - Fetching PR details
     - Checking CI status
     - Merging `main` into PR branches
     - Pushing changes to trigger CI
   - Authentication via `GITHUB_TOKEN` environment variable or `config.json`

4. **CLI UX**
   - Optional alias for convenience: `alias pp='pipeline-poker'`
   - Commands should print clear, color-coded output (success/failure) using `chalk`
   - Optional table formatting for watchlist using `cli-table3`

---
