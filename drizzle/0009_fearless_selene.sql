CREATE TABLE `student_demo_interests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentProfileId` int NOT NULL,
	`tutorProfileId` int NOT NULL,
	`message` text,
	`status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_demo_interests_id` PRIMARY KEY(`id`)
);
