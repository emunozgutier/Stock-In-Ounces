# Stock in Ounces - Automated Daily Updater

This directory contains a shell script to automatically update stock and crypto data daily using Python, commit the modified data, and push the changes back to your GitHub repository to update the live GitHub Pages site.

---

## 🛠️ Step-by-Step Setup

### Step 1: Configure environment variables
Create a local `.env` file by copying the template:
```bash
cp .env.example .env
```
*(This file is added to `.gitignore` and will never be committed to Git, keeping your credentials secure).*

Open `.env` and fill in the following parameters:
- `PYTHON_PATH`: Path to your python executable (defaults to `python`).
- `GIT_USER_NAME` and `GIT_USER_EMAIL`: The commit author name/email for automated commits.
- **Choose ONE** of the GitHub Authentication options below to configure credentials.

---

### Step 2: Configure GitHub Credentials

You need to provide git access to push updates automatically. Choose **Method A** or **Method B**:

#### Method A: GitHub Personal Access Token (PAT) [Recommended]
1. Go to your GitHub account settings: **Settings** -> **Developer Settings** -> **Personal Access Tokens**.
2. Create either a **Fine-grained Token** or a **Classic Token**:
   - *Fine-grained Token (Recommended)*: Set repository access to **Only select repositories** (choose this repo) and grant **Read and Write** access for **Contents**.
   - *Classic Token*: Grant the **repo** scope.
3. Copy the generated token.
4. Paste it in your `.env` file:
   ```env
   GITHUB_PAT=your_github_token_here
   ```

#### Method B: SSH Key
1. Generate an SSH key pair (e.g. `ssh-keygen -t ed25519 -C "bot@local"`).
2. Add your **public key** (`.pub`) to your GitHub account settings under **SSH and GPG keys**.
3. Place the **private key** in a secure local folder.
4. Set the path to your private key in your `.env` file:
   ```env
   SSH_KEY_PATH=/home/username/.ssh/id_ed25519
   ```

---

## 🚀 Running the Script Manually

Open your terminal and run:
```bash
chmod +x update_data.sh
./update_data.sh
```

---

## ⏰ Automating Daily Execution (Ubuntu/Linux)

To update the data every day at a specific time (e.g., 6:00 PM), schedule the script using the system's cron service:

1. Open the crontab editor:
   ```bash
   crontab -e
   ```
2. Add a cron job to run the script every day at 18:00 (6:00 PM). Ensure you use absolute paths:
   ```cron
   0 18 * * * /bin/bash /absolute/path/to/Stock-In-Ounces/cron_job/update_data.sh >> /absolute/path/to/Stock-In-Ounces/cron_job/update.log 2>&1
   ```

