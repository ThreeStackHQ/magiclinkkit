import { createDb } from "@magiclinkkit/db";

export const db = createDb(
  process.env.DATABASE_URL ??
    "postgresql://user:pass@ep-placeholder-123456.us-east-2.aws.neon.tech/neondb"
);
