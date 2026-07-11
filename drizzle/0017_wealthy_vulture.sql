ALTER TABLE `session_logs` MODIFY COLUMN `paymentStatus` enum('pending','sheet_uploaded','parent_paid','payment_processed') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `session_logs` ADD `parentPaid` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `session_logs` ADD `parentPaidAt` timestamp;--> statement-breakpoint
ALTER TABLE `session_logs` ADD `parentPaymentNote` varchar(256);--> statement-breakpoint
ALTER TABLE `tutor_profiles` ADD `upiId` varchar(64);