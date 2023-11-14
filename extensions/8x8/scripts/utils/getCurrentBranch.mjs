import { $ } from 'zx';

const getCurrentBranch = async () => {
  const envBranch = process.env.BUILD_BRANCH
  if (envBranch) return envBranch.replace('refs/heads/', '');

  const { stdout } = await $`git rev-parse --abbrev-ref HEAD`;
  return stdout.trim();
}

export default getCurrentBranch;