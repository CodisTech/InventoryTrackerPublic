/**
 * GitHub Pages Deployment Helper
 * 
 * This script helps prepare and deploy the static version of the application
 * to GitHub Pages. It creates necessary GitHub Pages files and sets up the
 * deployment repository structure.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  outputDir: 'gh-pages',        // Directory where GitHub Pages files will be generated
  docsDir: 'docs',              // Documentation directory
  screenshotsDir: 'screenshots', // Screenshot directory
  tempDir: 'gh-pages-temp',     // Temporary directory for building
  repoUrl: 'https://github.com/CodisTech/InventoryTrackerSandbox', // Sandbox repository URL
  branch: 'gh-pages',           // The branch to deploy to
};

/**
 * Create directory if it doesn't exist
 */
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

/**
 * Copy a file from source to destination
 */
function copyFile(source, destination) {
  fs.copyFileSync(source, destination);
  console.log(`Copied ${source} to ${destination}`);
}

/**
 * Create a simple HTML index page for GitHub Pages
 */
function createIndexPage() {
  let repoType = "sandbox";
  
  // Try to get repo type from .repository-type file
  try {
    if (fs.existsSync('.repository-type')) {
      repoType = fs.readFileSync('.repository-type', 'utf8').trim();
    }
  } catch (error) {
    console.warn('Could not read repository type from file, using default: sandbox');
  }
  
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inventory Management System - ${repoType.toUpperCase()}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1 {
      border-bottom: 1px solid #eee;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    .repo-indicator {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: bold;
      font-size: 0.8rem;
      color: white;
      margin-left: 1rem;
      vertical-align: middle;
    }
    .private {
      background-color: #e11d48;
    }
    .public {
      background-color: #16a34a;
    }
    .sandbox {
      background-color: #f59e0b;
    }
    .screenshot {
      border: 1px solid #ddd;
      border-radius: 8px;
      margin: 1rem 0;
      max-width: 100%;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .screenshot-container {
      margin: 2rem 0;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }
    .feature-card {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 1rem;
      background-color: #f9fafb;
    }
    .status {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 0.5rem;
    }
    .status.enabled {
      background-color: #16a34a;
    }
    .status.disabled {
      background-color: #6b7280;
    }
  </style>
</head>
<body>
  <h1>
    Inventory Management System
    <span class="repo-indicator ${repoType}">${repoType.toUpperCase()}</span>
  </h1>
  
  <p>
    An advanced inventory management system with a focus on delightful user experience 
    and seamless item tracking, designed to transform inventory management into an engaging
    and intuitive process.
  </p>
  
  <h2>Repository Information</h2>
  <p>
    <strong>Version:</strong> 1.0.0<br>
    <strong>Repository Type:</strong> ${repoType}<br>
    <strong>Last Updated:</strong> ${new Date().toLocaleDateString()}
  </p>
  
  <h2>Feature Availability</h2>
  <div class="features-grid">
    <div class="feature-card">
      <h3>
        <span class="status enabled"></span>
        Core Features
      </h3>
      <p>Essential inventory management functionality available in all repositories.</p>
    </div>
    
    <div class="feature-card">
      <h3>
        <span class="status enabled"></span>
        User Management
      </h3>
      <p>Comprehensive user and permission management systems.</p>
    </div>
    
    <div class="feature-card">
      <h3>
        <span class="status ${repoType !== 'public' ? 'enabled' : 'disabled'}"></span>
        Advanced Reporting
      </h3>
      <p>Detailed analytics and reporting features for data-driven insights.</p>
    </div>
    
    <div class="feature-card">
      <h3>
        <span class="status ${repoType !== 'public' ? 'enabled' : 'disabled'}"></span>
        Experimental UI
      </h3>
      <p>Cutting-edge user interface components and interactions.</p>
    </div>
    
    <div class="feature-card">
      <h3>
        <span class="status ${repoType !== 'public' ? 'enabled' : 'disabled'}"></span>
        Beta Features
      </h3>
      <p>Preview of upcoming features still under development.</p>
    </div>
    
    <div class="feature-card">
      <h3>
        <span class="status enabled"></span>
        Enhanced Security
      </h3>
      <p>Advanced security features for protecting sensitive data.</p>
    </div>
  </div>
  
  <h2>Screenshots</h2>
  
  <div class="screenshot-container">
    <h3>Dashboard</h3>
    <img src="./dashboard.svg" alt="Dashboard" class="screenshot">
  </div>
  
  <div class="screenshot-container">
    <h3>Inventory</h3>
    <img src="./inventory.svg" alt="Inventory" class="screenshot">
  </div>
  
  <div class="screenshot-container">
    <h3>Transactions</h3>
    <img src="./transactions.svg" alt="Transactions" class="screenshot">
  </div>
  
  <h2>Documentation</h2>
  <ul>
    <li><a href="https://github.com/CodisTech/InventoryTrackerSandbox/blob/main/README.md">README</a></li>
    <li><a href="https://github.com/CodisTech/InventoryTrackerSandbox/blob/main/docs/USER_GUIDE.md">User Guide</a></li>
    <li><a href="https://github.com/CodisTech/InventoryTrackerSandbox/blob/main/docs/API.md">API Documentation</a></li>
    <li><a href="https://github.com/CodisTech/InventoryTrackerSandbox/blob/main/docs/DATABASE.md">Database Schema</a></li>
  </ul>
  
  <footer style="margin-top: 3rem; border-top: 1px solid #eee; padding-top: 1rem;">
    <p>© ${new Date().getFullYear()} Inventory Management System. All rights reserved.</p>
  </footer>

  <script>
    // Mark the current repository type
    document.addEventListener('DOMContentLoaded', function() {
      const repoType = "${repoType}";
      const featureCards = document.querySelectorAll('.feature-card');
      
      featureCards.forEach(card => {
        const status = card.querySelector('.status');
        const title = card.querySelector('h3').textContent.trim();
        
        if (repoType === 'public' && 
            (title.includes('Advanced Reporting') || 
             title.includes('Experimental UI') || 
             title.includes('Beta Features'))) {
          status.classList.remove('enabled');
          status.classList.add('disabled');
        }
      });
    });
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(config.outputDir, 'index.html'), indexHtml);
  console.log(`Created index.html in ${config.outputDir}`);
}

/**
 * Create a demo page
 */
function createDemoPage() {
  const demoHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demo - Inventory Management System</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
      text-align: center;
    }
    h1 {
      margin-bottom: 2rem;
    }
    .demo-frame {
      width: 100%;
      height: 600px;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <h1>Inventory Management Demo</h1>
  <p>This demo showcases the functionality of the Inventory Management System.</p>
  <p><strong>Note:</strong> This is a static demo. For the full interactive experience, please run the application locally.</p>
  
  <div>
    <iframe src="https://codistech-inventorytrackersandbox.replit.app?embed=true" class="demo-frame"></iframe>
  </div>
  
  <p style="margin-top: 2rem;">
    <a href="./index.html">Back to Documentation</a>
  </p>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(config.outputDir, 'demo.html'), demoHtml);
  console.log(`Created demo.html in ${config.outputDir}`);
}

/**
 * Create .nojekyll file to disable Jekyll processing on GitHub Pages
 */
function createNoJekyllFile() {
  fs.writeFileSync(path.join(config.outputDir, '.nojekyll'), '');
  console.log(`Created .nojekyll file in ${config.outputDir}`);
}

/**
 * Copy README to the GitHub Pages directory
 */
function copyReadme() {
  copyFile('README.md', path.join(config.outputDir, 'README.md'));
}

/**
 * Copy screenshots to the GitHub Pages directory
 */
function copyScreenshots() {
  const screenshotsDir = config.screenshotsDir;
  const targetDir = config.outputDir;
  
  if (fs.existsSync(screenshotsDir)) {
    fs.readdirSync(screenshotsDir).forEach(file => {
      if (file.endsWith('.svg') || file.endsWith('.png') || file.endsWith('.jpg')) {
        copyFile(path.join(screenshotsDir, file), path.join(targetDir, file));
      }
    });
  } else {
    console.warn(`Screenshots directory ${screenshotsDir} does not exist, skipping screenshot copying.`);
  }
}

/**
 * Main function to build GitHub Pages
 */
function buildGitHubPages() {
  console.log('Building GitHub Pages...');
  
  // Ensure output directory exists
  ensureDirectoryExists(config.outputDir);
  
  // Create GitHub Pages specific files
  createNoJekyllFile();
  createIndexPage();
  createDemoPage();
  copyReadme();
  copyScreenshots();
  
  console.log('GitHub Pages build completed!');
}

// Run the build process
buildGitHubPages();