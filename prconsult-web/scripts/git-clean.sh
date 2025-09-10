#!/bin/bash

# === GIT CLEAN SCRIPT FOR SPA MANAGEMENT ===
# Script để dọn dẹp repository và tối ưu Git

echo "🧹 Git Clean Script - Spa Management"
echo "=====================================\n"

# === SAFETY CHECK ===
echo "⚠️  Cảnh báo: Script này sẽ thực hiện các thao tác cleanup."
echo "Đảm bảo bạn đã backup code quan trọng."
read -p "Tiếp tục? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Hủy bỏ cleanup"
    exit 1
fi

# === GIT STATUS CHECK ===
echo "📊 Kiểm tra Git status..."
if ! git status --porcelain | grep -q .; then
    echo "✅ Working directory clean"
else
    echo "⚠️  Working directory có uncommitted changes:"
    git status --short
    read -p "Tiếp tục cleanup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Hủy bỏ cleanup"
        exit 1
    fi
fi

# === CLEANUP OPERATIONS ===

echo "\n🗑️  Dọn dẹp untracked files..."
# Hiển thị files sẽ bị xóa
echo "Files sẽ bị xóa:"
git clean -n -d
read -p "Xác nhận xóa? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git clean -f -d
    echo "✅ Đã xóa untracked files"
else
    echo "⏭️  Bỏ qua cleanup untracked files"
fi

echo "\n🔄 Dọn dẹp remote tracking branches..."
git remote prune origin
echo "✅ Đã cleanup remote tracking branches"

echo "\n📦 Dọn dẹp Git objects..."
# Kiểm tra kích thước repo trước
echo "Kích thước repo trước cleanup:"
du -sh .git 2>/dev/null || echo "Không thể đo kích thước"

# Git garbage collection
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "Kích thước repo sau cleanup:"
du -sh .git 2>/dev/null || echo "Không thể đo kích thước"
echo "✅ Đã cleanup Git objects"

# === BRANCH CLEANUP ===
echo "\n🌿 Kiểm tra branches để cleanup..."

# List merged branches
merged_branches=$(git branch --merged main 2>/dev/null | grep -v "main\|master\|\*" | tr -d ' ')
if [ ! -z "$merged_branches" ]; then
    echo "Branches đã merged vào main:"
    echo "$merged_branches"
    read -p "Xóa các branches này? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "$merged_branches" | xargs -n 1 git branch -d
        echo "✅ Đã xóa merged branches"
    fi
else
    echo "✅ Không có branches nào cần xóa"
fi

# === FILE SIZE CHECK ===
echo "\n📏 Kiểm tra large files..."
if command -v node &> /dev/null && [ -f "scripts/git-ignore-check.js" ]; then
    node scripts/git-ignore-check.js
else
    echo "⚠️  git-ignore-check.js không tìm thấy, bỏ qua kiểm tra"
fi

# === OPTIMIZATION ===
echo "\n⚡ Tối ưu Git configuration..."

# Set up optimal configs
git config gc.auto 1
git config gc.autopacklimit 1
git config repack.usedeltabaseoffset true
git config pack.deltacachesize 2g
git config pack.packsizelimit 2g
git config pack.windowmemory 2g

echo "✅ Đã cập nhật Git optimization configs"

# === GITIGNORE CHECK ===
echo "\n📋 Kiểm tra .gitignore..."
if [ -f ".gitignore" ]; then
    # Kiểm tra xem có file nào đang tracked mà nên ignore không
    ignored_but_tracked=$(git ls-files -i --exclude-standard)
    if [ ! -z "$ignored_but_tracked" ]; then
        echo "⚠️  Files đang tracked nhưng nên ignore:"
        echo "$ignored_but_tracked"
        echo "Chạy: git rm --cached <file> để untrack"
    else
        echo "✅ .gitignore working correctly"
    fi
else
    echo "⚠️  .gitignore không tồn tại"
fi

# === SECURITY CHECK ===
echo "\n🔒 Kiểm tra security..."

# Check for sensitive files
sensitive_patterns=("*.key" "*.pem" "*.env" "*password*" "*secret*")
for pattern in "${sensitive_patterns[@]}"; do
    found=$(git ls-files | grep -i "$pattern")
    if [ ! -z "$found" ]; then
        echo "⚠️  Tìm thấy sensitive files:"
        echo "$found"
        echo "Xem xét remove khỏi Git history"
    fi
done

# === SUMMARY ===
echo "\n📊 SUMMARY"
echo "============"
echo "📁 Total files tracked: $(git ls-files | wc -l)"
echo "🌿 Total branches: $(git branch -a | wc -l)"
echo "📦 Git objects: $(git count-objects -v | grep 'count' | awk '{print $2}')"
echo "💾 Repository size: $(du -sh .git 2>/dev/null | cut -f1 || echo 'N/A')"

# === RECOMMENDATIONS ===
echo "\n💡 RECOMMENDATIONS"
echo "==================="
echo "1. Thường xuyên chạy script này để maintain repo"
echo "2. Sử dụng 'git spa-push' cho quick commits"
echo "3. Review .gitignore định kỳ"
echo "4. Tránh commit large files"
echo "5. Sử dụng Git LFS cho files > 100MB"

echo "\n🎉 Git cleanup hoàn tất!"