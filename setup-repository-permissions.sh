#!/bin/bash

# Repository Permissions Setup Script
# This script configures permissions for the three repositories: private, public, and sandbox

set -e

# Configuration
GITHUB_USERNAME=""
GITHUB_TOKEN=""

PRIVATE_REPO_NAME="inventory-management-system"
PUBLIC_REPO_NAME="inventory-management-system-public" 
SANDBOX_REPO_NAME="inventory-management-system-sandbox"

# Prompt for GitHub credentials if not set
if [ -z "$GITHUB_USERNAME" ]; then
  read -p "Enter GitHub username: " GITHUB_USERNAME
fi

if [ -z "$GITHUB_TOKEN" ]; then
  read -s -p "Enter GitHub personal access token: " GITHUB_TOKEN
  echo
fi

# Function to add collaborator to a repository
add_collaborator() {
  local repo_name=$1
  local username=$2
  local permission=$3
  
  echo "Adding $username to $repo_name with $permission permission..."
  
  curl -s -X PUT \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Authorization: token $GITHUB_TOKEN" \
    https://api.github.com/repos/$GITHUB_USERNAME/$repo_name/collaborators/$username \
    -d "{\"permission\":\"$permission\"}"
  
  # Check the response
  if [ $? -eq 0 ]; then
    echo "Successfully added $username to $repo_name with $permission permission"
  else
    echo "Failed to add $username to $repo_name"
  fi
}

# Function to create a team
create_team() {
  local team_name=$1
  local description=$2
  local privacy=$3
  
  echo "Creating team: $team_name..."
  
  # Create the team
  local team_id=$(curl -s -X POST \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Authorization: token $GITHUB_TOKEN" \
    https://api.github.com/orgs/$GITHUB_USERNAME/teams \
    -d "{\"name\":\"$team_name\",\"description\":\"$description\",\"privacy\":\"$privacy\"}" | jq '.id')
  
  echo "Team ID: $team_id"
  return $team_id
}

# Function to add repository to team
add_repo_to_team() {
  local team_id=$1
  local repo_name=$2
  local permission=$3
  
  echo "Adding $repo_name to team ID $team_id with $permission permission..."
  
  curl -s -X PUT \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Authorization: token $GITHUB_TOKEN" \
    https://api.github.com/orgs/$GITHUB_USERNAME/teams/$team_id/repos/$GITHUB_USERNAME/$repo_name \
    -d "{\"permission\":\"$permission\"}"
  
  if [ $? -eq 0 ]; then
    echo "Successfully added $repo_name to team ID $team_id"
  else
    echo "Failed to add $repo_name to team ID $team_id"
  fi
}

# Main script

echo "Repository Permissions Setup"
echo "============================"
echo

# Menu for permission setup options
echo "Select an option:"
echo "1. Set up individual collaborators"
echo "2. Set up teams (requires GitHub organization)"
echo "3. Exit"
read -p "Enter option (1-3): " SETUP_OPTION

case $SETUP_OPTION in
  1) # Set up individual collaborators
    echo
    echo "Setting up individual collaborators..."
    
    # Get collaborators
    read -p "Enter collaborator username for private repo (admin): " PRIVATE_ADMIN
    read -p "Enter collaborator username for public repo (maintain): " PUBLIC_MAINTAIN
    read -p "Enter collaborator username for sandbox repo (write): " SANDBOX_WRITE
    
    # Add collaborators to private repo
    if [ ! -z "$PRIVATE_ADMIN" ]; then
      add_collaborator $PRIVATE_REPO_NAME $PRIVATE_ADMIN "admin"
    fi
    
    # Add collaborators to public repo
    if [ ! -z "$PUBLIC_MAINTAIN" ]; then
      add_collaborator $PUBLIC_REPO_NAME $PUBLIC_MAINTAIN "maintain"
    fi
    
    # Add collaborators to sandbox repo
    if [ ! -z "$SANDBOX_WRITE" ]; then
      add_collaborator $SANDBOX_REPO_NAME $SANDBOX_WRITE "write"
    fi
    ;;
    
  2) # Set up teams
    echo
    echo "Setting up teams..."
    
    # Need to check if running in organization context
    read -p "Enter GitHub organization name: " GITHUB_ORG
    
    if [ -z "$GITHUB_ORG" ]; then
      echo "Error: GitHub organization name is required for team setup"
      exit 1
    fi
    
    # Create teams
    DEV_TEAM_ID=$(create_team "developers" "Full access to private repo" "closed")
    PUBLIC_TEAM_ID=$(create_team "public-contributors" "Maintain access to public repo" "closed")
    TEST_TEAM_ID=$(create_team "testers" "Write access to sandbox repo" "closed")
    
    # Add repositories to teams
    add_repo_to_team $DEV_TEAM_ID $PRIVATE_REPO_NAME "admin"
    add_repo_to_team $PUBLIC_TEAM_ID $PUBLIC_REPO_NAME "maintain"
    add_repo_to_team $TEST_TEAM_ID $SANDBOX_REPO_NAME "write"
    
    # Get team members
    read -p "Enter team member username for developers team: " DEV_MEMBER
    read -p "Enter team member username for public-contributors team: " PUBLIC_MEMBER
    read -p "Enter team member username for testers team: " TEST_MEMBER
    
    # Add members to teams
    if [ ! -z "$DEV_MEMBER" ]; then
      curl -s -X PUT \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/orgs/$GITHUB_ORG/teams/$DEV_TEAM_ID/memberships/$DEV_MEMBER \
        -d '{"role":"member"}'
    fi
    
    if [ ! -z "$PUBLIC_MEMBER" ]; then
      curl -s -X PUT \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/orgs/$GITHUB_ORG/teams/$PUBLIC_TEAM_ID/memberships/$PUBLIC_MEMBER \
        -d '{"role":"member"}'
    fi
    
    if [ ! -z "$TEST_MEMBER" ]; then
      curl -s -X PUT \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/orgs/$GITHUB_ORG/teams/$TEST_TEAM_ID/memberships/$TEST_MEMBER \
        -d '{"role":"member"}'
    fi
    ;;
    
  3) # Exit
    echo "Exiting without setting up permissions"
    exit 0
    ;;
    
  *) # Invalid option
    echo "Error: Invalid option selected"
    exit 1
    ;;
esac

echo
echo "Repository permissions setup completed"
echo
echo "Permission Structure:"
echo "- Private Repository ($PRIVATE_REPO_NAME): Admin access for core development team"
echo "- Public Repository ($PUBLIC_REPO_NAME): Maintain access for public contributors"
echo "- Sandbox Repository ($SANDBOX_REPO_NAME): Write access for testers"
echo
echo "For more information on repository access levels, see:"
echo "https://docs.github.com/en/organizations/managing-access-to-your-organizations-repositories/repository-roles-for-an-organization"