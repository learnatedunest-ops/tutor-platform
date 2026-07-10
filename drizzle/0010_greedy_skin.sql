CREATE TABLE `demo_slots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentDemoInterestId` int NOT NULL,
	`studentProfileId` int NOT NULL,
	`tutorProfileId` int NOT NULL,
	`scheduledDate` varchar(32),
	`scheduledTime` varchar(32),
	`mode` enum('home_tuition','online') NOT NULL DEFAULT 'online',
	`notes` text,
	`status` enum('pending_schedule','scheduled','completed','cancelled') NOT NULL DEFAULT 'pending_schedule',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `demo_slots_id` PRIMARY KEY(`id`),
	CONSTRAINT `demo_slots_studentDemoInterestId_unique` UNIQUE(`studentDemoInterestId`)
);
--> statement-breakpoint
CREATE TABLE `otp_verifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone` varchar(20) NOT NULL,
	`code` varchar(6) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`verified` enum('yes','no') NOT NULL DEFAULT 'no',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otp_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `phoneVerified` enum('yes','no') DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE `tutor_profiles` ADD `education` text;--> statement-breakpoint
ALTER TABLE `tutor_profiles` ADD `workExperience` text;--> statement-breakpoint
ALTER TABLE `tutor_profiles` ADD `phoneVerified` enum('yes','no') DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE `tutor_profiles` DROP COLUMN `demoTime`;--> statement-breakpoint
ALTER TABLE `tutor_profiles` DROP COLUMN `regularTime`;--> statement-breakpoint
ALTER TABLE `tutor_profiles` DROP COLUMN `sessionDuration`;--> statement-breakpoint
ALTER TABLE `tutor_profiles` DROP COLUMN `daysPerWeek`;--> statement-breakpoint
ALTER TABLE `tutor_profiles` DROP COLUMN `firstMonthFee`;--> statement-breakpoint
ALTER TABLE `tutor_profiles` DROP COLUMN `nextMonthFee`;