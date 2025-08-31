import { BaseAgent } from './base-agent.js';
import fs from 'fs';

/**
 * Scan Agent for Billy LLM Multi-Agent System
 * Specializes in network scanning, port discovery, and service enumeration
 * Created by BillyC0der
 */
export class ScanAgent extends BaseAgent {
  constructor(llmClient) {
    super('ScanAgent', llmClient);
    this.capabilities = ['scan', 'enumerate', 'discover', 'fingerprint', 'probe'];
    this.scanTypes = ['port', 'network', 'service', 'vulnerability', 'stealth'];
    this.protocols = ['tcp', 'udp', 'icmp', 'http', 'https', 'ftp', 'ssh', 'smb'];
  }

  async performTask(task) {
    this.logger.info(`Performing scan task: ${task.action}`);
    
    switch (task.action) {
      case 'scan':
        return await this.performScan(task);
      case 'enumerate':
        return await this.enumerateServices(task);
      case 'discover':
        return await this.discoverHosts(task);
      case 'fingerprint':
        return await this.fingerprintServices(task);
      case 'probe':
        return await this.probeVulnerabilities(task);
      default:
        return await this.performGenericScan(task);
    }
  }

  async performScan(task) {
    const scanType = task.parameters.type || 'port';
    const target = task.parameters.target;
    const ports = task.parameters.ports || '1-65535';
    const protocol = task.parameters.protocol || 'tcp';
    
    if (!target) {
      throw new Error('Target is required for scanning');
    }

    this.logger.info(`Performing ${scanType} scan on ${target}`);

    // Load scan schema if available
    let schema = null;
    try {
      const schemaPath = './schemas/scan.json';
      if (fs.existsSync(schemaPath)) {
        schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      }
    } catch (error) {
      this.logger.warning('Could not load scan schema');
    }

    const scanPrompt = `Generate comprehensive ${scanType} scan strategy and commands for:
    
    Target: ${target}
    Scan Type: ${scanType}
    Ports: ${ports}
    Protocol: ${protocol}
    
    Generate:
    1. Nmap commands for different scan phases
    2. Masscan commands for fast scanning
    3. Custom scanning scripts
    4. Service enumeration commands
    5. OS fingerprinting techniques
    6. Stealth scanning methods
    7. Result interpretation guidelines
    8. Follow-up enumeration commands
    
    Include both aggressive and stealth scanning options.
    Provide commands ready for execution.`;

    const scanResult = await this.client.invoke(scanPrompt, schema, true);

    const enhancedResult = {
      scanType,
      target,
      ports,
      protocol,
      scan: scanResult,
      metadata: {
        scanned: new Date().toISOString(),
        agent: this.name,
        task: task.name,
        stealth: this.determineStealthLevel(scanType),
        complexity: this.assessScanComplexity(ports)
      }
    };

    // Save scan to file
    const filename = `scan-${scanType}-${this.sanitizeFilename(target)}-${Date.now()}.json`;
    const filepath = `./results/${filename}`;
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(enhancedResult, null, 2));
      enhancedResult.outputFile = filepath;
      this.logger.success(`Scan saved to: ${filepath}`);
    } catch (error) {
      this.logger.warning(`Could not save scan: ${error.message}`);
    }

    return enhancedResult;
  }

  async enumerateServices(task) {
    const target = task.parameters.target;
    const services = task.parameters.services || [];
    const ports = task.parameters.ports || [];
    
    this.logger.info(`Enumerating services on ${target}`);

    const enumPrompt = `Generate comprehensive service enumeration commands for:
    
    Target: ${target}
    Services: ${services.join(', ') || 'auto-detect'}
    Ports: ${ports.join(', ') || 'discovered ports'}
    
    Generate enumeration commands for:
    1. HTTP/HTTPS Services (gobuster, nikto, dirb)
    2. SMB/NetBIOS (enum4linux, smbclient)
    3. SSH Services (ssh-audit, brute force)
    4. FTP Services (anonymous login, file listing)
    5. Database Services (MySQL, PostgreSQL, MSSQL)
    6. DNS Services (zone transfers, brute force)
    7. SNMP Services (community strings, OID walks)
    8. Mail Services (SMTP, POP3, IMAP)
    9. Directory Services (LDAP enumeration)
    10. Custom service fingerprinting
    
    Include both manual and automated enumeration approaches.`;

    const enumResult = await this.client.invoke(enumPrompt, null, true);

    const enhancedResult = {
      target,
      services,
      ports,
      enumeration: enumResult,
      metadata: {
        enumerated: new Date().toISOString(),
        agent: this.name,
        task: task.name,
        serviceCount: services.length
      }
    };

    // Save enumeration to file
    const filename = `enumeration-${this.sanitizeFilename(target)}-${Date.now()}.json`;
    const filepath = `./results/${filename}`;
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(enhancedResult, null, 2));
      enhancedResult.outputFile = filepath;
      this.logger.success(`Enumeration saved to: ${filepath}`);
    } catch (error) {
      this.logger.warning(`Could not save enumeration: ${error.message}`);
    }

    return enhancedResult;
  }

  async discoverHosts(task) {
    const network = task.parameters.network || task.parameters.subnet;
    const method = task.parameters.method || 'comprehensive';
    
    if (!network) {
      throw new Error('Network or subnet is required for host discovery');
    }

    this.logger.info(`Discovering hosts in network: ${network}`);

    const discoveryPrompt = `Generate host discovery commands for network: ${network}
    
    Method: ${method}
    
    Generate discovery techniques:
    1. ICMP ping sweeps (various ICMP types)
    2. TCP SYN ping (common ports)
    3. UDP ping discovery
    4. ARP ping for local networks
    5. Broadcast ping methods
    6. DNS reverse lookups
    7. DHCP client discovery
    8. Network broadcast enumeration
    9. IPv6 neighbor discovery
    10. Passive network monitoring
    
    Include both active and passive discovery methods.
    Optimize for speed and stealth options.`;

    const discoveryResult = await this.client.invoke(discoveryPrompt, null, true);

    return {
      network,
      method,
      discovery: discoveryResult,
      metadata: {
        discovered: new Date().toISOString(),
        agent: this.name,
        task: task.name
      }
    };
  }

  async fingerprintServices(task) {
    const target = task.parameters.target;
    const port = task.parameters.port;
    const service = task.parameters.service;
    
    this.logger.info(`Fingerprinting service ${service} on ${target}:${port}`);

    const fingerprintPrompt = `Generate service fingerprinting commands for:
    
    Target: ${target}
    Port: ${port}
    Service: ${service || 'unknown'}
    
    Generate fingerprinting techniques:
    1. Banner grabbing (netcat, telnet, nmap scripts)
    2. Protocol-specific probes
    3. Version detection commands
    4. SSL/TLS certificate analysis
    5. HTTP header analysis
    6. Application-specific fingerprinting
    7. Vulnerability-based identification
    8. Behavioral fingerprinting
    
    Focus on accurate version and configuration detection.`;

    const fingerprintResult = await this.client.invoke(fingerprintPrompt, null, true);

    return {
      target,
      port,
      service,
      fingerprint: fingerprintResult,
      timestamp: new Date().toISOString()
    };
  }

  async probeVulnerabilities(task) {
    const target = task.parameters.target;
    const services = task.parameters.services || [];
    const aggressive = task.parameters.aggressive || false;
    
    this.logger.info(`Probing vulnerabilities on ${target}`);

    const probePrompt = `Generate vulnerability probing commands for:
    
    Target: ${target}
    Services: ${services.join(', ') || 'discovered services'}
    Aggressive Mode: ${aggressive}
    
    Generate vulnerability probes:
    1. Nmap vulnerability scripts (--script vuln)
    2. Nessus-like vulnerability checks
    3. Service-specific vulnerability tests
    4. Web application vulnerability scans
    5. SSL/TLS vulnerability tests
    6. Database vulnerability checks
    7. SMB vulnerability probes
    8. Buffer overflow tests
    9. Default credential checks
    10. Configuration weakness tests
    
    ${aggressive ? 'Include aggressive and potentially disruptive tests.' : 'Focus on safe, non-intrusive probes.'}`;

    const probeResult = await this.client.invoke(probePrompt, null, true);

    const enhancedResult = {
      target,
      services,
      aggressive,
      vulnerabilityProbe: probeResult,
      metadata: {
        probed: new Date().toISOString(),
        agent: this.name,
        task: task.name,
        riskLevel: aggressive ? 'High' : 'Low'
      }
    };

    // Save vulnerability probe to file
    const filename = `vulnprobe-${this.sanitizeFilename(target)}-${Date.now()}.json`;
    const filepath = `./results/${filename}`;
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(enhancedResult, null, 2));
      enhancedResult.outputFile = filepath;
      this.logger.success(`Vulnerability probe saved to: ${filepath}`);
    } catch (error) {
      this.logger.warning(`Could not save vulnerability probe: ${error.message}`);
    }

    return enhancedResult;
  }

  async performGenericScan(task) {
    this.logger.info(`Performing generic scan task: ${task.name}`);
    
    const response = await this.callLLM(task);
    
    return {
      task: task.name,
      action: task.action,
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  determineStealthLevel(scanType) {
    const stealthScans = ['stealth', 'syn', 'fin', 'null', 'xmas'];
    return stealthScans.some(type => scanType.toLowerCase().includes(type)) ? 'High' : 'Medium';
  }

  assessScanComplexity(ports) {
    if (typeof ports === 'string') {
      if (ports.includes('-') || ports.includes(',')) {
        const portCount = ports.split(/[-,]/).length;
        if (portCount > 1000) return 'High';
        if (portCount > 100) return 'Medium';
      }
    }
    return 'Low';
  }

  validateTask(task) {
    const baseValidation = super.validateTask(task);
    if (!baseValidation.valid) return baseValidation;

    const errors = [];
    
    // Scan-specific validations
    if ((task.action === 'scan' || task.action === 'enumerate' || task.action === 'fingerprint') && !task.parameters.target) {
      errors.push('Target is required for scanning operations');
    }

    if (task.action === 'discover' && !task.parameters.network && !task.parameters.subnet) {
      errors.push('Network or subnet is required for host discovery');
    }

    return {
      valid: errors.length === 0,
      errors: [...baseValidation.errors, ...errors]
    };
  }
}

// Signed by BillyC0der
