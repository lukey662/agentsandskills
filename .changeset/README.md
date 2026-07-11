# Changesets

This repo uses [changesets](https://github.com/changesets/changesets) for versioning and changelog generation.

Workflow:

1. With every user-visible change, run `npx changeset` and describe the change (patch/minor/major).
2. Merge the PR with the changeset file included.
3. The version workflow (`.github/workflows/version.yml`) opens or updates a "Version Packages" PR that bumps `package.json` and `CHANGELOG.md`.
4. Merging the version PR updates `main`; `release.yml` publishes the missing npm version through Trusted Publishing, verifies it, and only then creates the GitHub release.

`npm run version:check` still guards that `package.json` and `CHANGELOG.md` agree before release.
