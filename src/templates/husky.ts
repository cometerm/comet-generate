export const preCommitTemplate = () => `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged`;

export const prePushTemplate = () => `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run build`;

export const lintStagedConfigTemplate = () => ({
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "git add"],
  "*.{json,css,md}": ["prettier --write", "git add"],
});
