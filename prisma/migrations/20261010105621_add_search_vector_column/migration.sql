-- AlterTable
ALTER TABLE "User" ADD COLUMN     "searchVector" tsvector;

CREATE INDEX "User_searchVector_idx"
ON "User" USING GIN ("searchVector");

-- function calculates the vector
CREATE FUNCTION update_user_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW."searchVector" =
    to_tsvector(
      'simple',
      coalesce(NEW.username, '') || ' ' ||
      coalesce(NEW."displayName", '')
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger calls that function automatically
CREATE TRIGGER user_search_vector_trigger
BEFORE INSERT OR UPDATE OF username, "displayName"
ON "User"
FOR EACH ROW
EXECUTE FUNCTION update_user_search_vector();