import { EventEmitter } from 'events';
import chalk from 'chalk';

/**
 * Base Agent Class for Billy LLM Multi-Agent System
 * Created by BillyC0der
 */
export class BaseAgent extends EventEmitter {
  constructor(name, llmClient) {
    super();
    this.name = name;
    this.client = llmClient;
    this.status = 'idle'; // idle, working, completed, failed
    this.capabilities = [];
    this.results = {};
    this.logger = this.createLogger();
  }

  /**
   * Create a logger for this agent
   * @returns {Object} Logger object
   */
  createLogger() {
    return {
      info: (msg) => console.log(chalk.blue(`[${this.name}]`) + ` ${msg}`),
      success: (msg) => console.log(chalk.green(`[${this.name}]`) + ` ✅ ${msg}`),
      error: (msg) => console.log(chalk.red(`[${this.name}]`) + ` ❌ ${msg}`),
      warning: (msg) => console.log(chalk.yellow(`[${this.name}]`) + ` ⚠️ ${msg}`),
      debug: (msg) => console.log(chalk.gray(`[${this.name}]`) + ` 🔍 ${msg}`)
    };
  }

  /**
   * Execute a task
   * @param {Object} task - Task object from workflow
   * @returns {Promise<Object>} Task result
   */
  async executeTask(task) {
    this.status = 'working';
    this.logger.info(`Starting task: ${task.name}`);
    
    try {
      // Emit task start event
      this.emit('taskStart', { agent: this.name, task: task.name });

      // Validate task parameters
      const validation = this.validateTask(task);
      if (!validation.valid) {
        throw new Error(`Task validation failed: ${validation.errors.join(', ')}`);
      }

      // Execute the task
      const result = await this.performTask(task);
      
      // Store result
      this.results[task.name] = result;
      this.status = 'completed';
      
      this.logger.success(`Task completed: ${task.name}`);
      this.emit('taskComplete', { agent: this.name, task: task.name, result });
      
      return result;

    } catch (error) {
      this.status = 'failed';
      this.logger.error(`Task failed: ${task.name} - ${error.message}`);
      this.emit('taskFailed', { agent: this.name, task: task.name, error: error.message });
      
      if (task.critical) {
        throw error;
      }
      
      return { error: error.message, success: false };
    }
  }

  /**
   * Perform the actual task (to be overridden by subclasses)
   * @param {Object} task 
   * @returns {Promise<Object>}
   */
  async performTask(task) {
    throw new Error('performTask must be implemented by subclasses');
  }

  /**
   * Validate task parameters
   * @param {Object} task 
   * @returns {Object} Validation result
   */
  validateTask(task) {
    const errors = [];
    
    if (!task.name) errors.push('Task name is required');
    if (!task.action) errors.push('Task action is required');
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get agent capabilities
   * @returns {Array} List of capabilities
   */
  getCapabilities() {
    return this.capabilities;
  }

  /**
   * Check if agent can handle a task
   * @param {Object} task 
   * @returns {boolean}
   */
  canHandle(task) {
    return this.capabilities.includes(task.action) || 
           this.capabilities.includes('*') ||
           task.agent === this.name;
  }

  /**
   * Get task results
   * @param {string} taskName 
   * @returns {Object} Task result
   */
  getResult(taskName) {
    return this.results[taskName];
  }

  /**
   * Get all results
   * @returns {Object} All results
   */
  getAllResults() {
    return this.results;
  }

  /**
   * Reset agent state
   */
  reset() {
    this.status = 'idle';
    this.results = {};
    this.removeAllListeners();
  }

  /**
   * Generate prompt for LLM based on task
   * @param {Object} task 
   * @returns {string} Generated prompt
   */
  generatePrompt(task) {
    let prompt = `As a professional ${this.name.replace('Agent', '')} specialist, `;
    
    switch (task.action) {
      case 'recon':
        prompt += `perform reconnaissance on target: ${task.parameters.target || 'unknown target'}. `;
        break;
      case 'exploit':
        prompt += `generate exploit code for: ${task.parameters.target || task.parameters.vulnerability || 'target'}. `;
        break;
      case 'analyze':
        prompt += `analyze the provided data: ${task.parameters.data || task.parameters.input || 'data'}. `;
        break;
      case 'scan':
        prompt += `perform scanning on: ${task.parameters.target || 'target'}. `;
        break;
      default:
        prompt += `execute the following task: ${task.name}. `;
        break;
    }

    // Add task-specific parameters
    if (task.parameters.tool) {
      prompt += `Use tool: ${task.parameters.tool}. `;
    }
    
    if (task.parameters.command) {
      prompt += `Execute command: ${task.parameters.command}. `;
    }

    if (task.parameters.options) {
      prompt += `Parameters: ${task.parameters.options}. `;
    }

    // Add code if provided
    if (task.code) {
      prompt += `\n\nCode to execute or analyze:\n${task.code}\n`;
    }

    // Add output format requirements
    prompt += '\n\nProvide detailed results including:';
    prompt += '\n1. Summary of actions performed';
    prompt += '\n2. Key findings and observations';
    prompt += '\n3. Potential security implications';
    prompt += '\n4. Recommended next steps';
    prompt += '\n5. Technical details and evidence';

    return prompt;
  }

  /**
   * Call LLM with generated prompt
   * @param {Object} task 
   * @returns {Promise<Object>} LLM response
   */
  async callLLM(task) {
    const prompt = this.generatePrompt(task);
    this.logger.debug('Calling LLM with generated prompt');
    
    // Use schema if specified
    let schema = null;
    if (task.parameters.schema) {
      try {
        const fs = await import('fs');
        const schemaPath = task.parameters.schema.startsWith('/') ? 
          task.parameters.schema : 
          `./schemas/${task.parameters.schema}`;
        
        if (fs.existsSync(schemaPath)) {
          schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        }
      } catch (error) {
        this.logger.warning(`Could not load schema: ${task.parameters.schema}`);
      }
    }

    return await this.client.invoke(prompt, schema, true);
  }
}

// Signed by BillyC0der
