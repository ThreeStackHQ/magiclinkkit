import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  uuid,
  index,
  integer,
} from "drizzle-orm/pg-core";

// ─── Workspaces ──────────────────────────────────────────────────────

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    apiKey: text("api_key").notNull(),
    plan: text("plan")
      .$type<"free" | "pro" | "business">()
      .default("free")
      .notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    monthlyAuthCount: integer("monthly_auth_count").default(0).notNull(),
    lastResetAt: timestamp("last_reset_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("workspaces_api_key_idx").on(table.apiKey)]
);

// ─── Workspace Users (dashboard login) ──────────────────────────────

export const workspaceUsers = pgTable(
  "workspace_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("workspace_users_email_idx").on(table.email)]
);

// ─── Magic Links ────────────────────────────────────────────────────

export const magicLinks = pgTable(
  "magic_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    usedAt: timestamp("used_at", { mode: "date" }),
    redirectUrl: text("redirect_url"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("magic_links_token_idx").on(table.token)]
);

// ─── OTP Codes ──────────────────────────────────────────────────────

export const otpCodes = pgTable(
  "otp_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    code: text("code").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    usedAt: timestamp("used_at", { mode: "date" }),
    attemptCount: integer("attempt_count").default(0).notNull(),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("otp_codes_workspace_email_idx").on(
      table.workspaceId,
      table.email
    ),
  ]
);

// ─── Audit Log ──────────────────────────────────────────────────────

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    event: text("event")
      .$type<
        | "magic_link.sent"
        | "magic_link.verified"
        | "magic_link.expired"
        | "otp.sent"
        | "otp.verified"
        | "otp.failed"
        | "otp.expired"
      >()
      .notNull(),
    email: text("email"),
    ipAddress: text("ip_address"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_log_workspace_idx").on(table.workspaceId),
    index("audit_log_created_idx").on(table.createdAt),
  ]
);

// ─── Subscriptions ──────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" })
    .unique(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan")
    .$type<"free" | "pro" | "business">()
    .default("free")
    .notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at", { mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});

// ─── Webhooks ───────────────────────────────────────────────────────

export const webhooks = pgTable("webhooks", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  events: text("events").array().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});
