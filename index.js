#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';

// Gruvbox palette
const c = {
  yellow:  (t) => chalk.hex('#fabd2f').bold(t),
  orange:  (t) => chalk.hex('#fe8019').bold(t),
  red:     (t) => chalk.hex('#fb4934').bold(t),
  green:   (t) => chalk.hex('#b8bb26').bold(t),
  aqua:    (t) => chalk.hex('#8ec07c').bold(t),
  blue:    (t) => chalk.hex('#83a598').bold(t),
  purple:  (t) => chalk.hex('#d3869b').bold(t),
  fg:      (t) => chalk.hex('#ebdbb2')(t),
  muted:   (t) => chalk.hex('#928374')(t),
  dim:     (t) => chalk.hex('#504945')(t),
};

const line = () => c.dim('  ' + '─'.repeat(42));

const displayHeader = () => {
  console.clear();
  console.log();
  console.log(
    `  ` +
    c.yellow('z') + c.orange('e') + c.green('n') +
    `  ` + c.muted('·') + `  ` +
    c.fg('create new project')
  );
  console.log(line());
  console.log();
};

const getProjectName = async () => {
  const { projectName } = await prompts({
    type: 'text',
    name: 'projectName',
    message: c.fg('project name'),
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
    message: c.fg('starter'),
    choices: [
      {
        title: `${c.aqua('express')}   ${c.muted('tailwind + alpine')}`,
        description: 'lightweight utility-first setup',
        value: 'express'
      },
      {
        title: `${c.muted('standard')}  ${c.muted('bem + scss + typescript')}`,
        description: 'classic setup',
        value: 'standard'
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
    express:  'https://github.com/dmitry-conquer/zen-express.git',
    standard: 'https://github.com/dmitry-conquer/zen-starter.git',
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

const rainbow = [c.red, c.orange, c.yellow, c.green, c.aqua, c.blue, c.purple];

const main = async () => {
  try {
    displayHeader();

    const PROJECT_NAME = await getProjectName();
    const variant = await getStarterVariant();
    const REPO_URL = getRepositoryUrl(variant);

    const spinner = ora({
      text: `  ${c.muted('cloning...')}`,
      spinner: 'dots',
      color: 'yellow'
    }).start();

    try {
      execSync(`git clone --depth=1 "${REPO_URL}" "${PROJECT_NAME}"`, { stdio: 'pipe' });
      spinner.stop();
    } catch (err) {
      spinner.stop();
      console.log();
      console.log(`  ${c.red('✗')}  ${c.fg('clone failed')}  ${c.muted('check your connection')}`);
      console.log();
      process.exit(1);
    }

    fs.rmSync(path.join(PROJECT_NAME, '.git'), { recursive: true, force: true });

    console.log(`  ${c.green('✓')}  ${c.fg('ready')}  ${c.aqua(PROJECT_NAME)}`);
    console.log();
    console.log(line());
    console.log();

    const steps = getNextSteps(variant, PROJECT_NAME);
    console.log(`  ${c.muted('next steps')}`);
    console.log();
    steps.forEach(({ cmd, label }, i) => {
      const col = rainbow[i % rainbow.length];
      console.log(`  ${c.dim(`${i + 1}.`)}  ${col(cmd)}  ${c.muted(label)}`);
    });

    console.log();
    console.log(line());
    console.log();
    console.log(
      `  ` +
      c.yellow('z') + c.orange('e') + c.green('n') +
      `  ` + c.muted('happy building.')
    );
    console.log();

  } catch (err) {
    console.log();
    console.log(`  ${c.red('✗')}  ${err.message}`);
    console.log();
    process.exit(1);
  }
};

main();
