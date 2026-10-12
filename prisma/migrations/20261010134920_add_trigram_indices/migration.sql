-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User" USING GIN ("username" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "User_displayName_idx" ON "User" USING GIN ("displayName" gin_trgm_ops);
