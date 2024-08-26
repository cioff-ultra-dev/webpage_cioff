import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { AdapterAccountType } from "next-auth/adapters";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import { z } from "zod";

// Enums
export const stateModeEnum = pgEnum("state_mode", ["offline", "online"]);

// Tables
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  password: text("password").notNull(),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  stateMode: stateModeEnum("state_mode").default("offline"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  logo: text("logo"),
  url: text("url"),
  approved: boolean("approved"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const festivals = pgTable("festivals", {
  id: serial("id").primaryKey(),
  stateMode: stateModeEnum("state_mode").default("offline"),
  name: text("name").notNull(),
  directorName: text("director_name").notNull(),
  phone: text("phone"),
  description: text("description").notNull(),
  address: text("address"),
  location: text("location").notNull(),
  currentDates: text("current_dates").notNull(),
  nextDates: text("next_dates"),
  logo: text("logo"),
  cover: text("cover"),
  photos: text("photos"),
  youtubeId: text("youtube_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const eventTypes = pgTable("event_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const eventsToEventTypes = pgTable(
  "events_to_event_types",
  {
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id),
    eventTypeId: integer("event_types_id")
      .notNull()
      .references(() => eventTypes.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.eventTypeId] }),
  })
);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

// Relations
export const eventsRelations = relations(events, ({ many }) => ({
  eventToTypes: many(eventsToEventTypes),
}));

export const eventTypesRelations = relations(eventTypes, ({ many }) => ({
  eventToTypes: many(eventsToEventTypes),
}));

export const eventsToEventTypesRelations = relations(
  eventsToEventTypes,
  ({ one }) => ({
    event: one(events, {
      fields: [eventsToEventTypes.eventId],
      references: [events.id],
    }),
    type: one(eventTypes, {
      fields: [eventsToEventTypes.eventTypeId],
      references: [eventTypes.id],
    }),
  })
);

// Schemas
export const inserUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
  password: (schema) => schema.password.min(6),
});
export const selectUserSchema = createSelectSchema(users);
export const requestAuthSchema = inserUserSchema.pick({
  email: true,
  password: true,
});

export const insertEventSchema = createInsertSchema(events, {
  description: (schema) => schema.description.min(20),
});
export const selectEventSchema = createSelectSchema(events);
export const insertFestivalSchema = createInsertSchema(festivals, {
  name: (schema) => schema.name.min(1),
  directorName: (schema) => schema.directorName.min(1),
  description: (schema) => schema.description.max(500),
  phone: (schema) =>
    schema.phone.refine(
      (value) => {
        return isPossiblePhoneNumber(value || "");
      },
      { message: "Invalid phone number" }
    ),
});
export const selectFestivalSchema = createSelectSchema(festivals);

// Infered Types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertEvent = typeof events.$inferInsert;
export type SelectEvent = typeof events.$inferSelect;

export type InsertCategory = typeof categories.$inferInsert;
export type SelectCategory = typeof categories.$inferSelect;

export type InsertFestival = typeof festivals.$inferInsert;
export type SelectFestival = typeof festivals.$inferSelect;
