import { $ } from 'zx'

const createFolder = async (folderName) => {
  try {
    await $`mkdir ${folderName}`;
  } catch (err) {
    // Folder exists 
  }
}

export default createFolder;