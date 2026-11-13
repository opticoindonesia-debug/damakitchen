CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('catering','gifting','corporate','general') NOT NULL,
	`name` varchar(160),
	`company` varchar(160),
	`email` varchar(190),
	`phone` varchar(40),
	`data` json NOT NULL,
	`page_path` varchar(255),
	`source` json,
	`status` enum('new','contacted','quoted','won','lost','spam') NOT NULL DEFAULT 'new',
	`note` text,
	`ip_hash` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `articles` ADD `short_answer` text;--> statement-breakpoint
ALTER TABLE `articles` ADD `sources` json;--> statement-breakpoint
ALTER TABLE `articles` ADD `related_products` json;--> statement-breakpoint
ALTER TABLE `products` ADD `ingredients` text;--> statement-breakpoint
ALTER TABLE `products` ADD `serving` varchar(160);--> statement-breakpoint
ALTER TABLE `products` ADD `storage` text;--> statement-breakpoint
ALTER TABLE `products` ADD `preparation` text;--> statement-breakpoint
CREATE INDEX `inquiries_status_idx` ON `inquiries` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `inquiries_ip_idx` ON `inquiries` (`ip_hash`,`created_at`);