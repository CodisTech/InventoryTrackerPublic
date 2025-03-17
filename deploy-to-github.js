/**
 * GitHub Repository Setup Script
 * This script creates the public and sandbox repositories on GitHub
 * and pushes the code with proper repository type configurations.
 */

import { execSync } from 'child_process';
import fetch from 'node-fetch';

async function createRepository(name, isPrivate, description) {
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
  }

  console.log(`Creating repository: ${name} (${isPrivate ? 'private' : 'public'})`);
  
  try {
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        private: isPrivate,
        description,
        auto_init: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create repository: ${error.message}`);
    }

    const repo = await response.json();
    console.log(`Repository ${name} created successfully: ${repo.html_url}`);
    return repo;
  } catch (error) {
    console.error(`Error creating repository ${name}:`, error.message);
    throw error;
  }
}

async function setupRepositories() {
  try {
    // Create public repository
    await createRepository(
      'InventoryTrackerPublic',
      false,
      'Public version of Inventory Management System with limited features'
    );

    // Create sandbox repository
    await createRepository(
      'InventoryTrackerSandbox',
      true,
      'Sandbox environment for testing Inventory Management System features'
    );

    // Run the sync script to push code to all repositories
    console.log('\nSyncing code to all repositories...');
    execSync('./sync-repositories.sh "Initial setup for all repository types"', { stdio: 'inherit' });

    console.log('\nSetup complete! All repositories have been created and synchronized.');
  } catch (error) {
    console.error('Failed to set up repositories:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupRepositories();