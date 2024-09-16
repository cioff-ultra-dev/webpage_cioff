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
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { AdapterAccountType } from "next-auth/adapters";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import slug from "slug";

// Enums
export const stateModeEnum = pgEnum("state_mode", ["offline", "online"]);

/* Users Table */

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  roleId: integer("role_id"),
  countryId: integer("country_id"),
  title: text("title"),
  name: text("name"),
  firstname: text("firstname"),
  lastname: text("lastname"),
  email: text("email").notNull().unique(),
  address: text("address"),
  city: text("city"),
  zip: text("zip"),
  phone: text("phone"),
  image: text("image"),
  password: text("password"),
  active: boolean("active"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Account Table */

export const accounts = pgTable(
  "account",
  {
    userId: text("user_id")
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
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

/* Session Table */

export const sessions = pgTable("session", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

/* Verification Token Table */

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

export const sessionsContainer = pgTable("session_group", {
  id: serial("id").primaryKey(),
});

/* Authenticator Table */

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credential_id").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

/* Events Table */

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

/* Festivals Table */

export const festivals = pgTable("festivals", {
  id: serial("id").primaryKey(),
  address: text("address"),
  name: text("name").notNull().default(""),
  email: text("email"),
  url: text("url"),
  contact: text("contact"),
  countryId: integer("country_id"),
  urlValidated: boolean("url_validated"),
  description: text("description").notNull().default(""),
  phone: text("phone"),
  stateMode: stateModeEnum("state_mode").default("offline"),
  location: text("location"),
  currentDates: text("current_dates"),
  nextDates: text("next_dates"),
  logo: text("logo"),
  cover: text("cover"),
  photos: text("photos"),
  youtubeId: text("youtube_id"),
  directorName: text("director_name").notNull().default(""),
  categories: text("categories"),
  lang: integer("lang"),
  publish: boolean("publish"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Categories Table */

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Type groups Table */

export const typeGroups = pgTable("type_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Groups Table */

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  generalDirectorName: text("general_director_name").notNull(),
  generalDirectorProfile: text("general_director_profile"),
  generalDirectorPhoto: text("general_director_photo"),
  artisticDirectorName: text("artistic_director_name"),
  artisticDirectorProfile: text("artistic_director_profile"),
  artisticDirectorPhoto: text("artistic_director_photo"),
  phone: text("phone"),
  address: text("address"),
  typeId: integer("type_id"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Docs Table */
export const docsTable = pgTable("docs", {
  id: serial("id").primaryKey(),
  title: text("title"),
  docfile: text("docfile").notNull(),
  docKeywords: text("dockeywords"),
  lang: text("lang"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Countries Table */

export const countriesTable = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name"),
  lang: integer("lang"),
  lat: text("lat"),
  lng: text("lng"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Countries Lang Index Table */

export const countriesLangIndexTable = pgTable("countries_lang_index", {
  id: serial("id").primaryKey(),
  en: integer("en"),
  es: integer("es"),
  fr: integer("fr"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Languages Table */

export const languagesTable = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: text("name"),
  code: text("code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Roles Table */

export const rolesTable = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name"),
  active: boolean("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Permissions Table */

export const permissionsTable = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name"),
  active: boolean("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Roles to Permissions Table */

export const rolesToPermissionsTable = pgTable("roles_to_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id"),
  permissionId: integer("permission_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Festival to categories Table */

export const festivalsToCategoriesTable = pgTable(
  "festivals_to_categories",
  {
    festivalId: integer("festival_id").references(() => festivals.id),
    categoryId: integer("category_id").references(() => categories.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.festivalId, t.categoryId] }),
  })
);

/* Relations */

export const festivalRelations = relations(festivals, ({ many, one }) => ({
  festivalsToCategories: many(festivalsToCategoriesTable),
  country: one(countriesTable, {
    fields: [festivals.countryId],
    references: [countriesTable.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  festivalsToCategories: many(festivalsToCategoriesTable),
}));

export const countriesRelations = relations(countriesTable, ({ many }) => ({
  festivals: many(festivals),
}));

export const festivalsToGroupsRelations = relations(
  festivalsToCategoriesTable,
  ({ one }) => ({
    festival: one(festivals, {
      fields: [festivalsToCategoriesTable.festivalId],
      references: [festivals.id],
    }),
    category: one(categories, {
      fields: [festivalsToCategoriesTable.categoryId],
      references: [categories.id],
    }),
  })
);

export const groupsRelations = relations(groups, ({ one }) => ({
  type: one(typeGroups, {
    fields: [groups.typeId],
    references: [typeGroups.id],
  }),
}));

export const typeGroupsRelations = relations(typeGroups, ({ many }) => ({
  groups: many(groups),
}));

/* Schema */

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

export const insertTypeGroupSchema = createInsertSchema(typeGroups, {
  slug: (schema) =>
    schema.slug.transform((value) => (value ? slug(value) : value)),
});

/* Infered Types */

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertEvent = typeof events.$inferInsert;
export type SelectEvent = typeof events.$inferSelect;

export type InsertCategory = typeof categories.$inferInsert;
export type SelectCategory = typeof categories.$inferSelect;

export type InsertFestival = typeof festivals.$inferInsert;
export type SelectFestival = typeof festivals.$inferSelect;

export type InsertGroup = typeof groups.$inferInsert;
export type SelectGroup = typeof groups.$inferSelect;

export type InsertTypeGroup = typeof typeGroups.$inferInsert;
export type SelectTypeGroup = typeof typeGroups.$inferSelect;

export type InsertDocs = typeof docsTable.$inferInsert;
export type SelectDocs = typeof docsTable.$inferSelect;

export type InsertCountries = typeof countriesTable.$inferInsert;
export type SelectCountries = typeof countriesTable.$inferSelect;

export type InsertCountriesLangIndex =
  typeof countriesLangIndexTable.$inferInsert;
export type SelectCountriesLangIndex =
  typeof countriesLangIndexTable.$inferSelect;

export type InsertLanguages = typeof languagesTable.$inferInsert;
export type SelectLanguages = typeof languagesTable.$inferSelect;

export type InsertRoles = typeof rolesTable.$inferInsert;
export type SelectRoles = typeof rolesTable.$inferSelect;

export type InsertPermissions = typeof permissionsTable.$inferInsert;
export type SelectPermissions = typeof permissionsTable.$inferSelect;

export type InsertRolesToPermissions =
  typeof rolesToPermissionsTable.$inferInsert;
export type SelectRolesToPermissions =
  typeof rolesToPermissionsTable.$inferSelect;

export type InsertFestivalToCategories =
  typeof festivalsToCategoriesTable.$inferInsert;
export type SelectFestivalToCategories =
  typeof festivalsToCategoriesTable.$inferSelect;
