import { BaseAgent } from './base-agent.js';
import fs from 'fs';

/**
 * Reconnaissance Agent for Billy LLM Multi-Agent System
 * Specializes in information gathering and target reconnaissance
 * Created by BillyC0der
 */
export class ReconAgent extends BaseAgent {
  constructor(llmClient) {
    super('ReconAgent', llmClient);
    this.capabilities = ['recon', 'discover', 'enumerate', 'osint', 'scan'];
    this.tools = ['nmap', 'dig', 'whois', 'sublist3r', 'dirb', 'gobuster'];
  }

  async performTask(task) {
    this.logger.info(`Performing reconnaissance task: ${task.action}`);
    
    switch (task.action) {
      case 'recon':
        return await this.performReconnaissance(task);
      case 'discover':
        return await this.performDiscovery(task);
      case 'enumerate':
        return await this.performEnumeration(task);
      case 'osint':
        return await this.performOSINT(task);
      case 'scan':
        return await this.performScan(task);
      default:
        return await this.performGenericRecon(task);
    }
  }

  async performReconnaissance(task) {
    const target = task.parameters.target;
    if (!target) {
      throw new Error('Target is required for reconnaissance');
    }

    this.logger.info(`Starting reconnaissance on target: ${target}`);

    // Generate comprehensive recon plan using LLM
    const reconPrompt = `Generate a comprehensive reconnaissance plan for target: ${target}.
    Include:
    1. Information gathering techniques
    2. Specific commands to execute
    3. Tools to use
    4. Expected findings
    5. Timeline estimation
    
    Target: ${target}
    Tools available: ${this.tools.join(', ')}`;

    const reconPlan = await this.client.invoke(reconPrompt, null, true);

    // Execute basic reconnaissance commands if specified
    const results = {
      target,
      plan: reconPlan,
      findings: {},
      timestamp: new Date().toISOString()
    };

    // DNS lookup
    if (task.parameters.includeDNS !== false) {
      try {
        results.findings.dns = await this.performDNSLookup(target);
      } catch (error) {
        results.findings.dns = { error: error.message };
      }
    }

    // WHOIS lookup
    if (task.parameters.includeWHOIS !== false) {
      try {
        results.findings.whois = await this.performWHOISLookup(target);
      } catch (error) {
        results.findings.whois = { error: error.message };
      }
    }

    // Save results to file
    const filename = `recon-${target.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`;
    const filepath = `./results/${filename}`;
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
      results.outputFile = filepath;
      this.logger.success(`Reconnaissance results saved to: ${filepath}`);
    } catch (error) {
      this.logger.warning(`Could not save results: ${error.message}`);
    }

    return results;
  }

  async performDiscovery(task) {
    const target = task.parameters.target;
    const discoveryType = task.parameters.type || 'subdomain';

    this.logger.info(`Performing ${discoveryType} discovery on: ${target}`);

    const discoveryPrompt = `Perform ${discoveryType} discovery for target: ${target}.
    Generate specific commands and techniques for:
    1. ${discoveryType} enumeration
    2. Discovery methodology
    3. Tools and techniques
    4. Expected results analysis
    
    Provide actionable commands that can be executed.`;

    const discovery = await this.client.invoke(discoveryPrompt, null, true);

    return {
      target,
      type: discoveryType,
      discovery,
      timestamp: new Date().toISOString()
    };
  }

  async performEnumeration(task) {
    const target = task.parameters.target;
    const service = task.parameters.service || task.parameters.tool;

    this.logger.info(`Performing enumeration on ${service || 'target'}: ${target}`);

    const enumPrompt = `Generate enumeration techniques for:
    Target: ${target}
    Service/Tool: ${service || 'general'}
    
    Include:
    1. Enumeration commands
    2. Expected output analysis
    3. Vulnerability identification
    4. Next steps based on findings
    
    Focus on practical, executable commands.`;

    const enumeration = await this.client.invoke(enumPrompt, null, true);

    return {
      target,
      service,
      enumeration,
      timestamp: new Date().toISOString()
    };
  }

  async performOSINT(task) {
    const target = task.parameters.target;
    
    this.logger.info(`Performing OSINT gathering on: ${target}`);

    const osintPrompt = `Perform OSINT (Open Source Intelligence) gathering for target: ${target}.
    Generate techniques and sources for:
    1. Public information gathering
    2. Social media analysis
    3. Domain and infrastructure research
    4. Employee and contact information
    5. Technology stack identification
    
    Include specific sources, tools, and methodologies.`;

    const osint = await this.client.invoke(osintPrompt, null, true);

    return {
      target,
      osint,
      timestamp: new Date().toISOString()
    };
  }

  async performScan(task) {
    const target = task.parameters.target;
    const scanType = task.parameters.type || 'port';
    const tool = task.parameters.tool || 'nmap';

    this.logger.info(`Performing ${scanType} scan on ${target} using ${tool}`);

    const scanPrompt = `Generate ${scanType} scanning commands for target: ${target} using ${tool}.
    Include:
    1. Appropriate scan commands
    2. Stealth considerations
    3. Output analysis
    4. Finding interpretation
    5. Follow-up actions
    
    Focus on practical, production-ready commands.`;

    const scan = await this.client.invoke(scanPrompt, null, true);

    return {
      target,
      scanType,
      tool,
      scan,
      timestamp: new Date().toISOString()
    };
  }

  async performGenericRecon(task) {
    this.logger.info(`Performing generic reconnaissance task: ${task.name}`);
    
    const response = await this.callLLM(task);
    
    return {
      task: task.name,
      action: task.action,
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  async performDNSLookup(target) {
    // Simulate DNS lookup - in real implementation, this would execute actual commands
    const dnsPrompt = `Perform DNS analysis for ${target}. Generate comprehensive DNS lookup commands and explain what each record type reveals about the target infrastructure.`;
    
    return await this.client.invoke(dnsPrompt, null, false);
  }

  async performWHOISLookup(target) {
    // Simulate WHOIS lookup
    const whoisPrompt = `Perform WHOIS analysis for ${target}. Generate WHOIS lookup commands and explain how to analyze the registration information for reconnaissance purposes.`;
    
    return await this.client.invoke(whoisPrompt, null, false);
  }

  validateTask(task) {
    const baseValidation = super.validateTask(task);
    if (!baseValidation.valid) return baseValidation;

    const errors = [];
    
    // Recon-specific validations
    if (task.action === 'recon' && !task.parameters.target) {
      errors.push('Target is required for reconnaissance tasks');
    }

    if (task.action === 'scan' && !task.parameters.target) {
      errors.push('Target is required for scanning tasks');
    }

    return {
      valid: errors.length === 0,
      errors: [...baseValidation.errors, ...errors]
    };
  }
}

// Signed by BillyC0der
