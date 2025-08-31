import { BaseAgent } from './base-agent.js';
import fs from 'fs';

/**
 * Analysis Agent for Billy LLM Multi-Agent System
 * Specializes in security analysis, reporting, and result interpretation
 * Created by BillyC0der
 */
export class AnalysisAgent extends BaseAgent {
  constructor(llmClient) {
    super('AnalysisAgent', llmClient);
    this.capabilities = ['analyze', 'report', 'interpret', 'correlate', 'assess'];
    this.analysisTypes = ['vulnerability', 'network', 'code', 'behavioral', 'forensic', 'threat'];
    this.reportFormats = ['executive', 'technical', 'compliance', 'remediation'];
  }

  async performTask(task) {
    this.logger.info(`Performing analysis task: ${task.action}`);
    
    switch (task.action) {
      case 'analyze':
        return await this.performAnalysis(task);
      case 'report':
        return await this.generateReport(task);
      case 'interpret':
        return await this.interpretResults(task);
      case 'correlate':
        return await this.correlateData(task);
      case 'assess':
        return await this.assessRisk(task);
      default:
        return await this.performGenericAnalysis(task);
    }
  }

  async performAnalysis(task) {
    const analysisType = task.parameters.type || 'general';
    const data = task.parameters.data || task.parameters.target;
    
    this.logger.info(`Performing ${analysisType} analysis`);

    // Load analysis schema if available
    let schema = null;
    try {
      const schemaPath = './schemas/analysis.json';
      if (fs.existsSync(schemaPath)) {
        schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      }
    } catch (error) {
      this.logger.warning('Could not load analysis schema');
    }

    const analysisPrompt = `Perform comprehensive ${analysisType} analysis on the following data:
    
    ${data}
    
    Provide:
    1. Executive Summary
    2. Detailed Findings
    3. Risk Assessment
    4. Technical Analysis
    5. Impact Evaluation
    6. Recommendations
    7. Prioritized Action Items
    
    Analysis Type: ${analysisType}
    Focus on actionable insights and clear risk prioritization.`;

    const analysisResult = await this.client.invoke(analysisPrompt, schema, true);

    const enhancedResult = {
      analysisType,
      analysisResult,
      metadata: {
        analyzed: new Date().toISOString(),
        agent: this.name,
        task: task.name,
        dataSize: typeof data === 'string' ? data.length : 'complex',
        severity: this.extractSeverity(analysisResult)
      }
    };

    // Save analysis to file
    const filename = `analysis-${analysisType}-${Date.now()}.json`;
    const filepath = `./results/${filename}`;
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(enhancedResult, null, 2));
      enhancedResult.outputFile = filepath;
      this.logger.success(`Analysis saved to: ${filepath}`);
    } catch (error) {
      this.logger.warning(`Could not save analysis: ${error.message}`);
    }

    return enhancedResult;
  }

  async generateReport(task) {
    const format = task.parameters.format || 'technical';
    const scope = task.parameters.scope || 'full';
    const audience = task.parameters.audience || 'technical';
    
    this.logger.info(`Generating ${format} report for ${audience} audience`);

    // Load previous results for comprehensive reporting
    const resultsData = await this.loadResultsData();
    
    const reportPrompt = `Generate a comprehensive ${format} security report:
    
    Format: ${format}
    Audience: ${audience}
    Scope: ${scope}
    
    Previous Results Data:
    ${resultsData}
    
    Include:
    1. Executive Summary (risk overview, key findings)
    2. Methodology and Scope
    3. Detailed Findings with Evidence
    4. Risk Matrix and Prioritization  
    5. Technical Details and Proof of Concepts
    6. Business Impact Assessment
    7. Remediation Roadmap
    8. Compliance Mapping (if applicable)
    9. Appendices and References
    
    Tailor content and language for ${audience} audience.
    Focus on actionable recommendations and clear business impact.`;

    const reportResult = await this.client.invoke(reportPrompt, null, true);

    const enhancedResult = {
      format,
      audience,
      scope,
      report: reportResult,
      metadata: {
        generated: new Date().toISOString(),
        agent: this.name,
        task: task.name,
        resultsIncluded: resultsData ? true : false
      }
    };

    // Save report in multiple formats
    const timestamp = Date.now();
    
    // JSON format
    const jsonFile = `./results/report-${format}-${timestamp}.json`;
    try {
      fs.writeFileSync(jsonFile, JSON.stringify(enhancedResult, null, 2));
      enhancedResult.jsonFile = jsonFile;
    } catch (error) {
      this.logger.warning(`Could not save JSON report: ${error.message}`);
    }

    // Text format for readability
    const textFile = `./results/report-${format}-${timestamp}.txt`;
    try {
      const textContent = this.formatReportAsText(reportResult);
      fs.writeFileSync(textFile, textContent);
      enhancedResult.textFile = textFile;
      this.logger.success(`Report saved to: ${textFile}`);
    } catch (error) {
      this.logger.warning(`Could not save text report: ${error.message}`);
    }

    return enhancedResult;
  }

  async interpretResults(task) {
    const results = task.parameters.results || task.parameters.data;
    const context = task.parameters.context || 'pentest';
    
    this.logger.info(`Interpreting results in context: ${context}`);

    const interpretPrompt = `Interpret these security testing results:
    
    Results: ${results}
    Context: ${context}
    
    Provide:
    1. Plain English Interpretation
    2. Technical Significance
    3. Attack Scenarios
    4. Business Risk Context
    5. Immediate Actions Required
    6. Long-term Implications
    
    Make technical findings accessible to non-technical stakeholders.`;

    const interpretation = await this.client.invoke(interpretPrompt, null, true);

    return {
      context,
      interpretation,
      originalResults: results,
      timestamp: new Date().toISOString()
    };
  }

  async correlateData(task) {
    const datasets = task.parameters.datasets || [];
    const pattern = task.parameters.pattern || 'security';
    
    this.logger.info(`Correlating data across ${datasets.length} datasets`);

    const correlationPrompt = `Correlate security data across multiple sources:
    
    Datasets: ${JSON.stringify(datasets)}
    Pattern Focus: ${pattern}
    
    Identify:
    1. Cross-dataset patterns and relationships
    2. Timeline correlations
    3. Common attack vectors
    4. Privilege escalation paths
    5. Data flow connections
    6. Compromise indicators
    
    Focus on attack chain reconstruction and threat actor attribution.`;

    const correlation = await this.client.invoke(correlationPrompt, null, true);

    return {
      pattern,
      datasets,
      correlation,
      correlationStrength: this.assessCorrelationStrength(correlation),
      timestamp: new Date().toISOString()
    };
  }

  async assessRisk(task) {
    const asset = task.parameters.asset;
    const vulnerabilities = task.parameters.vulnerabilities || [];
    const threats = task.parameters.threats || [];
    
    this.logger.info(`Assessing risk for asset: ${asset}`);

    const riskPrompt = `Perform comprehensive risk assessment:
    
    Asset: ${asset}
    Vulnerabilities: ${JSON.stringify(vulnerabilities)}
    Threats: ${JSON.stringify(threats)}
    
    Calculate:
    1. Asset Value and Criticality
    2. Threat Likelihood Assessment
    3. Vulnerability Impact Scoring
    4. Overall Risk Rating (Critical/High/Medium/Low)
    5. Risk Matrix Positioning
    6. Cost-Benefit Analysis for Mitigations
    7. Residual Risk After Controls
    
    Use industry-standard risk calculation methodologies.`;

    const riskAssessment = await this.client.invoke(riskPrompt, null, true);

    return {
      asset,
      vulnerabilities,
      threats,
      riskAssessment,
      riskScore: this.extractRiskScore(riskAssessment),
      timestamp: new Date().toISOString()
    };
  }

  async performGenericAnalysis(task) {
    this.logger.info(`Performing generic analysis task: ${task.name}`);
    
    const response = await this.callLLM(task);
    
    return {
      task: task.name,
      action: task.action,
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  async loadResultsData() {
    const resultsDir = './results';
    
    if (!fs.existsSync(resultsDir)) {
      return null;
    }

    try {
      const files = fs.readdirSync(resultsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      if (jsonFiles.length === 0) {
        return null;
      }

      // Load and summarize recent results
      const recentFiles = jsonFiles
        .slice(-10) // Last 10 files
        .map(file => {
          try {
            const content = fs.readFileSync(`${resultsDir}/${file}`, 'utf8');
            return { file, content: JSON.parse(content) };
          } catch (error) {
            return null;
          }
        })
        .filter(Boolean);

      return JSON.stringify(recentFiles, null, 2);
    } catch (error) {
      this.logger.warning(`Could not load results data: ${error.message}`);
      return null;
    }
  }

  formatReportAsText(reportData) {
    if (typeof reportData === 'string') {
      return reportData;
    }

    // Convert structured report to readable text
    let text = `SECURITY ASSESSMENT REPORT\n`;
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += `Agent: AnalysisAgent by BillyC0der\n`;
    text += `${'='.repeat(50)}\n\n`;
    
    if (reportData.executiveSummary) {
      text += `EXECUTIVE SUMMARY\n${'-'.repeat(20)}\n${reportData.executiveSummary}\n\n`;
    }
    
    if (reportData.findings) {
      text += `DETAILED FINDINGS\n${'-'.repeat(20)}\n${reportData.findings}\n\n`;
    }
    
    if (reportData.recommendations) {
      text += `RECOMMENDATIONS\n${'-'.repeat(20)}\n${reportData.recommendations}\n\n`;
    }
    
    return text;
  }

  extractSeverity(analysisResult) {
    if (typeof analysisResult !== 'string') {
      return 'Medium';
    }

    const severity = analysisResult.toLowerCase();
    if (severity.includes('critical') || severity.includes('high')) return 'High';
    if (severity.includes('medium') || severity.includes('moderate')) return 'Medium';
    if (severity.includes('low') || severity.includes('minimal')) return 'Low';
    
    return 'Medium';
  }

  extractRiskScore(riskAssessment) {
    if (typeof riskAssessment === 'string') {
      const match = riskAssessment.match(/risk\s+score[:\s]*(\d+)/i);
      return match ? parseInt(match[1]) : 5;
    }
    
    return 5; // Default medium risk
  }

  assessCorrelationStrength(correlation) {
    if (typeof correlation === 'string') {
      const strength = correlation.toLowerCase();
      if (strength.includes('strong') || strength.includes('high')) return 'Strong';
      if (strength.includes('weak') || strength.includes('low')) return 'Weak';
      if (strength.includes('moderate') || strength.includes('medium')) return 'Moderate';
    }
    
    return 'Moderate';
  }

  validateTask(task) {
    const baseValidation = super.validateTask(task);
    if (!baseValidation.valid) return baseValidation;

    const errors = [];
    
    // Analysis-specific validations
    if (task.action === 'analyze' && !task.parameters.data && !task.parameters.target) {
      errors.push('Analysis data or target is required');
    }

    if (task.action === 'correlate' && (!task.parameters.datasets || task.parameters.datasets.length < 2)) {
      errors.push('At least 2 datasets are required for correlation');
    }

    return {
      valid: errors.length === 0,
      errors: [...baseValidation.errors, ...errors]
    };
  }
}

// Signed by BillyC0der
