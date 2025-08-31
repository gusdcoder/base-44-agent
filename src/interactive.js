import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import { SchemaValidator } from './schema-validator.js';
import { exploitTemplates, payloadTemplates, reconTemplates } from './templates.js';
import { Orchestrator } from './orchestrator.js';

const validator = new SchemaValidator();

export async function setupInteractiveMode(client, options = {}) {
  console.log(chalk.blue('🤖 Welcome to Billy LLM Interactive Mode - Pentester Edition'));
  console.log(chalk.gray('Type "exit" to quit, "help" for commands\n'));

  // Load initial schema if provided
  if (options.schema) {
    try {
      if (fs.existsSync(options.schema)) {
        const schema = JSON.parse(fs.readFileSync(options.schema, 'utf8'));
        const validation = validator.validateSchema(schema);
        
        if (validation.valid) {
          client.currentSchema = schema;
          console.log(chalk.green(`✅ Schema loaded: ${options.schema}`));
        } else {
          console.log(chalk.red(`❌ Invalid schema: ${validation.error}`));
        }
      } else {
        console.log(chalk.red(`❌ Schema file not found: ${options.schema}`));
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error loading schema: ${error.message}`));
    }
  }

  // Set default context option
  client.defaultContext = options.context || false;

  while (true) {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'prompt',
          message: chalk.cyan('You:'),
          validate: (input) => input.trim() !== '' || 'Please enter a prompt'
        }
      ]);

      const prompt = answers.prompt.trim();

      if (prompt.toLowerCase() === 'exit') {
        console.log(chalk.yellow('Goodbye! 👋'));
        break;
      }

      if (prompt.toLowerCase() === 'help') {
        showHelp();
        continue;
      }

      if (prompt.startsWith('/schema')) {
        await handleSchemaCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/config')) {
        await handleConfigCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/exploit')) {
        await handleExploitCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/payload')) {
        await handlePayloadCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/recon')) {
        await handleReconCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/reverse')) {
        await handleReverseCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/enum')) {
        await handleEnumCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/snippet')) {
        await handleSnippetCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/template')) {
        await handleTemplateCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/pentest')) {
        await handlePentestCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/generate')) {
        await handleGenerateCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/format')) {
        await handleFormatCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/analyze')) {
        await handleAnalyzeCommand(prompt, client);
        continue;
      }

      // Multi-Agent Orchestrator Commands
      if (prompt.startsWith('/workflow')) {
        await handleWorkflowCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/orchestrator')) {
        await handleOrchestratorCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/agents')) {
        await handleAgentsCommand(prompt, client);
        continue;
      }

      if (prompt.startsWith('/jobs')) {
        await handleJobsCommand(prompt, client);
        continue;
      }

      console.log(chalk.gray('Thinking...'));
      
      const response = await client.invoke(
        prompt, 
        client.currentSchema,
        client.defaultContext
      );
      
      console.log(chalk.green('\n🤖 Assistant:'));
      console.log(JSON.stringify(response, null, 2));
      console.log();

    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      console.log();
    }
  }
}

function showHelp() {
  console.log(chalk.blue('\n📖 Available Commands:'));
  console.log(chalk.gray('  help                     - Show this help'));
  console.log(chalk.gray('  exit                     - Exit interactive mode'));
  
  console.log(chalk.blue('\n🔧 Configuration:'));
  console.log(chalk.gray('  /schema <file>           - Use schema from file'));
  console.log(chalk.gray('  /schema list             - List available schemas'));
  console.log(chalk.gray('  /config show             - Show current config'));
  console.log(chalk.gray('  /config token <val>      - Set bearer token'));
  
  console.log(chalk.blue('\n🎯 Pentesting Commands:'));
  console.log(chalk.gray('  /exploit <type>          - Generate exploit code'));
  console.log(chalk.gray('  /payload <type>          - Generate payloads'));
  console.log(chalk.gray('  /recon <target>          - Reconnaissance commands'));
  console.log(chalk.gray('  /enum <service>          - Enumeration techniques'));
  console.log(chalk.gray('  /reverse <ip> <port>     - Reverse shell generators'));
  console.log(chalk.gray('  /snippet <name>          - Code snippets library'));
  console.log(chalk.gray('  /template <type>         - Quick exploit templates'));
  console.log(chalk.gray('  /pentest <action>        - Pentest project management'));
  console.log(chalk.gray('  /generate <type>         - Generate custom code'));
  console.log(chalk.gray('  /format <type>           - Format and save outputs'));
  console.log(chalk.gray('  /analyze <tool>          - Analyze tool outputs'));
  
  console.log(chalk.blue('\n💬 Normal Usage:'));
  console.log(chalk.gray('  Any other text           - Send to LLM\n'));
}

async function handleSchemaCommand(command, client) {
  const parts = command.split(' ');
  
  if (parts.length < 2) {
    console.log(chalk.red('Usage: /schema <file|list>'));
    return;
  }

  if (parts[1] === 'list') {
    const schemas = validator.getDefaultSchemas();
    console.log(chalk.blue('\n📋 Available default schemas:'));
    Object.keys(schemas).forEach(name => {
      console.log(chalk.gray(`  ${name}`));
    });
    console.log();
    return;
  }

  const schemaFile = parts[1];
  try {
    if (fs.existsSync(schemaFile)) {
      const schema = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
      const validation = validator.validateSchema(schema);
      
      if (validation.valid) {
        console.log(chalk.green(`✅ Schema loaded from ${schemaFile}`));
        // Store schema in client for next request
        client.currentSchema = schema;
      } else {
        console.log(chalk.red(`❌ Invalid schema: ${validation.error}`));
      }
    } else {
      console.log(chalk.red(`❌ Schema file not found: ${schemaFile}`));
    }
  } catch (error) {
    console.log(chalk.red(`❌ Error loading schema: ${error.message}`));
  }
}

async function handleConfigCommand(command, client) {
  const parts = command.split(' ');
  
  if (parts.length < 2 || parts[1] === 'show') {
    console.log(chalk.blue('\n⚙️ Current Configuration:'));
    console.log(chalk.gray(`  Endpoint: ${client.config.endpoint}`));
    console.log(chalk.gray(`  Token: ${client.config.token ? '***hidden***' : 'not set'}`));
    console.log(chalk.gray(`  App ID: ${client.config.appId}`));
    console.log();
    return;
  }

  if (parts[1] === 'token' && parts[2]) {
    client.configure({ token: parts[2] });
    console.log(chalk.green('✅ Token updated'));
    return;
  }

  console.log(chalk.red('Usage: /config show | /config token <value>'));
}

// Pentesting command handlers
async function handleExploitCommand(command, client) {
  const parts = command.split(' ');
  
  if (parts.length < 2) {
    console.log(chalk.blue('\n🎯 Available Exploit Types:'));
    console.log(chalk.gray('  sqli          - SQL Injection exploits'));
    console.log(chalk.gray('  xss           - Cross-Site Scripting'));
    console.log(chalk.gray('  rce           - Remote Code Execution'));
    console.log(chalk.gray('  lfi           - Local File Inclusion'));
    console.log(chalk.gray('  csrf          - Cross-Site Request Forgery'));
    console.log(chalk.gray('  buffer        - Buffer Overflow'));
    console.log(chalk.gray('  privesc       - Privilege Escalation'));
    console.log(chalk.gray('Usage: /exploit <type> [description]'));
    return;
  }

  const exploitType = parts[1];
  const description = parts.slice(2).join(' ') || '';
  
  const prompts = {
    sqli: `Generate SQL injection exploit code for ${description || 'common scenarios'}. Include both manual and automated approaches.`,
    xss: `Generate XSS payloads and exploit code for ${description || 'various contexts (stored, reflected, DOM-based)'}.`,
    rce: `Generate remote code execution exploit for ${description || 'common vulnerabilities'}. Include different payload types.`,
    lfi: `Generate local file inclusion exploit code for ${description || 'path traversal attacks'}. Include wrapper techniques.`,
    csrf: `Generate CSRF exploit code for ${description || 'form-based attacks'}. Include HTML and JavaScript approaches.`,
    buffer: `Generate buffer overflow exploit template for ${description || 'stack-based vulnerabilities'}. Include shellcode.`,
    privesc: `Generate privilege escalation techniques for ${description || 'Linux and Windows systems'}.`
  };

  const prompt = prompts[exploitType];
  if (!prompt) {
    console.log(chalk.red(`Unknown exploit type: ${exploitType}`));
    return;
  }

  console.log(chalk.gray('Generating exploit...'));
  try {
    const response = await client.invoke(prompt, null, true);
    console.log(chalk.green(`\n🎯 ${exploitType.toUpperCase()} Exploit:`));
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.log(chalk.red(`Error generating exploit: ${error.message}`));
  }
}

async function handlePayloadCommand(command, client) {
  const parts = command.split(' ');
  
  if (parts.length < 2) {
    console.log(chalk.blue('\n💥 Available Payload Types:'));
    console.log(chalk.gray('  revshell      - Reverse shells (bash, python, php, etc.)'));
    console.log(chalk.gray('  webshell      - Web shells (php, asp, aspx, jsp)'));
    console.log(chalk.gray('  bindshell     - Bind shells'));
    console.log(chalk.gray('  meterpreter   - Meterpreter payloads'));
    console.log(chalk.gray('  powershell    - PowerShell payloads'));
    console.log(chalk.gray('  encoded       - Encoded/obfuscated payloads'));
    console.log(chalk.gray('Usage: /payload <type> [options]'));
    return;
  }

  const payloadType = parts[1];
  const options = parts.slice(2).join(' ') || '';
  
  const prompts = {
    revshell: `Generate reverse shell payloads in multiple languages (bash, python, php, netcat, etc.) ${options ? 'with options: ' + options : ''}`,
    webshell: `Generate web shell code in multiple languages (PHP, ASP, ASPX, JSP) ${options ? 'with features: ' + options : ''}`,
    bindshell: `Generate bind shell payloads for different platforms ${options ? 'with options: ' + options : ''}`,
    meterpreter: `Generate meterpreter payload examples and usage ${options ? 'for: ' + options : ''}`,
    powershell: `Generate PowerShell payloads and obfuscation techniques ${options ? 'for: ' + options : ''}`,
    encoded: `Generate encoded and obfuscated payloads to bypass detection ${options ? 'using: ' + options : ''}`
  };

  const prompt = prompts[payloadType];
  if (!prompt) {
    console.log(chalk.red(`Unknown payload type: ${payloadType}`));
    return;
  }

  console.log(chalk.gray('Generating payload...'));
  try {
    const response = await client.invoke(prompt, null, true);
    console.log(chalk.green(`\n💥 ${payloadType.toUpperCase()} Payload:`));
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.log(chalk.red(`Error generating payload: ${error.message}`));
  }
}

async function handleReconCommand(command, client) {
  const parts = command.split(' ');
  
  if (parts.length < 2) {
    console.log(chalk.blue('\n🔍 Reconnaissance Commands:'));
    console.log(chalk.gray('  /recon <target>          - General recon for target'));
    console.log(chalk.gray('  /recon subdomain <domain> - Subdomain enumeration'));
    console.log(chalk.gray('  /recon portscan <ip>     - Port scanning techniques'));
    console.log(chalk.gray('  /recon osint <target>    - OSINT gathering'));
    console.log(chalk.gray('  /recon web <url>         - Web application recon'));
    console.log(chalk.gray('  /recon save <target>     - Save recon plan to file'));
    return;
  }

  const target = parts[1];
  const subcommand = parts[2] || '';
  
  let prompt;
  let useReconSchema = true;
  
  if (subcommand) {
    const reconTypes = {
      subdomain: `Generate subdomain enumeration techniques and tools for domain: ${target}`,
      portscan: `Generate port scanning commands and techniques for IP: ${target}`,
      osint: `Generate OSINT gathering techniques and tools for target: ${target}`,
      web: `Generate web application reconnaissance checklist and tools for: ${target}`,
      save: `Generate a comprehensive, structured reconnaissance plan for target: ${target} with commands, tools, and estimated time`
    };
    prompt = reconTypes[target] || `Generate reconnaissance techniques for: ${target} ${subcommand}`;
    
    // Use structured schema for save command
    if (target === 'save') {
      useReconSchema = true;
      const actualTarget = subcommand;
      prompt = `Generate a comprehensive, structured reconnaissance plan for target: ${actualTarget}. Include specific commands, required tools, descriptions of what each technique discovers, and estimated time to complete.`;
    }
  } else {
    prompt = `Generate comprehensive reconnaissance plan and commands for target: ${target}. Include specific techniques, commands, tools needed, and estimated completion time.`;
  }

  console.log(chalk.gray('Generating reconnaissance plan...'));
  try {
    // Use recon schema for structured output when appropriate
    const schema = useReconSchema ? validator.getDefaultSchemas().recon : null;
    const response = await client.invoke(prompt, schema, true);
    
    console.log(chalk.green('\n🔍 Reconnaissance Plan:'));
    
    if (useReconSchema && response.target) {
      // Format structured response nicely
      console.log(chalk.blue(`Target: ${response.target}`));
      if (response.estimated_time) {
        console.log(chalk.yellow(`Estimated Time: ${response.estimated_time}`));
      }
      if (response.tools && response.tools.length > 0) {
        console.log(chalk.cyan(`\n🛠️ Required Tools:`));
        response.tools.forEach(tool => {
          console.log(chalk.gray(`  - ${tool}`));
        });
      }
      if (response.techniques && response.techniques.length > 0) {
        console.log(chalk.cyan(`\n📋 Techniques:`));
        response.techniques.forEach((technique, index) => {
          console.log(chalk.blue(`\n${index + 1}. ${technique.name}`));
          if (technique.description) {
            console.log(chalk.gray(`   Description: ${technique.description}`));
          }
          if (technique.tool) {
            console.log(chalk.yellow(`   Tool: ${technique.tool}`));
          }
          console.log(chalk.white(`   Command: ${technique.command}`));
        });
      }
      if (response.notes) {
        console.log(chalk.cyan(`\n📝 Notes:`));
        console.log(chalk.gray(response.notes));
      }
      
      // Save to file if requested
      if (target === 'save') {
        try {
          const filename = `recon-${subcommand.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`;
          fs.writeFileSync(filename, JSON.stringify(response, null, 2));
          console.log(chalk.green(`\n� Reconnaissance plan saved to: ${filename}`));
          
          // Also save to current project if available
          if (client.currentProject) {
            client.currentProject.findings.push({
              type: 'reconnaissance_plan',
              target: response.target,
              timestamp: new Date().toISOString(),
              data: response
            });
            
            const projectsPath = './pentest-projects';
            fs.writeFileSync(`${projectsPath}/${client.currentProject.name}.json`, 
              JSON.stringify(client.currentProject, null, 2));
            console.log(chalk.blue('💾 Plan also saved to current project'));
          }
        } catch (error) {
          console.log(chalk.red(`Error saving file: ${error.message}`));
        }
      }
      
    } else {
      // Fallback to JSON output
      console.log(JSON.stringify(response, null, 2));
    }
    
  } catch (error) {
    console.log(chalk.red(`Error generating recon plan: ${error.message}`));
  }
}

async function handleReverseCommand(command, client) {
  const parts = command.split(' ');
  
  if (parts.length < 3) {
    console.log(chalk.red('Usage: /reverse <ip> <port> [shell_type]'));
    console.log(chalk.gray('Examples:'));
    console.log(chalk.gray('  /reverse 10.10.10.1 4444'));
    console.log(chalk.gray('  /reverse 192.168.1.100 1337 bash'));
    console.log(chalk.gray('  /reverse 172.16.1.1 9001 powershell'));
    return;
  }

  const ip = parts[1];
  const port = parts[2];
  const shellType = parts[3] || 'all';
  
  const prompt = `Generate reverse shell commands for IP ${ip} and port ${port}. Include ${shellType === 'all' ? 'all common types (bash, python, php, netcat, powershell, etc.)' : shellType + ' shells'}. Format as ready-to-use commands.`;

  console.log(chalk.gray('Generating reverse shells...'));
  try {
    const response = await client.invoke(prompt);
    console.log(chalk.green(`\n🔄 Reverse Shells (${ip}:${port}):`));
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.log(chalk.red(`Error generating reverse shells: ${error.message}`));
  }
}

async function handleEnumCommand(command, client) {
  const parts = command.split(' ');
  
  if (parts.length < 2) {
    console.log(chalk.blue('\n🔎 Enumeration Services:'));
    console.log(chalk.gray('  smb           - SMB enumeration'));
    console.log(chalk.gray('  ftp           - FTP enumeration'));
    console.log(chalk.gray('  ssh           - SSH enumeration'));
    console.log(chalk.gray('  http          - HTTP enumeration'));
    console.log(chalk.gray('  dns           - DNS enumeration'));
    console.log(chalk.gray('  ldap          - LDAP enumeration'));
    console.log(chalk.gray('  snmp          - SNMP enumeration'));
    console.log(chalk.gray('  mysql         - MySQL enumeration'));
    console.log(chalk.gray('Usage: /enum <service> [target]'));
    return;
  }

  const service = parts[1];
  const target = parts[2] || '<target>';
  
  const prompts = {
    smb: `Generate SMB enumeration commands and techniques for target ${target}. Include share enumeration, null sessions, and vulnerability checks.`,
    ftp: `Generate FTP enumeration commands for ${target}. Include anonymous access, directory traversal, and common vulnerabilities.`,
    ssh: `Generate SSH enumeration and attack techniques for ${target}. Include version detection, brute force, and key-based attacks.`,
    http: `Generate HTTP/HTTPS enumeration checklist for ${target}. Include directory busting, technology detection, and common vulnerabilities.`,
    dns: `Generate DNS enumeration techniques for ${target}. Include zone transfers, subdomain brute force, and record analysis.`,
    ldap: `Generate LDAP enumeration commands for ${target}. Include anonymous binds, user enumeration, and schema discovery.`,
    snmp: `Generate SNMP enumeration techniques for ${target}. Include community string attacks and OID walking.`,
    mysql: `Generate MySQL enumeration and exploitation techniques for ${target}. Include authentication bypass and privilege escalation.`
  };

  const prompt = prompts[service];
  if (!prompt) {
    console.log(chalk.red(`Unknown service: ${service}`));
    return;
  }

  console.log(chalk.gray('Generating enumeration techniques...'));
  try {
    const response = await client.invoke(prompt, null, true);
    console.log(chalk.green(`\n🔎 ${service.toUpperCase()} Enumeration:`));
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.log(chalk.red(`Error generating enumeration: ${error.message}`));
  }
}

async function handleSnippetCommand(command, client) {
  const parts = command.split(' ');
  
  if (parts.length < 2) {
    console.log(chalk.blue('\n📝 Code Snippets Library:'));
    console.log(chalk.gray('  /snippet list            - List available snippets'));
    console.log(chalk.gray('  /snippet create <name>   - Create new snippet'));
    console.log(chalk.gray('  /snippet <name>          - Show snippet'));
    console.log(chalk.gray('  /snippet search <term>   - Search snippets'));
    return;
  }

  const action = parts[1];
  const name = parts.slice(2).join(' ');

  if (action === 'list') {
    console.log(chalk.blue('\n📝 Available Snippets:'));
    console.log(chalk.gray('  portscan      - Common port scanning commands'));
    console.log(chalk.gray('  sqlmap        - SQLMap usage examples'));
    console.log(chalk.gray('  nmap          - Nmap scanning techniques'));
    console.log(chalk.gray('  burp          - Burp Suite automation'));
    console.log(chalk.gray('  metasploit    - Metasploit commands'));
    console.log(chalk.gray('  gobuster      - Directory/subdomain busting'));
    console.log(chalk.gray('  hashcat       - Password cracking'));
    console.log(chalk.gray('  privesc       - Privilege escalation checks'));
    return;
  }

  const snippets = {
    portscan: 'Generate comprehensive port scanning command examples using nmap, masscan, and other tools',
    sqlmap: 'Generate SQLMap command examples for different attack scenarios',
    nmap: 'Generate advanced nmap scanning techniques and NSE script usage',
    burp: 'Generate Burp Suite automation scripts and extension usage',
    metasploit: 'Generate Metasploit framework usage examples and common modules',
    gobuster: 'Generate directory and subdomain enumeration commands using gobuster',
    hashcat: 'Generate hashcat commands for different hash types and attack modes',
    privesc: 'Generate privilege escalation enumeration scripts for Linux and Windows'
  };

  if (action === 'create') {
    console.log(chalk.yellow('Custom snippet creation not yet implemented. Using predefined snippets.'));
    return;
  }

  if (action === 'search') {
    console.log(chalk.yellow('Snippet search not yet implemented.'));
    return;
  }

  const prompt = snippets[action];
  if (!prompt) {
    console.log(chalk.red(`Unknown snippet: ${action}`));
    return;
  }

  console.log(chalk.gray('Generating snippet...'));
  try {
    const response = await client.invoke(prompt);
    console.log(chalk.green(`\n📝 ${action.toUpperCase()} Snippet:`));
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.log(chalk.red(`Error generating snippet: ${error.message}`));
  }
}

async function handleTemplateCommand(command, client) {
  const parts = command.split(' ');
  
  if (parts.length < 2) {
    console.log(chalk.blue('\n🛠️ Quick Templates:'));
    console.log(chalk.gray('  /template exploit <type>  - Show exploit templates'));
    console.log(chalk.gray('  /template payload <type>  - Show payload templates'));
    console.log(chalk.gray('  /template recon <type>    - Show recon templates'));
    console.log(chalk.gray('  /template list            - List all available templates'));
    return;
  }

  const category = parts[1];
  const type = parts[2];

  if (category === 'list') {
    console.log(chalk.blue('\n🛠️ Available Templates:'));
    console.log(chalk.yellow('Exploits:'));
    Object.keys(exploitTemplates).forEach(key => {
      console.log(chalk.gray(`  ${key} - ${Object.keys(exploitTemplates[key]).join(', ')}`));
    });
    console.log(chalk.yellow('\nPayloads:'));
    Object.keys(payloadTemplates).forEach(key => {
      console.log(chalk.gray(`  ${key} - ${Object.keys(payloadTemplates[key]).join(', ')}`));
    });
    console.log(chalk.yellow('\nRecon:'));
    Object.keys(reconTemplates).forEach(key => {
      console.log(chalk.gray(`  ${key} - ${Object.keys(reconTemplates[key]).join(', ')}`));
    });
    return;
  }

  if (category === 'exploit') {
    if (!type || !exploitTemplates[type]) {
      console.log(chalk.red(`Available exploit types: ${Object.keys(exploitTemplates).join(', ')}`));
      return;
    }
    
    console.log(chalk.green(`\n🎯 ${type.toUpperCase()} Exploit Templates:`));
    Object.entries(exploitTemplates[type]).forEach(([name, template]) => {
      console.log(chalk.blue(`\n${template.name}:`));
      console.log(chalk.gray(`Description: ${template.description}`));
      console.log(chalk.white(`Payload: ${template.payload}`));
    });
    return;
  }

  if (category === 'payload') {
    if (!type || !payloadTemplates[type]) {
      console.log(chalk.red(`Available payload types: ${Object.keys(payloadTemplates).join(', ')}`));
      return;
    }
    
    console.log(chalk.green(`\n💥 ${type.toUpperCase()} Payload Templates:`));
    Object.entries(payloadTemplates[type]).forEach(([name, template]) => {
      console.log(chalk.blue(`\n${template.name}:`));
      console.log(chalk.gray(`Description: ${template.description}`));
      console.log(chalk.white(`Template: ${template.template}`));
      console.log(chalk.yellow('Note: Replace [IP] and [PORT] with actual values'));
    });
    return;
  }

  if (category === 'recon') {
    if (!type || !reconTemplates[type]) {
      console.log(chalk.red(`Available recon types: ${Object.keys(reconTemplates).join(', ')}`));
      return;
    }
    
    console.log(chalk.green(`\n🔍 ${type.toUpperCase()} Recon Templates:`));
    if (typeof reconTemplates[type] === 'object') {
      Object.entries(reconTemplates[type]).forEach(([name, template]) => {
        console.log(chalk.blue(`\n${name}:`));
        console.log(chalk.white(`Command: ${template}`));
      });
    } else {
      console.log(chalk.white(`Command: ${reconTemplates[type]}`));
    }
    console.log(chalk.yellow('Note: Replace [TARGET] with actual target'));
    return;
  }

  console.log(chalk.red('Usage: /template <exploit|payload|recon|list> [type]'));
}

async function handlePentestCommand(command, client) {
  const parts = command.split(' ');
  
  if (parts.length < 2) {
    console.log(chalk.blue('\n🎯 Pentest Project Management:'));
    console.log(chalk.gray('  /pentest new <name>      - Create new pentest project'));
    console.log(chalk.gray('  /pentest load <name>     - Load existing project'));
    console.log(chalk.gray('  /pentest list            - List all projects'));
    console.log(chalk.gray('  /pentest info            - Show current project info'));
    console.log(chalk.gray('  /pentest target <ip>     - Set target IP'));
    console.log(chalk.gray('  /pentest note <text>     - Add note to current project'));
    console.log(chalk.gray('  /pentest report          - Generate project report'));
    return;
  }

  const action = parts[1];
  const value = parts.slice(2).join(' ');

  try {
    const projectsPath = './pentest-projects';
    if (!fs.existsSync(projectsPath)) {
      fs.mkdirSync(projectsPath, { recursive: true });
    }

    switch (action) {
      case 'new':
        if (!value) {
          console.log(chalk.red('Please specify a project name'));
          return;
        }
        const newProject = {
          name: value,
          created: new Date().toISOString(),
          target: '',
          notes: [],
          exploits: [],
          findings: []
        };
        fs.writeFileSync(`${projectsPath}/${value}.json`, JSON.stringify(newProject, null, 2));
        client.currentProject = newProject;
        console.log(chalk.green(`✅ Created project: ${value}`));
        break;

      case 'load':
        if (!value) {
          console.log(chalk.red('Please specify a project name'));
          return;
        }
        const projectFile = `${projectsPath}/${value}.json`;
        if (fs.existsSync(projectFile)) {
          client.currentProject = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
          console.log(chalk.green(`✅ Loaded project: ${value}`));
        } else {
          console.log(chalk.red(`Project not found: ${value}`));
        }
        break;

      case 'list':
        const projects = fs.readdirSync(projectsPath)
          .filter(f => f.endsWith('.json'))
          .map(f => f.replace('.json', ''));
        console.log(chalk.blue('\n📁 Available Projects:'));
        projects.forEach(project => {
          console.log(chalk.gray(`  ${project}`));
        });
        break;

      case 'info':
        if (client.currentProject) {
          console.log(chalk.blue('\n📊 Current Project Info:'));
          console.log(chalk.gray(`Name: ${client.currentProject.name}`));
          console.log(chalk.gray(`Created: ${client.currentProject.created}`));
          console.log(chalk.gray(`Target: ${client.currentProject.target || 'Not set'}`));
          console.log(chalk.gray(`Notes: ${client.currentProject.notes.length}`));
          console.log(chalk.gray(`Findings: ${client.currentProject.findings.length}`));
        } else {
          console.log(chalk.yellow('No project loaded. Use /pentest new or /pentest load'));
        }
        break;

      case 'target':
        if (!client.currentProject) {
          console.log(chalk.red('No project loaded'));
          return;
        }
        client.currentProject.target = value;
        fs.writeFileSync(`${projectsPath}/${client.currentProject.name}.json`, 
          JSON.stringify(client.currentProject, null, 2));
        console.log(chalk.green(`✅ Target set to: ${value}`));
        break;

      case 'note':
        if (!client.currentProject) {
          console.log(chalk.red('No project loaded'));
          return;
        }
        client.currentProject.notes.push({
          timestamp: new Date().toISOString(),
          text: value
        });
        fs.writeFileSync(`${projectsPath}/${client.currentProject.name}.json`, 
          JSON.stringify(client.currentProject, null, 2));
        console.log(chalk.green('✅ Note added'));
        break;

      case 'report':
        if (!client.currentProject) {
          console.log(chalk.red('No project loaded'));
          return;
        }
        console.log(chalk.gray('Generating project report...'));
        const reportPrompt = `Generate a penetration testing report for project: ${client.currentProject.name}, Target: ${client.currentProject.target}, Notes: ${JSON.stringify(client.currentProject.notes)}, Findings: ${JSON.stringify(client.currentProject.findings)}`;
        const response = await client.invoke(reportPrompt, null, true);
        console.log(chalk.green('\n📄 Project Report:'));
        console.log(JSON.stringify(response, null, 2));
        break;

      default:
        console.log(chalk.red('Unknown pentest command'));
        break;
    }
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`));
  }
}

async function handleGenerateCommand(command, client) {
  const parts = command.split(' ');
  
  if (parts.length < 2) {
    console.log(chalk.blue('\n⚡ Code Generation:'));
    console.log(chalk.gray('  /generate python <desc>  - Generate Python exploit'));
    console.log(chalk.gray('  /generate bash <desc>    - Generate Bash script'));
    console.log(chalk.gray('  /generate powershell     - Generate PowerShell script'));
    console.log(chalk.gray('  /generate c <desc>       - Generate C exploit'));
    console.log(chalk.gray('  /generate js <desc>      - Generate JavaScript payload'));
    console.log(chalk.gray('  /generate php <desc>     - Generate PHP web shell'));
    console.log(chalk.gray('  /generate report <type>  - Generate report template'));
    return;
  }

  const type = parts[1];
  const description = parts.slice(2).join(' ');

  const prompts = {
    python: `Generate a Python penetration testing script for: ${description || 'general purpose exploitation'}. Include error handling, comments, and proper structure. Make it production-ready for professional pentesting.`,
    bash: `Generate a Bash script for penetration testing: ${description || 'enumeration and exploitation'}. Include proper error handling and logging.`,
    powershell: `Generate a PowerShell script for Windows penetration testing: ${description || 'privilege escalation and lateral movement'}. Make it bypass basic detection.`,
    c: `Generate C exploit code for: ${description || 'buffer overflow exploitation'}. Include shellcode and proper memory management.`,
    js: `Generate JavaScript payload for: ${description || 'client-side exploitation'}. Include obfuscation techniques.`,
    php: `Generate PHP web shell or exploit for: ${description || 'web application penetration'}. Include multiple functionalities.`,
    report: `Generate a professional penetration testing report template for: ${description || 'general security assessment'}. Include executive summary, technical details, and recommendations.`
  };

  const prompt = prompts[type];
  if (!prompt) {
    console.log(chalk.red(`Unknown generation type: ${type}`));
    return;
  }

  console.log(chalk.gray('Generating code...'));
  try {
    const response = await client.invoke(prompt, null, true);
    console.log(chalk.green(`\n⚡ Generated ${type.toUpperCase()} Code:`));
    console.log(JSON.stringify(response, null, 2));

    // Save to current project if available
    if (client.currentProject && type !== 'report') {
      client.currentProject.findings.push({
        type: 'generated_code',
        language: type,
        description: description || `Generated ${type} code`,
        timestamp: new Date().toISOString(),
        code: response
      });
      
      const projectsPath = './pentest-projects';
      fs.writeFileSync(`${projectsPath}/${client.currentProject.name}.json`, 
        JSON.stringify(client.currentProject, null, 2));
      console.log(chalk.blue('💾 Code saved to current project'));
    }
  } catch (error) {
    console.log(chalk.red(`Error generating code: ${error.message}`));
  }
}

async function handleFormatCommand(command, client) {
  const parts = command.split(' ');
  
  if (parts.length < 2) {
    console.log(chalk.blue('\n📄 Format & Export Options:'));
    console.log(chalk.gray('  /format recon <target>   - Create formatted recon report'));
    console.log(chalk.gray('  /format checklist <type> - Generate pentesting checklists'));
    console.log(chalk.gray('  /format commands <tool>  - Format tool command references'));
    console.log(chalk.gray('  /format timeline         - Create testing timeline'));
    return;
  }

  const formatType = parts[1];
  const target = parts.slice(2).join(' ');

  try {
    switch (formatType) {
      case 'recon':
        if (!target) {
          console.log(chalk.red('Please specify a target for recon formatting'));
          return;
        }
        
        console.log(chalk.gray('Creating formatted reconnaissance report...'));
        const reconPrompt = `Create a professionally formatted reconnaissance report for ${target}. Use the following structure and format it clearly:
        
        # RECONNAISSANCE REPORT - ${target}
        Generated: ${new Date().toISOString().split('T')[0]}
        
        ## EXECUTIVE SUMMARY
        [Brief overview of target and scope]
        
        ## INFORMATION GATHERING
        ### 1. Domain Information
        - WHOIS Data
        - DNS Records  
        - IP Information
        
        ### 2. Infrastructure Analysis
        - Hosting Provider
        - CDN Detection
        - SSL/TLS Configuration
        
        ### 3. Attack Surface
        - Subdomains
        - Open Ports
        - Services
        
        ## RECONNAISSANCE COMMANDS
        [Organized list of commands with explanations]
        
        ## FINDINGS SUMMARY
        [Key observations and potential attack vectors]
        
        ## RECOMMENDATIONS
        [Next steps for penetration testing]`;
        
        const reconResponse = await client.invoke(reconPrompt, null, true);
        console.log(chalk.green('\n📄 Formatted Reconnaissance Report:'));
        console.log(reconResponse);
        
        // Save to file
        const reconFilename = `recon-report-${target.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.md`;
        fs.writeFileSync(reconFilename, typeof reconResponse === 'string' ? reconResponse : JSON.stringify(reconResponse, null, 2));
        console.log(chalk.green(`\n💾 Report saved to: ${reconFilename}`));
        break;

      case 'checklist':
        const checklistType = target || 'general';
        console.log(chalk.gray(`Creating ${checklistType} pentesting checklist...`));
        
        const checklistPrompt = `Create a comprehensive ${checklistType} penetration testing checklist. Format as a markdown checklist with checkboxes [ ] for each item. Include:
        
        # ${checklistType.toUpperCase()} PENETRATION TESTING CHECKLIST
        
        ## Pre-Engagement
        - [ ] Scope definition
        - [ ] Legal authorization
        - [ ] Rules of engagement
        
        ## Information Gathering
        [Add relevant items]
        
        ## Vulnerability Assessment  
        [Add relevant items]
        
        ## Exploitation
        [Add relevant items]
        
        ## Post-Exploitation
        [Add relevant items]
        
        ## Reporting
        [Add relevant items]`;
        
        const checklistResponse = await client.invoke(checklistPrompt, null, true);
        console.log(chalk.green('\n📋 Pentesting Checklist:'));
        console.log(checklistResponse);
        
        const checklistFilename = `checklist-${checklistType}-${Date.now()}.md`;
        fs.writeFileSync(checklistFilename, typeof checklistResponse === 'string' ? checklistResponse : JSON.stringify(checklistResponse, null, 2));
        console.log(chalk.green(`\n💾 Checklist saved to: ${checklistFilename}`));
        break;

      case 'commands':
        const tool = target || 'nmap';
        console.log(chalk.gray(`Creating ${tool} command reference...`));
        
        const commandsPrompt = `Create a formatted command reference guide for ${tool}. Include:
        
        # ${tool.toUpperCase()} COMMAND REFERENCE
        
        ## Basic Commands
        [Most common commands with explanations]
        
        ## Advanced Techniques
        [More sophisticated usage]
        
        ## Practical Examples
        [Real-world scenarios with specific commands]
        
        ## Output Analysis
        [How to interpret results]
        
        Format each command with:
        - Command syntax
        - Description of what it does
        - Example usage
        - Expected output`;
        
        const commandsResponse = await client.invoke(commandsPrompt, null, true);
        console.log(chalk.green(`\n📖 ${tool.toUpperCase()} Command Reference:`));
        console.log(commandsResponse);
        
        const commandsFilename = `commands-${tool}-${Date.now()}.md`;
        fs.writeFileSync(commandsFilename, typeof commandsResponse === 'string' ? commandsResponse : JSON.stringify(commandsResponse, null, 2));
        console.log(chalk.green(`\n💾 Command reference saved to: ${commandsFilename}`));
        break;

      case 'timeline':
        console.log(chalk.gray('Creating pentesting timeline template...'));
        
        const timelinePrompt = `Create a detailed penetration testing timeline template. Format as:
        
        # PENETRATION TESTING TIMELINE
        Project: [Project Name]
        Duration: [X] Days
        
        ## Day 1: Information Gathering & Reconnaissance
        ### Morning (4 hours)
        - [ ] OSINT collection
        - [ ] Domain enumeration
        - [ ] Infrastructure mapping
        
        ### Afternoon (4 hours)
        - [ ] Subdomain discovery
        - [ ] Port scanning
        - [ ] Service enumeration
        
        ## Day 2: Vulnerability Assessment
        [Continue with detailed daily breakdown]
        
        Include realistic time estimates and dependencies between tasks.`;
        
        const timelineResponse = await client.invoke(timelinePrompt, null, true);
        console.log(chalk.green('\n📅 Pentesting Timeline:'));
        console.log(timelineResponse);
        
        const timelineFilename = `timeline-template-${Date.now()}.md`;
        fs.writeFileSync(timelineFilename, typeof timelineResponse === 'string' ? timelineResponse : JSON.stringify(timelineResponse, null, 2));
        console.log(chalk.green(`\n💾 Timeline saved to: ${timelineFilename}`));
        break;

      default:
        console.log(chalk.red(`Unknown format type: ${formatType}`));
        break;
    }
    
    // Add to current project if available
    if (client.currentProject) {
      client.currentProject.findings.push({
        type: `formatted_${formatType}`,
        target: target,
        timestamp: new Date().toISOString(),
        description: `Generated ${formatType} format`
      });
      
      const projectsPath = './pentest-projects';
      fs.writeFileSync(`${projectsPath}/${client.currentProject.name}.json`, 
        JSON.stringify(client.currentProject, null, 2));
    }
    
  } catch (error) {
    console.log(chalk.red(`Error generating format: ${error.message}`));
  }
}

async function handleAnalyzeCommand(command, client) {
  const parts = command.split(' ');
  
  if (parts.length < 2) {
    console.log(chalk.blue('\n🔬 Analysis Options:'));
    console.log(chalk.gray('  /analyze nmap <output>   - Analyze nmap scan results'));
    console.log(chalk.gray('  /analyze logs <type>     - Analyze log files'));
    console.log(chalk.gray('  /analyze vulns <scan>    - Analyze vulnerability scan'));
    console.log(chalk.gray('  /analyze traffic <data>  - Analyze network traffic'));
    console.log(chalk.gray('  /analyze response <data> - Analyze HTTP responses'));
    console.log(chalk.gray('Usage: Provide the tool output or data to analyze'));
    return;
  }

  const toolType = parts[1];
  const analysisData = parts.slice(2).join(' ');

  if (!analysisData) {
    console.log(chalk.red('Please provide data to analyze'));
    return;
  }

  try {
    let analysisPrompt;
    
    switch (toolType) {
      case 'nmap':
        analysisPrompt = `Analyze this Nmap scan output and provide:
        1. Summary of open ports and services
        2. Potential vulnerabilities identified
        3. Attack vectors to investigate
        4. Recommended next steps
        5. Security concerns and priorities
        
        Nmap Output:
        ${analysisData}`;
        break;
        
      case 'logs':
        analysisPrompt = `Analyze these log entries for security insights:
        1. Identify suspicious activities
        2. Extract IOCs (Indicators of Compromise)
        3. Timeline of events
        4. Potential attack patterns
        5. Recommended actions
        
        Log Data:
        ${analysisData}`;
        break;
        
      case 'vulns':
        analysisPrompt = `Analyze this vulnerability scan output:
        1. Categorize vulnerabilities by severity
        2. Identify exploit potential
        3. Prioritize remediation efforts
        4. Suggest exploitation techniques
        5. Risk assessment
        
        Vulnerability Data:
        ${analysisData}`;
        break;
        
      case 'traffic':
        analysisPrompt = `Analyze this network traffic data:
        1. Identify protocols and services
        2. Detect anomalous behavior
        3. Extract communication patterns
        4. Security implications
        5. Potential data exfiltration
        
        Traffic Data:
        ${analysisData}`;
        break;
        
      case 'response':
        analysisPrompt = `Analyze this HTTP response data:
        1. Identify web technologies
        2. Security headers analysis
        3. Potential vulnerabilities
        4. Information disclosure
        5. Attack surface assessment
        
        HTTP Response:
        ${analysisData}`;
        break;
        
      default:
        analysisPrompt = `Analyze this ${toolType} output from a penetration testing perspective:
        1. Key findings and observations
        2. Security implications
        3. Potential vulnerabilities
        4. Recommended actions
        5. Next testing steps
        
        Data to analyze:
        ${analysisData}`;
        break;
    }

    console.log(chalk.gray(`Analyzing ${toolType} output...`));
    const response = await client.invoke(analysisPrompt, null, true);
    
    console.log(chalk.green(`\n🔬 ${toolType.toUpperCase()} Analysis Results:`));
    console.log(JSON.stringify(response, null, 2));
    
    // Save analysis to file
    const filename = `analysis-${toolType}-${Date.now()}.json`;
    const analysisReport = {
      tool: toolType,
      timestamp: new Date().toISOString(),
      input_data: analysisData.substring(0, 500) + (analysisData.length > 500 ? '...' : ''),
      analysis: response
    };
    
    fs.writeFileSync(filename, JSON.stringify(analysisReport, null, 2));
    console.log(chalk.green(`\n💾 Analysis saved to: ${filename}`));
    
    // Add to current project
    if (client.currentProject) {
      client.currentProject.findings.push({
        type: 'tool_analysis',
        tool: toolType,
        timestamp: new Date().toISOString(),
        analysis: response
      });
      
      const projectsPath = './pentest-projects';
      fs.writeFileSync(`${projectsPath}/${client.currentProject.name}.json`, 
        JSON.stringify(client.currentProject, null, 2));
      console.log(chalk.blue('💾 Analysis also saved to current project'));
    }
    
  } catch (error) {
    console.log(chalk.red(`Error analyzing data: ${error.message}`));
  }
}

// Multi-Agent Orchestrator Commands
async function handleWorkflowCommand(prompt, client) {
  const args = prompt.split(' ').slice(1);
  const subcommand = args[0];

  if (!client.orchestrator) {
    client.orchestrator = new Orchestrator(client);
  }

  try {
    switch (subcommand) {
      case 'list':
        console.log(chalk.cyan('📋 Available Workflows:'));
        const workflows = await client.orchestrator.listAvailableWorkflows();
        if (workflows.length === 0) {
          console.log(chalk.yellow('No workflows found in ./workflows directory'));
        } else {
          workflows.forEach(workflow => {
            console.log(chalk.blue(`• ${workflow.name}`));
            console.log(chalk.gray(`  Path: ${workflow.path}`));
            console.log(chalk.gray(`  Size: ${workflow.size} bytes\n`));
          });
        }
        break;

      case 'load':
        const workflowPath = args[1];
        if (!workflowPath) {
          console.log(chalk.red('❌ Please specify workflow path'));
          console.log(chalk.gray('Usage: /workflow load ./workflows/basic-recon.md'));
          return;
        }

        console.log(chalk.cyan(`📋 Loading workflow: ${workflowPath}`));
        const loadedWorkflow = await client.orchestrator.loadWorkflow(workflowPath);
        console.log(chalk.green(`✅ Workflow '${loadedWorkflow.name}' loaded successfully`));
        console.log(chalk.blue(`Tasks: ${loadedWorkflow.tasks.length}`));
        break;

      case 'run':
        const workflowId = args[1];
        if (!workflowId) {
          console.log(chalk.red('❌ Please specify workflow ID'));
          console.log(chalk.gray('Usage: /workflow run basic-recon'));
          return;
        }

        // Get parameters interactively
        const targetWorkflow = client.orchestrator.workflows.get(workflowId);
        if (!targetWorkflow) {
          console.log(chalk.red(`❌ Workflow not found: ${workflowId}`));
          return;
        }

        const parameters = {};
        if (targetWorkflow.parameters && targetWorkflow.parameters.length > 0) {
          console.log(chalk.cyan('🔧 Workflow Parameters:'));
          for (const param of targetWorkflow.parameters) {
            const answer = await inquirer.prompt([
              {
                type: 'input',
                name: 'value',
                message: `${param.name}:`,
                default: param.default
              }
            ]);
            parameters[param.name] = answer.value;
          }
        }

        console.log(chalk.cyan(`🚀 Executing workflow: ${targetWorkflow.name}`));
        const job = await client.orchestrator.executeWorkflow(workflowId, parameters);
        console.log(chalk.green(`✅ Workflow completed - Job ID: ${job.id}`));
        break;

      case 'status':
        const jobs = client.orchestrator.getActiveJobs();
        if (jobs.length === 0) {
          console.log(chalk.yellow('No active jobs'));
        } else {
          console.log(chalk.cyan('📊 Active Jobs:'));
          jobs.forEach(job => {
            console.log(chalk.blue(`• Job ${job.id} (${job.status})`));
            console.log(chalk.gray(`  Workflow: ${job.workflow.name}`));
            console.log(chalk.gray(`  Started: ${job.startTime.toLocaleString()}`));
            if (job.currentTasks.size > 0) {
              console.log(chalk.yellow(`  Current Tasks: ${Array.from(job.currentTasks).join(', ')}`));
            }
          });
        }
        break;

      case 'help':
      default:
        console.log(chalk.cyan('🤖 Multi-Agent Orchestrator - Workflow Commands:'));
        console.log(chalk.blue('/workflow list') + chalk.gray(' - List available workflows'));
        console.log(chalk.blue('/workflow load <path>') + chalk.gray(' - Load a workflow file'));
        console.log(chalk.blue('/workflow run <id>') + chalk.gray(' - Execute a workflow'));
        console.log(chalk.blue('/workflow status') + chalk.gray(' - Show active jobs'));
        console.log(chalk.blue('/workflow help') + chalk.gray(' - Show this help'));
        break;
    }
  } catch (error) {
    console.log(chalk.red(`❌ Workflow error: ${error.message}`));
  }
}

async function handleOrchestratorCommand(prompt, client) {
  const args = prompt.split(' ').slice(1);
  const subcommand = args[0];

  if (!client.orchestrator) {
    client.orchestrator = new Orchestrator(client);
  }

  try {
    switch (subcommand) {
      case 'status':
        const status = client.orchestrator.getSystemStatus();
        console.log(chalk.cyan('🤖 Orchestrator Status:'));
        console.log(chalk.blue(`System: ${status.orchestrator}`));
        console.log(chalk.blue(`Version: ${status.version}`));
        console.log(chalk.blue(`Author: ${status.author}`));
        console.log(chalk.blue(`Agents: ${status.agents}`));
        console.log(chalk.blue(`Workflows: ${status.workflows}`));
        console.log(chalk.blue(`Active Jobs: ${status.activeJobs}`));
        console.log(chalk.blue(`Uptime: ${Math.floor(status.uptime)}s`));
        break;

      case 'info':
        console.log(chalk.cyan('🤖 Billy LLM Multi-Agent Orchestrator'));
        console.log(chalk.blue('Created by BillyC0der for automated pentesting workflows'));
        console.log(chalk.gray('Coordinates specialized agents to execute complex security assessments'));
        console.log(chalk.yellow('\nAvailable Agents:'));
        console.log(chalk.blue('• ReconAgent') + chalk.gray(' - Intelligence gathering and reconnaissance'));
        console.log(chalk.blue('• ExploitAgent') + chalk.gray(' - Exploit development and vulnerability testing'));
        console.log(chalk.blue('• AnalysisAgent') + chalk.gray(' - Security analysis and risk assessment'));
        console.log(chalk.blue('• ScanAgent') + chalk.gray(' - Network scanning and service enumeration'));
        console.log(chalk.blue('• ReportAgent') + chalk.gray(' - Comprehensive reporting and documentation'));
        console.log(chalk.blue('• MonitorAgent') + chalk.gray(' - Continuous monitoring and alerting'));
        break;

      case 'help':
      default:
        console.log(chalk.cyan('🤖 Multi-Agent Orchestrator Commands:'));
        console.log(chalk.blue('/orchestrator status') + chalk.gray(' - Show system status'));
        console.log(chalk.blue('/orchestrator info') + chalk.gray(' - Show orchestrator information'));
        console.log(chalk.blue('/orchestrator help') + chalk.gray(' - Show this help'));
        break;
    }
  } catch (error) {
    console.log(chalk.red(`❌ Orchestrator error: ${error.message}`));
  }
}

async function handleAgentsCommand(prompt, client) {
  const args = prompt.split(' ').slice(1);
  const subcommand = args[0];

  if (!client.orchestrator) {
    client.orchestrator = new Orchestrator(client);
  }

  try {
    switch (subcommand) {
      case 'list':
        console.log(chalk.cyan('🤖 Available Agents:'));
        const agents = client.orchestrator.getAgentStatus();
        for (const [name, agent] of Object.entries(agents)) {
          console.log(chalk.blue(`• ${agent.name}`));
          console.log(chalk.gray(`  Capabilities: ${agent.capabilities.join(', ')}`));
          console.log(chalk.gray(`  Tasks Executed: ${agent.tasksExecuted}`));
          if (agent.lastActivity) {
            console.log(chalk.gray(`  Last Activity: ${agent.lastActivity}`));
          }
          console.log();
        }
        break;

      case 'help':
      default:
        console.log(chalk.cyan('🤖 Agent Management Commands:'));
        console.log(chalk.blue('/agents list') + chalk.gray(' - List all available agents'));
        console.log(chalk.blue('/agents help') + chalk.gray(' - Show this help'));
        break;
    }
  } catch (error) {
    console.log(chalk.red(`❌ Agents error: ${error.message}`));
  }
}

async function handleJobsCommand(prompt, client) {
  const args = prompt.split(' ').slice(1);
  const subcommand = args[0];

  if (!client.orchestrator) {
    client.orchestrator = new Orchestrator(client);
  }

  try {
    switch (subcommand) {
      case 'list':
        const jobs = client.orchestrator.getActiveJobs();
        if (jobs.length === 0) {
          console.log(chalk.yellow('No active jobs'));
        } else {
          console.log(chalk.cyan('📊 Active Jobs:'));
          jobs.forEach(job => {
            console.log(chalk.blue(`• Job ${job.id}`));
            console.log(chalk.gray(`  Status: ${job.status}`));
            console.log(chalk.gray(`  Workflow: ${job.workflow.name}`));
            console.log(chalk.gray(`  Started: ${job.startTime.toLocaleString()}`));
            console.log(chalk.gray(`  Completed Tasks: ${job.completedTasks.size}/${job.workflow.tasks.length}`));
            if (job.currentTasks.size > 0) {
              console.log(chalk.yellow(`  Running: ${Array.from(job.currentTasks).join(', ')}`));
            }
            if (job.endTime) {
              console.log(chalk.gray(`  Duration: ${job.duration}ms`));
            }
            console.log();
          });
        }
        break;

      case 'stop':
        const jobId = args[1];
        if (!jobId) {
          console.log(chalk.red('❌ Please specify job ID'));
          console.log(chalk.gray('Usage: /jobs stop <job_id>'));
          return;
        }

        await client.orchestrator.stopJob(jobId);
        console.log(chalk.green(`✅ Job ${jobId} stopped`));
        break;

      case 'status':
        const statusJobId = args[1];
        if (!statusJobId) {
          console.log(chalk.red('❌ Please specify job ID'));
          console.log(chalk.gray('Usage: /jobs status <job_id>'));
          return;
        }

        const job = client.orchestrator.getJobStatus(statusJobId);
        if (!job) {
          console.log(chalk.red(`❌ Job not found: ${statusJobId}`));
          return;
        }

        console.log(chalk.cyan(`📊 Job ${job.id} Status:`));
        console.log(chalk.blue(`Status: ${job.status}`));
        console.log(chalk.blue(`Workflow: ${job.workflow.name}`));
        console.log(chalk.blue(`Started: ${job.startTime.toLocaleString()}`));
        console.log(chalk.blue(`Completed: ${job.completedTasks.size}/${job.workflow.tasks.length}`));
        if (job.failedTasks.size > 0) {
          console.log(chalk.red(`Failed: ${job.failedTasks.size}`));
        }
        if (job.currentTasks.size > 0) {
          console.log(chalk.yellow(`Running: ${Array.from(job.currentTasks).join(', ')}`));
        }
        if (job.endTime) {
          console.log(chalk.blue(`Completed: ${job.endTime.toLocaleString()}`));
          console.log(chalk.blue(`Duration: ${job.duration}ms`));
        }
        break;

      case 'help':
      default:
        console.log(chalk.cyan('📊 Job Management Commands:'));
        console.log(chalk.blue('/jobs list') + chalk.gray(' - List all jobs'));
        console.log(chalk.blue('/jobs stop <id>') + chalk.gray(' - Stop a running job'));
        console.log(chalk.blue('/jobs status <id>') + chalk.gray(' - Show job details'));
        console.log(chalk.blue('/jobs help') + chalk.gray(' - Show this help'));
        break;
    }
  } catch (error) {
    console.log(chalk.red(`❌ Jobs error: ${error.message}`));
  }
}

// Signed by BillyC0der - Multi-Agent Orchestrator System