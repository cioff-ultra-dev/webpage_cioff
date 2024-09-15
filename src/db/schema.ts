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

export const cioffSchema = pgSchema("PROD");
export const langCodeEnum = pgEnum("lang_code", ["en", "es", "fr"]);

/* All tables:

1. USER MODULE:
Users
Account
Session
Verification Token
Authenticator
Roles
Permissions
Roles to Permissions

2. SYSTEM:
Languages
Social Media Links
Docs

3. CATEGORY MODULE:
Categories
Categories Lang

4. FESTIVAL MODULE:
Events
EventsToGroups
Festivals Lang
Festivals
Festivals Photos
Festival to categories

5. GROUP MODULE:
Type groups
Groups
Groups Lang

6. COUNTRY MODULE:
Countries
Countries Lang

7. NATIONAL SECTION MODULE:
National Section
National Section Lang
National Section Positions
National Section Positions Lang

8. TIMELINE
Timeline
Timeline Lang

9. WEBSITE MODULE
Design
Menu
Menu Lang

10. PAGES
Sub Pages
Sub Pages Docs
Sub Pages Texts Lang

11. Announcements
emails
emails docs
*/

export const RolesProd = cioffSchema.table("Roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const CountriesProd = cioffSchema.table("Countries", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const UsersProd = cioffSchema.table("Users", {
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
export const AccountsProd = cioffSchema.table(
  "Account",
  {
    userId: integer("user_id").references(() => UsersProd.id, {
      onDelete: "cascade",
    }),
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
export const SessionsProd = cioffSchema.table("Session", {
  sessionToken: text("session_token").primaryKey(),
  userId: integer("user_id").references(() => UsersProd.id, {
    onDelete: "cascade",
  }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
export const VerificationTokenProd = cioffSchema.table(
  "VerificationToken",
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
export const AuthenticatorProd = cioffSchema.table(
  "Authenticator",
  {
    credentialID: text("credential_id").notNull().unique(),
    userId: integer("user_id").references(() => UsersProd.id, {
      onDelete: "cascade",
    }),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.credentialID],
    }),
  })
);
export const PermissionsProd = cioffSchema.table("Permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const RolesToPermissionsProd = cioffSchema.table("RolesToPermissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => RolesProd.id),
  permissionId: integer("permission_id").references(() => PermissionsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const LanguagesProd = cioffSchema.table("Languages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: langCodeEnum("code").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const SocialMediaLinksProd = cioffSchema.table("SocialMediaLinks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  link: text("link"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const StorageProd = cioffSchema.table("Storage", {
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
export const CategoriesProd = cioffSchema.table("Categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  icon: text("icon"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const CategoriesLangProd = cioffSchema.table("CategoriesLang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  categoryId: integer("category_id").references(() => CategoriesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalsProd = cioffSchema.table("Festivals", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  stateMode: stateModeEnum("state_mode").default("offline"),
  urlValidated: boolean("url_validated").default(false),
  directorName: text("director_name").notNull().default(""),
  email: text("email").notNull().unique(),
  url: text("url"),
  contact: text("contact"),
  phone: text("phone"),
  location: text("location"),
  currentDates: text("current_dates"),
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
export const FestivalsLangProd = cioffSchema.table("FestivalsLang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  description: text("description").notNull().default(""),
  address: text("address").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalPhotosProd = cioffSchema.table("FestivalPhotos", {
  id: serial("id").primaryKey(),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  photoId: integer("photo_id").references(() => StorageProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalToCategoriesProd = cioffSchema.table(
  "FestivalToCategories",
  {
    id: serial("id").primaryKey(),
    festivalId: integer("festival_id").references(() => FestivalsProd.id),
    categoryId: integer("category_id").references(() => CategoriesProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const EventsProd = cioffSchema.table("Events", {
  id: serial("id").primaryKey(),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const TypeGroupsProd = cioffSchema.table("TypeGroups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const GroupsProd = cioffSchema.table("Groups", {
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
export const GroupsLangProd = cioffSchema.table("GroupsLang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  address: text("address").notNull(),
  generalDirectorProfile: text("general_director_profile"),
  artisticDirectorProfile: text("artistic_director_profile"),
  lang: integer("lang").references(() => LanguagesProd.id),
  groupId: integer("group_id").references(() => GroupsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const EventsToGroupsProd = cioffSchema.table("EventsToGroups", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => EventsProd.id),
  groupId: integer("group_id").references(() => GroupsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const CountriesLangProd = cioffSchema.table("CountriesLang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  countryId: integer("country_id").references(() => CountriesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const NationalSectionProd = cioffSchema.table("NationalSection", {
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
  "NationalSectionLang",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    about: text("about").notNull(),
    aboutYoung: text("about_young").notNull(),
    nsId: integer("ns_id").references(() => NationalSectionProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const NationalSectionPositionsProd = cioffSchema.table(
  "NationalSectionPositions",
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
  "NationalSectionPositionsLang",
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
export const TimelineProd = cioffSchema.table("Timeline", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  videoId: text("video_id"),
  mediaId: integer("media_id").references(() => StorageProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const TimelineLangProd = cioffSchema.table("TimelineLang", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  timelineId: integer("timeline_id").references(() => TimelineProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const DesignProd = cioffSchema.table("Design", {
  id: serial("id").primaryKey(),
  bannerMediaId: integer("banner_media_id")
    .references(() => StorageProd.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const MenuProd = cioffSchema.table("Menu", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  order: integer("order"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const MenuLangProd = cioffSchema.table("MenuLang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  lang: integer("lang").references(() => LanguagesProd.id),
  menuId: integer("menu_id").references(() => MenuProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const SubPagesProd = cioffSchema.table("SubPages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  url: text("url").notNull(),
  idNews: boolean("is_news").default(false),
  originalDate: timestamp("original_date", { mode: "date" }).notNull(),
  published: boolean("published").default(false),
  createdBy: integer("created_by").references(() => UsersProd.id),
  updatedBy: integer("updated_by").references(() => UsersProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const SubPagesDocsProd = cioffSchema.table("SubPagesDocs", {
  id: serial("id").primaryKey(),
  order: integer("order").notNull(),
  subPageId: integer("subpage_id").references(() => SubPagesProd.id),
  mediaId: integer("media_id").references(() => StorageProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const SubPagesTextsLangProd = cioffSchema.table("SubPagesTextsLang", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  subPageId: integer("subpage_id").references(() => SubPagesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const EmailsProd = cioffSchema.table("Emails", {
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
export const EmailsDocsProd = cioffSchema.table("EmailsDocs", {
  id: serial("id").primaryKey(),
  emailId: integer("email_id").references(() => EmailsProd.id),
  mediaId: integer("media_id").references(() => StorageProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
