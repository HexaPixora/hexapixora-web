-- CreateTable
CREATE TABLE "ThemePack" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "manifest" JSONB NOT NULL,
    "sourceCss" TEXT NOT NULL DEFAULT '',
    "css" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemePack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeAsset" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "bytes" BYTEA NOT NULL,

    CONSTRAINT "ThemeAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ThemePack_isActive_idx" ON "ThemePack"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ThemePack_slug_version_key" ON "ThemePack"("slug", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ThemeAsset_packId_path_key" ON "ThemeAsset"("packId", "path");

-- AddForeignKey
ALTER TABLE "ThemeAsset" ADD CONSTRAINT "ThemeAsset_packId_fkey" FOREIGN KEY ("packId") REFERENCES "ThemePack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
