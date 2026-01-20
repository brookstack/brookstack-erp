-- -------------------------------------------------------------
-- TablePlus 6.8.0(654)
--
-- https://tableplus.com/
--
-- Database: brooksta_erp
-- Generation Time: 2026-01-20 19:42:07.7720
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


DROP TABLE IF EXISTS `billing`;
CREATE TABLE `billing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doc_no` varchar(50) NOT NULL,
  `type` enum('invoice','quotation') NOT NULL,
  `client_id` int NOT NULL,
  `currency` char(3) DEFAULT 'KES',
  `subtotal` decimal(15,2) NOT NULL DEFAULT '0.00',
  `vat_total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `grand_total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `notes` text,
  `services` longtext,
  `status` varchar(20) DEFAULT 'unpaid',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `total_paid` decimal(15,2) NOT NULL DEFAULT '0.00',
  `outstanding_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `doc_no` (`doc_no`),
  KEY `fk_billing_client` (`client_id`),
  CONSTRAINT `fk_billing_client` FOREIGN KEY (`client_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyName` varchar(255) NOT NULL,
  `clientType` varchar(100) DEFAULT NULL,
  `contactPerson` varchar(255) DEFAULT NULL,
  `mobile` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `building` varchar(255) DEFAULT NULL,
  `serviceCategory` varchar(100) DEFAULT NULL,
  `engagementType` varchar(100) DEFAULT NULL,
  `description` text,
  `accountManager` varchar(100) DEFAULT NULL,
  `status` enum('lead','active','inactive') DEFAULT 'lead',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `expenses`;
CREATE TABLE `expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `expense_date` date NOT NULL,
  `description` text,
  `document_url` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'unpaid',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `billing_id` int NOT NULL,
  `payment_date` date NOT NULL,
  `amount_paid` decimal(15,2) NOT NULL,
  `balance_snapshot` decimal(15,2) DEFAULT NULL,
  `previous_paid_snapshot` decimal(15,2) DEFAULT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `transaction_reference` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `grand_total` decimal(15,2) DEFAULT '0.00',
  `total_received` decimal(15,2) DEFAULT '0.00',
  `outstanding_balance` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `fk_billing` (`billing_id`),
  CONSTRAINT `fk_billing` FOREIGN KEY (`billing_id`) REFERENCES `billing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `project_attachments`;
CREATE TABLE `project_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_attachment_project` (`project_id`),
  CONSTRAINT `fk_attachment_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `client_id` int NOT NULL,
  `lead_staff_id` int DEFAULT NULL,
  `project_type` varchar(255) NOT NULL,
  `status` varchar(100) DEFAULT 'Discovery',
  `project_url` varchar(255) DEFAULT NULL,
  `repo_url` varchar(255) DEFAULT NULL,
  `tech_stack` text,
  `notes` longtext,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_project_client` (`client_id`),
  KEY `fk_project_lead` (`lead_staff_id`),
  CONSTRAINT `fk_project_client` FOREIGN KEY (`client_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_project_lead` FOREIGN KEY (`lead_staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_name` text NOT NULL,
  `category` enum('Technical','Business','Meeting','Other') DEFAULT 'Other',
  `due_date` date NOT NULL,
  `owner` varchar(100) NOT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `billing` (`id`, `doc_no`, `type`, `client_id`, `currency`, `subtotal`, `vat_total`, `grand_total`, `notes`, `services`, `status`, `created_at`, `updated_at`, `total_paid`, `outstanding_balance`) VALUES
(11, 'INV-846678', 'invoice', 31, 'KES', 45000.00, 0.00, 45000.00, 'Migrated company ERP https://bookings.apollotours.co.ke/ to Safaricom PLC servers', '[{\"description\":\"ERP Migration\",\"price\":45000,\"vat\":false,\"frequency\":\"One-off\"}]', 'paid', '2026-01-03 23:24:06', '2026-01-20 12:56:20', 45000.00, 0.00),
(13, 'INV-029468', 'invoice', 32, 'KES', 15000.00, 0.00, 15000.00, 'Migrated the domain, emails, website and ERP from Contabo servers to Safaricom servers', '[{\"description\":\"Domain, Emails, Website & ERP Migration\",\"price\":15000,\"vat\":false,\"frequency\":\"Annually\"}]', 'paid', '2026-01-08 08:10:29', '2026-01-18 13:18:41', 15000.00, 0.00),
(29, 'QUO-452552', 'quotation', 39, 'KES', 40000.00, 0.00, 40000.00, 'Custom made ERP to include: Inventory Management, Purchase Management, Sales & POS, Billing & Invoicing, CRM & Reports modules.', '[{\"description\":\"ERP Development\",\"price\":40000,\"vat\":false,\"frequency\":\"One-off\"}]', 'pending', '2026-01-13 20:47:32', '2026-01-20 19:40:57', 0.00, 40000.00),
(33, 'INV-710989', 'invoice', 42, 'KES', 25000.00, 0.00, 25000.00, '9U Bets Mpesa C2B integrations', '[{\"description\":\"Mpesa integrations\",\"price\":25000,\"vat\":false,\"frequency\":\"One-off\"}]', 'paid', '2026-01-18 09:45:10', '2026-01-18 09:46:24', 25000.00, 0.00),
(34, 'QUO-715099', 'quotation', 40, 'KES', 6500.00, 0.00, 6500.00, 'Cloud VPS 20 SSD (no setup) - 173.212.248.196', '[{\"description\":\"Cloud VPS 20 SSD (no setup)\",\"price\":6500,\"vat\":false,\"frequency\":\"Monthly\"}]', 'pending', '2026-01-18 10:18:35', '2026-01-20 10:09:32', 0.00, 6500.00);

INSERT INTO `customers` (`id`, `companyName`, `clientType`, `contactPerson`, `mobile`, `email`, `location`, `city`, `building`, `serviceCategory`, `engagementType`, `description`, `accountManager`, `status`, `notes`, `created_at`) VALUES
(31, 'Apollo Tours Limited', 'SME', 'Ford Anwar', '+254710770826', 'info@apollotours.co.ke', 'Kenya', 'Nairobi', 'Kay Complex, Mombasa Road, Godown D1.', 'IT Consulting', 'Support Contract', 'Supporting Apollo Tours ERP', 'Dennis Obota', 'active', 'Client onboarded on multiple services', '2026-01-03 23:09:31'),
(32, 'Airport Mtaani Limited', 'SME', 'Humphrey Mbogo', '0711222333', 'humphrey@outlook.com', 'Kenya', '', '', 'Software Development', 'One Off', 'Test', 'Dennis Obota', 'active', 'Test', '2026-01-08 08:00:19'),
(35, 'Milan Butchery', 'SME', 'Dennis Obota', '0711927833', 'obotechsolutionsltd@gmail.com', 'Kenya', '', '', 'IT Consulting', 'One Off', 'IT setup', 'Dennis Obota', 'active', 'IT setup', '2026-01-11 00:04:53'),
(39, 'Biogas Appliances Africa', 'SME', 'Beatrice', '0722473794', 'info@biogasenergy.africa', 'Kenya', 'Nairobi', 'Nairobi - Kenya', 'ERP Development', 'One Off', 'Retail gas business ERP development', 'Dennis Obota', 'lead', 'Retail gas business ERP development', '2026-01-13 20:42:37'),
(40, 'Novaplus Ltd', 'SME', 'Mr. Bashir', '+1 (916) 538-3548', 'info@thenovaplus.com', 'Kenya', 'Nairobi', 'Ngong Road', 'IT Consulting', 'Retainer', 'Monthly subscription', 'Dennis Obota', 'inactive', 'Cloud VPS 20 SSD (no setup)	\nIP: 173.212.248.196 ', '2026-01-16 11:07:27'),
(41, 'Pochi POS', 'SME', 'Joyna Luvisia', '0705964957', 'joynaluvisia@gmail.com', 'Kenya', 'Nairobi', 'Gallant Mall', 'Software Development', 'One Off', 'Pochi POS platform', 'Dennis Obota', 'active', 'www.pochipos.com', '2026-01-17 23:57:57'),
(42, 'Book One Ltd', 'SME', 'Gilbert Masero', '+254724886517', 'robimasero@gmail.com', 'Kenya', 'Nairobi', 'Gallant Mall', 'IT Consulting', 'One Off', 'Betting integrations IT consulting', 'Dennis Obota', 'active', '', '2026-01-18 09:41:19'),
(43, 'Fitness Empire Gym', 'SME', 'Adnan', '+254722560256', 'info@fintessempire.co.ke', 'Kenya', 'Nairobi', 'Eastleigh Next to Pumwani Hospital', 'Software Development', 'One Off', '', 'Dennis Obota', 'active', '', '2026-01-18 14:53:02'),
(44, 'Afrinet Global Ltd', 'SME', 'Antonio Makhusta', '+254 702 115577', 'antonio@afrinetglobal.com', 'Kenya', 'Nairobi', 'Laiboni Center, Lenana Road', 'IT Consulting', 'Support Contract', 'IT & Software consultation', 'Dennis Obota', 'active', '', '2026-01-20 07:30:33');

INSERT INTO `expenses` (`id`, `title`, `amount`, `category`, `expense_date`, `description`, `document_url`, `status`, `created_at`) VALUES
(4, 'Website Development', 54000.00, 'Payroll', '2026-01-20', 'Pay for Victor', '', 'Pending', '2026-01-20 18:54:38');

INSERT INTO `payments` (`id`, `billing_id`, `payment_date`, `amount_paid`, `balance_snapshot`, `previous_paid_snapshot`, `payment_method`, `transaction_reference`, `notes`, `created_at`, `grand_total`, `total_received`, `outstanding_balance`) VALUES
(36, 33, '2026-01-17', 25000.00, NULL, NULL, 'Bank Transfer', 'Paid via Bookone Bank account', '', '2026-01-18 09:46:24', 0.00, 0.00, 0.00),
(37, 13, '2026-01-17', 15000.00, NULL, NULL, 'Bank Transfer', 'Openfloat. Mpesa Ref: TL8CF0CZQE', 'Hala Nirobi Airport Services Ltd has transferred KES 15,000.00 to 254711927833 - DENNIS OKOTH OBOTA via Openfloat. Mpesa Ref: TL8CF0CZQE. ', '2026-01-18 13:18:41', 0.00, 0.00, 0.00),
(38, 11, '2026-01-20', 45000.00, NULL, NULL, 'Bank Transfer', 'Reference No: 0050000120260120105121LLr128td', 'Reference No: 0050000120260120105121LLr128td', '2026-01-20 12:56:20', 0.00, 0.00, 0.00);

INSERT INTO `projects` (`id`, `project_name`, `description`, `client_id`, `lead_staff_id`, `project_type`, `status`, `project_url`, `repo_url`, `tech_stack`, `notes`, `created_at`) VALUES
(1, 'Novaplus Backup Server', 'Cloud backup services', 40, 8, 'Hosting Services', 'Retired', '173.212.248.196 ', '', 'Ubuntu Linux Server -Cloud VPS 20 SSD (no setup)', 'Cloud VPS 20 SSD (no setup) -173.212.248.196', '2026-01-16 11:12:37'),
(4, 'Pochi POS Development', 'Pochi POS is an ERP tailored for SMEs in Africa', 41, 8, 'SaaS Platform', 'QA/Testing', 'www.app.pochipos.com', '1.2', 'Vue JS and Tailwind CSS', 'Version one done, version 2 coming soon', '2026-01-18 07:54:13'),
(5, 'Milan Butchery Website', 'Butchery website', 35, 8, 'Website Development', 'Design', 'www.milanbutchery.co.ke', '1.1', 'React, Typescript, Node JS', NULL, '2026-01-18 08:11:00'),
(6, 'Apollo Tours ERP Development', 'Car bookings and rentals ERP', 31, 8, 'ERP Development', 'Completed', 'https://bookings.apollotours.co.ke/', '1.3', 'Appgini RAD & Mysql', 'The platform has both testand production environment.', '2026-01-18 08:22:20'),
(7, '9U Bets Paybills Integrations', 'Integrations of 9U Bets C2B and B2C integrations', 42, 8, 'IT Consulting', 'Completed', 'https://9ubet.co.ke/', NULL, 'Safaricom Daraja APIs', 'Fully integrated', '2026-01-18 09:44:12'),
(8, 'Airport mtaani ERP Development', 'https://erp.airportmtaani.co.ke/ ERP development for lost luggage handling', 32, 10, 'ERP Development', 'Completed', 'https://erp.airportmtaani.co.ke/', NULL, 'App Gini, MYSQL', 'Currently hosted in Safaricom Shared Hosting', '2026-01-18 13:21:05'),
(9, 'Fintness Empire Gym Website', 'Gym website development', 43, 8, 'Website Development', 'Development', 'https://fitnessempire.co.ke/', '', 'Wordpress', 'Currently under development', '2026-01-18 14:54:08'),
(10, 'Yellow Bets Mpesa Integrations', 'Fidotech Ltd MPESA & KRA integration (Yellowbet is the trading name)', 42, 8, 'IT Consulting', 'Completed', 'https://yellowbet.com/', '', 'Mpesa Daraja', 'Integrated C2B, C2B & KRA B2B into Yellow Bet https://yellowbet.com/', '2026-01-19 21:01:25'),
(11, 'Mzizi Global Website', 'Website for Mzizi Mobile app which is an international money remittance platform.', 44, 8, 'Website Development', 'Completed', 'https://mziziglobal.com/', '1.1', 'React, Typescript, Node JS', 'Website deployed ', '2026-01-20 07:32:17'),
(12, 'Greatrift Foundation Website', 'Greatrift Ltd is a coffee factory in Eldoret - Kenya. The foundation is the CSR arm of the company.', 44, 8, 'Website Development', 'Completed', 'https://greatriftfoundation.com/', '1.1', 'React, Typescript, Node JS', '', '2026-01-20 07:33:42'),
(13, 'Airport Mtaani Website Development', 'Airport Mtaani is a lost baggage handling company in JKIA', 32, 8, 'Website Development', 'Completed', 'https://airportmtaani.co.ke/', '1.1', 'Wordpress', 'Website hosted in Safaricom', '2026-01-20 08:12:14');

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'admin', 'Super User - Access to everything', '2026-01-11 19:39:33'),
(2, 'manager', 'Can manage clients and billing but not system users', '2026-01-11 19:39:33'),
(3, 'staff', 'View only access to most modules', '2026-01-11 19:39:33');

INSERT INTO `tasks` (`id`, `task_name`, `category`, `due_date`, `owner`, `status`, `created_at`, `updated_at`) VALUES
(3, 'Prepare for Afrinet PM Portal walkthrough', 'Business', '2026-01-19', 'Admin User', 'Completed', '2026-01-20 13:43:45', '2026-01-20 19:13:28'),
(4, 'Apply Qwetu Sacco website development tender', 'Business', '2026-01-20', 'Admin User', 'Completed', '2026-01-20 19:14:17', '2026-01-20 19:15:14'),
(5, 'Complete Expenses module for Brookstack ERP', 'Technical', '2026-01-20', 'Admin User', 'Pending', '2026-01-20 19:15:08', '2026-01-20 19:15:08'),
(6, 'Submit Qwetu Sacco website tender application', 'Technical', '2026-01-20', 'Admin User', 'Pending', '2026-01-20 19:37:22', '2026-01-20 19:37:22');

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role_id`, `status`, `created_at`, `updated_at`) VALUES
(8, 'Dennis Obota', 'business@brookstack.com', '$2b$10$zUQdXesbyvFIf9OZ0DNpmOf0WvIzksnsPk0HNsVRzW0r5zcjAp13u', 1, 'active', '2026-01-11 20:13:34', '2026-01-11 21:12:36'),
(9, 'Joyna Luvisia', 'joyna@brookstack.com', '$2b$10$rUMUoxVGqjEzzhD8ZSta/OV4zFxofoV6wzpHj6G0S0TDyX/g7DF.y', 1, 'active', '2026-01-13 09:35:46', '2026-01-13 09:35:46'),
(10, 'Ronald Ngoda', 'ronniengoda@gmail.com', '$2b$10$QMXG6wnZ6aTv.rOPKAW2/eQ4IFb1mAqsQx2MF83LP2vEFZVFS88zO', 3, 'active', '2026-01-18 10:02:59', '2026-01-18 10:02:59');



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;