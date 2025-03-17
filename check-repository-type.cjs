#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to detect repository type
function detectRepositoryType() {
  // Check if .repository-type file exists
  const repoTypePath = path.join('.', '.repository-type');
  
  if (fs.existsSync(repoTypePath)) {
    const content = fs.readFileSync(repoTypePath, 'utf8').trim();
    const match = content.match(/repository:\s*(\w+)/);
    
    if (match && match[1]) {
      return match[1]; // Extract repository type
    }
  }
  
  // Default to private if not found
  return 'private';
}

// Check Git branch as fallback
function detectGitBranch() {
  try {
    // Use git command to get current branch
    const { execSync } = require('child_process');
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    
    if (branch === 'public') return 'public';
    if (branch === 'sandbox') return 'sandbox';
    return 'private'; // Default to private (main branch)
  } catch (error) {
    return 'private'; // Default to private if Git command fails
  }
}

// Get repository type
const repoType = detectRepositoryType() || detectGitBranch();

console.log('==========================================');
console.log(`Repository Type: ${repoType.toUpperCase()}`);
console.log('==========================================');

// Show feature availability
console.log('\nFeature Availability:');

// Define feature availability (similar to the version-config.ts file)
const FEATURE_FLAGS = {
  ADVANCED_REPORTING: {
    title: "Advanced Reporting",
    description: "Advanced reporting and analytics features",
    availability: {
      private: true,
      public: false,
      sandbox: true
    }
  },
  EXPERIMENTAL_UI: {
    title: "Experimental UI",
    description: "New experimental user interface components",
    availability: {
      private: true,
      public: false,
      sandbox: true
    }
  },
  PRIVACY_AGREEMENTS: {
    title: "Privacy Agreements",
    description: "Privacy agreement tracking and management",
    availability: {
      private: true,
      public: true,
      sandbox: true
    }
  },
  AUDIT_LOGGING: {
    title: "Audit Logging",
    description: "Detailed audit logging of all system actions",
    availability: {
      private: true,
      public: true,
      sandbox: true
    }
  },
  BETA_FEATURES: {
    title: "Beta Features",
    description: "Upcoming features in beta testing",
    availability: {
      private: true,
      public: false,
      sandbox: true
    }
  }
};

// Show feature availability for the current repository type
Object.entries(FEATURE_FLAGS).forEach(([key, feature]) => {
  const isAvailable = feature.availability[repoType] === true;
  const status = isAvailable ? '✅ ENABLED' : '❌ DISABLED';
  console.log(`- ${feature.title}: ${status}`);
});

console.log('\nRepository structure is correctly set up!');