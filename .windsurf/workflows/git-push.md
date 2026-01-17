---
auto_execution_mode: 1
---
# Git Push Workflow

This workflow guides the process of committing and pushing changes to GitHub, ensuring proper version control practices and team coordination.

## Prerequisites
- Completed development work ready for commit
- Understanding of git basics and project structure
- Access to GitHub repository
- Clean working directory (or intentional changes)

## When to Use This Workflow
- Daily development commits
- Feature completion commits
- Bug fix commits
- Documentation updates
- Before creating pull requests

## Step 1: Pre-Commit Checks

**Verify Changes:**
- [ ] Review `git status` to see what will be committed
- [ ] Review `git diff` to verify changes are correct
- [ ] Ensure no sensitive data is being committed
- [ ] Check for debug code (console.logs, debugger statements)
- [ ] Verify no hardcoded credentials or API keys

**Quality Checks:**
- [ ] Code follows project conventions
- [ ] Tests are passing locally
- [ ] Build process completes successfully
- [ ] No TypeScript errors
- [ ] Linting passes (if applicable)

**Branch Status:**
- [ ] On correct branch (main for direct pushes, feature branch for PRs)
- [ ] Branch is up to date with main (if needed)
- [ ] No merge conflicts

## Step 2: Stage Changes

**Review and Stage Files:**
```bash
# Check what files have changed
git status

# Review specific file changes
git diff [filename]

# Stage all changes
git add .

# Or stage specific files
git add [file1] [file2] [file3]
```

**Verify Staged Changes:**
```bash
# Review what will be committed
git diff --cached

# Check staged files list
git status
```

## Step 3: Create Commit

**Commit Message Format:**
Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

**Common Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**
```bash
# Feature commit
git commit -m "feat(resolution): add mission tracking dashboard

- Implement dashboard view with mission cards
- Add filtering and search functionality
- Include progress indicators and status badges"

# Bug fix commit
git commit -m "fix(auth): resolve token expiration handling

- Add automatic token refresh
- Fix logout on token expiry
- Update error messages for clarity"

# Documentation commit
git commit -m "docs(readme): update installation instructions

- Add Node.js version requirements
- Include environment setup steps
- Update troubleshooting section"
```

## Step 4: Push to GitHub

**Push Commands:**
```bash
# Push current branch to origin
git push origin [branch-name]

# Push and set upstream (first time pushing branch)
git push -u origin [branch-name]

# Force push (use with caution - only if necessary)
git push --force-with-lease origin [branch-name]
```

**Before Pushing:**
- [ ] Commit message is descriptive and follows format
- [ ] No sensitive information in commit
- [ ] Changes are ready for team review
- [ ] Branch is correct for target environment

## Step 5: Post-Push Verification

**Verify Push Success:**
- [ ] Check GitHub repository to confirm changes appear
- [ ] Verify CI/CD pipeline starts (if configured)
- [ ] Confirm no push errors or conflicts
- [ ] Check that all commits are present

**Update Tracking:**
- [ ] Update Linear tickets with commit references
- [ ] Notify team of important changes
- [ ] Update project documentation if needed
- [ ] Create pull request if using feature branches

## Common Scenarios

### Scenario 1: Daily Development Push
**Use Case:** End of day commit with multiple small changes

**Approach:**
- Group related changes into logical commits
- Use descriptive commit messages
- Push to main branch if working solo
- Use feature branch if team collaboration

**Example:**
```bash
git add .
git commit -m "feat(dashboard): enhance mission card layout and add filters

- Improve card responsive design
- Add status and priority filters
- Implement search functionality
- Update loading states"
git push origin main
```

### Scenario 2: Feature Branch Development
**Use Case:** Working on new feature with team

**Approach:**
- Create feature branch from main
- Commit changes to feature branch
- Push feature branch to GitHub
- Create pull request for review

**Example:**
```bash
# Create and switch to feature branch
git checkout -b feature/mission-filters

# Make changes and commit
git add .
git commit -m "feat(filters): add mission filtering capabilities"

# Push feature branch
git push -u origin feature/mission-filters
```

### Scenario 3: Hotfix Push
**Use Case:** Urgent bug fix needs immediate deployment

**Approach:**
- Create hotfix branch from main
- Make minimal changes
- Test thoroughly
- Push directly to main or create expedited PR

**Example:**
```bash
git checkout -b hotfix/critical-auth-fix
# Make minimal fix
git add .
git commit -m "fix(auth): resolve critical login issue"
git push origin hotfix/critical-auth-fix
# Create expedited PR or merge directly
```

### Scenario 4: Merge Conflict Resolution
**Use Case:** Push rejected due to conflicts

**Approach:**
- Pull latest changes from remote
- Resolve conflicts locally
- Test resolution
- Commit merge and push

**Example:**
```bash
git pull origin main
# Resolve conflicts in editor
git add .
git commit -m "resolve merge conflicts"
git push origin main
```

## Push Best Practices

**✅ Do:**
- Push frequently to avoid large diffs
- Use descriptive commit messages
- Review changes before committing
- Test locally before pushing
- Follow conventional commit format
- Create pull requests for team review

**❌ Don't:**
- Push broken code
- Commit sensitive data
- Use vague commit messages
- Force push without reason
- Push to main without testing
- Ignore merge conflicts

## Troubleshooting

**Common Push Issues:**

**Authentication Error:**
```bash
# Check git credentials
git config --global user.name
git config --global user.email

# Update credentials if needed
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Push Rejected - Non-Fast Forward:**
```bash
# Pull latest changes first
git pull origin main
# Resolve any conflicts
# Then push
git push origin main
```

**Push Rejected - Remote Contains Work:**
```bash
# Fetch and rebase
git fetch origin
git rebase origin/main
# Resolve conflicts if any
git push origin main
```

**Network Issues:**
```bash
# Check internet connection
# Try again after a moment
# Use SSH instead of HTTPS if configured
git remote set-url origin git@github.com:username/repo.git
```

## Integration with Workflows

**Before Code Review:**
- Use this workflow to push changes
- Create pull request
- Follow code review workflow

**Before Deployment:**
- Ensure all changes are pushed
- Verify CI/CD pipeline passes
- Follow deployment workflow

**Daily Updates:**
- Use at end of each work session
- Combine with daily update workflow
- Track progress in Linear tickets

## Output

A successful git push that ensures:
- Changes are safely stored in GitHub
- Team members can access latest code
- Version control history is maintained
- CI/CD pipelines can run
- Backup of work is created
- Collaboration workflow is enabled

## Safety Checklist

**Before Commit:**
- [ ] No sensitive data in changes
- [ ] Code compiles and runs
- [ ] Tests pass locally
- [ ] Commit message is descriptive

**Before Push:**
- [ ] Correct branch selected
- [ ] No merge conflicts
- [ ] Changes reviewed and approved
- [ ] CI/CD ready (if applicable)

**After Push:**
- [ ] Verify changes appear in GitHub
- [ ] Check CI/CD pipeline status
- [ ] Update project tracking
- [ ] Notify team if needed
