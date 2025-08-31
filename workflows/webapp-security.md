# Web Application Security Assessment

**Description:** Comprehensive web application security testing workflow
**Author:** BillyC0der  
**Category:** Web Security  
**Difficulty:** Intermediate  

## Workflow Parameters

- `target_url`: Target web application URL
- `domain`: Target domain name
- `deep_scan`: Enable deep vulnerability scanning (default: false)

## Tasks

### Task 1: Web Reconnaissance
**Agent:** recon  
**Action:** recon  

Gather information about the target web application.

**Parameters:**

- target: ${job.target_url}
- type: web

### Task 2: Subdomain Discovery
**Agent:** recon  
**Action:** recon  

Discover subdomains associated with the target domain.

**Parameters:**

- target: ${job.domain}
- type: subdomain

### Task 3: Technology Stack Detection
**Agent:** scan  
**Action:** fingerprint  
**Dependencies:** [web_reconnaissance]

Identify technologies and frameworks used by the application.

**Parameters:**

- target: ${job.target_url}
- service: http

### Task 4: Directory Enumeration
**Agent:** scan  
**Action:** enumerate  
**Dependencies:** [technology_stack_detection]

Enumerate directories and files on the web server.

**Parameters:**

- target: ${job.target_url}
- services: [http, https]

### Task 5: Vulnerability Scanning
**Agent:** scan  
**Action:** probe  
**Dependencies:** [directory_enumeration]

Scan for common web application vulnerabilities.

**Parameters:**

- target: ${job.target_url}
- services: [http]
- aggressive: ${job.deep_scan}

### Task 6: SSL/TLS Assessment
**Agent:** recon  
**Action:** recon  
**Dependencies:** [web_reconnaissance]

Assess SSL/TLS configuration and certificates.

**Parameters:**

- target: ${job.target_url}
- type: ssl

### Task 7: SQL Injection Testing
**Agent:** exploit  
**Action:** exploit  
**Dependencies:** [vulnerability_scanning]

Test for SQL injection vulnerabilities.

**Parameters:**

- type: sqli
- target: ${job.target_url}

### Task 8: XSS Vulnerability Testing
**Agent:** exploit  
**Action:** exploit  
**Dependencies:** [vulnerability_scanning]

Test for Cross-Site Scripting vulnerabilities.

**Parameters:**

- type: xss
- target: ${job.target_url}

### Task 9: CSRF Testing
**Agent:** exploit  
**Action:** exploit  
**Dependencies:** [vulnerability_scanning]

Test for Cross-Site Request Forgery vulnerabilities.

**Parameters:**

- type: csrf
- target: ${job.target_url}

### Task 10: Security Header Analysis
**Agent:** analysis  
**Action:** analyze  
**Dependencies:** [ssl_tls_assessment]

Analyze security headers and configurations.

**Parameters:**

- type: security_headers
- data: ${ssl_tls_assessment.result}

### Task 11: Vulnerability Analysis
**Agent:** analysis  
**Action:** correlate  
**Dependencies:** [sql_injection_testing, xss_vulnerability_testing, csrf_testing]

Correlate and analyze all discovered vulnerabilities.

**Parameters:**

- datasets: [${sql_injection_testing.result}, ${xss_vulnerability_testing.result}, ${csrf_testing.result}]
- pattern: web_vulnerabilities

### Task 12: Risk Assessment
**Agent:** analysis  
**Action:** assess  
**Dependencies:** [vulnerability_analysis]

Assess overall risk based on discovered vulnerabilities.

**Parameters:**

- asset: ${job.target_url}
- vulnerabilities: ${vulnerability_analysis.vulnerabilities}

### Task 13: Security Report Generation
**Agent:** report  
**Action:** report  
**Dependencies:** [risk_assessment]

Generate comprehensive web application security report.

**Parameters:**

- type: technical
- scope: web_security
- template: webapp

### Task 14: Executive Summary
**Agent:** report  
**Action:** summarize  
**Dependencies:** [security_report_generation]

Create executive summary for stakeholders.

**Parameters:**

- focus: business_risk
- files: [${security_report_generation.outputFile}]

## Success Criteria

- [ ] Web application reconnaissance completed
- [ ] Technology stack identified
- [ ] Directories enumerated
- [ ] Vulnerabilities discovered and tested
- [ ] SSL/TLS configuration assessed
- [ ] Risk assessment performed
- [ ] Technical report generated
- [ ] Executive summary created

## Notes

This workflow performs comprehensive web application security testing. Set deep_scan to true for more thorough but potentially disruptive testing. Ensure proper authorization before testing.
