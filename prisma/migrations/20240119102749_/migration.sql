-- CreateTable
CREATE TABLE "DashTable" (
    "id" SERIAL NOT NULL,
    "ProjectName" TEXT NOT NULL,
    "TemplateId" TEXT NOT NULL,
    "LastSaved" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "DashTable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DashTable" ADD CONSTRAINT "DashTable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
