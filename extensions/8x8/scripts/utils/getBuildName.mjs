import getTodayDate from './getTodayDate.mjs';
import getCurrentBranch from './getCurrentBranch.mjs';
import packageJson from '../../package.json' assert { type: 'json' };

const getBuildName = async () => {
  const todayDate = getTodayDate();
  const fullVersion = `${packageJson.version}.${todayDate}`;


  const branch = await getCurrentBranch();
  const isProdBranch = branch === 'master';
  const readableBranch = branch.replace('/', '-').replace('_', '-');
  return isProdBranch ? fullVersion : `${fullVersion}-${readableBranch}-SNAPSHOT`;
}

export default getBuildName;