#!/usr/bin/env node

/**
 * Debugging version of pkg entry point
 */

console.log("=== DEBUG PKG ENTRY ===");
console.log("process.argv:", process.argv);
console.log("process.cwd():", process.cwd());
console.log("__dirname available:", typeof __dirname !== 'undefined');
console.log("__filename available:", typeof __filename !== 'undefined');
console.log("process.pkg:", process.pkg);

// Test basic functionality
console.log("=== TESTING BASIC IMPORTS ===");

try {
  console.log("Testing chalk import...");
  const chalk = await import('chalk');
  console.log("✅ chalk imported successfully");
  
  console.log("Testing fs import...");
  const fs = await import('fs');
  console.log("✅ fs imported successfully");
  
  console.log("Testing path import...");
  const path = await import('path');
  console.log("✅ path imported successfully");
  
  console.log("Testing our modules...");
  
  console.log("Testing LLMClient import...");
  const { LLMClient } = await import('./src/client.js');
  console.log("✅ LLMClient imported successfully");
  
  console.log("Testing interactive import...");
  const { setupInteractiveMode } = await import('./src/interactive.js');
  console.log("✅ setupInteractiveMode imported successfully");
  
  console.log("Testing CLI handler import...");
  const { handleCLI } = await import('./src/cli-handler.js');
  console.log("✅ handleCLI imported successfully");
  
  console.log("=== TESTING CLI EXECUTION ===");
  const client = new LLMClient();
  console.log("✅ Client created successfully");
  
  console.log("Calling handleCLI...");
  handleCLI(client, setupInteractiveMode);
  console.log("✅ handleCLI called successfully");
  
} catch (error) {
  console.error("❌ Error during testing:");
  console.error("Error message:", error.message);
  console.error("Error stack:", error.stack);
  console.error("Error code:", error.code);
}
