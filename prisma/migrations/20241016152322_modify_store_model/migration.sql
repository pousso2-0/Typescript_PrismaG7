-- DropIndex
DROP INDEX "Store_userId_key";

-- RenameForeignKey
ALTER TABLE "View" RENAME CONSTRAINT "FK_View_StatusViewer" TO "FK_View_User";

-- RenameForeignKey
ALTER TABLE "View" RENAME CONSTRAINT "FK_View_User" TO "FK_View_StatusViewer";
