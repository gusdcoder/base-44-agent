# Billy LLM - Technical Documentation
**Created by BillyC0der**

## 🎯 Features Implemented

### ✅ Core Enhancements
- **Interactive mode with schema support**: `billy-llm i -s schema.json`
- **Context-aware responses**: `--context` flag for internet research
- **Enhanced error messages**: Better user feedback and guidance

### ✅ Pentesting Command Suite
- **Exploit Generation**: `/exploit <type>` - sqli, xss, rce, lfi, csrf, buffer, privesc
- **Payload Creation**: `/payload <type>` - revshell, webshell, bindshell, meterpreter, powershell, encoded
- **Reconnaissance**: `/recon <target>` - automated recon planning
- **Service Enumeration**: `/enum <service>` - smb, ftp, ssh, http, dns, ldap, snmp, mysql
- **Reverse Shells**: `/reverse <ip> <port>` - custom IP/port shells
- **Template System**: `/template <type>` - quick access to exploit templates

### ✅ Code Generation System
- **Multi-language Support**: Python, Bash, PowerShell, C, JavaScript, PHP
- **Report Generation**: Automated pentest report creation
- **Snippet Library**: Pre-built code snippets for common tasks
- **Custom Code**: `/generate <language> <description>`

### ✅ Project Management
- **Project Creation**: `/pentest new <name>` - new pentest projects
- **Project Loading**: `/pentest load <name>` - load existing projects
- **Note Taking**: `/pentest note <text>` - project documentation
- **Target Management**: `/pentest target <ip>` - set current target
- **Report Generation**: `/pentest report` - comprehensive reports

### ✅ Schema System
- **Exploit Schema**: Structured exploit information with risk levels
- **Payload Schema**: Payload templates with platform instructions
- **Reconnaissance Schema**: Structured recon plans with techniques
- **BIN Lookup Schema**: Bank identification number analysis

## 🛠️ Architecture

### File Structure
```
billy-llm/
├── src/
│   ├── index.js           # Main CLI entry point
│   ├── client.js          # LLM API client
│   ├── interactive.js     # Interactive mode with pentest commands
│   ├── schema-validator.js # JSON schema validation
│   └── templates.js       # Exploit and payload templates
├── schemas/
│   ├── bin-lookup.json    # BIN analysis schema
│   ├── exploit.json       # Exploit information schema
│   ├── payload.json       # Payload template schema
│   └── recon.json         # Reconnaissance plan schema
├── pentest-projects/      # Auto-created project directory
├── config.json           # API configuration
└── package.json          # Dependencies
```

### Command Categories

#### Configuration Commands
- `/config show` - Display current configuration
- `/config token <token>` - Set bearer token
- `/schema <file>` - Load custom schema
- `/schema list` - Show available schemas

#### Pentesting Commands
- `/exploit <type> [desc]` - Generate exploit code
- `/payload <type> [opts]` - Create payload templates
- `/reverse <ip> <port>` - Generate reverse shells
- `/recon <target>` - Create reconnaissance plan
- `/enum <service> [target]` - Service enumeration
- `/template <category> [type]` - Show quick templates

#### Generation Commands
- `/generate <language> [desc]` - Generate custom code
- `/snippet <name>` - Access code snippet library

#### Project Commands
- `/pentest new <name>` - Create new project
- `/pentest load <name>` - Load existing project
- `/pentest target <ip>` - Set target IP
- `/pentest note <text>` - Add project note
- `/pentest report` - Generate project report

## 🎨 Template System

### Exploit Templates
- **SQL Injection**: Basic, UNION, Blind SQLi
- **XSS**: Basic, DOM, Filter bypass
- **RCE**: PHP, Python code execution
- **LFI**: Path traversal, Null byte, PHP wrappers

### Payload Templates
- **Reverse Shells**: Bash, Python, PHP, NetCat, PowerShell
- **Web Shells**: PHP, ASP, JSP functional shells
- **Bind Shells**: Various platform implementations

### Reconnaissance Templates
- **Nmap**: Basic, stealth, comprehensive scans
- **Enumeration**: SMB, DNS, web directory busting
- **Service-specific**: Tailored for different services

## 🔧 Configuration

### API Configuration
```json
{
  "endpoint": "https://api-endpoint.com/invoke",
  "token": "your-bearer-token",
  "appId": "app-identifier",
  "originUrl": "origin-url"
}
```

### Schema Examples
```json
// Exploit Schema
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "type": { "type": "string" },
    "code": { "type": "string" },
    "risk_level": { "enum": ["Low", "Medium", "High", "Critical"] }
  },
  "required": ["name", "type", "code", "risk_level"]
}
```

## 🚀 Usage Examples

### Quick Start
```bash
# Setup
npm install
node src/index.js config --token "your-token"

# Interactive mode
node src/index.js i

# With schema
node src/index.js i -s schemas/exploit.json

# Direct questions
node src/index.js ask "Generate SQL injection for login"
```

### Interactive Session
```bash
# Start session
$ billy-llm i

# Generate exploit
/exploit sqli login bypass

# Create reverse shell
/reverse 10.10.10.100 4444

# Start recon
/recon target.com

# Generate custom code
/generate python buffer overflow exploit

# Project management
/pentest new "Client-Assessment-2025"
/pentest target 192.168.1.100
/pentest note "Found SSH on port 22"
```

## 🛡️ Security Notes

- **Authorization Required**: Tool designed for authorized penetration testing only
- **Professional Use**: Intended for security professionals and ethical hackers
- **Documentation**: Always document activities in pentest projects
- **Responsible Disclosure**: Follow responsible disclosure practices

## 📋 Dependencies

```json
{
  "commander": "^11.0.0",    // CLI framework
  "axios": "^1.5.0",         // HTTP client
  "chalk": "^5.3.0",         // Terminal colors
  "inquirer": "^9.2.0",      // Interactive prompts
  "ajv": "^8.12.0"           // JSON schema validation
}
```

## 🔄 Future Enhancements

- **Plugin System**: Modular exploit plugins
- **Database Integration**: SQLite for project persistence  
- **Report Templates**: Multiple report formats (PDF, HTML, JSON)
- **Collaboration**: Multi-user project support
- **Integration**: API for external tool integration

---
**Signed by BillyC0der - Professional Pentesting Automation**
