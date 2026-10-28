# Cell project workflow

The user explicitly requested that every future change to this project be synced to `yermusevych/cellproject` and published on GitHub Pages. This is standing authorization for this project's source synchronization and deployment; do not ask again on ordinary changes.

- Preserve the existing Sites project and audience. Test/build, publish its exact pushed source through Sites, then sync the same full project source to GitHub `main` and verify the Pages workflow succeeds.
- GitHub repository: https://github.com/yermusevych/cellproject
- Pages site: https://yermusevych.github.io/cellproject/
- Use the connected GitHub account `yermusevych`. The local CLI is signed into a different account (`bangoldar`); do not push using that identity or change account access without authorization.
- When using the connector, generate the full source snapshot with `python scripts/github-snapshot.py`. Create any binary blobs, create a Git tree from scratch with all snapshot entries, create a commit parented to the current GitHub `main` head, then update `main` with its expected head SHA. Include deletions by using the complete tree. Do not replace unrelated user changes silently; inspect the current branch before syncing.
- `.github/workflows/pages.yml` tests/builds and deploys every `main` push. Preserve its `/cellproject/` asset base. The ordinary Sites build keeps `/`.
- Sync source, tests, configuration and documentation; ignore dependencies, generated builds, local credentials, QA captures and runtime files. Never upload the user's textbook PDFs or attachment files unless explicitly requested.
- Keep the biology at the supplied textbook level and preserve all six user-selected models and always-active 3D controls.
