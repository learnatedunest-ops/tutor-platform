CREATE TABLE `confirmed_matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`demoSlotId` int NOT NULL,
	`tutorProfileId` int NOT NULL,
	`studentProfileId` int NOT NULL,
	`tutorName` varchar(128),
	`tutorEmail` varchar(320),
	`tutorPhone` varchar(20),
	`studentName` varchar(128),
	`studentEmail` varchar(320),
	`studentPhone` varchar(20),
	`studentArea` varchar(128),
	`studentGrade` varchar(64),
	`studentSubjects` text,
	`matchedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `confirmed_matches_id` PRIMARY KEY(`id`),
	CONSTRAINT `confirmed_matches_demoSlotId_unique` UNIQUE(`demoSlotId`)
);
--> statement-breakpoint
ALTER TABLE `demo_slots` ADD `tutorProceedIntent` enum('yes','no');--> statement-breakpoint
ALTER TABLE `demo_slots` ADD `studentProceedIntent` enum('yes','no');