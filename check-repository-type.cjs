/**
 * Repository Type Detection Script
 *
 * This script determines which repository type is being used:
 * - private: Full access repository with all features
 * - public: Limited public repository with restricted features
 * - sandbox: Testing repository with all features enabled for evaluation
 * 
 * The detection is based on:
 * 1. Reading the .repository-type file (if present)
 * 2. Checking git remote URLs
 * 3. Looking for specific environment variables
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Detects the repository type based on available information
 * Returns: "private" | "public" | "sandbox"
 */
function detectRepositoryType() {
  try {
    // Method 1: Look for the .repository-type file
    if (fs.existsSync('.repository-type')) {
      const repoType = fs.readFileSync('.repository-type', 'utf8').trim();
      if (['private', 'public', 'sandbox'].includes(repoType)) {
        console.log(`[INFO] Repository type detected from .repository-type: ${repoType}`);
        return repoType;
      }
    }
    
    // Method 2: Check for environment variables
    if (process.env.REPOSITORY_TYPE && 
        ['private', 'public', 'sandbox'].includes(process.env.REPOSITORY_TYPE)) {
      console.log(`[INFO] Repository type detected from environment: ${process.env.REPOSITORY_TYPE}`);
      return process.env.REPOSITORY_TYPE;
    }
    
    // Method 3: Detect from git branch
    const gitBranch = detectGitBranch();
    if (gitBranch) {
      if (gitBranch === 'main') {
        console.log('[INFO] Repository type detected from git branch: private (main)');
        return 'private';
      }
      if (gitBranch === 'public') {
        console.log('[INFO] Repository type detected from git branch: public');
        return 'public';
      }
      if (gitBranch === 'sandbox') {
        console.log('[INFO] Repository type detected from git branch: sandbox');
        return 'sandbox';
      }
    }
    
    // Default fallback to private
    console.log('[INFO] Repository type not detected, using default: private');
    return 'private';
  } catch (error) {
    console.error('[ERROR] Failed to detect repository type:', error.message);
    return 'private'; // Default fallback
  }
}

/**
 * Detects the current git branch
 * Returns: string | null
 */
function detectGitBranch() {
  try {
    // Try to get the branch name from git
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    return branch;
  } catch (error) {
    console.warn('[WARNING] Failed to detect git branch:', error.message);
    return null;
  }
}

// Run the detection
const repositoryType = detectRepositoryType();

// Write the result to a file for other scripts
fs.writeFileSync('.repository-type', repositoryType);

// Write a JavaScript snippet to inject at build time
const jsSnippet = `window.__REPOSITORY_TYPE__ = "${repositoryType}";`;
fs.writeFileSync('repository-type.js', jsSnippet);

// Output for vite.config or other build tools
if (process.env.NODE_ENV === 'development') {
  console.log(`Repository type: ${repositoryType}`);
  // Also write to a temporary file for dev server to read
  fs.writeFileSync('.repository-type.dev', repositoryType);
}

module.exports = {
  repositoryType,
  detectRepositoryType,
  detectGitBranch
};