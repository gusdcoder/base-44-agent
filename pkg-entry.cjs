#!/usr/bin/env node

/**
 * PKG-compatible entry point for Billy LLM CLI
 * Uses eval() to work around pkg ES module issues
 * Created by BillyC0der - Pentester automation tools
 */

console.log("=== PKG DEBUG INFO ===");
console.log("process.pkg:", process.pkg ? "present" : "not present");

// Use eval to dynamically create an import function that pkg can't detect at build time
const dynamicImport = new Function('specifier', 'return import(specifier)');

async function startBillyLLM() {
  try {
    console.log("Loading ES modules...");
    
    // Dynamically import ES modules using eval-created import
    const { LLMClient } = await dynamicImport('./src/client.js');
    const { setupInteractiveMode } = await dynamicImport('./src/interactive.js');
    const { handleCLI } = await dynamicImport('./src/cli-handler.js');
    
    console.log("✅ ES modules loaded successfully");
    
    // Create client instance
    const client = new LLMClient();
    
    // Handle CLI with custom handler
    handleCLI(client, setupInteractiveMode);
    
  } catch (error) {
    console.error('❌ Billy LLM Error:', error.message);
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Start the application
startBillyLLM();
