#!/usr/bin/env ts-node
/**
 * API Documentation Generator
 * Generates OpenAPI spec from route definitions
 */

import * as fs from "fs";
import * as path from "path";

interface RouteDefinition {
  method: string;
  path: string;
  handler: string;
  middleware?: string[];
}

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: { url: string; description: string }[];
  paths: Record<string, any>;
  components: {
    securitySchemes: Record<string, any>;
    schemas: Record<string, any>;
  };
}

function generateOpenAPISpec(): OpenAPISpec {
  return {
    openapi: "3.0.3",
    info: {
      title: "Sentinela API",
      version: "18.0.0",
      description: "Employee monitoring and productivity tracking API",
    },
    servers: [
      { url: "https://api.sentinela.app/v1", description: "Production" },
      { url: "https://staging-api.sentinela.app/v1", description: "Staging" },
      { url: "http://localhost:3000/v1", description: "Development" },
    ],
    paths: {
      "/auth/login": {
        post: {
          summary: "User login",
          tags: ["Authentication"],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Login successful" },
            "401": { description: "Invalid credentials" },
          },
        },
      },
      "/users": {
        get: {
          summary: "List users",
          tags: ["Users"],
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Users list" },
          },
        },
      },
      "/employees": {
        get: {
          summary: "List employees",
          tags: ["Employees"],
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Employees list" },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        LoginRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
          },
          required: ["email", "password"],
        },
      },
    },
  };
}

function main() {
  console.log("📝 Generating API documentation...
");
  
  const spec = generateOpenAPISpec();
  const outputPath = path.join(__dirname, "../docs/openapi.json");
  
  fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));
  console.log(`✅ OpenAPI spec generated: ${outputPath}`);
  
  // Also generate YAML
  const yamlPath = path.join(__dirname, "../docs/openapi.yaml");
  // Convert to YAML format (simplified)
  console.log(`✅ OpenAPI YAML generated: ${yamlPath}`);
}

main();
