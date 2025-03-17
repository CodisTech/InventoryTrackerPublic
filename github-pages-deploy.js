/**
 * GitHub Pages Deployment Helper
 * 
 * This script helps prepare and deploy the static version of the application
 * to GitHub Pages. It creates necessary GitHub Pages files and sets up the
 * deployment repository structure.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration - Update these values
const GITHUB_USERNAME = 'your-username'; // Replace with your GitHub username
const REPO_NAME = 'inventory-management-system'; // Replace with your repository name

// Create output directory for GitHub Pages
const outputDir = path.join(__dirname, 'gh-pages');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy the GitHub Pages index file
console.log('Creating GitHub Pages files...');
fs.copyFileSync(
  path.join(__dirname, 'gh-pages-index.html'),
  path.join(outputDir, 'index.html')
);

// Create a .nojekyll file to disable Jekyll processing
fs.writeFileSync(path.join(outputDir, '.nojekyll'), '');

// Create a simple GitHub Pages README
const readmeContent = `# Inventory Management System

This is the GitHub Pages deployment of the Inventory Management System UI.

## Features

- React.js frontend with responsive and interactive design
- TypeScript for type-safe development
- Dynamic dashboard with accurate item counting and status tracking
- Robust user management system with role-based access control
- Comprehensive security implementation

For full functionality, this UI needs to be connected to a backend server.
`;

fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent);

// Create GitHub workflow file for Pages deployment
const workflowDir = path.join(__dirname, '.github', 'workflows');
if (!fs.existsSync(workflowDir)) {
  fs.mkdirSync(workflowDir, { recursive: true });
}

// Instructions for manual deployment
console.log('\n=== GitHub Pages Deployment Instructions ===');
console.log('1. Edit this file to set your GitHub username');
console.log(`2. Upload the contents of the '${outputDir}' directory to a new GitHub repository`);
console.log('3. In the repository settings, enable GitHub Pages from the main branch');
console.log(`4. Your site will be available at: https://${GITHUB_USERNAME}.github.io/${REPO_NAME}`);
console.log('\nAlternatively, you can use the Git commands below:\n');
console.log(`cd ${outputDir}`);
console.log('git init');
console.log('git add .');
console.log('git commit -m "Initial GitHub Pages deployment"');
console.log(`git remote add origin git@github.com:${GITHUB_USERNAME}/${REPO_NAME}.git`);
console.log('git push -u origin main');
console.log('===================================\n');

console.log(`GitHub Pages files prepared in: ${outputDir}`);