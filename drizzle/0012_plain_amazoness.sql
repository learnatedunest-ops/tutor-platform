CREATE TABLE `session_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`tutorProfileId` int NOT NULL,
	`studentProfileId` int NOT NULL,
	`tutorName` varchar(128),
	`studentName` varchar(128),
	`uploadedSheetUrl` text,
	`uploadedAt` timestamp,
	`paymentStatus` enum('pending','sheet_uploaded','payment_processed') NOT NULL DEFAULT 'pending',
	`adminApprovedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `session_logs_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_logs_matchId_unique` UNIQUE(`matchId`)
);
