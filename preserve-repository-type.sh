#!/bin/bash

# This script checks for and maintains the .repository-type file
# It ensures the repository type is preserved during deployments

# Default repository type if not specified
DEFAULT_TYPE="sandbox"

# Check if .repository-type exists
if [ ! -f ".repository-type" ]; then
  # If running on GitHub Actions, try to detect branch
  if [ -n "$GITHUB_REF" ]; then
    if [[ "$GITHUB_REF" == *"/main" ]]; then
      REPO_TYPE="private"
    elif [[ "$GITHUB_REF" == *"/public" ]]; then
      REPO_TYPE="public"
    elif [[ "$GITHUB_REF" == *"/sandbox" ]]; then
      REPO_TYPE="sandbox"
    else
      REPO_TYPE="$DEFAULT_TYPE"
    fi
  else
    # Default to sandbox for local development
    REPO_TYPE="$DEFAULT_TYPE"
  fi
  
  echo "Creating .repository-type with value: $REPO_TYPE"
  echo "$REPO_TYPE" > .repository-type
else
  REPO_TYPE=$(cat .repository-type)
  echo "Existing .repository-type found with value: $REPO_TYPE"
fi

# Output for GitHub Actions
if [ -n "$GITHUB_OUTPUT" ]; then
  echo "repository-type=$REPO_TYPE" >> $GITHUB_OUTPUT
fi

echo "Repository type is set to: $REPO_TYPE"