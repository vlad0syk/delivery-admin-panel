-- CreateEnum
CREATE TYPE "JurisdictionType" AS ENUM ('state', 'county', 'city', 'special');

-- CreateTable
CREATE TABLE "Jurisdiction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "JurisdictionType" NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "taxRateRegionId" TEXT NOT NULL,

    CONSTRAINT "Jurisdiction_pkey" PRIMARY KEY ("id")
);

-- Backfill jurisdictions from existing tax rates.
INSERT INTO "Jurisdiction" ("id", "name", "type", "rate", "taxRateRegionId")
SELECT CONCAT("id", '-state'), 'New York State', 'state'::"JurisdictionType", "state_rate", "id"
FROM "TaxRateRegion";

INSERT INTO "Jurisdiction" ("id", "name", "type", "rate", "taxRateRegionId")
SELECT CONCAT("id", '-county'), CONCAT("name", ' County'), 'county'::"JurisdictionType", "county_rate", "id"
FROM "TaxRateRegion";

INSERT INTO "Jurisdiction" ("id", "name", "type", "rate", "taxRateRegionId")
SELECT CONCAT("id", '-city'), CONCAT("name", ' City'), 'city'::"JurisdictionType", "city_rate", "id"
FROM "TaxRateRegion"
WHERE "city_rate" > 0;

INSERT INTO "Jurisdiction" ("id", "name", "type", "rate", "taxRateRegionId")
SELECT
    CONCAT("id", '-special'),
    'Metropolitan Commuter Transportation District',
    'special'::"JurisdictionType",
    "special_rate",
    "id"
FROM "TaxRateRegion"
WHERE "special_rate" > 0;

-- CreateIndex
CREATE INDEX "Jurisdiction_taxRateRegionId_idx" ON "Jurisdiction"("taxRateRegionId");

-- CreateIndex
CREATE UNIQUE INDEX "Jurisdiction_taxRateRegionId_type_name_key" ON "Jurisdiction"("taxRateRegionId", "type", "name");

-- AddForeignKey
ALTER TABLE "Jurisdiction" ADD CONSTRAINT "Jurisdiction_taxRateRegionId_fkey" FOREIGN KEY ("taxRateRegionId") REFERENCES "TaxRateRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop legacy column.
ALTER TABLE "TaxRateRegion" DROP COLUMN "jurisdictions";
