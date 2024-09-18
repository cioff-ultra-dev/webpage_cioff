ALTER TABLE "users" RENAME TO "user";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "provider_account_id" TO "providerAccountId";--> statement-breakpoint
ALTER TABLE "authenticator" RENAME COLUMN "credential_id" TO "credentialID";--> statement-breakpoint
ALTER TABLE "authenticator" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "authenticator" RENAME COLUMN "provider_account_id" TO "providerAccountId";--> statement-breakpoint
ALTER TABLE "authenticator" RENAME COLUMN "credential_public_key" TO "credentialPublicKey";--> statement-breakpoint
ALTER TABLE "authenticator" RENAME COLUMN "credential_device_type" TO "credentialDeviceType";--> statement-breakpoint
ALTER TABLE "authenticator" RENAME COLUMN "credential_backed_up" TO "credentialBackedUp";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "email_verified" TO "emailVerified";--> statement-breakpoint
ALTER TABLE "authenticator" DROP CONSTRAINT "authenticator_credential_id_unique";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "authenticator" DROP CONSTRAINT "authenticator_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_provider_provider_account_id_pk";--> statement-breakpoint
ALTER TABLE "authenticator" DROP CONSTRAINT "authenticator_user_id_credential_id_pk";--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId");--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");