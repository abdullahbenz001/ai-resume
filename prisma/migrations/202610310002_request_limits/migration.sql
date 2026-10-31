CREATE TABLE "rate_limits" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "count" INTEGER NOT NULL,
  "window_start" TIMESTAMP(3) NOT NULL
);
