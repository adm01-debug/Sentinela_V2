#!/usr/bin/env ts-node
/**
 * Environment Variables Validator
 * Validates all required environment variables are set
 */

interface EnvVar {
  name: string;
  required: boolean;
  pattern?: RegExp;
  description: string;
}

const envVars: EnvVar[] = [
  // Database
  { name: "DATABASE_URL", required: true, description: "PostgreSQL connection string" },
  { name: "REDIS_URL", required: true, description: "Redis connection string" },
  
  // Authentication
  { name: "JWT_SECRET", required: true, pattern: /.{32,}/, description: "JWT signing secret (min 32 chars)" },
  { name: "SESSION_SECRET", required: true, pattern: /.{32,}/, description: "Session secret (min 32 chars)" },
  
  // API Keys
  { name: "SUPABASE_URL", required: true, pattern: /^https:\/\//, description: "Supabase project URL" },
  { name: "SUPABASE_ANON_KEY", required: true, description: "Supabase anonymous key" },
  { name: "SUPABASE_SERVICE_KEY", required: false, description: "Supabase service role key" },
  
  // Email
  { name: "SMTP_HOST", required: false, description: "SMTP server host" },
  { name: "SMTP_PORT", required: false, pattern: /^\d+$/, description: "SMTP server port" },
  { name: "SMTP_USER", required: false, description: "SMTP username" },
  { name: "SMTP_PASS", required: false, description: "SMTP password" },
  
  // Storage
  { name: "S3_BUCKET", required: false, description: "S3 bucket for file storage" },
  { name: "S3_REGION", required: false, description: "AWS region" },
  
  // Monitoring
  { name: "SENTRY_DSN", required: false, pattern: /^https:\/\//, description: "Sentry DSN for error tracking" },
  
  // Application
  { name: "NODE_ENV", required: true, pattern: /^(development|test|production)$/, description: "Node environment" },
  { name: "PORT", required: false, pattern: /^\d+$/, description: "Server port" },
  { name: "APP_URL", required: true, pattern: /^https?:\/\//, description: "Application URL" },
];

function validateEnv(): void {
  console.log("🔍 Validating environment variables...
");
  
  let errors: string[] = [];
  let warnings: string[] = [];
  
  for (const envVar of envVars) {
    const value = process.env[envVar.name];
    
    if (!value) {
      if (envVar.required) {
        errors.push(`❌ ${envVar.name} is required - ${envVar.description}`);
      } else {
        warnings.push(`⚠️  ${envVar.name} is not set - ${envVar.description}`);
      }
      continue;
    }
    
    if (envVar.pattern && !envVar.pattern.test(value)) {
      errors.push(`❌ ${envVar.name} has invalid format - ${envVar.description}`);
      continue;
    }
    
    console.log(`✅ ${envVar.name}`);
  }
  
  if (warnings.length > 0) {
    console.log("
⚠️  Warnings:");
    warnings.forEach(w => console.log(`   ${w}`));
  }
  
  if (errors.length > 0) {
    console.log("
❌ Errors:");
    errors.forEach(e => console.log(`   ${e}`));
    process.exit(1);
  }
  
  console.log("
✅ All required environment variables are valid!");
}

validateEnv();
