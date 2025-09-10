#!/bin/bash

# === GIT SETUP SCRIPT FOR SPA MANAGEMENT ===
# Script để setup Git aliases và hooks hữu ích

echo "🔧 Setting up Git configuration for Spa Management project..."

# === GIT ALIASES ===
echo "📝 Setting up Git aliases..."

# Basic shortcuts
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'

# Advanced aliases
git config --global alias.visual '!gitk'
git config --global alias.praise blame
git config --global alias.save '!git add -A && git commit -m "SAVEPOINT"'
git config --global alias.wip '!git add -u && git commit -m "WIP"'
git config --global alias.undo '!git reset HEAD~1 --mixed'
git config --global alias.amend 'commit -a --amend'
git config --global alias.wipe '!git add -A && git commit -qm "WIPE SAVEPOINT" && git reset HEAD~1 --hard'

# Logging aliases
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
git config --global alias.tree "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --all"

# Spa project specific aliases
git config alias.spa-push '!git add . && git commit -m "feat: spa updates" && git push'
git config alias.spa-fix '!git add . && git commit -m "fix: spa bug fixes" && git push'
git config alias.spa-style '!git add . && git commit -m "style: spa UI improvements" && git push'

# === GIT HOOKS SETUP ===
echo "🪝 Setting up Git hooks..."

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Pre-commit hook for Spa Management

echo "🔍 Running pre-commit checks..."

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

# Run linting
echo "📋 Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ ESLint failed. Please fix the errors before committing."
    exit 1
fi

# Check for large files
echo "📏 Checking file sizes..."
large_files=$(find . -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" | xargs wc -c | awk '$1 > 500000 { print $2, $1 }')
if [ ! -z "$large_files" ]; then
    echo "⚠️  Large files detected:"
    echo "$large_files"
    echo "Consider optimizing these files"
fi

# Check for TODO comments in production
if git diff --cached --name-only | grep -E "\.(js|jsx|ts|tsx)$" | xargs grep -l "TODO\|FIXME\|XXX" > /dev/null 2>&1; then
    echo "⚠️  TODO/FIXME comments found in staged files"
    echo "Consider resolving these before committing to main branch"
fi

echo "✅ Pre-commit checks passed!"
EOF

# Make hook executable
chmod +x .git/hooks/pre-commit

# Pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/sh
# Pre-push hook for Spa Management

echo "🚀 Running pre-push checks..."

# Get current branch
current_branch=$(git symbolic-ref HEAD 2>/dev/null | cut -d"/" -f 3)

# Check if pushing to main/master
if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
    echo "⚠️  Pushing to $current_branch branch"
    echo "Make sure all tests pass and code is reviewed"
    
    # Build check
    echo "🏗️  Running build check..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Cannot push to $current_branch."
        exit 1
    fi
    
    echo "✅ Build successful"
fi

echo "✅ Pre-push checks passed!"
EOF

chmod +x .git/hooks/pre-push

# === GIT CONFIG ===
echo "⚙️  Setting up Git configuration..."

# Setup line ending handling
git config core.autocrlf false
git config core.eol lf

# Setup default push behavior
git config push.default simple

# Setup rebase by default
git config pull.rebase true

# Setup default editor (nếu chưa có)
if [ -z "$(git config --global core.editor)" ]; then
    git config --global core.editor "code --wait"
fi

# === COMPLETION ===
echo ""
echo "🎉 Git setup completed!"
echo ""
echo "📋 Available aliases:"
echo "  git st        - git status"
echo "  git co        - git checkout"
echo "  git br        - git branch"
echo "  git ci        - git commit"
echo "  git lg        - beautiful log"
echo "  git tree      - branch tree view"
echo "  git spa-push  - quick spa commit and push"
echo "  git spa-fix   - quick bug fix commit and push"
echo "  git spa-style - quick style commit and push"
echo ""
echo "🪝 Git hooks installed:"
echo "  pre-commit  - runs linting and checks"
echo "  pre-push    - runs build check for main/master"
echo ""
echo "📝 To see all aliases: git config --get-regexp alias"