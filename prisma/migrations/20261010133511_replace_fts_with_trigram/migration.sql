/*
  Warnings:

  - You are about to drop the column `searchVector` on the `User` table. All the data in the column will be lost.

*/

-- Drop the FTS triggers first.
DROP TRIGGER IF EXISTS user_search_vector_trigger ON "User";

-- Drop the FTS function only after no longer-needed
-- triggers depend on it.
DROP FUNCTION IF EXISTS update_user_search_vector();

-- Drop fts index
DROP INDEX "User_searchVector_idx";

-- Drop fts column
ALTER TABLE "User" DROP COLUMN "searchVector";