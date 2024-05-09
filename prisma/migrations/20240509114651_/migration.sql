-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "announcementChannelId" TEXT NOT NULL,
    "paymentChannelId" TEXT NOT NULL,
    "discussionChannelId" TEXT NOT NULL
);
