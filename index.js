#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';

// Modern terminal palette
const c = {
  brand:   (t) => chalk.hex('#38bdf8').bold(t),
  accent:  (t) => chalk.hex('#a78bfa').bold(t),
  success: (t) => chalk.hex('#34d399').bold(t),
  warning: (t) => chalk.hex('#fbbf24').bold(t),
  danger:  (t) => chalk.hex('#fb7185').bold(t),
  info:    (t) => chalk.hex('#22d3ee').bold(t),
  fg:      (t) => chalk.hex('#f8fafc')(t),
  soft:    (t) => chalk.hex('#cbd5e1')(t),
  muted:   (t) => chalk.hex('#94a3b8')(t),
  dim:     (t) => chalk.hex('#475569')(t),
};

const line = () => c.dim('  ' + '─'.repeat(48));

const displayHeader = () => {
  console.clear();
  console.log();
  console.log(
    `  ` +
    c.brand('create') + c.fg('-') + c.accent('zen') +
    `  ` + c.muted('·') + `  ` +
    c.soft('modern starter generator')
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
        title: `${c.info('Express')}    ${c.muted('Tailwind + Alpine')}`,
        description: 'frontend-only layout starter for fast utility-first development',
        value: 'express'
      },
      {
        title: `${c.accent('Standard')}   ${c.muted('BEM + SCSS + TypeScript')}`,
        description: 'frontend-only layout starter with structured component styling',
        value: 'standard'
      },
      {
        title: `${c.success('WordPress')}  ${c.muted('PHP + Tailwind + Alpine + TypeScript')}`,
        description: 'WordPress theme starter with PHP templates and production packaging',
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

const stepColors = [c.info, c.accent, c.success, c.warning];

const main = async () => {
  try {
    displayHeader();

    const PROJECT_NAME = await getProjectName();
    const variant = await getStarterVariant();
    const REPO_URL = getRepositoryUrl(variant);

    const spinner = ora({
      text: `  ${c.muted('Creating project...')}`,
      spinner: 'dots',
      color: 'cyan'
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

    console.log(`  ${c.success('✓')}  ${c.fg('Project ready')}  ${c.info(PROJECT_NAME)}`);
    console.log();
    console.log(line());
    console.log();

    const steps = getNextSteps(variant, PROJECT_NAME);
    console.log(`  ${c.soft('Next steps')}`);
    console.log();
    steps.forEach(({ cmd, label }, i) => {
      const col = stepColors[i % stepColors.length];
      console.log(`  ${c.dim(`${i + 1}.`)}  ${col(cmd.padEnd(16))} ${c.muted(label)}`);
    });

    console.log();
    console.log(line());
    console.log();
    console.log(
      `  ` +
      c.brand('create') + c.fg('-') + c.accent('zen') +
      `  ` + c.muted('ready when you are.')
    );
    console.log();

  } catch (err) {
    console.log();
    console.log(`  ${c.danger('✗')}  ${err.message}`);
    console.log();
    process.exit(1);
  }
};

main();
