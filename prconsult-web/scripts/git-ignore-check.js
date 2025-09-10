#!/usr/bin/env node

/**
 * Git Ignore Checker - Spa Management
 * Kiểm tra các file đang được track mà có thể nên ignore
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔍 Git Ignore Checker - Spa Management\n')

// Các pattern file nên ignore
const shouldIgnorePatterns = [
  // Dependencies
  /node_modules/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  
  // Build
  /dist\//,
  /build\//,
  
  // Environment
  /\.env/,
  /\.local$/,
  
  // Logs
  /\.log$/,
  /logs?\//,
  
  // Cache
  /\.cache\//,
  /\.vite\//,
  
  // IDE
  /\.vscode\//,
  /\.idea\//,
  /\.DS_Store$/,
  /Thumbs\.db$/,
  
  // Temporary
  /\.tmp/,
  /temp\//,
  
  // Large files
  /\.(mp4|avi|mov|zip|rar|tar\.gz)$/,
  
  // Sensitive
  /\.key$/,
  /\.pem$/,
  /config\/production\./
]

// Lấy danh sách file đang được track
function getTrackedFiles() {
  try {
    const output = execSync('git ls-files', { encoding: 'utf8' })
    return output.trim().split('\n').filter(file => file)
  } catch (error) {
    console.error('❌ Error: Không thể lấy danh sách tracked files')
    console.error('Đảm bảo bạn đang ở trong Git repository')
    process.exit(1)
  }
}

// Kiểm tra file size
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (error) {
    return 0
  }
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Main check function
function checkIgnoredFiles() {
  const trackedFiles = getTrackedFiles()
  const issues = []
  
  console.log(`📁 Đang kiểm tra ${trackedFiles.length} files...\n`)
  
  trackedFiles.forEach(file => {
    // Check if file should be ignored
    const shouldIgnore = shouldIgnorePatterns.some(pattern => pattern.test(file))
    
    if (shouldIgnore) {
      const size = getFileSize(file)
      issues.push({
        file,
        reason: 'Should be ignored',
        size,
        priority: 'high'
      })
    }
    
    // Check large files
    const size = getFileSize(file)
    if (size > 1024 * 1024) { // > 1MB
      issues.push({
        file,
        reason: `Large file (${formatFileSize(size)})`,
        size,
        priority: size > 10 * 1024 * 1024 ? 'critical' : 'medium'
      })
    }
  })
  
  return issues
}

// Display results
function displayResults(issues) {
  if (issues.length === 0) {
    console.log('✅ Tất cả files đều ổn! Không có file nào cần ignore.')
    return
  }
  
  console.log(`⚠️  Tìm thấy ${issues.length} vấn đề:\n`)
  
  // Group by priority
  const critical = issues.filter(i => i.priority === 'critical')
  const high = issues.filter(i => i.priority === 'high')
  const medium = issues.filter(i => i.priority === 'medium')
  
  if (critical.length > 0) {
    console.log('🚨 CRITICAL - Files rất lớn:')
    critical.forEach(issue => {
      console.log(`   ${issue.file} - ${issue.reason}`)
    })
    console.log()
  }
  
  if (high.length > 0) {
    console.log('⚠️  HIGH - Files nên ignore:')
    high.forEach(issue => {
      console.log(`   ${issue.file}`)
    })
    console.log()
  }
  
  if (medium.length > 0) {
    console.log('📋 MEDIUM - Files lớn:')
    medium.forEach(issue => {
      console.log(`   ${issue.file} - ${issue.reason}`)
    })
    console.log()
  }
  
  // Suggestions
  console.log('💡 Gợi ý sửa chữa:')
  
  if (critical.length > 0 || high.length > 0) {
    console.log('1. Thêm vào .gitignore:')
    const toIgnore = [...critical, ...high].map(i => i.file).join('\n')
    console.log('   echo "' + toIgnore.replace('\n', '\\n') + '" >> .gitignore')
    console.log()
    
    console.log('2. Remove từ Git (giữ file local):')
    console.log('   git rm --cached <filename>')
    console.log()
  }
  
  if (critical.length > 0) {
    console.log('3. Xem xét sử dụng Git LFS cho files lớn:')
    console.log('   git lfs track "*.mp4"')
    console.log('   git lfs track "*.zip"')
    console.log()
  }
}

// Run checker
function main() {
  try {
    const issues = checkIgnoredFiles()
    displayResults(issues)
    
    // Exit code
    const criticalIssues = issues.filter(i => i.priority === 'critical' || i.priority === 'high')
    if (criticalIssues.length > 0) {
      console.log('❌ Tìm thấy vấn đề quan trọng. Vui lòng xử lý trước khi commit.')
      process.exit(1)
    } else {
      console.log('✅ Kiểm tra hoàn tất!')
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ Lỗi khi chạy checker:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { checkIgnoredFiles, getTrackedFiles }