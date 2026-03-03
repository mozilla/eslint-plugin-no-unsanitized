# Instructions for creating a new release

# Check everything locally:

- `npm run test`
- `npm run lint`

# Preparing the code

- Bump version in package.json
- git add
- git commit
- git push to branch
- Get code review (branch protection) and then merge
- wait for travis results just to be sure.

**At this point people tracking `main` should already get the new version**

# Publish the release as a new version

- git tag -a x.y.z
- npm publish
- git push --tags
- Go to [https://github.com/mozilla/eslint-plugin-no-unsanitized/releases](https://github.com/mozilla/eslint-plugin-no-unsanitized/releases) to create a new release. Pick the right tag.
