import fs from 'fs';
import path from 'path';

/**
 * Billy LLM Workflow Parser
 * Parses markdown workflow files and extracts structured tasks
 * Created by BillyC0der
 */
export class WorkflowParser {
  constructor() {
    this.supportedActions = [
      'recon', 'exploit', 'enumerate', 'analyze', 'scan', 
      'test', 'validate', 'report', 'execute', 'monitor'
    ];
  }

  /**
   * Parse a markdown workflow file
   * @param {string} filePath - Path to the .md workflow file
   * @returns {Object} Parsed workflow object
   */
  parseWorkflow(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Workflow file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const workflow = {
      name: path.basename(filePath, '.md'),
      description: '',
      metadata: {},
      phases: [],
      tasks: [],
      dependencies: [],
      outputs: []
    };

    const lines = content.split('\n');
    let currentPhase = null;
    let currentTask = null;
    let inMetadata = false;
    let inCodeBlock = false;
    let codeBlockContent = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End of code block
          if (currentTask) {
            currentTask.code = codeBlockContent.join('\n');
          }
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Start of code block
          inCodeBlock = true;
          codeBlockContent = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(lines[i]); // Keep original formatting
        continue;
      }

      // Parse metadata section
      if (line.startsWith('---') && i === 0) {
        inMetadata = true;
        continue;
      }
      
      if (line.startsWith('---') && inMetadata) {
        inMetadata = false;
        continue;
      }

      if (inMetadata) {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          workflow.metadata[key.trim()] = valueParts.join(':').trim();
        }
        continue;
      }

      // Parse main title (# Title)
      if (line.startsWith('# ') && !workflow.description) {
        workflow.description = line.substring(2);
        continue;
      }

      // Parse phases (## Phase Name)
      if (line.startsWith('## ')) {
        if (currentTask) {
          workflow.tasks.push(currentTask);
          currentTask = null;
        }
        
        currentPhase = {
          name: line.substring(3),
          tasks: [],
          order: workflow.phases.length + 1
        };
        workflow.phases.push(currentPhase);
        continue;
      }

      // Parse tasks (### Task Name or - Task)
      if (line.startsWith('### ') || line.startsWith('- **')) {
        if (currentTask) {
          if (currentPhase) {
            currentPhase.tasks.push(currentTask);
          }
          workflow.tasks.push(currentTask);
        }

        const taskName = line.startsWith('### ') 
          ? line.substring(4)
          : line.replace(/^- \*\*(.+?)\*\*.*/, '$1');

        currentTask = {
          name: taskName,
          phase: currentPhase?.name || 'default',
          agent: this.detectAgent(taskName),
          action: this.detectAction(taskName),
          parameters: {},
          dependencies: [],
          timeout: 300000, // 5 minutes default
          retry: 3,
          critical: false,
          output: null,
          code: null
        };
        continue;
      }

      // Parse task properties
      if (currentTask) {
        // Target
        if (line.includes('Target:') || line.includes('target:')) {
          currentTask.parameters.target = this.extractValue(line);
        }
        
        // Command
        if (line.includes('Command:') || line.includes('command:')) {
          currentTask.parameters.command = this.extractValue(line);
        }
        
        // Tool
        if (line.includes('Tool:') || line.includes('tool:')) {
          currentTask.parameters.tool = this.extractValue(line);
        }
        
        // Parameters
        if (line.includes('Params:') || line.includes('params:') || line.includes('Parameters:')) {
          currentTask.parameters.options = this.extractValue(line);
        }
        
        // Dependencies
        if (line.includes('Depends:') || line.includes('depends:') || line.includes('After:')) {
          const deps = this.extractValue(line).split(',').map(d => d.trim());
          currentTask.dependencies = deps;
        }
        
        // Timeout
        if (line.includes('Timeout:') || line.includes('timeout:')) {
          currentTask.timeout = parseInt(this.extractValue(line)) * 1000;
        }
        
        // Critical
        if (line.includes('Critical:') || line.includes('critical:')) {
          currentTask.critical = this.extractValue(line).toLowerCase() === 'true';
        }
        
        // Output
        if (line.includes('Output:') || line.includes('output:')) {
          currentTask.output = this.extractValue(line);
        }

        // Schema
        if (line.includes('Schema:') || line.includes('schema:')) {
          currentTask.parameters.schema = this.extractValue(line);
        }
      }
    }

    // Add the last task
    if (currentTask) {
      if (currentPhase) {
        currentPhase.tasks.push(currentTask);
      }
      workflow.tasks.push(currentTask);
    }

    return workflow;
  }

  /**
   * Detect which agent should handle a task
   * @param {string} taskName 
   * @returns {string}
   */
  detectAgent(taskName) {
    const lower = taskName.toLowerCase();
    
    if (lower.includes('recon') || lower.includes('reconnaissance') || lower.includes('discover')) {
      return 'ReconAgent';
    }
    if (lower.includes('exploit') || lower.includes('attack') || lower.includes('payload')) {
      return 'ExploitAgent';
    }
    if (lower.includes('scan') || lower.includes('enum') || lower.includes('port')) {
      return 'ScanAgent';
    }
    if (lower.includes('analyze') || lower.includes('analysis') || lower.includes('parse')) {
      return 'AnalysisAgent';
    }
    if (lower.includes('report') || lower.includes('document') || lower.includes('generate')) {
      return 'ReportAgent';
    }
    if (lower.includes('monitor') || lower.includes('watch') || lower.includes('track')) {
      return 'MonitorAgent';
    }
    
    return 'GeneralAgent';
  }

  /**
   * Detect the action type for a task
   * @param {string} taskName 
   * @returns {string}
   */
  detectAction(taskName) {
    const lower = taskName.toLowerCase();
    
    for (const action of this.supportedActions) {
      if (lower.includes(action)) {
        return action;
      }
    }
    
    return 'execute';
  }

  /**
   * Extract value from a line like "Key: value"
   * @param {string} line 
   * @returns {string}
   */
  extractValue(line) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return '';
    
    return line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
  }

  /**
   * Validate a parsed workflow
   * @param {Object} workflow 
   * @returns {Object} Validation result
   */
  validateWorkflow(workflow) {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!workflow.name) errors.push('Workflow name is required');
    if (!workflow.tasks || workflow.tasks.length === 0) errors.push('Workflow must have at least one task');

    // Check task dependencies
    const taskNames = workflow.tasks.map(t => t.name);
    for (const task of workflow.tasks) {
      for (const dep of task.dependencies) {
        if (!taskNames.includes(dep)) {
          errors.push(`Task "${task.name}" depends on unknown task "${dep}"`);
        }
      }
    }

    // Check for circular dependencies
    const hasCycle = this.detectCircularDependencies(workflow.tasks);
    if (hasCycle) {
      errors.push('Circular dependencies detected in workflow');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Detect circular dependencies in tasks
   * @param {Array} tasks 
   * @returns {boolean}
   */
  detectCircularDependencies(tasks) {
    const graph = {};
    
    // Build dependency graph
    for (const task of tasks) {
      graph[task.name] = task.dependencies;
    }

    // DFS to detect cycles
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycleDFS = (node) => {
      if (recursionStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recursionStack.add(node);

      for (const neighbor of (graph[node] || [])) {
        if (hasCycleDFS(neighbor)) return true;
      }

      recursionStack.delete(node);
      return false;
    };

    for (const task of tasks) {
      if (hasCycleDFS(task.name)) return true;
    }

    return false;
  }
}

// Signed by BillyC0der
