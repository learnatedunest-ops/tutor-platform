ALTER TABLE `demo_slots` MODIFY COLUMN `mode` enum('home_tuition','online','both') NOT NULL DEFAULT 'online';--> statement-breakpoint
ALTER TABLE `confirmed_matches` ADD `paymentAmount` varchar(64);--> statement-breakpoint
ALTER TABLE `demo_slots` ADD `interestDirection` enum('tutor_to_student','student_to_tutor') DEFAULT 'student_to_tutor' NOT NULL;--> statement-breakpoint
ALTER TABLE `demo_slots` ADD `parentAccepted` enum('yes','no','pending') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `student_demo_interests` ADD `adminApprovalStatus` enum('pending_admin','admin_approved','admin_rejected') DEFAULT 'pending_admin' NOT NULL;--> statement-breakpoint
ALTER TABLE `tutor_interests` ADD `adminApprovalStatus` enum('pending_admin','admin_approved','admin_rejected') DEFAULT 'pending_admin' NOT NULL;