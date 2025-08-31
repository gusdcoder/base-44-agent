#!/usr/bin/env node

/**
 * Billy LLM CLI - PKG-compatible version
 * Uses custom CLI handler instead of commander.js for better pkg compatibility
 * Created by BillyC0der - Pentester automation tools
 */

import { LLMClient } from './client.js';
import { setupInteractiveMode } from './interactive.js';
import { handleCLI } from './cli-handler.js';

// Create client instance
const client = new LLMClient();

// Handle CLI with custom handler
try {
  handleCLI(client, setupInteractiveMode);
} catch (error) {
  console.error('CLI Error:', error.message);
  if (process.env.DEBUG) {
    console.error('Full error:', error);
  }
  process.exit(1);
}
