import { BaseAgent } from './base-agent.js';
import fs from 'fs';
import path from 'path';

/**
 * Report Agent for Billy LLM Multi-Agent System
 * Specializes in generating comprehensive security reports and documentation
 * Created by BillyC0der
 */
export class ReportAgent extends BaseAgent {
  constructor(llmClient) {
    super('ReportAgent', llmClient);
    this.capabilities = ['report', 'document', 'summarize', 'format', 'export'];
    this.reportTypes = ['executive', 'technical', 'compliance', 'vulnerability', 'pentest'];
    this.formats = ['pdf', 'html', 'markdown', 'json', 'docx'];
  }

  async performTask(task) {
    this.logger.info(`Performing report task: ${task.action}`);
    
    switch (task.action) {
      case 'report':
        return await this.generateReport(task);
      case 'document':
        return await this.createDocumentation(task);
      case 'summarize':
        return await this.summarizeResults(task);
      case 'format':
        return await this.formatReport(task);
      case 'export':
        return await this.exportReport(task);
      default:
        return await this.performGenericReport(task);
    }
  }

  async generateReport(task) {
    const reportType = task.parameters.type || 'technical';
    const scope = task.parameters.scope || 'full';
    const template = task.parameters.template;
    
    this.logger.info(`Generating ${reportType} report with ${scope} scope`);

    // Load all available results for comprehensive reporting
    const allResults = await this.loadAllResults();
    const projectInfo = await this.loadProjectInfo();

    // Load report schema if available
    let schema = null;
    try {
      const schemaPath = './schemas/report.json';
      if (fs.existsSync(schemaPath)) {
        schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      }
    } catch (error) {
      this.logger.warning('Could not load report schema');
    }

    const reportPrompt = `Generate a comprehensive ${reportType} security assessment report:
    
    Report Type: ${reportType}
    Scope: ${scope}
    Template: ${template || 'standard'}
    
    Project Information:
    ${projectInfo}
    
    Assessment Results:
    ${allResults}
    
    Generate report with these sections:
    1. EXECUTIVE SUMMARY
       - High-level risk assessment
       - Key findings and business impact
       - Strategic recommendations
       
    2. ASSESSMENT METHODOLOGY
       - Testing approach and scope
       - Tools and techniques used
       - Timeline and limitations
       
    3. DETAILED FINDINGS
       - Vulnerability details with evidence
       - Risk ratings and CVSS scores
       - Proof of concept demonstrations
       - Screenshots and technical details
       
    4. RISK ANALYSIS
       - Risk matrix and prioritization
       - Business impact assessment
       - Attack scenario modeling
       
    5. RECOMMENDATIONS
       - Immediate remediation actions
       - Long-term security improvements
       - Implementation roadmap
       
    6. COMPLIANCE MAPPING
       - Regulatory requirements
       - Standards alignment (OWASP, NIST)
       - Compliance gaps analysis
       
    7. APPENDICES
       - Technical details
       - Tool outputs
       - References and resources
    
    Tailor content for ${reportType} audience with appropriate technical depth.`;

    const reportResult = await this.client.invoke(reportPrompt, schema, true);

    const enhancedResult = {
      reportType,
      scope,
      template,
      report: reportResult,
      metadata: {
        generated: new Date().toISOString(),
        agent: this.name,
        task: task.name,
        resultsIncluded: allResults ? allResults.split('\n').length : 0,
        sections: this.extractSections(reportResult)
      }
    };

    // Save report in multiple formats
    const timestamp = Date.now();
    const baseFilename = `report-${reportType}-${timestamp}`;
    
    // JSON format
    const jsonFile = `./results/${baseFilename}.json`;
    try {
      fs.writeFileSync(jsonFile, JSON.stringify(enhancedResult, null, 2));
      enhancedResult.jsonFile = jsonFile;
    } catch (error) {
      this.logger.warning(`Could not save JSON report: ${error.message}`);
    }

    // Markdown format
    const markdownFile = `./results/${baseFilename}.md`;
    try {
      const markdownContent = this.formatAsMarkdown(reportResult, reportType);
      fs.writeFileSync(markdownFile, markdownContent);
      enhancedResult.markdownFile = markdownFile;
    } catch (error) {
      this.logger.warning(`Could not save Markdown report: ${error.message}`);
    }

    // HTML format
    const htmlFile = `./results/${baseFilename}.html`;
    try {
      const htmlContent = this.formatAsHTML(reportResult, reportType);
      fs.writeFileSync(htmlFile, htmlContent);
      enhancedResult.htmlFile = htmlFile;
      this.logger.success(`Report saved to: ${htmlFile}`);
    } catch (error) {
      this.logger.warning(`Could not save HTML report: ${error.message}`);
    }

    return enhancedResult;
  }

