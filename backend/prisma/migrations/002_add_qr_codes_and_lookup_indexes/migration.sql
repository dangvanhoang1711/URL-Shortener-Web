CREATE TABLE `qr_codes` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `urlId` INTEGER NOT NULL,
  `imageData` MEDIUMTEXT NOT NULL,
  `contentType` VARCHAR(50) NOT NULL DEFAULT 'image/png',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `qr_codes_urlId_key` (`urlId`),
  INDEX `qr_codes_createdAt_idx` (`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `urls_clickCount_createdAt_idx` ON `urls`(`clickCount`, `createdAt`);
CREATE INDEX `urls_lastClickedAt_idx` ON `urls`(`lastClickedAt`);

ALTER TABLE `qr_codes`
  ADD CONSTRAINT `qr_codes_urlId_fkey`
  FOREIGN KEY (`urlId`) REFERENCES `urls`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
