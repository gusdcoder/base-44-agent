import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class LLMClient {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    const configPath = path.join(__dirname, '..', 'config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    return {
      endpoint: 'https://base44.app/api/apps/68b273aab44a3188021f4317/integration-endpoints/Core/InvokeLLM',
      token: '',
      appId: '68b273aab44a3188021f4317',
      originUrl: 'https://preview--cyber-sec-sentinel-021f4317.base44.app/BinSearch?hide_badge=true'
    };
  }

  saveConfig() {
    const configPath = path.join(__dirname, '..', 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
  }

  configure(options) {
    if (options.endpoint) this.config.endpoint = options.endpoint;
    if (options.token) this.config.token = options.token;
    if (options.appId) this.config.appId = options.appId;
    this.saveConfig();
  }

  async invoke(prompt, responseJsonSchema = null, addContextFromInternet = false) {
    if (!this.config.token) {
      throw new Error('Bearer token not configured. Run: billy-llm config --token <your-token>\nOr set it in interactive mode with: /config token <your-token>');
    }

    const payload = {
      prompt,
      add_context_from_internet: addContextFromInternet
    };

    if (responseJsonSchema) {
      payload.response_json_schema = responseJsonSchema;
    }

    try {
      const response = await axios.post(this.config.endpoint, payload, {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Authorization': `Bearer ${this.config.token}`,
          'X-App-Id': this.config.appId,
          'X-Origin-URL': this.config.originUrl,
          'Origin': 'https://preview--cyber-sec-sentinel-021f4317.base44.app',
          'Referer': 'https://preview--cyber-sec-sentinel-021f4317.base44.app/',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0'
        }
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: No response from server');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }
}