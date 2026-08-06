ALTER TABLE `student_profiles` ADD `holdStatus` enum('active','held') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `holdReason` text;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `heldAt` timestamp;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `heldBy` varchar(128);--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `createdByAdmin` enum('yes','no') DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE `tutor_profiles` ADD `holdStatus` enum('active','held') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `tutor_profiles` ADD `holdReason` text;--> statement-breakpoint
ALTER TABLE `tutor_profiles` ADD `heldAt` timestamp;--> statement-breakpoint
ALTER TABLE `tutor_profiles` ADD `heldBy` varchar(128);--> statement-breakpoint
ALTER TABLE `tutor_profiles` ADD `createdByAdmin` enum('yes','no') DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `holdStatus` enum('active','held') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `holdReason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `heldAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `heldBy` varchar(128);