CREATE TABLE `session_log_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionLogId` int NOT NULL,
	`sessionDate` varchar(32) NOT NULL,
	`duration` varchar(64) NOT NULL,
	`topicsCovered` text NOT NULL,
	`homeworkNotes` text,
	`tutorNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `session_log_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `session_logs` ADD `onlineSubmittedAt` timestamp;