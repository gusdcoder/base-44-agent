#!/usr/bin/env node

/**
 * PKG-compatible entry point for Billy LLM CLI
 * Uses CommonJS with dynamic imports for ES modules compatibility
 * Created by BillyC0der - Pentester automation tools
 */

console.log("=== PKG DEBUG INFO ===");
console.log("process.pkg:", process.pkg ? "present" : "not present");
console.log("Starting Billy LLM CLI...");

// Use dynamic imports for ES modules in CommonJS context
async function startBillyLLM() {
  try {
    // Dynamically import ES modules
    const { LLMClient } = await import('./src/client.js');
    const { setupInteractiveMode } = await import('./src/interactive.js');
    const { handleCLI } = await import('./src/cli-handler.js');
    
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
}

// Start the application
startBillyLLM();
