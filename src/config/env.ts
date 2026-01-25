function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  database: {
    url: requireEnv("DATABASE_URL"),
  },
  openai: {
    apiKey: requireEnv("OPENAI_API_KEY"),
  },
} as const;
