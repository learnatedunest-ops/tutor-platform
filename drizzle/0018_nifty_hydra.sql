ALTER TABLE `confirmed_matches` ADD `cancellationRequestedBy` enum('tutor','parent');--> statement-breakpoint
ALTER TABLE `confirmed_matches` ADD `cancellationRequestedAt` timestamp;--> statement-breakpoint
ALTER TABLE `confirmed_matches` ADD `cancellationNote` text;