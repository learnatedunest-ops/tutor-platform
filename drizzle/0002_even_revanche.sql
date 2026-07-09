CREATE TABLE `demo_bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tutorName` varchar(128) NOT NULL,
	`tutorSubject` varchar(128) NOT NULL,
	`studentName` varchar(128) NOT NULL,
	`studentEmail` varchar(320) NOT NULL,
	`studentPhone` varchar(20) NOT NULL,
	`grade` varchar(64) NOT NULL,
	`subject` varchar(128) NOT NULL,
	`preferredDate` varchar(32) NOT NULL,
	`preferredTime` varchar(32) NOT NULL,
	`mode` enum('home_tuition','online') NOT NULL,
	`message` text,
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `demo_bookings_id` PRIMARY KEY(`id`)
);
