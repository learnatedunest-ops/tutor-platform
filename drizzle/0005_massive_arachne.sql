CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerName` varchar(128) NOT NULL,
	`referrerEmail` varchar(320) NOT NULL,
	`referrerPhone` varchar(20),
	`refereeName` varchar(128) NOT NULL,
	`refereeEmail` varchar(320) NOT NULL,
	`refereePhone` varchar(20),
	`referralCode` varchar(16) NOT NULL,
	`status` enum('pending','joined','rewarded') NOT NULL DEFAULT 'pending',
	`discountApplied` enum('yes','no') NOT NULL DEFAULT 'no',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
ALTER TABLE `tutors` MODIFY COLUMN `rating` varchar(8) NOT NULL DEFAULT '4.5';