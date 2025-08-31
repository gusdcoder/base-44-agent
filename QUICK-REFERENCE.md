# Billy LLM - Quick Reference Guide
**Professional Pentesting Automation by BillyC0der**

## 🚀 Quick Start Commands

### Basic Usage
```bash
# Configure token
node src/index.js config --token "your-token-here"

# Start interactive mode
node src/index.js i

# Start with specific schema
node src/index.js i -s schemas/recon.json

# Ask direct questions
node src/index.js ask "Generate SQL injection for login form"
```

## 🎯 Interactive Commands Reference

### Configuration
- `/config show` - Display current settings
- `/config token <token>` - Set bearer token
- `/schema <file>` - Load custom schema
- `/schema list` - Show available schemas

### Exploit Generation
- `/exploit sqli` - SQL injection techniques
- `/exploit xss` - Cross-site scripting
- `/exploit rce` - Remote code execution
- `/exploit lfi` - Local file inclusion
- `/exploit csrf` - Cross-site request forgery
- `/exploit buffer` - Buffer overflow
- `/exploit privesc` - Privilege escalation

### Payload Creation
- `/payload revshell` - Reverse shell variants
- `/payload webshell` - Web shell code
- `/payload bindshell` - Bind shell techniques
- `/payload meterpreter` - Meterpreter payloads
- `/payload powershell` - PowerShell payloads
- `/payload encoded` - Encoded/obfuscated payloads

### Reconnaissance
- `/recon <target>` - General reconnaissance
- `/recon subdomain <domain>` - Subdomain enumeration
- `/recon portscan <ip>` - Port scanning techniques
- `/recon osint <target>` - OSINT gathering
- `/recon web <url>` - Web application recon
- `/recon save <target>` - Save structured recon plan

### Service Enumeration
- `/enum smb <target>` - SMB enumeration
- `/enum ftp <target>` - FTP enumeration
- `/enum ssh <target>` - SSH enumeration
- `/enum http <target>` - HTTP enumeration
- `/enum dns <target>` - DNS enumeration
- `/enum ldap <target>` - LDAP enumeration
- `/enum snmp <target>` - SNMP enumeration
- `/enum mysql <target>` - MySQL enumeration

### Quick Tools
- `/reverse <ip> <port>` - Generate reverse shells
- `/template exploit <type>` - Show exploit templates
- `/template payload <type>` - Show payload templates
- `/template recon <type>` - Show recon templates

### Code Generation
- `/generate python <description>` - Python scripts
- `/generate bash <description>` - Bash scripts
- `/generate powershell <description>` - PowerShell scripts
- `/generate c <description>` - C exploit code
- `/generate js <description>` - JavaScript payloads
- `/generate php <description>` - PHP web shells
- `/generate report <type>` - Report templates

### Project Management
- `/pentest new <name>` - Create new project
- `/pentest load <name>` - Load existing project
- `/pentest list` - List all projects
- `/pentest info` - Show current project info
- `/pentest target <ip>` - Set target IP
- `/pentest note <text>` - Add project note
- `/pentest report` - Generate project report

### Formatting & Analysis
- `/format recon <target>` - Create formatted recon report
- `/format checklist <type>` - Generate testing checklists
- `/format commands <tool>` - Create command references
- `/format timeline` - Create testing timeline
- `/analyze nmap <output>` - Analyze Nmap results
- `/analyze logs <data>` - Analyze log files
- `/analyze vulns <scan>` - Analyze vulnerability scans

## 📋 Common Workflows

### 1. New Assessment Setup
```
/pentest new "Client-Assessment-2025"
/pentest target 192.168.1.100
/pentest note "Initial scope: web application and network"
/recon save 192.168.1.100
/format checklist web
```

### 2. Exploit Development
```
/exploit sqli login bypass
/payload revshell
/reverse 10.10.10.100 4444
/generate python exploit template
```

### 3. Service Enumeration
```
/enum http 192.168.1.100
/enum smb 192.168.1.100
/recon portscan 192.168.1.100
/analyze nmap <paste scan results>
```

### 4. Documentation
```
/format recon target.com
/format commands nmap
/pentest report
/format timeline
```

## 🛠️ Available Schemas

- **exploit.json** - Structured exploit information
- **payload.json** - Payload templates with instructions
- **recon.json** - Reconnaissance plans with techniques
- **bin-lookup.json** - Bank identification analysis

## 📁 File Outputs

The tool automatically creates these files:
- `recon-<target>-<timestamp>.json` - Structured recon plans
- `analysis-<tool>-<timestamp>.json` - Tool output analysis
- `checklist-<type>-<timestamp>.md` - Testing checklists
- `commands-<tool>-<timestamp>.md` - Command references
- `timeline-template-<timestamp>.md` - Testing timelines
- `pentest-projects/<name>.json` - Project files

## 🎯 Pro Tips

1. **Use schemas for structured output**: Always specify schema when you need parseable results
2. **Save everything to projects**: Use `/pentest` commands to maintain organized documentation
3. **Combine commands**: Chain multiple commands for comprehensive testing
4. **Export reports**: Use `/format` commands to create professional documentation
5. **Analyze outputs**: Use `/analyze` to get AI insights on tool results

## 🔒 Security Reminder

This tool is designed for authorized penetration testing only. Always ensure you have proper authorization before testing any systems.

---
**Created by BillyC0der - Automation for Professional Pentesters** 🎯
