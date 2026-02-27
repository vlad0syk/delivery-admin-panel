-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "tax_amount" DECIMAL(65,30) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "taxRateRegionId" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRateRegion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "composite_rate" DOUBLE PRECISION NOT NULL,
    "state_rate" DOUBLE PRECISION NOT NULL,
    "county_rate" DOUBLE PRECISION NOT NULL,
    "city_rate" DOUBLE PRECISION NOT NULL,
    "special_rate" DOUBLE PRECISION NOT NULL,
    "jurisdictions" TEXT[],

    CONSTRAINT "TaxRateRegion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_taxRateRegionId_fkey" FOREIGN KEY ("taxRateRegionId") REFERENCES "TaxRateRegion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
