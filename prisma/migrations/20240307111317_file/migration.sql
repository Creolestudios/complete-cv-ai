-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "file_id" TEXT NOT NULL,
    "candidateFile_name" TEXT NOT NULL,
    "user_url" TEXT NOT NULL,
    "_url" TEXT NOT NULL,
    "zipUrl" TEXT NOT NULL,
    "lastsaved" TIMESTAMP(3) NOT NULL,
    "templateId" TEXT NOT NULL,
    "dashTableId" INTEGER NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_dashTableId_fkey" FOREIGN KEY ("dashTableId") REFERENCES "DashTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
