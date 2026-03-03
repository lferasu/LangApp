import { config as loadEnv } from "dotenv";

loadEnv();

const requiredEnv = ["APP_NAME", "PORT", "NODE_ENV", "OPENAI_API_KEY"] as const;

type RequiredEnvKey = (typeof requiredEnv)[number];

function getEnvVar(key: RequiredEnvKey): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

const port = Number(getEnvVar("PORT"));

if (Number.isNaN(port)) {
  throw new Error("PORT must be a valid number.");
}

export const appConfig = {
  appName: getEnvVar("APP_NAME"),
  port,
  nodeEnv: getEnvVar("NODE_ENV"),
  openAIApiKey: getEnvVar("OPENAI_API_KEY"),
};

export default appConfig;
