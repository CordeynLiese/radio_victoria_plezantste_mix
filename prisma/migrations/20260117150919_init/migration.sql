-- CreateTable
CREATE TABLE "songs" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteItem" (
    "voteId" INTEGER NOT NULL,
    "songId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "VoteItem_pkey" PRIMARY KEY ("voteId","songId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_email_key" ON "Vote"("email");

-- CreateIndex
CREATE INDEX "VoteItem_songId_idx" ON "VoteItem"("songId");

-- CreateIndex
CREATE UNIQUE INDEX "VoteItem_voteId_rank_key" ON "VoteItem"("voteId", "rank");

-- AddForeignKey
ALTER TABLE "VoteItem" ADD CONSTRAINT "VoteItem_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteItem" ADD CONSTRAINT "VoteItem_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
