#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';

// Color palette inspired by the ZEN website
const colors = {
  green: '#00D4AA',      // Less acidic, more blue-green
  lightGreen: '#00B894', // Darker blue-green
  purple: '#8B5CF6',     // Purple accent
  darkPurple: '#7C3AED', // Darker purple
  lightPurple: '#A78BFA', // Light purple
  white: '#FFFFFF',      // Pure white
  lightGrey: '#9CA3AF',  // Light grey
  darkGrey: '#374151',   // Dark grey
  bgDark: '#1F2937'      // Background dark
};

// Enhanced text styling with chalk
const zen = (text) => chalk.hex(colors.green).bold(text);
const accent = (text) => chalk.hex(colors.purple).bold(text);
const title = (text) => chalk.hex(colors.white).bold(text);
const subtitle = (text) => chalk.hex(colors.lightGrey)(text);
const highlight = (text) => chalk.hex(colors.lightGreen)(text);
const error = (text) => chalk.red.bold(text);
const success = (text) => chalk.green.bold(text);
const info = (text) => chalk.blue(text);

// Display minimalistic header
const displayHeader = () => {
  console.clear();
  console.log();
  console.log(`  ${zen('ZEN')} - ${title('The Professional Web Development Starter')}`);
  console.log();
};

// Get project name with enhanced styling
const getProjectName = async () => {
  const { projectName } = await prompts({
    type: 'text',
    name: 'projectName',
    message: 'Project name:',
    initial: 'zen-starter-app',
    validate: (value) => {
      if (!value.trim()) return 'Project name is required';
      if (fs.existsSync(value.trim())) return 'Directory already exists';
      return true;
    }
  });
  
  return projectName;
};

// Get repository URL
const getRepositoryUrl = () => 'https://github.com/dmitry-conquer/zen-starter.git';

// Main function with enhanced UX
const main = async () => {
  try {
    displayHeader();
    
    const PROJECT_NAME = await getProjectName();
    const REPO_URL = getRepositoryUrl();
    
    // Cloning with spinner
    const spinner = ora({
      text: `${chalk.hex(colors.green)('◇')} ${title('Preparing your ZEN project...')}`,
      color: 'green'
    }).start();
    
    try {
      execSync(`git clone --depth=1 "${REPO_URL}" "${PROJECT_NAME}"`, { stdio: 'pipe' });
      spinner.stop();
    } catch (err) {
      spinner.fail(`${error('Setup failed!')}`);
      console.log(`  ${subtitle('Please check your internet connection, permissions, and try again.')}`);
      process.exit(1);
    }
    
    // Remove .git
    fs.rmSync(path.join(PROJECT_NAME, '.git'), { recursive: true, force: true });
    
    // Success message
    console.log();
    console.log(`  ${chalk.hex(colors.darkPurple)('✅ SUCCESS! Your project is ready to go!')} ${chalk.hex(colors.lightPurple)('🎉')}`);
    console.log();
    
    // Next steps
    console.log(`  ${chalk.hex(colors.green)('◇')} ${title('Next steps')}`);
    console.log(`    ${chalk.hex(colors.purple)('📁')} ${highlight(`cd ${PROJECT_NAME}`)}`);
    console.log(`    ${chalk.hex(colors.purple)('📦')} ${highlight('npm install')}`);
    console.log(`    ${chalk.hex(colors.purple)('🧑‍💻')} ${highlight('npm run dev')}`);
    console.log();
    
    // Final message
    console.log(`  ${zen('Happy coding with ZEN!')} ${chalk.hex(colors.lightPurple)('✨')}`);
    console.log();
    
  } catch (err) {
    console.log(`  ${error('❌ An error occurred:')} ${err.message}`);
    process.exit(1);
  }
};

// Run the main function
main();