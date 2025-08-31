/**
 * CLI Handler - Alternative to commander.js for pkg compatibility
 * Created by BillyC0der - Pentester automation tools
 */

import chalk from 'chalk';

export function handleCLI(client, setupInteractiveMode) {
  const args = process.argv.slice(2);
  
  // Show help if no arguments or help requested
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'ask':
      handleAskCommand(client, args);
      break;
      
    case 'interactive':
    case 'i':
      handleInteractiveCommand(client, setupInteractiveMode, args);
      break;
      
    case 'config':
      handleConfigCommand(client, args);
      break;
      
    case '--version':
    case '-v':
      console.log('billy-llm v1.0.0');
      break;
      
    default:
      console.error(chalk.red(`Unknown command: ${command}`));
      console.log('Use --help to see available commands');
      process.exit(1);
  }
}

function showHelp() {
  console.log(chalk.blue('Billy LLM CLI - LLM CLI with structured responses\n'));
  console.log(chalk.cyan('Usage: billy-llm <command> [options]\n'));
  console.log(chalk.green('Commands:'));
  console.log('  ask <prompt>     Ask a question to the LLM');
  console.log('  interactive, i   Start interactive mode');
  console.log('  config          Configure API settings');
  console.log('');
  console.log(chalk.green('Ask command options:'));
  console.log('  -s, --schema <file>  JSON schema file path');
  console.log('  -c, --context        Add context from internet');
  console.log('  -j, --json          Output raw JSON response');
  console.log('');
  console.log(chalk.green('Interactive command options:'));
  console.log('  -s, --schema <file>  JSON schema file path');
  console.log('  -c, --context        Enable context by default');
  console.log('');
  console.log(chalk.green('Config command options:'));
  console.log('  --endpoint <url>    Set API endpoint');
  console.log('  --token <token>     Set bearer token');
  console.log('  --app-id <id>       Set app ID');
  console.log('');
  console.log(chalk.gray('Examples:'));
  console.log('  billy-llm ask "What is Node.js?"');
  console.log('  billy-llm i');
  console.log('  billy-llm ask "Explain this" -c -j');
  console.log('');
  console.log(chalk.gray('Created by BillyC0der - Pentester automation tools'));
}

async function handleAskCommand(client, args) {
  try {
    if (args.length < 2) {
      console.error(chalk.red('Error: Please provide a prompt'));
      console.log('Usage: billy-llm ask "<your question>"');
      process.exit(1);
    }
    
    const prompt = args[1];
    const options = parseOptions(args.slice(2));
    
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
}

function handleInteractiveCommand(client, setupInteractiveMode, args) {
  const options = parseOptions(args.slice(1));
  setupInteractiveMode(client, options);
}

function handleConfigCommand(client, args) {
  const options = parseOptions(args.slice(1));
  
  if (!options.endpoint && !options.token && !options['app-id']) {
    console.log(chalk.yellow('No configuration options provided'));
    console.log('Available options: --endpoint, --token, --app-id');
    return;
  }
  
  const config = {};
  if (options.endpoint) config.endpoint = options.endpoint;
  if (options.token) config.token = options.token;
  if (options['app-id']) config.appId = options['app-id'];
  
  client.configure(config);
  console.log(chalk.green('Configuration updated'));
}

function parseOptions(args) {
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '-s':
      case '--schema':
        options.schema = args[++i];
        break;
      case '-c':
      case '--context':
        options.context = true;
        break;
      case '-j':
      case '--json':
        options.json = true;
        break;
      case '--endpoint':
        options.endpoint = args[++i];
        break;
      case '--token':
        options.token = args[++i];
        break;
      case '--app-id':
        options['app-id'] = args[++i];
        break;
    }
  }
  
  return options;
}
