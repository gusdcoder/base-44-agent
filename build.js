#!/usr/bin/env node

/**
 * Billy LLM CLI Build Script
 * Creates standalone executables for multiple platforms
 * Created by BillyC0der
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.blue('🔨 Billy LLM CLI Build Tool'));
console.log(chalk.gray('Building standalone executables...\n'));

// Build configuration
const buildConfig = {
  name: 'billy-llm',
  entry: 'src/index.js',
  targets: [
    'node18-win-x64',     // Windows 64-bit
    'node18-linux-x64',   // Linux 64-bit
    'node18-macos-x64',   // macOS Intel
    'node18-macos-arm64'  // macOS Apple Silicon
  ],
  outputDir: 'dist',
  compression: true,
  // Configurações para ES modules
  pkgConfig: {
    "pkg": {
      "scripts": [
        "src/**/*.js"
      ],
      "assets": [
        "schemas/**/*",
        "templates/**/*",
        "workflows/**/*",
        "package.json"
      ],
      "targets": [
        "node18-win-x64",
        "node18-linux-x64", 
        "node18-macos-x64",
        "node18-macos-arm64"
      ],
      "outputPath": "dist"
    }
  }
};

// Check if pkg is installed
function checkPkgInstalled() {
  try {
    execSync('pkg --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Install pkg if not available
function installPkg() {
  console.log(chalk.yellow('📦 Installing pkg globally...'));
  try {
    execSync('npm install -g pkg', { stdio: 'inherit' });
    console.log(chalk.green('✅ pkg installed successfully\n'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to install pkg:'), error.message);
    process.exit(1);
  }
}

// Create dist directory
function createDistDirectory() {
  if (!fs.existsSync(buildConfig.outputDir)) {
    fs.mkdirSync(buildConfig.outputDir, { recursive: true });
    console.log(chalk.green(`✅ Created ${buildConfig.outputDir} directory`));
  }
}

// Update package.json with pkg configuration
function updatePackageJson() {
  console.log(chalk.cyan('🔧 Updating package.json with build configuration...'));
  
  const packagePath = './package.json';
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Set main entry point to pkg-entry.cjs for pkg (CommonJS compatibility)
  packageJson.main = 'pkg-entry.cjs';
  
  // Add pkg configuration
  packageJson.pkg = {
    scripts: [
      "src/**/*.js"
    ],
    assets: [
      "schemas/**/*",
      "workflows/**/*",
      "templates/**/*"
    ],
    outputPath: buildConfig.outputDir,
    targets: buildConfig.targets,
    options: [
      "--compress",
      "--public"
    ]
  };

  // Add build scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    "build": "node build.js",
    "build:win": "pkg . --targets node18-win-x64 --out-path dist",
    "build:linux": "pkg . --targets node18-linux-x64 --out-path dist",
    "build:mac": "pkg . --targets node18-macos-x64,node18-macos-arm64 --out-path dist",
    "build:all": "pkg . --out-path dist"
  };

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log(chalk.green('✅ package.json updated with build configuration\n'));
}

// Create CommonJS wrapper for ES modules compatibility with pkg
function createCjsWrapper() {
  console.log(chalk.cyan('🔄 Creating CommonJS wrapper for pkg compatibility...'));
  
  const wrapperContent = `#!/usr/bin/env node

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
`;

  fs.writeFileSync('./index.cjs', wrapperContent);
  console.log(chalk.green('✅ Created CommonJS wrapper (index.cjs)'));
}

// Create alternative entry point that works with pkg
function createPkgEntry() {
  console.log(chalk.cyan('🔄 Creating pkg-compatible entry point...'));
  
  const entryContent = `#!/usr/bin/env node

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
`;

  fs.writeFileSync('./pkg-entry.cjs', entryContent);
  console.log(chalk.green('✅ Created pkg entry point (pkg-entry.cjs)'));
}

// Build for specific target
function buildTarget(target) {
  const outputName = `${buildConfig.name}-${target.split('-').slice(1).join('-')}`;
  const outputPath = path.join(buildConfig.outputDir, outputName);
  
  console.log(chalk.cyan(`🔨 Building for ${target}...`));
  
  try {
    // Use package.json configuration instead of specifying entry point
    const command = `pkg . --targets ${target} --out-path ${buildConfig.outputDir} --compress`;
    execSync(command, { stdio: 'inherit' });
    
    // The output will be based on package.json name
    const baseName = JSON.parse(fs.readFileSync('./package.json', 'utf8')).name || 'billy-llm-cli';
    const defaultOutput = path.join(buildConfig.outputDir, baseName);
    const platformOutput = outputPath + (target.includes('win') ? '.exe' : '');
    
    // Rename output to include platform if needed
    try {
      if (fs.existsSync(defaultOutput) && !target.includes('win')) {
        // Linux/macOS executable without extension
        fs.renameSync(defaultOutput, platformOutput);
      } else if (fs.existsSync(defaultOutput + '.exe') && target.includes('win')) {
        // Windows executable with .exe extension
        fs.renameSync(defaultOutput + '.exe', platformOutput);
      }
      
      console.log(chalk.green(`✅ Built: ${platformOutput}`));
      
      // Get file size
      if (fs.existsSync(platformOutput)) {
        const stats = fs.statSync(platformOutput);
        const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(chalk.gray(`   Size: ${sizeInMB} MB\n`));
      }
    } catch (renameError) {
      console.log(chalk.yellow(`⚠️  Output file created but rename failed: ${renameError.message}`));
      console.log(chalk.blue(`📁 Check dist directory for generated files`));
    }
    
  } catch (error) {
    console.error(chalk.red(`❌ Failed to build ${target}:`), error.message);
  }
}

// Build all targets
function buildAllTargets() {
  console.log(chalk.blue('🚀 Building all targets...\n'));
  
  buildConfig.targets.forEach(target => {
    buildTarget(target);
  });
}

// Create build info file
function createBuildInfo() {
  const buildInfo = {
    name: buildConfig.name,
    version: JSON.parse(fs.readFileSync('./package.json', 'utf8')).version,
    buildDate: new Date().toISOString(),
    targets: buildConfig.targets,
    author: 'BillyC0der',
    description: 'Billy LLM Multi-Agent Pentesting CLI Tool'
  };

  fs.writeFileSync(
    path.join(buildConfig.outputDir, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );

  console.log(chalk.green('✅ Build information saved'));
}

// Create README for dist
function createDistReadme() {
  const readmeContent = `# Billy LLM CLI - Standalone Executables

Built on: ${new Date().toLocaleString()}
Created by: BillyC0der

## Available Executables

- **billy-llm-win-x64.exe** - Windows 64-bit
- **billy-llm-linux-x64** - Linux 64-bit  
- **billy-llm-macos-x64** - macOS Intel
- **billy-llm-macos-arm64** - macOS Apple Silicon

## Usage

### Windows
\`\`\`cmd
billy-llm-win-x64.exe interactive
billy-llm-win-x64.exe ask "Generate SQL injection payload"
\`\`\`

### Linux/macOS
\`\`\`bash
chmod +x billy-llm-linux-x64
./billy-llm-linux-x64 interactive
./billy-llm-linux-x64 ask "Generate reverse shell"
\`\`\`

## Features

- 🤖 Multi-Agent Orchestrator System
- 🎯 Specialized Pentesting Agents
- 📋 Workflow-driven Automation
- 🔍 Interactive Mode with History
- 📊 Comprehensive Reporting

## Commands

- \`interactive\` - Start interactive mode with history support
- \`ask <prompt>\` - Send single prompt to LLM
- \`config --token <token>\` - Configure API token

## Multi-Agent Commands (Interactive Mode)

- \`/workflow list\` - List available workflows
- \`/workflow run <id>\` - Execute workflow
- \`/agents list\` - Show available agents
- \`/history\` - Command history management
- \`/exploit <type>\` - Generate exploits
- \`/payload <type>\` - Create payloads
- \`/recon <target>\` - Reconnaissance tools

---

**Billy LLM Multi-Agent Pentesting System**  
*Professional penetration testing automation*
`;

  fs.writeFileSync(path.join(buildConfig.outputDir, 'README.md'), readmeContent);
  console.log(chalk.green('✅ Distribution README created'));
}

// Clean previous builds
function cleanBuild() {
  if (fs.existsSync(buildConfig.outputDir)) {
    console.log(chalk.yellow('🧹 Cleaning previous build...'));
    fs.rmSync(buildConfig.outputDir, { recursive: true, force: true });
    console.log(chalk.green('✅ Previous build cleaned\n'));
  }
}

// Main build function
async function main() {
  try {
    // Check arguments
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'clean':
        cleanBuild();
        break;

      case 'install':
        if (!checkPkgInstalled()) {
          installPkg();
        } else {
          console.log(chalk.green('✅ pkg is already installed\n'));
        }
        break;

      case 'config':
        updatePackageJson();
        break;

      case 'win':
        createDistDirectory();
        await createCjsWrapper();
        await createPkgEntry();
        buildTarget('node18-win-x64');
        break;

      case 'linux':
        createDistDirectory();
        await createCjsWrapper();
        await createPkgEntry();
        buildTarget('node18-linux-x64');
        break;

      case 'mac':
        createDistDirectory();
        await createCjsWrapper();
        await createPkgEntry();
        buildTarget('node18-macos-x64');
        buildTarget('node18-macos-arm64');
        break;

      case 'all':
      default:
        // Full build process
        console.log(chalk.blue('🚀 Starting full build process...\n'));

        // Step 1: Check/Install pkg
        if (!checkPkgInstalled()) {
          installPkg();
        } else {
          console.log(chalk.green('✅ pkg is available\n'));
        }

        // Step 2: Clean previous builds
        cleanBuild();

        // Step 3: Create directories
        createDistDirectory();

        // Step 4: Create CommonJS wrapper for pkg compatibility
        await createCjsWrapper();
        
        // Step 5: Create pkg entry point
        await createPkgEntry();

        // Step 6: Update package.json
        updatePackageJson();

        // Step 7: Build all targets
        buildAllTargets();

        // Step 8: Create additional files
        createBuildInfo();
        createDistReadme();

        console.log(chalk.green('\n🎉 Build completed successfully!'));
        console.log(chalk.blue('📁 Executables available in ./dist directory'));
        console.log(chalk.gray('Use "node build.js clean" to clean builds'));
        break;
    }

  } catch (error) {
    console.error(chalk.red('❌ Build failed:'), error.message);
    process.exit(1);
  }
}

// Show help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(chalk.blue('Billy LLM Build Tool\n'));
  console.log(chalk.gray('Usage: node build.js [command]\n'));
  console.log(chalk.cyan('Commands:'));
  console.log(chalk.gray('  all (default)  - Build all platforms'));
  console.log(chalk.gray('  win           - Build Windows executable only'));
  console.log(chalk.gray('  linux         - Build Linux executable only'));
  console.log(chalk.gray('  mac           - Build macOS executables only'));
  console.log(chalk.gray('  clean         - Clean previous builds'));
  console.log(chalk.gray('  install       - Install pkg globally'));
  console.log(chalk.gray('  config        - Update package.json only'));
  console.log(chalk.gray('  --help, -h    - Show this help\n'));
  process.exit(0);
}

// Run main function
main();

// Signed by BillyC0der - Executable Builder
