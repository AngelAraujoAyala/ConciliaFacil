-- CreateEnum
CREATE TYPE "AppTheme" AS ENUM ('light', 'dark', 'system');

-- CreateTable
CREATE TABLE "user_preferences" (
    "userId" TEXT NOT NULL,
    "theme" "AppTheme" NOT NULL DEFAULT 'light',
    "timezone" TEXT NOT NULL DEFAULT 'America/Mexico_City',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "defaultRfc" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
