-- AlterTable
ALTER TABLE "public"."user" ALTER COLUMN "emailVerified" SET DEFAULT false,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
