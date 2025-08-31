import { EventEmitter } from 'events';
import { WorkflowParser } from './workflow-parser.js';
import { ReconAgent } from './agents/recon-agent.js';
import { ExploitAgent } from './agents/exploit-agent.js';
import { AnalysisAgent } from './agents/analysis-agent.js';
import { ScanAgent } from './agents/scan-agent.js';
import { ReportAgent } from './agents/report-agent.js';
import { MonitorAgent } from './agents/monitor-agent.js';
import fs from 'fs';
import chalk from 'chalk';

/**
 * Multi-Agent Orchestrator for Billy LLM System
 * Coordinates specialized agents to execute complex pentesting workflows
 * Created by BillyC0der
 */
export class Orchestrator extends EventEmitter {
  constructor(llmClient) {
    super();
    this.llmClient = llmClient;
    this.agents = new Map();
    this.workflows = new Map();
    this.activeJobs = new Map();
    this.results = new Map();
    this.parser = new WorkflowParser();
    
    this.initializeAgents();
    this.setupEventHandlers();
    
    console.log(chalk.cyan('🤖 Multi-Agent Orchestrator initialized by BillyC0der'));
  }

  initializeAgents() {
    // Initialize all specialized agents
    this.agents.set('recon', new ReconAgent(this.llmClient));
    this.agents.set('exploit', new ExploitAgent(this.llmClient));
    this.agents.set('analysis', new AnalysisAgent(this.llmClient));
    this.agents.set('scan', new ScanAgent(this.llmClient));
    this.agents.set('report', new ReportAgent(this.llmClient));
    this.agents.set('monitor', new MonitorAgent(this.llmClient));

    // Setup agent event forwarding
    for (const [name, agent] of this.agents) {
      agent.on('taskStarted', (task) => this.emit('agentTaskStarted', name, task));
      agent.on('taskCompleted', (task, result) => this.emit('agentTaskCompleted', name, task, result));
      agent.on('taskFailed', (task, error) => this.emit('agentTaskFailed', name, task, error));
      agent.on('log', (level, message) => this.emit('agentLog', name, level, message));
    }

    console.log(chalk.green(`✅ Initialized ${this.agents.size} specialized agents`));
  }

  setupEventHandlers() {
    this.on('agentTaskStarted', (agentName, task) => {
      console.log(chalk.blue(`🚀 ${agentName.toUpperCase()}: Started task '${task.name}'`));
    });

    this.on('agentTaskCompleted', (agentName, task, result) => {
      console.log(chalk.green(`✅ ${agentName.toUpperCase()}: Completed task '${task.name}'`));
      this.handleTaskCompletion(agentName, task, result);
    });

    this.on('agentTaskFailed', (agentName, task, error) => {
      console.log(chalk.red(`❌ ${agentName.toUpperCase()}: Failed task '${task.name}' - ${error.message}`));
      this.handleTaskFailure(agentName, task, error);
    });

    this.on('agentLog', (agentName, level, message) => {
      const colors = {
        info: chalk.cyan,
        success: chalk.green,
        warning: chalk.yellow,
        error: chalk.red
      };
      const color = colors[level] || chalk.white;
      console.log(color(`[${agentName.toUpperCase()}] ${message}`));
    });
  }

  async loadWorkflow(workflowPath) {
    console.log(chalk.cyan(`📋 Loading workflow: ${workflowPath}`));
    
    try {
      if (!fs.existsSync(workflowPath)) {
        throw new Error(`Workflow file not found: ${workflowPath}`);
      }

      const workflowContent = fs.readFileSync(workflowPath, 'utf8');
      const workflow = await this.parser.parseWorkflow(workflowContent, workflowPath);
      
      this.workflows.set(workflow.id, workflow);
      
      console.log(chalk.green(`✅ Loaded workflow '${workflow.name}' with ${workflow.tasks.length} tasks`));
      
      return workflow;
    } catch (error) {
      console.log(chalk.red(`❌ Failed to load workflow: ${error.message}`));
      throw error;
    }
  }

