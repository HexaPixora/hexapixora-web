-- Drop the unused agency content tables (Service, Portfolio, TeamMember, Faq).
-- All four were empty in production on 2026-10-28 and had no admin screens.
-- Guard: abort instead of dropping anything if a table has gained rows since.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Service")
     OR EXISTS (SELECT 1 FROM "Portfolio")
     OR EXISTS (SELECT 1 FROM "TeamMember")
     OR EXISTS (SELECT 1 FROM "Faq") THEN
    RAISE EXCEPTION 'drop_agency_content: a table is not empty; back it up and empty it first';
  END IF;
END $$;

-- DropTable
DROP TABLE "Service";

-- DropTable
DROP TABLE "Portfolio";

-- DropTable
DROP TABLE "TeamMember";

-- DropTable
DROP TABLE "Faq";
