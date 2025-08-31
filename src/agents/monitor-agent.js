import { BaseAgent } from './base-agent.js';
import fs from 'fs';

/**
 * Monitor Agent for Billy LLM Multi-Agent System
 * Specializes in system monitoring, alerting, and continuous assessment
 * Created by BillyC0der
 */
export class MonitorAgent extends BaseAgent {
  constructor(llmClient) {
    super('MonitorAgent', llmClient);
    this.capabilities = ['monitor', 'alert', 'track', 'watch', 'notify'];
    this.monitorTypes = ['network', 'system', 'application', 'security', 'performance'];
    this.alertLevels = ['critical', 'high', 'medium', 'low', 'info'];
  }

  async performTask(task) {
    this.logger.info(`Performing monitor task: ${task.action}`);
    
    switch (task.action) {
      case 'monitor':
        return await this.startMonitoring(task);
      case 'alert':
        return await this.processAlert(task);
      case 'track':
        return await this.trackChanges(task);
      case 'watch':
        return await this.watchTarget(task);
      case 'notify':
        return await this.sendNotification(task);
      default:
        return await this.performGenericMonitor(task);
    }
  }

  async startMonitoring(task) {
    const target = task.parameters.target;
    const monitorType = task.parameters.type || 'security';
    const interval = task.parameters.interval || '5m';
    const thresholds = task.parameters.thresholds || {};
    
    if (!target) {
      throw new Error('Target is required for monitoring');
    }

    this.logger.info(`Starting ${monitorType} monitoring for ${target}`);

    // Load monitoring schema if available
    let schema = null;
    try {
      const schemaPath = './schemas/monitor.json';
      if (fs.existsSync(schemaPath)) {
        schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      }
    } catch (error) {
      this.logger.warning('Could not load monitor schema');
    }

    const monitorPrompt = `Generate comprehensive monitoring strategy for:
    
    Target: ${target}
    Monitor Type: ${monitorType}
    Check Interval: ${interval}
    Thresholds: ${JSON.stringify(thresholds)}
    
    Generate monitoring configuration including:
    1. System Monitoring
       - CPU, memory, disk usage
       - Network connectivity
       - Service availability
       - Process monitoring
    
    2. Security Monitoring
       - Failed login attempts
       - Suspicious network activity
       - File integrity checks
       - Configuration changes
    
    3. Application Monitoring
       - Response times
       - Error rates
       - Resource consumption
       - User activity
    
    4. Network Monitoring
       - Bandwidth utilization
       - Connection states
       - Port scanning detection
       - Traffic analysis
    
    5. Alert Conditions
       - Threshold definitions
       - Escalation procedures
       - Notification methods
       - Recovery actions
    
    Include monitoring scripts, commands, and configuration files.`;

    const monitorResult = await this.client.invoke(monitorPrompt, schema, true);

    const enhancedResult = {
      target,
      monitorType,
      interval,
      thresholds,
      monitoring: monitorResult,
      metadata: {
        started: new Date().toISOString(),
        agent: this.name,
        task: task.name,
        status: 'active',
        alertsEnabled: true
      }
    };

    // Save monitoring configuration
    const filename = `monitor-${monitorType}-${this.sanitizeFilename(target)}-${Date.now()}.json`;
    const filepath = `./results/${filename}`;
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(enhancedResult, null, 2));
      enhancedResult.configFile = filepath;
      this.logger.success(`Monitoring configuration saved to: ${filepath}`);
    } catch (error) {
      this.logger.warning(`Could not save monitoring config: ${error.message}`);
    }

    return enhancedResult;
  }

  async processAlert(task) {
    const alertLevel = task.parameters.level || 'medium';
    const source = task.parameters.source;
    const message = task.parameters.message;
    const data = task.parameters.data;
    
    this.logger.info(`Processing ${alertLevel} alert from ${source}`);

    const alertPrompt = `Process and analyze security alert:
    
    Alert Level: ${alertLevel}
    Source: ${source}
    Message: ${message}
    Data: ${data ? JSON.stringify(data) : 'None'}
    
    Provide:
    1. Alert Analysis
       - Threat assessment
       - Impact evaluation
       - Severity validation
       - Root cause analysis
    
    2. Response Recommendations
       - Immediate actions
       - Investigation steps
       - Containment measures
       - Recovery procedures
    
    3. Escalation Guidance
       - When to escalate
       - Who to notify
       - Documentation requirements
       - Follow-up actions
    
    4. Prevention Measures
       - Configuration changes
       - Policy updates
       - Monitoring improvements
       - Training recommendations
    
    Focus on actionable response guidance.`;

    const alertAnalysis = await this.client.invoke(alertPrompt, null, true);

    const enhancedResult = {
      alertLevel,
      source,
      message,
      data,
      analysis: alertAnalysis,
      metadata: {
        processed: new Date().toISOString(),
        agent: this.name,
        task: task.name,
        urgency: this.determineUrgency(alertLevel),
        requiresEscalation: this.requiresEscalation(alertLevel)
      }
    };

    // Save alert analysis
    const filename = `alert-${alertLevel}-${Date.now()}.json`;
    const filepath = `./results/${filename}`;
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(enhancedResult, null, 2));
      enhancedResult.outputFile = filepath;
      this.logger.success(`Alert analysis saved to: ${filepath}`);
    } catch (error) {
      this.logger.warning(`Could not save alert analysis: ${error.message}`);
    }

    return enhancedResult;
  }

  async trackChanges(task) {
    const target = task.parameters.target;
    const changeType = task.parameters.type || 'configuration';
    const baseline = task.parameters.baseline;
    
    this.logger.info(`Tracking ${changeType} changes for ${target}`);

    const trackingPrompt = `Generate change tracking strategy for:
    
    Target: ${target}
    Change Type: ${changeType}
    Baseline: ${baseline || 'current state'}
    
    Generate tracking mechanisms:
    1. File Integrity Monitoring
       - Configuration files
       - System binaries
       - Log files
       - Database schemas
    
    2. System State Tracking
       - User accounts
       - Group memberships
       - Permissions
       - Services and processes
    
    3. Network Configuration
       - Firewall rules
       - Network interfaces
       - Routing tables
       - DNS settings
    
    4. Application Changes
       - Code deployments
       - Configuration updates
       - Database changes
       - Dependency updates
    
    5. Change Detection Methods
       - Checksums and hashes
       - Version control integration
       - Real-time monitoring
       - Scheduled audits
    
    Include scripts for automated change detection and reporting.`;

    const trackingResult = await this.client.invoke(trackingPrompt, null, true);

    return {
      target,
      changeType,
      baseline,
      tracking: trackingResult,
      metadata: {
        started: new Date().toISOString(),
        agent: this.name,
        task: task.name
      }
    };
  }

  async watchTarget(task) {
    const target = task.parameters.target;
    const watchType = task.parameters.type || 'security';
    const duration = task.parameters.duration || '24h';
    
    this.logger.info(`Watching ${target} for ${watchType} events (${duration})`);

    const watchPrompt = `Generate target watching strategy:
    
    Target: ${target}
    Watch Type: ${watchType}
    Duration: ${duration}
    
    Generate watching procedures:
    1. Real-time Monitoring
       - Network traffic analysis
       - System call monitoring
       - File access tracking
       - Process monitoring
    
    2. Behavioral Analysis
       - User activity patterns
       - Network communication
       - Resource usage trends
       - Anomaly detection
    
    3. Event Correlation
       - Log aggregation
       - Timeline reconstruction
       - Pattern recognition
       - Threat hunting
    
    4. Data Collection
       - Metrics gathering
       - Log centralization
       - Screenshot capture
       - Network packet capture
    
    5. Alerting Rules
       - Suspicious activity detection
       - Threshold breaches
       - Pattern matches
       - Correlation alerts
    
    Focus on comprehensive visibility and early threat detection.`;

    const watchResult = await this.client.invoke(watchPrompt, null, true);

    return {
      target,
      watchType,
      duration,
      watch: watchResult,
      status: 'active',
      timestamp: new Date().toISOString()
    };
  }

  async sendNotification(task) {
    const recipients = task.parameters.recipients || [];
    const subject = task.parameters.subject;
    const message = task.parameters.message;
    const priority = task.parameters.priority || 'medium';
    const attachments = task.parameters.attachments || [];
    
    this.logger.info(`Sending ${priority} notification to ${recipients.length} recipients`);

    const notificationPrompt = `Generate notification content and delivery strategy:
    
    Recipients: ${recipients.join(', ')}
    Subject: ${subject}
    Message: ${message}
    Priority: ${priority}
    Attachments: ${attachments.join(', ')}
    
    Generate:
    1. Notification Content
       - Clear, actionable subject line
       - Structured message body
       - Priority indicators
       - Action items
    
    2. Delivery Methods
       - Email notifications
       - Slack/Teams messages
       - SMS alerts
       - Dashboard updates
    
    3. Escalation Procedures
       - Primary notification
       - Follow-up reminders
       - Escalation triggers
       - Alternate contacts
    
    4. Documentation
       - Notification logs
       - Delivery confirmation
       - Response tracking
       - Audit trail
    
    Ensure notifications are clear, urgent, and actionable.`;

    const notificationResult = await this.client.invoke(notificationPrompt, null, true);

    const enhancedResult = {
      recipients,
      subject,
      message,
      priority,
      attachments,
      notification: notificationResult,
      metadata: {
        sent: new Date().toISOString(),
        agent: this.name,
        task: task.name,
        deliveryMethod: 'multi-channel',
        trackingEnabled: true
      }
    };

    // Save notification log
    const filename = `notification-${priority}-${Date.now()}.json`;
    const filepath = `./results/${filename}`;
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(enhancedResult, null, 2));
      enhancedResult.logFile = filepath;
      this.logger.success(`Notification log saved to: ${filepath}`);
    } catch (error) {
      this.logger.warning(`Could not save notification log: ${error.message}`);
    }

    return enhancedResult;
  }

  async performGenericMonitor(task) {
    this.logger.info(`Performing generic monitor task: ${task.name}`);
    
    const response = await this.callLLM(task);
    
    return {
      task: task.name,
      action: task.action,
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  determineUrgency(alertLevel) {
    const urgencyMap = {
      'critical': 'immediate',
      'high': 'urgent',
      'medium': 'normal',
      'low': 'low',
      'info': 'informational'
    };
    
    return urgencyMap[alertLevel.toLowerCase()] || 'normal';
  }

  requiresEscalation(alertLevel) {
    const escalationLevels = ['critical', 'high'];
    return escalationLevels.includes(alertLevel.toLowerCase());
  }

  sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  validateTask(task) {
    const baseValidation = super.validateTask(task);
    if (!baseValidation.valid) return baseValidation;

    const errors = [];
    
    // Monitor-specific validations
    if ((task.action === 'monitor' || task.action === 'track' || task.action === 'watch') && !task.parameters.target) {
      errors.push('Target is required for monitoring operations');
    }

    if (task.action === 'alert' && !task.parameters.message && !task.parameters.source) {
      errors.push('Alert message or source is required');
    }

    if (task.action === 'notify' && (!task.parameters.recipients || task.parameters.recipients.length === 0)) {
      errors.push('At least one recipient is required for notifications');
    }

    return {
      valid: errors.length === 0,
      errors: [...baseValidation.errors, ...errors]
    };
  }
}

// Signed by BillyC0der
