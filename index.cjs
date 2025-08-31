#!/usr/bin/env node

/**
 * CommonJS wrapper for Billy LLM CLI
 * This file enables pkg to work with ES modules
 */

// Dynamic import for ES modules
async function startApp() {
  try {
    const { program } = await import('./src/index.js');
    // The module will execute when imported
  } catch (error) {
    console.error('Error loading ES module:', error);
    process.exit(1);
  }
}

startApp();
