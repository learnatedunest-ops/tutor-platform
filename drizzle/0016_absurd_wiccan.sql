ALTER TABLE `demo_slots` ADD `tutorSuggestedDate` varchar(32);--> statement-breakpoint
ALTER TABLE `demo_slots` ADD `tutorSuggestedTime` varchar(32);--> statement-breakpoint
ALTER TABLE `demo_slots` ADD `parentRescheduleResponse` enum('accepted','declined');