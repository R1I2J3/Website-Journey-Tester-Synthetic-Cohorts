# Agent Instructions

- Always ask the user for explicit permission before pushing commits or changes to GitHub.
- Do not run `git push`, GitHub CLI push commands, or any equivalent remote-publishing command unless the user has confirmed that push for the current set of changes.
- It is okay to inspect Git status, prepare files, stage changes, and create local commits when requested, but remote pushes require a fresh confirmation first.
