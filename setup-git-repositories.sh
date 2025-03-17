#!/bin/bash

# Ensure the script stops on first error
set -e

echo "Setting up Git repositories..."

# Function to create a GitHub repository
create_repository() {
    local name=$1
    local visibility=$2
    local description=$3

    echo "Creating $visibility repository: $name"
    
    # Create the repository using GitHub API
    curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
         -H "Accept: application/vnd.github.v3+json" \
         https://api.github.com/user/repos \
         -d "{\"name\":\"$name\",\"private\":$([[ $visibility == "private" ]] && echo "true" || echo "false"),\"description\":\"$description\"}"
    
    echo "Repository $name created successfully"
}

# Create the public repository
create_repository "InventoryTrackerPublic" "public" "Public version of Inventory Management System with limited features"

# Create the sandbox repository
create_repository "InventoryTrackerSandbox" "private" "Sandbox environment for testing Inventory Management System features"

echo "Repositories created successfully!"

# Now run the sync script to push code to all repositories
echo "Syncing code to all repositories..."
./sync-repositories.sh "Initial setup for all repository types"

echo "Setup complete! All repositories have been created and synchronized."