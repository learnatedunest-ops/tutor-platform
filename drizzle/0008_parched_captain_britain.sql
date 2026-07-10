CREATE TABLE `tutor_interests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tutorProfileId` int NOT NULL,
	`studentProfileId` int NOT NULL,
	`message` text,
	`status` enum('pending','accepted','declined') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tutor_interests_id` PRIMARY KEY(`id`)
);
