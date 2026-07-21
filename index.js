#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';

// Restrained terminal palette with a distinct accent for each starter.
const c = {
  basis:     (t) => chalk.hex('#CC6699').bold(t),
  express:   (t) => chalk.hex('#06B6D4').bold(t),
  wordpress: (t) => chalk.hex('#0073AA').bold(t),
  success:   (t) => chalk.hex('#22C55E').bold(t),
  danger:    (t) => chalk.hex('#EF4444').bold(t),
  fg:        (t) => chalk.hex('#E5E7EB')(t),
  soft:      (t) => chalk.hex('#B8C0CC')(t),
  muted:     (t) => chalk.hex('#7C8798')(t),
  dim:       (t) => chalk.hex('#3F4753')(t),
};

const line = () => c.dim('  ' + '─'.repeat(48));

const displayHeader = () => {
  console.clear();
  console.log();
  console.log(
    `  ${c.fg('modern starter generator')}`
  );
  console.log(line());
  console.log();
};

const getProjectName = async () => {
  const { projectName } = await prompts({
    type: 'text',
    name: 'projectName',
    message: c.soft('Project name'),
    initial: 'my-project',
    validate: (value) => {
      if (!value.trim()) return 'name is required';
      if (fs.existsSync(value.trim())) return `"${value.trim()}" already exists`;
      return true;
    }
  });

  if (!projectName) process.exit(0);
  return projectName;
};

const getStarterVariant = async () => {
  console.log();
  const { variant } = await prompts({
    type: 'select',
    name: 'variant',
    message: c.soft('Choose a starter'),
    choices: [
      {
        title: `${c.basis('Basis')}      ${c.muted('SCSS and BEM · HTML and Handlebars · TypeScript')}`,
        description: 'Foundational BEM-based markup for legacy and class-driven projects',
        value: 'standard'
      },
      {
        title: `${c.express('Express')}    ${c.muted('Tailwind CSS v4 · HTML and Handlebars · TypeScript and Alpine.js')}`,
        description: 'Fast utility-first frontend implementation',
        value: 'express'
      },
      {
        title: `${c.wordpress('WordPress')}  ${c.muted('Tailwind CSS v4 · PHP and WordPress templates · PHP, TypeScript, and Alpine.js')}`,
        description: 'Direct frontend development inside a production-ready WordPress theme',
        value: 'wordpress'
      }
    ],
    initial: 0,
    hint: ' '
  });

  if (!variant) process.exit(0);
  console.log();
  return variant;
};

const getRepositoryUrl = (variant) => {
  const repos = {
    express: 'https://github.com/dmitry-conquer/zen-express.git',
    standard: 'https://github.com/dmitry-conquer/zen-starter.git',
    wordpress: 'https://github.com/dmitry-conquer/zen-wordpress.git',
  };
  return repos[variant];
};

const getNextSteps = (variant, name) => {
  const steps = [
    { cmd: `cd ${name}`,    label: 'enter project' },
    { cmd: 'npm install',   label: 'install deps'  },
  ];

  steps.push({ cmd: 'npm run dev', label: 'start dev server' });

  return steps;
};

const getStarter = (variant) => ({
  standard:  { name: 'Basis',     color: c.basis,     spinnerColor: 'magenta' },
  express:   { name: 'Express',   color: c.express,   spinnerColor: 'cyan' },
  wordpress: { name: 'WordPress', color: c.wordpress, spinnerColor: 'blue' },
}[variant]);

const main = async () => {
  try {
    displayHeader();

    const PROJECT_NAME = await getProjectName();
    const variant = await getStarterVariant();
    const REPO_URL = getRepositoryUrl(variant);
    const starter = getStarter(variant);

    const spinner = ora({
      text: `  ${c.muted('Creating')} ${starter.color(starter.name)} ${c.muted('project...')}`,
      spinner: 'dots',
      color: starter.spinnerColor
    }).start();

    try {
      execSync(`git clone --depth=1 "${REPO_URL}" "${PROJECT_NAME}"`, { stdio: 'pipe' });
      spinner.stop();
    } catch (err) {
      spinner.stop();
      console.log();
      console.log(`  ${c.danger('✗')}  ${c.fg('Clone failed')}  ${c.muted('check your connection')}`);
      console.log();
      process.exit(1);
    }

    fs.rmSync(path.join(PROJECT_NAME, '.git'), { recursive: true, force: true });

    console.log(`  ${c.success('✓')}  ${c.fg('Project ready')}  ${starter.color(PROJECT_NAME)}`);
    console.log();
    console.log(line());
    console.log();

    const steps = getNextSteps(variant, PROJECT_NAME);
    console.log(`  ${c.soft('Next steps')}`);
    console.log();
    steps.forEach(({ cmd, label }, i) => {
      console.log(`  ${c.dim(`${i + 1}.`)}  ${c.fg(cmd.padEnd(16))} ${c.muted(label)}`);
    });

    console.log();
    console.log(line());
    console.log();
    console.log(`  ${c.fg('Setup complete.')}  ${c.muted('Ready when you are.')}`);
    console.log();

  } catch (err) {
    console.log();
    console.log(`  ${c.danger('✗')}  ${err.message}`);
    console.log();
    process.exit(1);
  }
};

main();
