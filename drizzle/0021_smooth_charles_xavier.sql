CREATE TABLE `smart_pair_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tutorProfileId` int NOT NULL,
	`studentProfileId` int NOT NULL,
	`contactedAt` timestamp NOT NULL DEFAULT (now()),
	`contactedBy` varchar(128),
	`notes` text,
	`tutorEmailSentAt` timestamp,
	`studentEmailSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `smart_pair_contacts_id` PRIMARY KEY(`id`)
);
