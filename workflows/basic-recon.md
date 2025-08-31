# Basic Network Reconnaissance Workflow

**Description:** Comprehensive network reconnaissance and enumeration
**Author:** BillyC0der  
**Category:** Reconnaissance  
**Difficulty:** Beginner  

## Workflow Parameters

- `target`: Target IP address or hostname
- `network`: Target network range (CIDR)
- `aggressive`: Enable aggressive scanning (default: false)

## Tasks

### Task 1: Host Discovery
**Agent:** scan  
**Action:** discover  
**Dependencies:** none

Discover live hosts in the target network range.

**Parameters:**
- network: ${job.network}
- method: comprehensive

### Task 2: Port Scanning
**Agent:** scan  
**Action:** scan  
**Dependencies:** host_discovery

Perform comprehensive port scanning on discovered hosts.

**Parameters:**
- target: ${job.target}
- type: port
- ports: 1-65535
- protocol: tcp

### Task 3: Service Enumeration
**Agent:** scan  
**Action:** enumerate  
**Dependencies:** port_scanning

Enumerate services running on discovered ports.

**Parameters:**
- target: ${job.target}
- services: ${port_scanning.services}
- ports: ${port_scanning.openPorts}

### Task 4: DNS Reconnaissance
**Agent:** recon  
**Action:** recon  
**Dependencies:** none

Perform DNS reconnaissance and subdomain discovery.

**Parameters:**
- target: ${job.target}
- type: dns

### Task 5: WHOIS Information
**Agent:** recon  
**Action:** recon  
**Dependencies:** none

Gather WHOIS information about the target.

**Parameters:**
- target: ${job.target}
- type: whois

### Task 6: SSL Certificate Analysis
**Agent:** recon  
**Action:** recon  
**Dependencies:** service_enumeration

Analyze SSL certificates if HTTPS services are found.

**Parameters:**
- target: ${job.target}
- type: ssl

### Task 7: Web Technology Detection
**Agent:** recon  
**Action:** recon  
**Dependencies:** service_enumeration

Detect web technologies and frameworks in use.

**Parameters:**
- target: ${job.target}
- type: web

### Task 8: Result Analysis
**Agent:** analysis  
**Action:** analyze  
**Dependencies:** [port_scanning, service_enumeration, dns_reconnaissance, whois_information]

Analyze all reconnaissance results and identify potential attack vectors.

**Parameters:**
- type: reconnaissance
- data: ${dns_reconnaissance.result},${whois_information.result},${service_enumeration.result}

### Task 9: Reconnaissance Report
**Agent:** report  
**Action:** report  
**Dependencies:** result_analysis

Generate comprehensive reconnaissance report.

**Parameters:**
- type: technical
- scope: reconnaissance
- template: pentest

## Success Criteria

- [ ] Live hosts discovered
- [ ] Open ports identified
- [ ] Services enumerated
- [ ] DNS information gathered
- [ ] WHOIS data collected
- [ ] Results analyzed
- [ ] Report generated

## Notes

This workflow performs passive and semi-passive reconnaissance suitable for the initial phase of penetration testing. Enable aggressive mode only when authorized and appropriate for the engagement scope.
