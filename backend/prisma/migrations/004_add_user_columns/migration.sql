ALTER TABLE `users` ADD COLUMN `name` VARCHAR(191) NULL AFTER `password`;
ALTER TABLE `users` ADD COLUMN `image` TEXT NULL AFTER `name`;
ALTER TABLE `users` ADD COLUMN `provider` VARCHAR(50) NOT NULL DEFAULT 'credentials' AFTER `image`;
ALTER TABLE `users` ADD COLUMN `providerId` VARCHAR(191) NULL AFTER `provider`;
ALTER TABLE `users` ADD UNIQUE INDEX `users_providerId_key` (`providerId`);