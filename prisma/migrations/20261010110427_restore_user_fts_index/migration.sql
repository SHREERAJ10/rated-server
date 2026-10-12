-- CreateIndex
CREATE INDEX "User_searchVector_idx" ON "User" USING GIN ("searchVector");
