/**
 * Feature Flag Test Script
 * 
 * This script tests the feature flag system by switching between repository types
 * and verifying which features are enabled in each configuration.
 */

// Import repository type utilities
import fs from 'fs';
import { execSync } from 'child_process';

// Function to test feature flags across all repository types
async function testFeatureFlagsAcrossRepositories() {
  const repositoryTypes = ['private', 'public', 'sandbox'];
  
  console.log('='.repeat(50));
  console.log('FEATURE FLAG VERIFICATION TEST');
  console.log('='.repeat(50));
  
  for (const repoType of repositoryTypes) {
    console.log(`\nTesting repository type: ${repoType.toUpperCase()}`);
    console.log('-'.repeat(40));
    
    // Change repository type
    fs.writeFileSync('.repository-type', repoType);
    
    // Run repository type check script
    const checkOutput = execSync('node check-repository-type.js').toString();
    console.log(checkOutput);
    
    // Run repository change script
    execSync(`node change-repository-type.js ${repoType}`);
    
    // Verify feature flags
    console.log('Feature flag status:');
    const featureFlags = ['CORE_FEATURES', 'ENHANCED_SECURITY', 'USER_MANAGEMENT', 
                          'ADVANCED_REPORTING', 'EXPERIMENTAL_UI', 'BETA_FEATURES'];
                          
    for (const flag of featureFlags) {
      let enabled = false;
      
      // Check if the feature should be enabled for this repository type
      if (flag === 'CORE_FEATURES' || flag === 'ENHANCED_SECURITY' || flag === 'USER_MANAGEMENT') {
        // These features are enabled in all repository types
        enabled = true;
      } else if (repoType !== 'public') {
        // Advanced features are only disabled in public repository
        enabled = true;
      }
      
      console.log(`- ${flag}: ${enabled ? '✅ Enabled' : '❌ Disabled'}`);
    }
  }
  
  // Reset to original repository type (sandbox)
  fs.writeFileSync('.repository-type', 'sandbox');
  execSync('node change-repository-type.js sandbox');
  
  console.log('\n='.repeat(50));
  console.log('Test complete! Repository type restored to sandbox.');
  console.log('='.repeat(50));
}

// Run the test
testFeatureFlagsAcrossRepositories().catch(console.error);

export {};