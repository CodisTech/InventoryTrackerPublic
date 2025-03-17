/**
 * Repository Type Switcher
 * 
 * This script allows you to quickly switch between repository types
 * for testing different feature sets.
 * 
 * Usage: 
 *   node change-repository-type.js private
 *   node change-repository-type.js public
 *   node change-repository-type.js sandbox
 */

import fs from 'fs';
import { execSync } from 'child_process';

// Get the target repository type from command line arguments
const targetRepoType = process.argv[2]?.toLowerCase();

// Validate input
if (!targetRepoType || !['private', 'public', 'sandbox'].includes(targetRepoType)) {
  console.error('Invalid repository type! Please use one of: private, public, sandbox');
  console.error('Usage: node change-repository-type.js <repository-type>');
  process.exit(1);
}

// Update the .repository-type file
console.log(`Setting repository type to: ${targetRepoType}`);
fs.writeFileSync('.repository-type', targetRepoType);

// Also set it in localStorage if we're in a browser environment
console.log(`Creating repository-type.js script for browser environment`);
const jsSnippet = `window.__REPOSITORY_TYPE__ = "${targetRepoType}";`;
fs.writeFileSync('repository-type.js', jsSnippet);

// Optional: Automatically restart the development server
console.log('Change complete!');
console.log(`Repository type is now: ${targetRepoType.toUpperCase()}`);
console.log('');
console.log('Features enabled in this repository type:');

// Display enabled features for the selected repository type
const features = {
  CORE_FEATURES: {
    title: 'Core Features',
    private: true,
    public: true,
    sandbox: true
  },
  ENHANCED_SECURITY: {
    title: 'Enhanced Security',
    private: true,
    public: true,
    sandbox: true
  },
  USER_MANAGEMENT: {
    title: 'User Management',
    private: true,
    public: true,
    sandbox: true
  },
  ADVANCED_REPORTING: {
    title: 'Advanced Reporting',
    private: true,
    public: false,
    sandbox: true
  },
  EXPERIMENTAL_UI: {
    title: 'Experimental UI',
    private: true,
    public: false,
    sandbox: true
  },
  BETA_FEATURES: {
    title: 'Beta Features',
    private: true,
    public: false,
    sandbox: true
  }
};

// Display a table of enabled features
Object.entries(features).forEach(([key, feature]) => {
  const isEnabled = feature[targetRepoType];
  console.log(`- ${feature.title}: ${isEnabled ? '✅ Enabled' : '❌ Disabled'}`);
});

console.log('');
console.log('Refresh your browser to see the changes');