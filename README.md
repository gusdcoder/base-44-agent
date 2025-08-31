# Billy LLM CLI - Pentester Edition

A powerful command-line interface for penetration testing automation using LLM APIs with structured JSON schemas. Designed by BillyC0der for professional penetration testers.

## 🚀 Features

- **Interactive pentesting mode** with specialized commands
- **Structured JSON responses** using customizable schemas
- **Exploit and payload generation** with templates
- **Project management** for pentest engagements
- **Quick code generation** for multiple languages
- **Reconnaissance automation** with command templates
- **Built-in exploit library** with common payloads

## Installation

```bash
npm install
```

## Configuration

Set your API credentials:

```bash
# Set bearer token
billy-llm config --token "your-bearer-token"

# Optionally set custom endpoint
billy-llm config --endpoint "https://your-api.com/endpoint"
```

## Usage

### Basic Commands

```bash
# Ask a simple question
billy-llm ask "What is the capital of Brazil?"

# Use with JSON schema for structured responses
billy-llm ask "Provide BIN info for 406669" --schema schemas/bin-lookup.json

# Add internet context for up-to-date information
billy-llm ask "Latest CVE vulnerabilities" --context

# Output raw JSON
billy-llm ask "Generate SQL injection payload" --json
```

### Interactive Mode

```bash
# Start interactive session
billy-llm interactive
# or
billy-llm i

# Start with specific schema
billy-llm i --schema schemas/exploit.json

# Enable context by default
billy-llm i --context
```

## 🎯 Pentesting Commands

### Interactive Commands

- `help` - Show available commands
- `exit` - Exit interactive mode

### 🔧 Configuration Commands
- `/schema <file>` - Load schema from file
- `/schema list` - List default schemas
- `/config show` - Show current configuration
- `/config token <value>` - Update bearer token

### 🎯 Exploit & Payload Commands
- `/exploit <type>` - Generate exploits (sqli, xss, rce, lfi, csrf, buffer, privesc)
- `/payload <type>` - Generate payloads (revshell, webshell, bindshell, meterpreter, powershell, encoded)
- `/reverse <ip> <port>` - Generate reverse shells for specific IP/port
- `/template <category>` - Show quick exploit templates

### 🔍 Reconnaissance Commands
- `/recon <target>` - Generate reconnaissance plans
- `/enum <service>` - Service enumeration (smb, ftp, ssh, http, dns, ldap, snmp, mysql)

### 📝 Code Generation
- `/generate <language>` - Generate custom code (python, bash, powershell, c, js, php, report)
- `/snippet <name>` - Access code snippet library

### 📊 Project Management
- `/pentest new <name>` - Create new pentest project
- `/pentest load <name>` - Load existing project
- `/pentest target <ip>` - Set target IP for current project
- `/pentest note <text>` - Add notes to current project
- `/pentest report` - Generate project report

## 📋 Available Schemas

### Exploit Schema (`schemas/exploit.json`)
Structured exploit information with risk levels and CVE references.

### Payload Schema (`schemas/payload.json`)
Payload templates with platform-specific instructions.

### Reconnaissance Schema (`schemas/recon.json`)
Structured recon plans with techniques and tools.

### BIN Lookup Schema (`schemas/bin-lookup.json`)
Bank Identification Number analysis for card forensics.

## 🛠️ Quick Templates

### Exploit Templates
- **SQL Injection**: Basic, UNION, and Blind SQLi payloads
- **XSS**: Basic, DOM, and filter bypass techniques
- **RCE**: PHP and Python code execution
- **LFI**: Path traversal with various techniques

### Payload Templates
- **Reverse Shells**: Bash, Python, PHP, NetCat, PowerShell
- **Web Shells**: PHP, ASP, JSP multi-functional shells
- **Reconnaissance**: Nmap, enum4linux, dirb commands

## 🔍 Example Usage

```bash
# Generate SQL injection exploit
/exploit sqli login form

# Create reverse shell for specific target
/reverse 10.10.10.100 4444

# Start reconnaissance on target
/recon example.com

# Generate Python exploit code
/generate python buffer overflow

# Create new pentest project
/pentest new "Client-Assessment-2025"
/pentest target 192.168.1.100
/pentest note "Found open SSH on port 22"
```

## 🎨 Features for Pentesters

- **Automated exploit generation** based on vulnerability type
- **Payload customization** with IP/port parameters
- **Project tracking** with notes and findings
- **Code generation** in multiple languages
- **Template library** for quick access to common payloads
- **Structured output** using JSON schemas for parsing
- **Context-aware responses** using internet research

## 📄 License

Created by BillyC0der for professional penetration testing automation.

---
**Note**: This tool is designed for authorized penetration testing only. Always ensure you have proper authorization before testing any systems.