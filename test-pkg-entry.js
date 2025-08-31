#!/usr/bin/env node

console.log("Testing pkg-entry.js...");
console.log("Process argv:", process.argv);

try {
  import('./src/index-pkg.js').then(() => {
    console.log("Import successful!");
  }).catch(error => {
    console.error("Import error:", error);
  });
} catch (error) {
  console.error("Direct error:", error);
}
