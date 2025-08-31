#!/usr/bin/env node

/**
 * PKG-compatible entry point for Billy LLM CLI
 * Uses static imports instead of dynamic imports for pkg compatibility
 * Created by BillyC0der - Pentester automation tools
 */

import { LLMClient } from './src/client.js';
import { setupInteractiveMode } from './src/interactive.js';
import { handleCLI } from './src/cli-handler.js';

console.log("=== PKG DEBUG INFO ===");
console.log("process.pkg:", process.pkg ? "present" : "not present");
console.log("Starting Billy LLM CLI...");

try {
  // Create client instance
  const client = new LLMClient();
  
  // Handle CLI with custom handler
  handleCLI(client, setupInteractiveMode);
  
} catch (error) {
  console.error('❌ Billy LLM Error:', error.message);
  if (process.env.DEBUG) {
    console.error('Full error:', error);
    console.error('Stack:', error.stack);
  }
  process.exit(1);
}
