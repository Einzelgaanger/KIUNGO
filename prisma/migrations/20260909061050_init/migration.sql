-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL,
    "entityId" TEXT,
    "nodeId" TEXT,
    "avatarSeed" TEXT NOT NULL DEFAULT 'k',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "parentId" TEXT,
    "lat" REAL,
    "lng" REAL,
    CONSTRAINT "Node_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Node" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradingName" TEXT,
    "registrationNo" TEXT,
    "category" TEXT NOT NULL,
    "subcategories" TEXT NOT NULL,
    "countyCode" TEXT NOT NULL,
    "ward" TEXT,
    "lat" REAL,
    "lng" REAL,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "sizeBand" TEXT NOT NULL,
    "ownershipTags" TEXT NOT NULL,
    "yearEstablished" INTEGER,
    "description" TEXT,
    "verification" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "reliability" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "scheme" TEXT NOT NULL,
    "class" TEXT,
    "number" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'VERIFIED',
    "lastCheckedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceUrl" TEXT,
    CONSTRAINT "Certification_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "since" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "volume" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Relationship_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relationship_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Programme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "owner" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "countyCode" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "geofenceM" INTEGER NOT NULL DEFAULT 500,
    "unitsPlanned" INTEGER NOT NULL,
    "unitsComplete" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME NOT NULL,
    "targetAt" DATETIME NOT NULL,
    CONSTRAINT "Site_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Site_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ref" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "awardedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "Contract_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContractLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantityTotal" REAL NOT NULL,
    "quantityClaimed" REAL NOT NULL DEFAULT 0,
    "unitRate" INTEGER NOT NULL,
    CONSTRAINT "ContractLine_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ref" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "contractLineId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "note" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "submittedLat" REAL NOT NULL,
    "submittedLng" REAL NOT NULL,
    "resolvedNodeId" TEXT,
    "driftMeters" INTEGER,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flowVersion" TEXT NOT NULL DEFAULT 'housing.delivery.v1',
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    CONSTRAINT "Claim_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Claim_contractLineId_fkey" FOREIGN KEY ("contractLineId") REFERENCES "ContractLine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Claim_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Claim_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Claim_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "claimId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "exifLat" REAL,
    "exifLng" REAL,
    "capturedAt" DATETIME,
    "deviceHint" TEXT,
    CONSTRAINT "Evidence_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EdgeCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "claimId" TEXT NOT NULL,
    "check" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "detail" TEXT NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EdgeCheck_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "claimId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "comment" TEXT,
    "decidedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ValueOutcome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "claimId" TEXT NOT NULL,
    "proofSetHash" TEXT NOT NULL,
    "baseAmount" INTEGER NOT NULL,
    "qualityMultiplier" REAL NOT NULL,
    "grossAmount" INTEGER NOT NULL,
    "supplierShare" INTEGER NOT NULL,
    "platformShare" INTEGER NOT NULL,
    "welfareShare" INTEGER NOT NULL,
    "policyVersion" TEXT NOT NULL DEFAULT 'housing.tariff.v1',
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ValueOutcome_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "valueOutcomeId" TEXT NOT NULL,
    "instrument" TEXT NOT NULL DEFAULT 'MPESA_B2C',
    "reference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SETTLED',
    "settledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Settlement_valueOutcomeId_fkey" FOREIGN KEY ("valueOutcomeId") REFERENCES "ValueOutcome" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "countyCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reservedFor" TEXT NOT NULL,
    "valueEst" INTEGER,
    "closesAt" DATETIME NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FinanceProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerName" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "minAmount" INTEGER NOT NULL,
    "maxAmount" INTEGER NOT NULL,
    "ratePctAnnual" REAL NOT NULL,
    "tenorMonths" INTEGER NOT NULL,
    "minReliability" INTEGER NOT NULL DEFAULT 0,
    "requiresVerified" BOOLEAN NOT NULL DEFAULT true,
    "blurb" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FinanceApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinanceApplication_productId_fkey" FOREIGN KEY ("productId") REFERENCES "FinanceProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FinanceApplication_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "countyCode" TEXT NOT NULL,
    "weekOf" DATETIME NOT NULL,
    "medianRate" INTEGER NOT NULL,
    "sampleSize" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Node_code_key" ON "Node"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_slug_key" ON "Entity"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Programme_code_key" ON "Programme"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Site_slug_key" ON "Site"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_ref_key" ON "Contract"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_ref_key" ON "Claim"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "ValueOutcome_claimId_key" ON "ValueOutcome"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "Settlement_valueOutcomeId_key" ON "Settlement"("valueOutcomeId");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_ref_key" ON "Opportunity"("ref");

-- CreateIndex
CREATE INDEX "MaterialPrice_itemCode_weekOf_idx" ON "MaterialPrice"("itemCode", "weekOf");
