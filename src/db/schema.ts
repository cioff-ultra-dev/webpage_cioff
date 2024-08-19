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

// Enums
export const stateModeEnum = pgEnum("state_mode", ["offline", "online"]);

// Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  stateMode: stateModeEnum("state_mode"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  logo: text("logo"),
  url: text("url"),
  approved: boolean("approved"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const eventTypes = pgTable("event_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tag: varchar("tag").notNull(),
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
  }),
);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
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
  }),
);

// Schemas
export const insertEventSchema = createInsertSchema(events);
export const selectEventSchema = createSelectSchema(events);

// Infered Types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertEvent = typeof events.$inferInsert;
export type SelectEvent = typeof events.$inferSelect;

export type InsertCategory = typeof categories.$inferInsert;
export type SelectCategory = typeof categories.$inferSelect;
