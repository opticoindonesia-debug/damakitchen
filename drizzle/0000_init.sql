CREATE TABLE `admin_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(190) NOT NULL,
	`name` varchar(120) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('owner','editor') NOT NULL DEFAULT 'editor',
	`is_active` boolean NOT NULL DEFAULT true,
	`last_login_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_email_uq` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `article_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `article_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `article_categories_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `article_tags` (
	`article_id` int NOT NULL,
	`tag_id` int NOT NULL,
	CONSTRAINT `article_tags_article_id_tag_id_pk` PRIMARY KEY(`article_id`,`tag_id`)
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`excerpt` text,
	`body_html` mediumtext NOT NULL,
	`featured_image` json,
	`author` varchar(120),
	`category_id` int,
	`published_at` datetime,
	`related_ids` json NOT NULL,
	`seo` json NOT NULL,
	`published` json,
	`published_slug` varchar(160),
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`has_changes` boolean NOT NULL DEFAULT true,
	`updated_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_uq` UNIQUE(`slug`),
	CONSTRAINT `articles_published_slug_uq` UNIQUE(`published_slug`)
);
--> statement-breakpoint
CREATE TABLE `brand_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kind` enum('pillar','value') NOT NULL,
	`title` varchar(160) NOT NULL,
	`body` text NOT NULL,
	`icon` varchar(40),
	`visible` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brand_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` varchar(300) NOT NULL,
	`answer` text NOT NULL,
	`group_key` varchar(60) NOT NULL DEFAULT 'umum',
	`visible` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ip` varchar(64) NOT NULL,
	`email` varchar(190) NOT NULL,
	`success` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `login_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storage_key` varchar(160) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`mime` varchar(80) NOT NULL,
	`kind` enum('image','document') NOT NULL,
	`size` int NOT NULL,
	`width` int,
	`height` int,
	`variants` json NOT NULL,
	`storage` enum('database','filesystem') NOT NULL,
	`checksum` varchar(64) NOT NULL,
	`alt` varchar(300) NOT NULL DEFAULT '',
	`description` text,
	`folder` varchar(80) NOT NULL DEFAULT '',
	`version` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_key_uq` UNIQUE(`storage_key`)
);
--> statement-breakpoint
CREATE TABLE `media_blobs` (
	`media_id` int NOT NULL,
	`variant` varchar(16) NOT NULL,
	`mime` varchar(80) NOT NULL,
	`size` int NOT NULL,
	`data` longblob NOT NULL,
	CONSTRAINT `media_blobs_media_id_variant_pk` PRIMARY KEY(`media_id`,`variant`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`builtin_key` varchar(32),
	`title` varchar(200) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`draft` json NOT NULL,
	`published` json,
	`published_slug` varchar(160),
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`has_changes` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`published_at` datetime,
	`updated_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_builtin_uq` UNIQUE(`builtin_key`),
	CONSTRAINT `pages_slug_uq` UNIQUE(`slug`),
	CONSTRAINT `pages_published_slug_uq` UNIQUE(`published_slug`)
);
--> statement-breakpoint
CREATE TABLE `product_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_categories_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`name` varchar(160) NOT NULL,
	`sub_brand_id` int,
	`category_id` int,
	`blurb` varchar(400) NOT NULL DEFAULT '',
	`description` text,
	`price` int,
	`price_note` varchar(120),
	`availability` enum('available','preorder','seasonal','unavailable') NOT NULL DEFAULT 'available',
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`image` json,
	`gallery` json NOT NULL,
	`info` json NOT NULL,
	`image_category` varchar(20) NOT NULL DEFAULT 'food',
	`order_links` json NOT NULL,
	`seo` json NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `redirects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`from_path` varchar(255) NOT NULL,
	`to_path` varchar(500) NOT NULL,
	`status_code` int NOT NULL DEFAULT 301,
	`note` varchar(200),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `redirects_id` PRIMARY KEY(`id`),
	CONSTRAINT `redirects_from_uq` UNIQUE(`from_path`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`user_id` int NOT NULL,
	`expires_at` datetime NOT NULL,
	`ip` varchar(64),
	`user_agent` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` varchar(40) NOT NULL,
	`draft` json NOT NULL,
	`published` json,
	`has_changes` boolean NOT NULL DEFAULT false,
	`published_at` datetime,
	`updated_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `sub_brands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(60) NOT NULL,
	`name` varchar(120) NOT NULL,
	`short_name` varchar(60) NOT NULL,
	`emotion` varchar(60) NOT NULL,
	`lead` text NOT NULL,
	`about` text NOT NULL,
	`how_to_order` text NOT NULL,
	`channel_note` text,
	`marker_hex` varchar(7) NOT NULL,
	`hero_image` json,
	`channels` json NOT NULL,
	`faqs` json NOT NULL,
	`cross_sell` json NOT NULL,
	`extra_sections` json NOT NULL,
	`seo` json NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sub_brands_id` PRIMARY KEY(`id`),
	CONSTRAINT `sub_brands_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `tags_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`context` varchar(160) NOT NULL DEFAULT '',
	`quote` text NOT NULL,
	`visible` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `article_tags` ADD CONSTRAINT `article_tags_article_id_articles_id_fk` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `article_tags` ADD CONSTRAINT `article_tags_tag_id_tags_id_fk` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_category_id_article_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `article_categories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_blobs` ADD CONSTRAINT `media_blobs_media_id_media_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_sub_brand_id_sub_brands_id_fk` FOREIGN KEY (`sub_brand_id`) REFERENCES `sub_brands`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_product_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_admin_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `admin_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `article_tags_tag_idx` ON `article_tags` (`tag_id`);--> statement-breakpoint
CREATE INDEX `articles_status_idx` ON `articles` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `brand_items_kind_idx` ON `brand_items` (`kind`,`sort_order`);--> statement-breakpoint
CREATE INDEX `faqs_group_idx` ON `faqs` (`group_key`,`sort_order`);--> statement-breakpoint
CREATE INDEX `login_attempts_ip_idx` ON `login_attempts` (`ip`,`created_at`);--> statement-breakpoint
CREATE INDEX `login_attempts_email_idx` ON `login_attempts` (`email`,`created_at`);--> statement-breakpoint
CREATE INDEX `media_folder_idx` ON `media` (`folder`);--> statement-breakpoint
CREATE INDEX `media_created_idx` ON `media` (`created_at`);--> statement-breakpoint
CREATE INDEX `pages_status_idx` ON `pages` (`status`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`,`sort_order`);--> statement-breakpoint
CREATE INDEX `products_sub_brand_idx` ON `products` (`sub_brand_id`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_idx` ON `sessions` (`expires_at`);