ALTER TABLE `demo_slots` ADD `tutorConfirmedComing` enum('yes','no','pending') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `student_demo_interests` DROP COLUMN `adminApprovalStatus`;--> statement-breakpoint
ALTER TABLE `tutor_interests` DROP COLUMN `adminApprovalStatus`;