  async createDocumentation(task) {
    const docType = task.parameters.type || 'technical';
    const subject = task.parameters.subject;
    const format = task.parameters.format || 'markdown';
    
    this.logger.info(`Creating ${docType} documentation for: ${subject}`);

    const docPrompt = `Create comprehensive ${docType} documentation for: ${subject}
    
    Documentation Type: ${docType}
    Subject: ${subject}
    Output Format: ${format}
    
    Include:
    1. Overview and Purpose
    2. Detailed Procedures
    3. Prerequisites and Requirements
    4. Step-by-step Instructions
    5. Code Examples and Scripts
    6. Troubleshooting Guide
    7. Best Practices
    8. References and Resources
    
    Make documentation clear, actionable, and professionally formatted.`;

    const docResult = await this.client.invoke(docPrompt, null, true);

    const enhancedResult = {
      docType,
      subject,
      format,
      documentation: docResult,
      timestamp: new Date().toISOString()
    };

    // Save documentation
    const filename = `doc-${docType}-${this.sanitizeFilename(subject)}-${Date.now()}.${format}`;
    const filepath = `./results/${filename}`;
    
    try {
      let content;
      if (format === 'markdown') {
        content = this.formatAsMarkdown(docResult, `${docType} Documentation: ${subject}`);
      } else if (format === 'html') {
        content = this.formatAsHTML(docResult, `${docType} Documentation: ${subject}`);
      } else {
        content = JSON.stringify(enhancedResult, null, 2);
      }
      
      fs.writeFileSync(filepath, content);
      enhancedResult.outputFile = filepath;
      this.logger.success(`Documentation saved to: ${filepath}`);
    } catch (error) {
      this.logger.warning(`Could not save documentation: ${error.message}`);
    }

    return enhancedResult;
  }

