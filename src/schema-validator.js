import Ajv from 'ajv';

export class SchemaValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
  }

  validateSchema(schema) {
    try {
      this.ajv.compile(schema);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  validateResponse(data, schema) {
    if (!schema) return { valid: true };

    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    if (valid) {
      return { valid: true };
    }

    return {
      valid: false,
      errors: validate.errors.map(err => ({
        path: err.instancePath,
        message: err.message,
        value: err.data
      }))
    };
  }

  getDefaultSchemas() {
    return {
      binLookup: {
        type: "object",
        properties: {
          issuing_organization: {
            type: "string",
            description: "The name of the bank or financial institution that issued the card."
          },
          brand: {
            type: "string",
            description: "The card brand (e.g., Visa, Mastercard, American Express)."
          },
          card_type: {
            type: "string",
            description: "The type of card (e.g., Debit, Credit)."
          },
          country: {
            type: "string",
            description: "The country where the card was issued."
          }
        },
        required: ["issuing_organization", "brand", "card_type", "country"]
      },
      
      simpleResponse: {
        type: "object",
        properties: {
          answer: {
            type: "string",
            description: "The main answer to the question"
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Confidence level from 0 to 1"
          }
        },
        required: ["answer"]
      },

      exploit: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the exploit"
          },
          type: {
            type: "string",
            description: "Type of exploit (SQLi, XSS, RCE, etc.)"
          },
          description: {
            type: "string",
            description: "Description of what the exploit does"
          },
          code: {
            type: "string",
            description: "The exploit code"
          },
          usage: {
            type: "string",
            description: "How to use the exploit"
          },
          risk_level: {
            type: "string",
            enum: ["Low", "Medium", "High", "Critical"],
            description: "Risk level of the vulnerability"
          }
        },
        required: ["name", "type", "code", "risk_level"]
      },

      payload: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "Type of payload (reverse shell, web shell, etc.)"
          },
          platform: {
            type: "string",
            description: "Target platform (Windows, Linux, etc.)"
          },
          language: {
            type: "string",
            description: "Programming language used"
          },
          code: {
            type: "string",
            description: "The payload code"
          },
          instructions: {
            type: "string",
            description: "Instructions on how to use the payload"
          }
        },
        required: ["type", "code", "instructions"]
      },

      recon: {
        type: "object",
        properties: {
          target: {
            type: "string",
            description: "The target being reconnaissance"
          },
          techniques: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Name of the technique"
                },
                command: {
                  type: "string",
                  description: "Command to execute"
                },
                description: {
                  type: "string",
                  description: "What this technique discovers"
                }
              },
              required: ["name", "command"]
            },
            description: "List of reconnaissance techniques"
          },
          tools: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Recommended tools for reconnaissance"
          }
        },
        required: ["target", "techniques"]
      }
    };
  }
}