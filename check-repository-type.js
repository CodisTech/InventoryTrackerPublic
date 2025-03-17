/**
 * Repository Type Detection Utility
 * 
 * This script detects which repository type (private, public, sandbox)
 * the application is currently running in.
 * 
 * Detection is based on the following hierarchy:
 * 1. .repository-type file
 * 2. REPOSITORY_TYPE environment variable
 * 3. Git branch name
 * 4. Default to "private"
 */

import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Detect the repository type based on available indicators
 * @returns {"private" | "public" | "sandbox"} The detected repository type
 */
function detectRepositoryType() {
  // Check for .repository-type file
  try {
    if (fs.existsSync('.repository-type')) {
      const repoType = fs.readFileSync('.repository-type', 'utf8').trim();
      if (['private', 'public', 'sandbox'].includes(repoType)) {
        console.log(`Repository type detected from .repository-type file: ${repoType}`);
        return repoType;
      }
    }
  } catch (error) {
    console.warn('Error reading .repository-type file:', error.message);
  }

  // Check for environment variable
  if (process.env.REPOSITORY_TYPE) {
    const repoType = process.env.REPOSITORY_TYPE.toLowerCase();
    if (['private', 'public', 'sandbox'].includes(repoType)) {
      console.log(`Repository type detected from environment variable: ${repoType}`);
      return repoType;
    }
  }

  // Check git branch name
  try {
    const gitBranch = detectGitBranch();
    if (gitBranch) {
      if (gitBranch === 'main') {
        console.log(`Repository type detected from git branch (main): private`);
        return 'private';
      } else if (['public', 'sandbox'].includes(gitBranch)) {
        console.log(`Repository type detected from git branch: ${gitBranch}`);
        return gitBranch;
      }
    }
  } catch (error) {
    console.warn('Error detecting git branch:', error.message);
  }

  // Default to private
  console.log('No repository type indicators found, defaulting to: private');
  return 'private';
}

/**
 * Detect the current git branch
 * @returns {string|null} The detected git branch name or null if not detected
 */
function detectGitBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    return branch;
  } catch (error) {
    return null;
  }
}

// Get the repository type
const repositoryType = detectRepositoryType();

// Also create the .repository-type file if it doesn't exist
if (!fs.existsSync('.repository-type')) {
  fs.writeFileSync('.repository-type', repositoryType);
  console.log(`.repository-type file created with value: ${repositoryType}`);
}

// Export the repository type
export default repositoryType;
export { repositoryType };

// Output a message about the detected repository type
console.log(`Repository type: ${repositoryType}`);