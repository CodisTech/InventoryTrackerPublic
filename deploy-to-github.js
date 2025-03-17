// GitHub Pages deployment script
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Repository name - update this to match your GitHub repository name
const REPO_NAME = 'inventory-management-system';

// Build the application
console.log('Building the application...');
execSync('npm run build', { stdio: 'inherit' });

// Create a CNAME file if you have a custom domain
// fs.writeFileSync('./dist/CNAME', 'yourdomain.com');

// Create a simple .nojekyll file to disable Jekyll processing
fs.writeFileSync('./dist/.nojekyll', '');

// Create or update the 404.html file to handle client-side routing
const notFoundContent = fs.readFileSync('./dist/index.html', 'utf8');
fs.writeFileSync('./dist/404.html', notFoundContent);

// Create a deployment script
console.log('Creating deployment script...');
const deployScript = `#!/bin/bash
cd dist
git init
git add .
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin git@github.com:yourusername/${REPO_NAME}.git
git push -f origin gh-pages
cd ..
`;

fs.writeFileSync('deploy.sh', deployScript);
execSync('chmod +x deploy.sh', { stdio: 'inherit' });

console.log('Deployment preparation complete!');
console.log('To deploy to GitHub Pages:');
console.log('1. Update the repository URL in the deploy.sh script');
console.log('2. Run: ./deploy.sh');