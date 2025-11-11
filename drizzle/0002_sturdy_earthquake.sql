CREATE TABLE `product_image` (
	`id` text PRIMARY KEY NOT NULL,
	`productId` text NOT NULL,
	`url` text NOT NULL,
	`isMain` integer DEFAULT false,
	`order` integer DEFAULT 0,
	`createdAt` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `product` DROP COLUMN `image`;