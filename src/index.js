#!/usr/bin/env node

import { program } from 'commander';
import { LLMClient } from './client.js';
import { setupInteractiveMode } from './interactive.js';
import chalk from 'chalk';

const client = new LLMClient();

program
  .name('billy-llm')
  .description('LLM CLI with structured responses')
  .version('1.0.0');

program
  .command('ask')
  .description('Ask a question to the LLM')
  .argument('<prompt>', 'The prompt to send')
  .option('-s, --schema <schema>', 'JSON schema file path')
  .option('-c, --context', 'Add context from internet', false)
  .option('-j, --json', 'Output raw JSON response', false)
  .action(async (prompt, options) => {
    try {
      let schema = null;
      if (options.schema) {
        const fs = await import('fs');
        schema = JSON.parse(fs.readFileSync(options.schema, 'utf8'));
      }

      const response = await client.invoke(prompt, schema, options.context);
      
      if (options.json) {
        console.log(JSON.stringify(response, null, 2));
      } else {
        console.log(chalk.green('Response:'));
        console.log(JSON.stringify(response, null, 2));
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .option('-s, --schema <schema>', 'JSON schema file path')
  .option('-c, --context', 'Enable context from internet by default', false)
  .action((options) => {
    setupInteractiveMode(client, options);
  });

program
  .command('config')
  .description('Configure API settings')
  .option('--endpoint <url>', 'Set API endpoint')
  .option('--token <token>', 'Set bearer token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiaWxseXJhdWwxOTFAZ21haWwuY29tIiwiZXhwIjoxNzU3MTMwMjgyLCJpYXQiOjE3NTY1MjU0ODJ9.6ygDYvaiiYbPhY8fjxvq6bNlpyU9UNFDKqfGhLkwAhY')
  .option('--app-id <id>', 'Set app ID')
  .action((options) => {
    client.configure(options);
    console.log(chalk.green('Configuration updated'));
  });

program.parse();