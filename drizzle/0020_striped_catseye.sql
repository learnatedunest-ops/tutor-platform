ALTER TABLE `demo_slots` ADD `demoCancelledBy` enum('parent');--> statement-breakpoint
ALTER TABLE `demo_slots` ADD `demoCancelledAt` timestamp;--> statement-breakpoint
ALTER TABLE `demo_slots` ADD `demoCancellationFeeCleared` boolean DEFAULT false NOT NULL;