  async summarizeResults(task) {
    const resultFiles = task.parameters.files || [];
    const focus = task.parameters.focus || 'general';
    
    this.logger.info(`Summarizing results with focus on: ${focus}`);

    // Load specified files or all results
    const resultsData = resultFiles.length > 0 
      ? await this.loadSpecificResults(resultFiles)
      : await this.loadAllResults();

    const summaryPrompt = `Summarize security assessment results:
    
    Focus Area: ${focus}
    
    Results Data:
    ${resultsData}
    
    Provide:
    1. Executive Summary
    2. Key Findings Highlights
    3. Critical Issues Summary
    4. Risk Level Breakdown
    5. Top 10 Recommendations
    6. Statistics and Metrics
    7. Trend Analysis
    
    Focus on ${focus} aspects and actionable insights.`;

    const summary = await this.client.invoke(summaryPrompt, null, true);

    const enhancedResult = {
      focus,
      resultFiles,
      summary,
      metadata: {
        summarized: new Date().toISOString(),
        agent: this.name,
        task: task.name,
        filesProcessed: resultFiles.length
      }
    };

    // Save summary
    const filename = `summary-${focus}-${Date.now()}.json`;
    const filepath = `./results/${filename}`;
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(enhancedResult, null, 2));
      enhancedResult.outputFile = filepath;
      this.logger.success(`Summary saved to: ${filepath}`);
    } catch (error) {
      this.logger.warning(`Could not save summary: ${error.message}`);
    }

    return enhancedResult;
  }

  async formatReport(task) {
    const content = task.parameters.content;
    const format = task.parameters.format || 'html';
    const style = task.parameters.style || 'professional';
    
    this.logger.info(`Formatting report to ${format} with ${style} style`);

    let formattedContent;
    
    switch (format.toLowerCase()) {
      case 'html':
        formattedContent = this.formatAsHTML(content, 'Security Report', style);
        break;
      case 'markdown':
        formattedContent = this.formatAsMarkdown(content, 'Security Report');
        break;
      case 'json':
        formattedContent = JSON.stringify({ content, style, timestamp: new Date().toISOString() }, null, 2);
        break;
      default:
        formattedContent = content;
    }

    return {
      originalFormat: typeof content,
      targetFormat: format,
      style,
      formattedContent,
      timestamp: new Date().toISOString()
    };
  }

  async exportReport(task) {
    const reportFile = task.parameters.file;
    const exportFormat = task.parameters.format || 'pdf';
    const destination = task.parameters.destination || './exports';
    
    this.logger.info(`Exporting report to ${exportFormat} format`);

    // Ensure export directory exists
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    // Load report content
    let reportContent;
    try {
      if (reportFile && fs.existsSync(reportFile)) {
        const content = fs.readFileSync(reportFile, 'utf8');
        reportContent = reportFile.endsWith('.json') ? JSON.parse(content) : content;
      } else {
        throw new Error('Report file not found or not specified');
      }
    } catch (error) {
      throw new Error(`Could not load report: ${error.message}`);
    }

    // Export based on format
    const timestamp = Date.now();
    const exportFilename = `exported-report-${timestamp}.${exportFormat}`;
    const exportPath = path.join(destination, exportFilename);

    let exportResult;
    switch (exportFormat.toLowerCase()) {
      case 'html':
        exportResult = this.exportToHTML(reportContent, exportPath);
        break;
      case 'markdown':
        exportResult = this.exportToMarkdown(reportContent, exportPath);
        break;
      case 'json':
        exportResult = this.exportToJSON(reportContent, exportPath);
        break;
      default:
        throw new Error(`Unsupported export format: ${exportFormat}`);
    }

    return {
      originalFile: reportFile,
      exportFormat,
      destination,
      exportPath,
      success: exportResult,
      timestamp: new Date().toISOString()
    };
  }

  async performGenericReport(task) {
    this.logger.info(`Performing generic report task: ${task.name}`);
    
    const response = await this.callLLM(task);
    
    return {
      task: task.name,
      action: task.action,
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  async loadAllResults() {
    const resultsDir = './results';
    
    if (!fs.existsSync(resultsDir)) {
      this.logger.warning('No results directory found');
      return null;
    }

    try {
      const files = fs.readdirSync(resultsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      if (jsonFiles.length === 0) {
        return null;
      }

      const allResults = jsonFiles.map(file => {
        try {
          const content = fs.readFileSync(`${resultsDir}/${file}`, 'utf8');
          return { 
            file, 
            timestamp: fs.statSync(`${resultsDir}/${file}`).mtime,
            content: JSON.parse(content) 
          };
        } catch (error) {
          this.logger.warning(`Could not load result file ${file}: ${error.message}`);
          return null;
        }
      }).filter(Boolean);

      // Sort by timestamp, newest first
      allResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return JSON.stringify(allResults, null, 2);
    } catch (error) {
      this.logger.warning(`Could not load results: ${error.message}`);
      return null;
    }
  }

  async loadSpecificResults(files) {
    const results = [];
    
    for (const file of files) {
      try {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          results.push({
            file,
            content: file.endsWith('.json') ? JSON.parse(content) : content
          });
        } else {
          this.logger.warning(`Result file not found: ${file}`);
        }
      } catch (error) {
        this.logger.warning(`Could not load result file ${file}: ${error.message}`);
      }
    }
    
    return JSON.stringify(results, null, 2);
  }

  async loadProjectInfo() {
    const packageFile = './package.json';
    const readmeFile = './README.md';
    
    let info = 'Project: Billy LLM Multi-Agent System\n';
    info += 'Author: BillyC0der\n';
    
    try {
      if (fs.existsSync(packageFile)) {
        const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
        info += `Name: ${pkg.name}\n`;
        info += `Version: ${pkg.version}\n`;
        info += `Description: ${pkg.description}\n`;
      }
    } catch (error) {
      this.logger.warning('Could not load package.json');
    }
    
    return info;
  }

  formatAsMarkdown(content, title = 'Security Report') {
    let markdown = `# ${title}\n\n`;
    markdown += `**Generated:** ${new Date().toLocaleString()}\n`;
    markdown += `**Agent:** ReportAgent by BillyC0der\n\n`;
    markdown += `---\n\n`;
    
    if (typeof content === 'string') {
      markdown += content;
    } else if (typeof content === 'object') {
      markdown += this.objectToMarkdown(content);
    }
    
    markdown += `\n\n---\n`;
    markdown += `*Report generated by Billy LLM Multi-Agent System*\n`;
    
    return markdown;
  }

  formatAsHTML(content, title = 'Security Report', style = 'professional') {
    const css = this.getHTMLCSS(style);
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${css}</style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${title}</h1>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Agent:</strong> ReportAgent by BillyC0der</p>
        </header>
        <main>`;
    
    if (typeof content === 'string') {
      html += this.stringToHTML(content);
    } else if (typeof content === 'object') {
      html += this.objectToHTML(content);
    }
    
    html += `
        </main>
        <footer>
            <p><em>Report generated by Billy LLM Multi-Agent System</em></p>
        </footer>
    </div>
</body>
</html>`;
    
    return html;
  }

  getHTMLCSS(style) {
    const baseCSS = `
      body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
      .container { max-width: 1200px; margin: 0 auto; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
      header { background: #2c3e50; color: white; padding: 20px; }
      main { padding: 20px; }
      footer { background: #ecf0f1; padding: 10px; text-align: center; }
      h1, h2, h3 { color: #2c3e50; }
      .section { margin-bottom: 30px; }
      .finding { border-left: 4px solid #e74c3c; padding-left: 15px; margin: 20px 0; }
      .recommendation { border-left: 4px solid #27ae60; padding-left: 15px; margin: 20px 0; }
      code { background: #f8f9fa; padding: 2px 5px; border-radius: 3px; }
      pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
    `;
    
    return baseCSS;
  }

  stringToHTML(str) {
    return str.split('\n').map(line => {
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)[0].length;
        const text = line.replace(/^#+\s*/, '');
        return `<h${level}>${text}</h${level}>`;
      }
      return line ? `<p>${line}</p>` : '';
    }).join('\n');
  }

  objectToHTML(obj) {
    let html = '';
    for (const [key, value] of Object.entries(obj)) {
      html += `<div class="section">`;
      html += `<h3>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>`;
      if (typeof value === 'string') {
        html += `<p>${value}</p>`;
      } else if (typeof value === 'object') {
        html += `<pre>${JSON.stringify(value, null, 2)}</pre>`;
      }
      html += `</div>`;
    }
    return html;
  }

  objectToMarkdown(obj) {
    let markdown = '';
    for (const [key, value] of Object.entries(obj)) {
      markdown += `## ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}\n\n`;
      if (typeof value === 'string') {
        markdown += `${value}\n\n`;
      } else if (typeof value === 'object') {
        markdown += `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\`\n\n`;
      }
    }
    return markdown;
  }

  extractSections(content) {
    if (typeof content === 'string') {
      const sections = content.match(/#{1,3}\s+(.+)/g);
      return sections ? sections.length : 0;
    }
    return 0;
  }

  exportToHTML(content, filepath) {
    try {
      const htmlContent = this.formatAsHTML(content, 'Exported Security Report');
      fs.writeFileSync(filepath, htmlContent);
      this.logger.success(`Report exported to HTML: ${filepath}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to export HTML: ${error.message}`);
      return false;
    }
  }

  exportToMarkdown(content, filepath) {
    try {
      const markdownContent = this.formatAsMarkdown(content, 'Exported Security Report');
      fs.writeFileSync(filepath, markdownContent);
      this.logger.success(`Report exported to Markdown: ${filepath}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to export Markdown: ${error.message}`);
      return false;
    }
  }

  exportToJSON(content, filepath) {
    try {
      const jsonContent = JSON.stringify(content, null, 2);
      fs.writeFileSync(filepath, jsonContent);
      this.logger.success(`Report exported to JSON: ${filepath}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to export JSON: ${error.message}`);
      return false;
    }
  }

  sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  validateTask(task) {
    const baseValidation = super.validateTask(task);
    if (!baseValidation.valid) return baseValidation;

    const errors = [];
    
    // Report-specific validations
    if (task.action === 'export' && !task.parameters.file) {
      errors.push('Report file is required for export');
    }

    if (task.action === 'format' && !task.parameters.content) {
      errors.push('Content is required for formatting');
    }

    return {
      valid: errors.length === 0,
      errors: [...baseValidation.errors, ...errors]
    };
  }
}

// Signed by BillyC0der
