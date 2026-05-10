-- Rename old qr_codes columns to match QRCode model
ALTER TABLE `qr_codes` ADD COLUMN `qrData` LONGTEXT AFTER `urlId`;
ALTER TABLE `qr_codes` ADD COLUMN `format` VARCHAR(50) NOT NULL DEFAULT 'png' AFTER `qrData`;
ALTER TABLE `qr_codes` ADD COLUMN `size` INT NOT NULL DEFAULT 300 AFTER `format`;

UPDATE `qr_codes` SET `qrData` = `imageData`, `format` = 'png', `size` = 300 WHERE `imageData` IS NOT NULL;

ALTER TABLE `qr_codes` DROP COLUMN `imageData`;
ALTER TABLE `qr_codes` DROP COLUMN `contentType`;