  async executeWorkflow(workflowId, parameters = {}) {
    console.log(chalk.cyan(`🎯 Executing workflow: ${workflowId}`));
    
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const jobId = `job_${Date.now()}`;
    const job = {
      id: jobId,
      workflowId,
      workflow,
      parameters,
      status: 'running',
      startTime: new Date(),
      completedTasks: new Set(),
      failedTasks: new Set(),
      results: new Map(),
      currentTasks: new Set()
    };

    this.activeJobs.set(jobId, job);
    
    console.log(chalk.blue(`🚀 Started job ${jobId} for workflow '${workflow.name}'`));
    
    try {
      // Execute workflow tasks based on dependencies
      await this.executeWorkflowTasks(job);
      
      job.status = 'completed';
      job.endTime = new Date();
      job.duration = job.endTime - job.startTime;
      
      console.log(chalk.green(`✅ Completed workflow '${workflow.name}' in ${job.duration}ms`));
      
      // Generate final report
      const finalReport = await this.generateFinalReport(job);
      job.finalReport = finalReport;
      
      this.emit('workflowCompleted', job);
      
      return job;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.endTime = new Date();
      
      console.log(chalk.red(`❌ Workflow '${workflow.name}' failed: ${error.message}`));
      
      this.emit('workflowFailed', job, error);
      throw error;
    }
  }

  async executeWorkflowTasks(job) {
    const { workflow } = job;
    const tasksToExecute = [...workflow.tasks];
    
    while (tasksToExecute.length > 0) {
      // Find tasks that can be executed (dependencies satisfied)
      const readyTasks = tasksToExecute.filter(task => 
        this.areTaskDependenciesSatisfied(task, job.completedTasks)
      );

      if (readyTasks.length === 0) {
        // Check for circular dependencies or missing dependencies
        const remainingTasks = tasksToExecute.map(t => t.name);
        throw new Error(`Cannot proceed: circular dependencies or missing tasks. Remaining: ${remainingTasks.join(', ')}`);
      }

      // Execute ready tasks in parallel
      const taskPromises = readyTasks.map(async (task) => {
        try {
          job.currentTasks.add(task.name);
          
          // Resolve task parameters from job parameters and previous results
          const resolvedTask = await this.resolveTaskParameters(task, job);
          
          const result = await this.executeTask(resolvedTask);
          
          job.completedTasks.add(task.name);
          job.results.set(task.name, result);
          job.currentTasks.delete(task.name);
          
          // Remove completed task from queue
          const taskIndex = tasksToExecute.findIndex(t => t.name === task.name);
          if (taskIndex !== -1) {
            tasksToExecute.splice(taskIndex, 1);
          }
          
          return { task, result, success: true };
        } catch (error) {
          job.failedTasks.add(task.name);
          job.currentTasks.delete(task.name);
          
          console.log(chalk.red(`❌ Task '${task.name}' failed: ${error.message}`));
          
          // Handle task failure based on workflow configuration
          if (task.continueOnFailure) {
            console.log(chalk.yellow(`⚠️ Continuing workflow despite task failure: ${task.name}`));
            job.completedTasks.add(task.name); // Mark as completed to unblock dependents
            
            const taskIndex = tasksToExecute.findIndex(t => t.name === task.name);
            if (taskIndex !== -1) {
              tasksToExecute.splice(taskIndex, 1);
            }
            
            return { task, error, success: false };
          } else {
            throw error;
          }
        }
      });

      // Wait for all ready tasks to complete
      await Promise.all(taskPromises);
    }
  }

  async executeTask(task) {
    console.log(chalk.blue(`🎯 Executing task: ${task.name} (${task.agent})`));
    
    const agent = this.agents.get(task.agent);
    if (!agent) {
      throw new Error(`Agent not found: ${task.agent}`);
    }

    // Validate task before execution
    const validation = agent.validateTask(task);
    if (!validation.valid) {
      throw new Error(`Task validation failed: ${validation.errors.join(', ')}`);
    }

    const result = await agent.executeTask(task);
    
    console.log(chalk.green(`✅ Task '${task.name}' completed successfully`));
    
    return result;
  }

  async resolveTaskParameters(task, job) {
    const resolvedTask = { ...task };
    const resolvedParameters = { ...task.parameters };

    // Resolve parameter references from job parameters and previous results
    for (const [key, value] of Object.entries(resolvedParameters)) {
      if (typeof value === 'string' && value.startsWith('${')) {
        const reference = value.slice(2, -1); // Remove ${ and }
        
        if (reference.startsWith('job.')) {
          // Job parameter reference
          const paramName = reference.slice(4);
          resolvedParameters[key] = job.parameters[paramName];
        } else if (reference.includes('.')) {
          // Previous task result reference
          const [taskName, resultPath] = reference.split('.', 2);
          const taskResult = job.results.get(taskName);
          
          if (taskResult) {
            resolvedParameters[key] = this.getNestedValue(taskResult, resultPath);
          }
        }
      }
    }

    resolvedTask.parameters = resolvedParameters;
    return resolvedTask;
  }

