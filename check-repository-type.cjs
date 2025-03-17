/**
 * Repository Type Detector
 * 
 * This script detects which repository type (private, public, sandbox) the code is running in
 * by checking the .repository-type file at the root of the project.
 * 
 * It's used during build time to configure the application accordingly.
 */

const fs = require('fs');
const path = require('path');

/**
 * Detects the repository type from the .repository-type file
 * @returns {'private'|'public'|'sandbox'} Repository type
 */
function detectRepositoryType() {
  const repoTypePath = path.join(__dirname, '.repository-type');
  
  try {
    if (fs.existsSync(repoTypePath)) {
      const content = fs.readFileSync(repoTypePath, 'utf8');
      const match = content.match(/repository:\s*(\w+)/);
      
      if (match && match[1]) {
        const repoType = match[1].toLowerCase();
        
        if (['private', 'public', 'sandbox'].includes(repoType)) {
          console.log(`Repository type detected: ${repoType}`);
          return repoType;
        } else {
          console.warn(`Invalid repository type in .repository-type: ${repoType}. Using default 'private'.`);
        }
      } else {
        console.warn('Invalid .repository-type file format. Using default: private');
      }
    } else {
      console.log('No .repository-type file found. Using default: private');
    }
  } catch (error) {
    console.error('Error reading .repository-type file:', error);
  }
  
  // Default to private if we can't determine the repository type
  return 'private';
}

/**
 * Detects the current Git branch
 * @returns {string} Current branch name or null if not in a Git repository
 */
function detectGitBranch() {
  try {
    const { execSync } = require('child_process');
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    console.log(`Current Git branch: ${branch}`);
    return branch;
  } catch (error) {
    console.warn('Unable to detect Git branch:', error.message);
    return null;
  }
}

// When run directly, output the repository type
if (require.main === module) {
  const repoType = detectRepositoryType();
  const branch = detectGitBranch();
  
  console.log(`Repository Type: ${repoType}`);
  if (branch) {
    console.log(`Git Branch: ${branch}`);
    
    // Simple validation - these should generally match
    // main branch -> private repo
    // public branch -> public repo
    // sandbox branch -> sandbox repo
    const expectedBranchMap = {
      'private': 'main',
      'public': 'public',
      'sandbox': 'sandbox'
    };
    
    if (branch !== expectedBranchMap[repoType]) {
      console.warn(`WARNING: You may be on the wrong branch! Repository type is '${repoType}' but branch is '${branch}'`);
      console.warn(`Expected branch for '${repoType}' repository is '${expectedBranchMap[repoType]}'`);
    }
  }
}

module.exports = {
  detectRepositoryType,
  detectGitBranch
};