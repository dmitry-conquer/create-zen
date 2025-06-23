#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_NAME = process.argv[2] || 'zen-starter-app';

const green = (msg) => `\x1b[32m${msg}\x1b[0m`;
const yellow = (msg) => `\x1b[33m${msg}\x1b[0m`;
const red = (msg) => `\x1b[31m${msg}\x1b[0m`;
const cyan = (msg) => `\x1b[36m${msg}\x1b[0m`;

console.log();
console.log('✨', cyan('Welcome to'), green('ZEN!'), '✨');
console.log();

if (fs.existsSync(PROJECT_NAME)) {
  console.error(red('⛔ Directory "' + PROJECT_NAME + '" already exists!'));
  process.exit(1);
}

console.log('🚀', yellow(`Cloning ZEN template into "${PROJECT_NAME}"...`));
try {
  execSync(`git clone --depth=1 https://github.com/dmitry-conquer/zen-starter.git "${PROJECT_NAME}"`, { stdio: 'inherit' });
} catch (err) {
  console.error(red('❌ Clone failed. Check your internet connection or permissions.'));
  process.exit(1);
}

// Remove .git so the created project is not a git repo
fs.rmSync(path.join(PROJECT_NAME, '.git'), { recursive: true, force: true });

console.log();
console.log(green('✅ All done! Your project is ready.'));
console.log();
console.log('👉', cyan('Next steps:'));
console.log();
console.log(`   📁 ${yellow('cd ' + PROJECT_NAME)}`);
console.log('   📦', yellow('npm install'));
console.log('   🧑‍💻', yellow('npm run dev'));
console.log();
console.log('🌿 Happy coding!');
console.log();