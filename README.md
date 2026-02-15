# pipeline-poker ♠️

**Poke your flaky pipelines back to life.**

Flaky CI pipelines can fail unpredictably, forcing developers to constantly check PRs and manually retrigger builds — pipeline-poker automates this process.

## Setup

Run `pp login` and follow the device flow to authenticate with GitHub.

## Usage

```bash
pp login          # Authenticate with GitHub (first time only)
pp logout         # Clear stored token
pp poke <pr-id>   # Update PR branch (merge main into feature branch)
pp watch <pr-id>  # Add a PR to the watchlist
pp status         # Show watchlist status
```

