CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`role` enum('student','parent','tutor','institution') NOT NULL,
	`subject` varchar(128),
	`area` varchar(128),
	`message` text NOT NULL,
	`status` enum('new','contacted','resolved') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tutor_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`qualification` varchar(256) NOT NULL,
	`subjects` varchar(512) NOT NULL,
	`experience` varchar(64) NOT NULL,
	`area` varchar(128) NOT NULL,
	`mode` enum('home_tuition','online','both') NOT NULL,
	`about` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tutor_applications_id` PRIMARY KEY(`id`)
);
