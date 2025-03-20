const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run ESLint with --fix option to automatically clean up issues
try {
  console.log('Running ESLint auto-fix...');
  execSync('npx eslint --fix "src/**/*.{ts,tsx}"');
  console.log('ESLint auto-fix completed successfully');
} catch (error) {
  console.error('ESLint auto-fix encountered errors:', error.message);
}