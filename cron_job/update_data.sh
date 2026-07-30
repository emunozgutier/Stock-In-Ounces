#!/usr/bin/env bash

# ------------------------------------------------------------------------------
# Stock in Ounces - Automated Daily Update Script
# Updates the data files using Python and pushes changes back to GitHub.
# ------------------------------------------------------------------------------

# Get absolute path to the directory containing this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change directory to the repository root
cd "$PROJECT_ROOT" || exit 1

# Load environment variables from .env if present
if [ -f "$SCRIPT_DIR/.env" ]; then
  echo "Loading configuration from .env..."
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
      continue
    fi
    # Split by first '='
    key=$(echo "$line" | cut -d'=' -f1 | tr -d '[:space:]')
    val=$(echo "$line" | cut -d'=' -f2- | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
    # Strip quotes if present
    val=$(echo "$val" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    eval "export $key=\"$val\""
  done < "$SCRIPT_DIR/.env"
fi

# Determine python executable path
PYTHON="${PYTHON_PATH:-python}"

echo "1. Checking python and requirements..."
if ! command -v "$PYTHON" &> /dev/null; then
  echo "Error: Python executable '$PYTHON' could not be found."
  exit 1
fi

# Run data collection python script
echo "2. Fetching latest market data..."
"$PYTHON" helperScripts/GetStockData.py
if [ $? -ne 0 ]; then
  echo "Error: Data collection failed."
  exit 1
fi

echo "3. Staging changes..."
# Files to commit
UPDATED_FILES=("public/Data.json" "public/FastData.json" "public/tickers.json")
git add "${UPDATED_FILES[@]}"

# Check if there are actual changes staged
if git diff --cached --quiet; then
  echo "No new data changes to commit. Everything is up-to-date."
  exit 0
fi

echo "4. Committing changes..."
# Save current repository user/email config
OLD_USER_NAME=$(git config --local user.name 2>/dev/null || true)
OLD_USER_EMAIL=$(git config --local user.email 2>/dev/null || true)

# Apply custom git user details if provided in .env
if [ -n "$GIT_USER_NAME" ]; then
  git config --local user.name "$GIT_USER_NAME"
fi
if [ -n "$GIT_USER_EMAIL" ]; then
  git config --local user.email "$GIT_USER_EMAIL"
fi

DATE_STR=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Auto-update stock data: $DATE_STR"
COMMIT_STATUS=$?

# Restore old repository settings to prevent local state pollution
if [ -n "$OLD_USER_NAME" ]; then
  git config --local user.name "$OLD_USER_NAME"
else
  git config --local --unset user.name 2>/dev/null || true
fi
if [ -n "$OLD_USER_EMAIL" ]; then
  git config --local user.email "$OLD_USER_EMAIL"
else
  git config --local --unset user.email 2>/dev/null || true
fi

if [ $COMMIT_STATUS -ne 0 ]; then
  echo "Error: Git commit failed."
  exit 1
fi

echo "5. Pushing changes to GitHub..."

# Case A: SSH Key authentication
if [ -n "$SSH_KEY_PATH" ]; then
  if [ ! -f "$SSH_KEY_PATH" ] && [[ ! "$SSH_KEY_PATH" =~ ^~ ]]; then
    echo "Warning: SSH key file not found at '$SSH_KEY_PATH'."
  fi
  echo "Pushing changes using configured SSH Key..."
  export GIT_SSH_COMMAND="ssh -i \"$SSH_KEY_PATH\" -o StrictHostKeyChecking=accept-new"
  git push origin HEAD
  exit $?
fi

# Case B: GITHUB_PAT HTTPS authentication
if [ -n "$GITHUB_PAT" ]; then
  echo "Pushing changes using GitHub Personal Access Token (PAT)..."
  REMOTE_URL=$(git remote get-url origin 2>/dev/null)
  if [ -z "$REMOTE_URL" ]; then
    echo "Error: Could not retrieve git origin remote URL."
    exit 1
  fi

  # Extract repo path (owner/repo) from origin remote URL
  if [[ "$REMOTE_URL" =~ git@github.com:(.*)/(.*)\.git ]]; then
    REPO_PATH="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
  elif [[ "$REMOTE_URL" =~ github.com/(.*)/(.*)\.git ]]; then
    REPO_PATH="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
  else
    REPO_PATH=$(echo "$REMOTE_URL" | sed -E 's/.*github\.com[\/:]//' | sed 's/\.git$//')
  fi

  # Construct push URL with token and hide command outputs to avoid token leakage
  PUSH_URL="https://x-access-token:${GITHUB_PAT}@github.com/${REPO_PATH}.git"
  git push "$PUSH_URL" HEAD >/dev/null 2>&1
  PUSH_STATUS=$?

  if [ $PUSH_STATUS -eq 0 ]; then
    echo "Push completed successfully."
    exit 0
  else
    echo "Error: Git push failed. Verify GITHUB_PAT permissions."
    exit 1
  fi
fi

# Case C: Fallback to ambient credentials (e.g. Git Credential Manager, active ssh-agent)
echo "No credential configuration found in .env. Attempting default push..."
git push origin HEAD
exit $?
