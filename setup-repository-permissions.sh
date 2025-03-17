#!/bin/bash

# Repository Permissions Setup Script
# This script helps set up permissions for various repository branches
# by configuring branch protection and access control on GitHub

set -e  # Exit on any error

# Function to show help
function show_help() {
  echo "Repository Permissions Setup Script for Inventory Management System"
  echo ""
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  --help              Show this help message"
  echo "  --add-collaborator  Add a collaborator to repositories"
  echo "  --protect-branch    Set up branch protection rules"
  echo "  --setup-teams       Create and configure GitHub teams"
  echo ""
  echo "Examples:"
  echo "  $0 --add-collaborator username private,sandbox  # Add collaborator to specific repos"
  echo "  $0 --protect-branch                            # Set up branch protection rules"
  echo ""
}

# Check if GitHub token is set
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable not set"
  echo "Please set the GITHUB_TOKEN environment variable with a GitHub personal access token"
  echo "with 'repo' and 'admin:org' permissions"
  exit 1
fi

# Get repository owner
USERNAME="$(git config user.username || echo "your-username")"
if [ "$USERNAME" = "your-username" ]; then
  read -p "Enter your GitHub username: " USERNAME
fi

# Repository variables
PRIVATE_REPO="$USERNAME/InventoryTracker"
PUBLIC_REPO="$USERNAME/InventoryTrackerPublic"
SANDBOX_REPO="$USERNAME/InventoryTrackerSandbox"

# Function to add a collaborator to a repository
function add_collaborator() {
  local username="$1"
  local repo="$2"
  local permission="${3:-push}"  # Default is push (write) access
  
  echo "Adding $username as collaborator to $repo with $permission permission..."
  
  # Add collaborator using GitHub API
  response=$(curl -s -w "%{http_code}" -o /dev/null \
    -X PUT \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$repo/collaborators/$username" \
    -d "{\"permission\":\"$permission\"}")
  
  if [ "$response" = "201" ] || [ "$response" = "204" ]; then
    echo "Successfully added $username to $repo"
  else
    echo "Error adding $username to $repo (HTTP status: $response)"
  fi
}

# Function to protect a branch
function protect_branch() {
  local repo="$1"
  local branch="${2:-main}"
  
  echo "Setting up branch protection for $repo/$branch..."
  
  # Set branch protection using GitHub API
  response=$(curl -s -w "%{http_code}" -o /dev/null \
    -X PUT \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$repo/branches/$branch/protection" \
    -d '{
      "required_status_checks": null,
      "enforce_admins": false,
      "required_pull_request_reviews": {
        "dismissal_restrictions": {},
        "dismiss_stale_reviews": true,
        "require_code_owner_reviews": false,
        "required_approving_review_count": 1
      },
      "restrictions": null
    }')
  
  if [ "$response" = "200" ] || [ "$response" = "201" ]; then
    echo "Successfully protected $repo/$branch"
  else
    echo "Error protecting $repo/$branch (HTTP status: $response)"
  fi
}

# Function to create and configure teams
function setup_teams() {
  # Create teams
  create_team "InventoryAdmins" "Administrators with full access to all repositories"
  create_team "InventoryDevelopers" "Developers with write access to private and sandbox repositories"
  create_team "InventoryViewers" "Users with read-only access to public repository"
  
  # Add repositories to teams
  add_team_repository "InventoryAdmins" "$PRIVATE_REPO" "admin"
  add_team_repository "InventoryAdmins" "$SANDBOX_REPO" "admin"
  add_team_repository "InventoryAdmins" "$PUBLIC_REPO" "admin"
  
  add_team_repository "InventoryDevelopers" "$PRIVATE_REPO" "push"
  add_team_repository "InventoryDevelopers" "$SANDBOX_REPO" "push"
  add_team_repository "InventoryDevelopers" "$PUBLIC_REPO" "pull"
  
  add_team_repository "InventoryViewers" "$PUBLIC_REPO" "pull"
  
  echo "Team setup completed"
}

# Function to create a team
function create_team() {
  local team_name="$1"
  local description="$2"
  local privacy="${3:-closed}"  # Default is closed
  
  echo "Creating team: $team_name..."
  
  # Create team using GitHub API
  response=$(curl -s -w "%{http_code}" -o /tmp/team_response \
    -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/orgs/$ORGANIZATION/teams" \
    -d "{
      \"name\": \"$team_name\",
      \"description\": \"$description\",
      \"privacy\": \"$privacy\"
    }")
  
  if [ "$response" = "201" ]; then
    team_id=$(jq '.id' /tmp/team_response)
    echo "Successfully created team $team_name (ID: $team_id)"
  else
    echo "Error creating team $team_name (HTTP status: $response)"
  fi
}

# Function to add repository to a team
function add_team_repository() {
  local team_name="$1"
  local repo="$2"
  local permission="${3:-pull}"  # Default is pull (read) access
  
  echo "Adding $repo to team $team_name with $permission permission..."
  
  # Add repository to team using GitHub API
  response=$(curl -s -w "%{http_code}" -o /dev/null \
    -X PUT \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/orgs/$ORGANIZATION/teams/$team_name/repos/$repo" \
    -d "{\"permission\":\"$permission\"}")
  
  if [ "$response" = "204" ]; then
    echo "Successfully added $repo to team $team_name"
  else
    echo "Error adding $repo to team $team_name (HTTP status: $response)"
  fi
}

# Parse command-line arguments
if [ $# -eq 0 ]; then
  show_help
  exit 1
fi

while [ $# -gt 0 ]; do
  case "$1" in
    --help)
      show_help
      exit 0
      ;;
    --add-collaborator)
      if [ -z "$2" ] || [ -z "$3" ]; then
        echo "Error: --add-collaborator requires a username and repository list"
        show_help
        exit 1
      fi
      
      COLLABORATOR_USERNAME="$2"
      REPOS="$3"
      
      IFS=',' read -ra REPO_ARRAY <<< "$REPOS"
      for repo_type in "${REPO_ARRAY[@]}"; do
        case "$repo_type" in
          private)
            add_collaborator "$COLLABORATOR_USERNAME" "$PRIVATE_REPO" "push"
            ;;
          public)
            add_collaborator "$COLLABORATOR_USERNAME" "$PUBLIC_REPO" "push"
            ;;
          sandbox)
            add_collaborator "$COLLABORATOR_USERNAME" "$SANDBOX_REPO" "push"
            ;;
          *)
            echo "Unknown repository type: $repo_type"
            ;;
        esac
      done
      
      shift 3
      ;;
    --protect-branch)
      protect_branch "$PRIVATE_REPO" "main"
      protect_branch "$PUBLIC_REPO" "main"
      protect_branch "$SANDBOX_REPO" "main"
      shift 1
      ;;
    --setup-teams)
      if [ -z "$2" ]; then
        echo "Error: --setup-teams requires an organization name"
        show_help
        exit 1
      fi
      
      ORGANIZATION="$2"
      setup_teams
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

echo "Repository permissions setup completed!"