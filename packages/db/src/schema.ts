import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  uuid,
  index,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
type AdapterAccountType = "oauth" | "oidc" | "email" | "webauthn";

// ─── Users ───────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── NextAuth Tables ─────────────────────────────────────────────────

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ─── Workspaces ──────────────────────────────────────────────────────

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── API Keys ────────────────────────────────────────────────────────

export const workspaceApiKeys = pgTable(
  "workspace_api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    keyPrefix: text("key_prefix").notNull(),
    keyHash: text("key_hash").notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("api_keys_prefix_idx").on(table.keyPrefix)]
);

// ─── 2FA Enrollments ─────────────────────────────────────────────────

export const twofaEnrollments = pgTable(
  "twofa_enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    endUserId: text("end_user_id").notNull(),
    secretEncrypted: text("secret_encrypted").notNull(),
    backupCodes: jsonb("backup_codes").$type<string[]>(),
    isEnabled: boolean("is_enabled").default(false).notNull(),
    enrolledAt: timestamp("enrolled_at", { mode: "date" }),
    lastVerifiedAt: timestamp("last_verified_at", { mode: "date" }),
  },
  (table) => [
    index("enrollments_workspace_user_idx").on(
      table.workspaceId,
      table.endUserId
    ),
  ]
);

// ─── 2FA Events ──────────────────────────────────────────────────────

export const twofaEvents = pgTable(
  "twofa_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    endUserId: text("end_user_id").notNull(),
    eventType: text("event_type")
      .$type<
        | "enrolled"
        | "verified"
        | "verify_failed"
        | "disabled"
        | "backup_used"
        | "backup_regenerated"
      >()
      .notNull(),
    metadata: jsonb("metadata"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("events_workspace_idx").on(table.workspaceId),
    index("events_user_idx").on(table.workspaceId, table.endUserId),
    index("events_created_idx").on(table.createdAt),
  ]
);

// ─── Subscriptions ───────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" })
    .unique(),
  tier: text("tier").$type<"free" | "pro" | "business">().default("free").notNull(),
  status: text("status").default("active").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Webhook Endpoints ───────────────────────────────────────────────

export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  events: jsonb("events").$type<string[]>().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
