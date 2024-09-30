import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgSchema,
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

/** CIOFF Daniel Schema */

export const cioffSchema = pgSchema("prod");
export const langCodeEnum = pgEnum("lang_code", ["en", "es", "fr"]);

/*
1. USER MODULE:
Roles
Permissions
Roles to Permissions
Users
Account
Session
Verification Token
Authenticator

2. SYSTEM:
Languages
Social Media Links
Storage

3. COUNTRY MODULE:
Countries
Countries Lang
*/

export const RolesProd = cioffSchema.table("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const PermissionsProd = cioffSchema.table("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const RolesToPermissionsProd = cioffSchema.table(
  "roles_to_permissions",
  {
    id: serial("id").primaryKey(),
    roleId: integer("role_id").references(() => RolesProd.id),
    permissionId: integer("permission_id").references(() => PermissionsProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const LanguagesProd = cioffSchema.table("languages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: langCodeEnum("code").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const CountriesProd = cioffSchema.table("countries", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  lat: text("lat"),
  lng: text("lng"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const CountriesLangProd = cioffSchema.table("countries_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  countryId: integer("country_id").references(() => CountriesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const UsersProd = cioffSchema.table("users", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => RolesProd.id),
  countryId: integer("country_id").references(() => CountriesProd.id),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  password: text("password").notNull(),
  firstname: text("firstname").notNull(),
  lastname: text("lastname").notNull(),
  title: text("title"),
  address: text("address"),
  city: text("city"),
  zip: text("zip"),
  phone: text("phone"),
  image: integer("image_id").references(() => StorageProd.id),
  active: boolean("active").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const AccountsProd = pgTable(
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
export const SessionsProd = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
export const VerificationTokenProd = pgTable(
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
export const SessionsContainerProd = pgTable("session_group", {
  id: serial("id").primaryKey(),
});
export const AuthenticatorProd = pgTable(
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
export const SocialMediaLinksProd = cioffSchema.table("social_media_links", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  link: text("link"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const StorageProd = cioffSchema.table("storage", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  name: text("name"),
  aux: text("aux"),
  keywords: text("keywords"),
  lang: integer("lang").references(() => LanguagesProd.id),
  isFile: boolean("is_file").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/*
4. CATEGORY MODULE:
Categories
Categories Lang

5. FESTIVAL MODULE:
Events
Festivals Lang
Festivals
Festivals Photos
Festival to categories
*/

export const CategoriesProd = cioffSchema.table("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  icon: text("icon"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const CategoriesLangProd = cioffSchema.table("categories_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  categoryId: integer("category_id").references(() => CategoriesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalsProd = cioffSchema.table("festivals", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  stateMode: stateModeEnum("state_mode").default("offline"),
  urlValidated: boolean("url_validated").default(false),
  directorName: text("director_name").notNull().default(""),
  email: text("email"),
  url: text("url"),
  contact: text("contact"),
  phone: text("phone"),
  lat: text("lat"),
  lng: text("lng"),
  transportLat: text("transport_lat"),
  transportLng: text("transport_lng"),
  youtubeId: text("youtube_id"),
  published: boolean("published").default(false),
  countryId: integer("country_id").references(() => CountriesProd.id),
  logoId: integer("logo_id").references(() => StorageProd.id),
  coverId: integer("cover_id").references(() => StorageProd.id),
  createdBy: integer("created_by").references(() => UsersProd.id),
  updatedBy: integer("updated_by").references(() => UsersProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalsLangProd = cioffSchema.table("festivals_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  description: text("description").notNull().default(""),
  address: text("address").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalPhotosProd = cioffSchema.table("festival_photos", {
  id: serial("id").primaryKey(),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  photoId: integer("photo_id").references(() => StorageProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalToCategoriesProd = cioffSchema.table(
  "festival_to_categories",
  {
    id: serial("id").primaryKey(),
    festivalId: integer("festival_id").references(() => FestivalsProd.id),
    categoryId: integer("category_id").references(() => CategoriesProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const EventsProd = cioffSchema.table("events", {
  id: serial("id").primaryKey(),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/*
6. GROUP MODULE:
Type groups
Groups
Groups Lang
EventsToGroups
*/

export const TypeGroupsProd = cioffSchema.table("type_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const GroupsProd = cioffSchema.table("groups", {
  id: serial("id").primaryKey(),
  slug: text("slug"),
  phone: text("phone"),
  generalDirectorName: text("general_director_name").notNull(),
  artisticDirectorName: text("artistic_director_name"),
  generalDirectorPhotoId: integer("general_director_photo_id").references(
    () => StorageProd.id
  ),
  artisticDirectorPhotoId: integer("artistic_director_photo_id").references(
    () => StorageProd.id
  ),
  typeId: integer("type_id").references(() => TypeGroupsProd.id),
  createdBy: integer("created_by").references(() => UsersProd.id),
  updatedBy: integer("updated_by").references(() => UsersProd.id),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const GroupsLangProd = cioffSchema.table("groups_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  address: text("address"),
  generalDirectorProfile: text("general_director_profile"),
  artisticDirectorProfile: text("artistic_director_profile"),
  lang: integer("lang").references(() => LanguagesProd.id),
  groupId: integer("group_id").references(() => GroupsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const EventsToGroupsProd = cioffSchema.table("events_to_groups", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => EventsProd.id),
  groupId: integer("group_id").references(() => GroupsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/*
7. NATIONAL SECTION MODULE:
National Section
National Section Lang
National Section Positions
National Section Positions Lang
*/

export const NationalSectionProd = cioffSchema.table("national_section", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  published: boolean("published").default(false),
  countryId: integer("country_id").references(() => CountriesProd.id),
  createdBy: integer("created_by").references(() => UsersProd.id),
  updatedBy: integer("updated_by").references(() => UsersProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const NationalSectionLangProd = cioffSchema.table(
  "national_section_lang",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    about: text("about"),
    aboutYoung: text("about_young"),
    nsId: integer("ns_id").references(() => NationalSectionProd.id),
    lang: integer("lang").references(() => LanguagesProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const NationalSectionPositionsProd = cioffSchema.table(
  "national_section_positions",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull().unique(),
    birthDate: timestamp("birth_date", { mode: "date" }).notNull(),
    deadDate: timestamp("dead_date", { mode: "date" }),
    isHonorable: boolean("is_honorable").default(false),
    photoId: integer("photo_id").references(() => StorageProd.id),
    nsId: integer("ns_id").references(() => NationalSectionProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const NationalSectionPositionsLangProd = cioffSchema.table(
  "national_section_positions_lang",
  {
    id: serial("id").primaryKey(),
    shortBio: text("short_bio").notNull(),
    lang: integer("lang").references(() => LanguagesProd.id),
    nsPositionsId: integer("ns_positions_id").references(
      () => NationalSectionPositionsProd.id
    ),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);

/*
8. TIMELINE
Timeline
Timeline Lang

9. WEBSITE MODULE
Design
Menu
Menu Lang

10. Announcements
Announcements
Announcements files
*/

export const TimelineProd = cioffSchema.table("timeline", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  videoId: text("video_id"),
  mediaId: integer("media_id").references(() => StorageProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const TimelineLangProd = cioffSchema.table("timeline_lang", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  timelineId: integer("timeline_id").references(() => TimelineProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const DesignProd = cioffSchema.table("design", {
  id: serial("id").primaryKey(),
  bannerMediaId: integer("banner_media_id")
    .references(() => StorageProd.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const MenuProd = cioffSchema.table("menu", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  order: integer("order"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const MenuLangProd = cioffSchema.table("menu_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  lang: integer("lang").references(() => LanguagesProd.id),
  menuId: integer("menu_id").references(() => MenuProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const EmailsProd = cioffSchema.table("announcements", {
  id: serial("id").primaryKey(),
  to: text("to").notNull(),
  from: text("from").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  categoryNames: text("category_names").notNull(),
  createdBy: integer("created_by").references(() => UsersProd.id),
  updatedBy: integer("updated_by").references(() => UsersProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const EmailsDocsProd = cioffSchema.table("announcements_files", {
  id: serial("id").primaryKey(),
  emailId: integer("email_id").references(() => EmailsProd.id),
  mediaId: integer("media_id").references(() => StorageProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/*
11. PAGES
Sub Pages
Sub Pages Docs
Sub Pages Texts Lang
*/

export const SubPagesProd = cioffSchema.table("sub_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  url: text("url").notNull(),
  isNews: boolean("is_news").default(false),
  originalDate: timestamp("original_date", { mode: "date" }).notNull(),
  published: boolean("published").default(false),
  createdBy: integer("created_by").references(() => UsersProd.id),
  updatedBy: integer("updated_by").references(() => UsersProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const SubPagesTextsLangProd = cioffSchema.table("sub_pages_texts_lang", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  subPageId: integer("subpage_id").references(() => SubPagesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 12. Owers */

export const OwnersProd = cioffSchema.table("owners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => UsersProd.id),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  groupId: integer("group_id").references(() => GroupsProd.id),
  nsId: integer("ns_id").references(() => NationalSectionProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 13. Type Reports */

export const ReportTypeCategoriesProd = cioffSchema.table(
  "report_type_categories",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    oriented_to: text("oriented_to"),
    subType: text("subType"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const ReportTypeCategoriesNsLangProd = cioffSchema.table(
  "report_type_categories_lang",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    lang: integer("lang")
      .references(() => LanguagesProd.id)
      .notNull(),
    reportTypeCategoryId: integer("report_type_category_id")
      .references(() => ReportTypeCategoriesProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);

/* 14. Rating Questions */

export const RatingTypeProd = cioffSchema.table("rating_type", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const RatingQuestionsProd = cioffSchema.table("rating_questions", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  ratingTypeId: integer("rating_type_id").references(() => RatingTypeProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const RatingQuestionsLangProd = cioffSchema.table(
  "rating_questions_lang",
  {
    id: serial("id").primaryKey(),
    name: text("name"),
    tooltip: text("tooltip"),
    lang: integer("lang")
      .references(() => LanguagesProd.id)
      .notNull(),
    ratingQuestionlId: integer("rating_question_id")
      .references(() => RatingQuestionsProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);

/* 15. NS Reports */

export const ReportNsProd = cioffSchema.table("report_ns", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  nsId: integer("ns_id")
    .references(() => NationalSectionProd.id)
    .notNull(),
  numberFestivals: integer("number_festivals"),
  numberGroups: integer("number_groups"),
  numberAssociationsOrOtherOrganizations: integer(
    "number_associations_or_other_organizations"
  ),
  numberIndividualMembers: integer("number_individual_members"),
  isActivelyEngagedNc: boolean("is_actively_engaged_nc"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const ReportNsLangProd = cioffSchema.table("report_ns_lang", {
  id: serial("id").primaryKey(),
  title: text("title"),
  comment: text("comment"),
  lang: integer("lang")
    .references(() => LanguagesProd.id)
    .notNull(),
  reportNsId: integer("report_ns_id")
    .references(() => ReportNsProd.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const ReportNsActivitiesProd = cioffSchema.table(
  "report_ns_activities",
  {
    id: serial("id").primaryKey(),
    reportTypeCategoryId: integer("report_type_category_id")
      .references(() => ReportTypeCategoriesProd.id)
      .notNull(),
    reportNsId: integer("report_ns_id")
      .references(() => ReportNsProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);

/* 16. Festivals Reports */

export const ReportFestivalProd = cioffSchema.table("report_festival", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  festivalId: integer("festival_id")
    .references(() => FestivalsProd.id)
    .notNull(),
  amountPeople: integer("amount_people"),
  disabledAdults: integer("any_disabled_adults"),
  disabledYouth: integer("any_disabled_youth"),
  disabledChildren: integer("any_disabled_children"),
  amountPerformances: integer("amount_performances"),
  averageCostTicket: integer("average_cost_ticket"),
  sourceData: text("source_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const ReportFestivalActivitiesProd = cioffSchema.table(
  "report_festival_activities",
  {
    id: serial("id").primaryKey(),
    reportTypeCategoryId: integer("report_type_category_id")
      .references(() => ReportTypeCategoriesProd.id)
      .notNull(),
    reportFestivalId: integer("report_festival_id")
      .references(() => ReportFestivalProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);

/* 17. Groups Reports */

export const ReportGroupProd = cioffSchema.table("report_group", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  groupId: integer("group_id")
    .references(() => GroupsProd.id)
    .notNull(),
  amountPersonsTravelled: integer("amount_persons_travelled"),
  ich: text("ich"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 18. Festival Rating */

export const RatingFestivalToGroupsProd = cioffSchema.table(
  "rating_festival_to_groups",
  {
    id: serial("id").primaryKey(),
    ratingResult: integer("rating_result").notNull(),
    reportFestivalId: integer("report_festival_id")
      .references(() => ReportFestivalProd.id)
      .notNull(),
    groupId: integer("group_id").references(() => GroupsProd.id),
    nameNoCioffGroup: text("name_no_cioff_group"),
    amountPersonsGroup: integer("amount_persons_group"),
    isInvitationPerWebsite: boolean("is_invitation_per_website"),
    isInvitationPerNs: boolean("is_invitation_per_ns"),
    isGroupLiveMusic: boolean("is_group_live_music"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const RatingFestivalToGroupsAnswersProd = cioffSchema.table(
  "rating_festival_to_groups_answers",
  {
    id: serial("id").primaryKey(),
    rating: integer("rating").notNull(),
    ratingFestivalToGroupsId: integer("rating_festival_to_groups_id")
      .references(() => RatingFestivalToGroupsProd.id)
      .notNull(),
    ratingQuestionId: integer("rating_question_id")
      .references(() => RatingQuestionsProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const RatingFestivalToGroupsAnswersLangProd = cioffSchema.table(
  "rating_festival_to_groups_answers_lang",
  {
    id: serial("id").primaryKey(),
    comment: text("comment"),
    lang: integer("lang")
      .references(() => LanguagesProd.id)
      .notNull(),
    ratingFestivalToGroupsAnswersId: integer(
      "rating_festival_to_groups_answers_id"
    )
      .references(() => RatingFestivalToGroupsAnswersProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const RatingFestivalResultsLangProd = cioffSchema.table(
  "rating_festival_results_lang",
  {
    id: serial("id").primaryKey(),
    comment: text("comment"),
    lang: integer("lang")
      .references(() => LanguagesProd.id)
      .notNull(),
    ratingFestivalToGroupsId: integer("rating_festival_to_groups_id")
      .references(() => RatingFestivalToGroupsProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);

/* 19. Group Rating */

export const RatingGroupToFestivalsProd = cioffSchema.table(
  "rating_group_to_festivals",
  {
    id: serial("id").primaryKey(),
    ratingResult: integer("rating_result").notNull(),
    reportGroupId: integer("report_group_id")
      .references(() => ReportGroupProd.id)
      .notNull(),
    festivalId: integer("festival_id").references(() => FestivalsProd.id),
    nameNoCioffFestival: text("name_no_cioff_festival"),
    introductionBeforePerformances: boolean("introduction_before_performances"),
    isLogosPresent: boolean("is_logos_present"),
    atLeast5ForeginGroups: boolean("at_least_5_foregin_groups"),
    festivalCoverTravelCosts: boolean("festival_cover_travel_costs"),
    refreshmentsDuringPerformances: boolean("refreshments_during_performances"),
    financialCompensationPerMember: integer(
      "financial_compensation_per_member"
    ),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const ReportGroupTypeLocalesProd = cioffSchema.table(
  "report_group_type_locales",
  {
    id: serial("id").primaryKey(),
    reportTypeCategoryId: integer("report_type_category_id")
      .references(() => ReportTypeCategoriesProd.id)
      .notNull(),
    reportGroupToFestivalsId: integer("report_group_to_festivals_id")
      .references(() => RatingGroupToFestivalsProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const ReportGroupTypeLocalesSleepProd = cioffSchema.table(
  "report_group_type_locales_sleep",
  {
    id: serial("id").primaryKey(),
    reportTypeCategoryId: integer("report_type_category_id")
      .references(() => ReportTypeCategoriesProd.id)
      .notNull(),
    reportGroupToFestivalsId: integer("report_group_to_festivals_id")
      .references(() => RatingGroupToFestivalsProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const RatingGroupToFestivalsAnswersProd = cioffSchema.table(
  "rating_group_to_festivals_answers",
  {
    id: serial("id").primaryKey(),
    rating: integer("rating").notNull(),
    reportGroupToFestivalsId: integer("report_group_to_festivals_id")
      .references(() => RatingGroupToFestivalsProd.id)
      .notNull(),
    ratingQuestionId: integer("rating_question_id")
      .references(() => RatingQuestionsProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const RatingGroupAnswersLangProd = cioffSchema.table(
  "rating_group_to_festivals_answers_lang",
  {
    id: serial("id").primaryKey(),
    comment: text("comment"),
    lang: integer("lang")
      .references(() => LanguagesProd.id)
      .notNull(),
    ratingGroupToFestivalsAnswersId: integer(
      "rating_group_to_festivals_answers_id"
    )
      .references(() => RatingGroupToFestivalsAnswersProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const RatingGroupResultsLangProd = cioffSchema.table(
  "rating_group_results_lang",
  {
    id: serial("id").primaryKey(),
    comment: text("comment"),
    lang: integer("lang")
      .references(() => LanguagesProd.id)
      .notNull(),
    reportGroupToFestivalsId: integer("report_group_to_festivals_id")
      .references(() => RatingGroupToFestivalsProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
