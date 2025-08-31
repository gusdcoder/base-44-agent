#!/usr/bin/env node

import readline from 'readline';
import chalk from 'chalk';

console.log(chalk.blue('🧪 Testing History Functionality'));
console.log(chalk.gray('Type commands and use ↑/↓ arrows to test history'));
console.log(chalk.gray('Type "exit" to quit\n'));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  history: ['help', '/exploit sqli', '/recon google.com', '/payload revshell'],
  historySize: 100,
  removeHistoryDuplicates: true
});

function askQuestion() {
  rl.question(chalk.cyan('Test: '), (answer) => {
    if (answer.toLowerCase() === 'exit') {
      console.log(chalk.yellow('Test completed! 👋'));
      rl.close();
      return;
    }
    
    console.log(chalk.green(`You entered: ${answer}`));
    console.log(chalk.gray('Use ↑/↓ arrows to navigate history\n'));
    
    askQuestion();
  });
}

askQuestion();
