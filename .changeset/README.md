# Changesets

This repo uses [changesets](https://github.com/changesets/changesets) for versioning and changelog generation.

Workflow:

1. With every user-visible change, run `npx changeset` and describe the change (patch/minor/major).
2. Merge the PR with the changeset file included.
3. The version workflow (`.github/workflows/version.yml`) opens or updates a "Version Packages" PR that bumps `package.json` and `CHANGELOG.md`.
4. Merging the version PR updates `main`; publishing still happens through the existing hardened release workflow (`release.yml`, npm Trusted Publishing) by creating a GitHub release for the new version.

`npm run version:check` still guards that `package.json` and `CHANGELOG.md` agree before release.
