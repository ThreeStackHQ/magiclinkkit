import { createDb } from "@magiclinkkit/db";

// Use a valid-format placeholder at build time — actual queries only run at request time
export const db = createDb(
  process.env.DATABASE_URL ?? "postgresql://user:pass@ep-placeholder-123456.us-east-2.aws.neon.tech/neondb"
);
