CREATE TYPE "public"."bet_status" AS ENUM('PENDING', 'HIT', 'LOST', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('SCHEDULED', 'ACTIVE', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."horse_origin" AS ENUM('DOMESTIC', 'FOREIGN_BRED', 'FOREIGN_TRAINED');--> statement-breakpoint
CREATE TYPE "public"."horse_type" AS ENUM('REAL', 'FICTIONAL');--> statement-breakpoint
CREATE TYPE "public"."race_entry_status" AS ENUM('ENTRANT', 'SCRATCHED', 'EXCLUDED');--> statement-breakpoint
CREATE TYPE "public"."race_grade" AS ENUM('G1', 'G2', 'G3', 'L', 'OP', '3_WIN', '2_WIN', '1_WIN', 'MAIDEN', 'NEWCOMER');--> statement-breakpoint
CREATE TYPE "public"."race_status" AS ENUM('SCHEDULED', 'CLOSED', 'FINALIZED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."race_type" AS ENUM('REAL', 'FICTIONAL');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN', 'GUEST', 'TIPSTER', 'AI_TIPSTER', 'AI_USER');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('DISTRIBUTION', 'BET', 'PAYOUT', 'REFUND', 'ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."venue_direction" AS ENUM('LEFT', 'RIGHT', 'STRAIGHT');--> statement-breakpoint
CREATE TABLE "account" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "bet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"race_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"details" jsonb NOT NULL,
	"amount" bigint NOT NULL,
	"odds" numeric,
	"payout" bigint,
	"status" "bet_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"distribute_amount" bigint NOT NULL,
	"status" "event_status" DEFAULT 'SCHEDULED' NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest_code" (
	"code" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_by" text NOT NULL,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "horse_tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"horse_id" uuid NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "horse_win" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"horse_id" uuid NOT NULL,
	"race_instance_id" uuid,
	"race_definition_id" uuid,
	"title" text NOT NULL,
	"date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "horse" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"gender" text NOT NULL,
	"age" integer,
	"type" "horse_type" DEFAULT 'REAL' NOT NULL,
	"origin" "horse_origin" DEFAULT 'DOMESTIC' NOT NULL,
	"notes" text,
	"sire_id" uuid,
	"dam_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payout_result" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"race_id" uuid NOT NULL,
	"type" text NOT NULL,
	"combinations" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "race_definition" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"grade" "race_grade" NOT NULL,
	"type" "race_type" DEFAULT 'REAL' NOT NULL,
	"default_distance" integer NOT NULL,
	"default_venue_id" uuid NOT NULL,
	"default_surface" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "race_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"race_id" uuid NOT NULL,
	"horse_id" uuid NOT NULL,
	"bracket_number" integer,
	"horse_number" integer,
	"jockey" text,
	"weight" integer,
	"finish_position" integer,
	"status" "race_entry_status" DEFAULT 'ENTRANT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "race_instance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"race_definition_id" uuid,
	"event_id" uuid NOT NULL,
	"date" date NOT NULL,
	"venue_id" uuid NOT NULL,
	"location" text,
	"name" text NOT NULL,
	"race_number" integer,
	"distance" integer NOT NULL,
	"surface" text NOT NULL,
	"condition" text,
	"grade" "race_grade",
	"type" "race_type" DEFAULT 'REAL' NOT NULL,
	"status" "race_status" DEFAULT 'SCHEDULED' NOT NULL,
	"closing_at" timestamp with time zone,
	"finalized_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" bigint NOT NULL,
	"reference_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp with time zone,
	"image" text,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"guest_code_id" text,
	"password" text,
	"is_onboarding_completed" boolean DEFAULT false NOT NULL,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "venue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"direction" "venue_direction" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "wallet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"event_id" uuid NOT NULL,
	"balance" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bet" ADD CONSTRAINT "bet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bet" ADD CONSTRAINT "bet_race_id_race_instance_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."race_instance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bet" ADD CONSTRAINT "bet_wallet_id_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_code" ADD CONSTRAINT "guest_code_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horse_tag" ADD CONSTRAINT "horse_tag_horse_id_horse_id_fk" FOREIGN KEY ("horse_id") REFERENCES "public"."horse"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horse_win" ADD CONSTRAINT "horse_win_horse_id_horse_id_fk" FOREIGN KEY ("horse_id") REFERENCES "public"."horse"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horse_win" ADD CONSTRAINT "horse_win_race_instance_id_race_instance_id_fk" FOREIGN KEY ("race_instance_id") REFERENCES "public"."race_instance"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horse_win" ADD CONSTRAINT "horse_win_race_definition_id_race_definition_id_fk" FOREIGN KEY ("race_definition_id") REFERENCES "public"."race_definition"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_result" ADD CONSTRAINT "payout_result_race_id_race_instance_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."race_instance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_definition" ADD CONSTRAINT "race_definition_default_venue_id_venue_id_fk" FOREIGN KEY ("default_venue_id") REFERENCES "public"."venue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_entry" ADD CONSTRAINT "race_entry_race_id_race_instance_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."race_instance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_entry" ADD CONSTRAINT "race_entry_horse_id_horse_id_fk" FOREIGN KEY ("horse_id") REFERENCES "public"."horse"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_instance" ADD CONSTRAINT "race_instance_race_definition_id_race_definition_id_fk" FOREIGN KEY ("race_definition_id") REFERENCES "public"."race_definition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_instance" ADD CONSTRAINT "race_instance_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_instance" ADD CONSTRAINT "race_instance_venue_id_venue_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_wallet_id_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transaction_reference_idx" ON "transaction" USING btree ("reference_id");