  areTaskDependenciesSatisfied(task, completedTasks) {
    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    return task.dependencies.every(dep => completedTasks.has(dep));
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  handleTaskCompletion(agentName, task, result) {
    // Store result for potential use by other tasks
    this.results.set(`${agentName}:${task.name}`, result);
    
    // Save result to file
    this.saveTaskResult(agentName, task, result);
  }

  handleTaskFailure(agentName, task, error) {
    // Log failure details
    const failure = {
      agent: agentName,
      task: task.name,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    this.saveTaskFailure(agentName, task, failure);
  }

  async generateFinalReport(job) {
    console.log(chalk.cyan(`📊 Generating final report for job ${job.id}`));
    
    try {
      const reportAgent = this.agents.get('report');
      
      const reportTask = {
        name: 'final_workflow_report',
        action: 'report',
        agent: 'report',
        parameters: {
          type: 'workflow',
          scope: 'full',
          workflowId: job.workflowId,
          jobId: job.id
        }
      };

      const report = await reportAgent.executeTask(reportTask);
      
      console.log(chalk.green(`✅ Final report generated`));
      
      return report;
    } catch (error) {
      console.log(chalk.yellow(`⚠️ Could not generate final report: ${error.message}`));
      return null;
    }
  }

  saveTaskResult(agentName, task, result) {
    try {
      const filename = `result-${agentName}-${task.name}-${Date.now()}.json`;
      const filepath = `./results/${filename}`;
      
      const resultData = {
        agent: agentName,
        task: task.name,
        result,
        timestamp: new Date().toISOString(),
        orchestrator: 'Billy LLM Multi-Agent System'
      };

      fs.writeFileSync(filepath, JSON.stringify(resultData, null, 2));
    } catch (error) {
      console.log(chalk.yellow(`⚠️ Could not save task result: ${error.message}`));
    }
  }

  saveTaskFailure(agentName, task, failure) {
    try {
      const filename = `failure-${agentName}-${task.name}-${Date.now()}.json`;
      const filepath = `./results/${filename}`;

      fs.writeFileSync(filepath, JSON.stringify(failure, null, 2));
    } catch (error) {
      console.log(chalk.yellow(`⚠️ Could not save task failure: ${error.message}`));
    }
  }

  getWorkflows() {
    return Array.from(this.workflows.values());
  }

  getActiveJobs() {
    return Array.from(this.activeJobs.values());
  }

  getJobStatus(jobId) {
    return this.activeJobs.get(jobId);
  }

  getAgentStatus() {
    const status = {};
    for (const [name, agent] of this.agents) {
      status[name] = {
        name: agent.name,
        capabilities: agent.capabilities,
        tasksExecuted: agent.tasksExecuted || 0,
        lastActivity: agent.lastActivity || null
      };
    }
    return status;
  }

  async listAvailableWorkflows() {
    const workflowsDir = './workflows';
    
    if (!fs.existsSync(workflowsDir)) {
      console.log(chalk.yellow('📁 No workflows directory found'));
      return [];
    }

    try {
      const files = fs.readdirSync(workflowsDir);
      const workflowFiles = files.filter(f => f.endsWith('.md'));
      
      console.log(chalk.cyan(`📋 Found ${workflowFiles.length} workflow files`));
      
      return workflowFiles.map(file => ({
        name: file.replace('.md', ''),
        path: `./workflows/${file}`,
        size: fs.statSync(`${workflowsDir}/${file}`).size
      }));
    } catch (error) {
      console.log(chalk.red(`❌ Error listing workflows: ${error.message}`));
      return [];
    }
  }

  async stopJob(jobId) {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    if (job.status !== 'running') {
      throw new Error(`Job is not running: ${job.status}`);
    }

    job.status = 'stopped';
    job.endTime = new Date();
    
    console.log(chalk.yellow(`⏹️ Stopped job ${jobId}`));
    
    this.emit('jobStopped', job);
  }

  getSystemStatus() {
    return {
      orchestrator: 'Billy LLM Multi-Agent System',
      version: '1.0.0',
      author: 'BillyC0der',
      agents: this.agents.size,
      workflows: this.workflows.size,
      activeJobs: this.activeJobs.size,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}

// Signed by BillyC0der
