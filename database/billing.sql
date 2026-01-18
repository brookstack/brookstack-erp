-- -------------------------------------------------------------
-- TablePlus 6.8.0(654)
--
-- https://tableplus.com/
--
-- Database: brooksta_erp
-- Generation Time: 2026-01-18 12:26:37.1230
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
  `status` enum('pending','partial','paid','cancelled') NOT NULL DEFAULT 'pending',
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
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(11, 'QUO-846678', 'quotation', 31, 'KES', 35000.00, 5600.00, 40600.00, 'Office networking', '[{\"description\":\"Networking\",\"price\":35000,\"vat\":true,\"frequency\":\"One-off\"}]', 'pending', '2026-01-03 23:24:06', '2026-01-10 14:26:03', 0.00, 0.00),
(13, 'QUO-029468', 'quotation', 32, 'KES', 95000.00, 0.00, 95000.00, 'Service fee for IT consultation per year', '[{\"description\":\"IT Consulting\",\"price\":50000,\"vat\":false,\"frequency\":\"Annually\"},{\"description\":\"Domain Hosting\",\"price\":45000,\"vat\":false,\"frequency\":\"One-off\"}]', 'pending', '2026-01-08 08:10:29', '2026-01-10 13:58:22', 0.00, 0.00),
(19, 'INV-641950', 'invoice', 32, 'KES', 40000.00, 0.00, 40000.00, '', '[{\"description\":\"Domain & email support\",\"price\":40000,\"vat\":false,\"frequency\":\"Monthly\"}]', 'partial', '2026-01-10 17:34:01', '2026-01-11 00:35:01', 26000.00, 14000.00),
(29, 'INV-452552', 'invoice', 39, 'KES', 40000.00, 0.00, 40000.00, 'Custom made ERP to include: Inventory Management, Purchase Management, Sales & POS, Billing & Invoicing, CRM & Reports modules.', '[{\"description\":\"ERP Development\",\"price\":40000,\"vat\":false,\"frequency\":\"One-off\"}]', 'pending', '2026-01-13 20:47:32', '2026-01-16 13:49:18', 0.00, 40000.00),
(31, 'INV-718785', 'invoice', 35, 'KES', 5000.00, 800.00, 5800.00, 'milanbutchery.co.ke', '[{\"description\":\"Domain Hosting\",\"price\":5000,\"vat\":true,\"frequency\":\"One-off\"}]', 'partial', '2026-01-16 13:01:58', '2026-01-16 13:37:33', 5000.00, 800.00),
(32, 'INV-360136', 'invoice', 41, 'KES', 300000.00, 48000.00, 348000.00, 'Test invoice', '[{\"description\":\"ERP Development\",\"price\":300000,\"vat\":true,\"frequency\":\"One-off\"}]', 'paid', '2026-01-18 07:26:00', '2026-01-18 09:16:10', 348000.00, 0.00),
(33, 'INV-710989', 'invoice', 42, 'KES', 25000.00, 0.00, 25000.00, '9U Bets Mpesa C2B integrations', '[{\"description\":\"Mpesa integrations\",\"price\":25000,\"vat\":false,\"frequency\":\"One-off\"}]', 'paid', '2026-01-18 09:45:10', '2026-01-18 09:46:24', 25000.00, 0.00),
(34, 'INV-715099', 'invoice', 40, 'KES', 6500.00, 0.00, 6500.00, 'Cloud VPS 20 SSD (no setup) - 173.212.248.196', '[{\"description\":\"Cloud VPS 20 SSD (no setup) - 173.212.248.196\",\"price\":6500,\"vat\":false,\"frequency\":\"Monthly\"}]', 'pending', '2026-01-18 10:18:35', '2026-01-18 10:18:35', 0.00, 6500.00),
(35, 'QUO-665476', 'quotation', 42, 'KES', 31313.00, 0.00, 31313.00, '', '[{\"description\":\"2133133\",\"price\":31313,\"vat\":false,\"frequency\":\"One-off\"},{\"description\":\"31133131\",\"price\":0,\"vat\":false,\"frequency\":\"One-off\"},{\"description\":\"3131313131\",\"price\":0,\"vat\":false,\"frequency\":\"One-off\"},{\"description\":\"3133131131\",\"price\":0,\"vat\":false,\"frequency\":\"One-off\"},{\"description\":\"313134131313\",\"price\":0,\"vat\":false,\"frequency\":\"One-off\"},{\"description\":\"313131331\",\"price\":0,\"vat\":false,\"frequency\":\"One-off\"}]', 'pending', '2026-01-18 11:07:45', '2026-01-18 11:07:45', 0.00, 31313.00);

INSERT INTO `customers` (`id`, `companyName`, `clientType`, `contactPerson`, `mobile`, `email`, `location`, `city`, `building`, `serviceCategory`, `engagementType`, `description`, `accountManager`, `status`, `notes`, `created_at`) VALUES
(31, 'Apollo Tours Limited', 'SME', 'Ford Anwar', '+254710770826', 'ford@apollotours.co.ke', 'Kenya', 'Nairobi', 'Kay Complex, Mombasa Road, Godown D1.', 'IT Consulting', 'Support Contract', 'Supporting Apollo Tours ERP', 'Dennis Obota', 'active', 'Client onboarded on multiple services', '2026-01-03 23:09:31'),
(32, 'Airport Mtaani Limited', 'SME', 'Humphrey Mbogo', '0711222333', 'humphrey@outlook.com', 'Kenya', '', '', 'Software Development', 'One Off', 'Test', 'Dennis Obota', 'active', 'Test', '2026-01-08 08:00:19'),
(35, 'Milan Butchery', 'SME', 'Dennis Obota', '0711927833', 'obotechsolutionsltd@gmail.com', 'Kenya', '', '', 'IT Consulting', 'One Off', 'IT setup', 'Dennis Obota', 'active', 'IT setup', '2026-01-11 00:04:53'),
(39, 'Biogas Appliances Africa', 'SME', 'Beatrice', '0722473794', 'info@biogasenergy.africa', 'Kenya', 'Nairobi', 'Nairobi - Kenya', 'ERP Development', 'One Off', 'Retail gas business ERP development', 'Dennis Obota', 'lead', 'Retail gas business ERP development', '2026-01-13 20:42:37'),
(40, 'Novaplus Ltd', 'SME', 'Mr. Bashir', '+1 (916) 538-3548', 'info@thenovaplus.com', 'Kenya', 'Nairobi', 'Ngong Road', 'IT Consulting', 'Retainer', 'Monthly subscription', 'Dennis Obota', 'active', 'Cloud VPS 20 SSD (no setup)	\nIP: 173.212.248.196 ', '2026-01-16 11:07:27'),
(41, 'Pochi POS', 'SME', 'Joyna Luvisia', '0705964957', 'joynaluvisia@gmail.com', 'Kenya', 'Nairobi', 'Gallant Mall', 'Software Development', 'One Off', 'Pochi POS platform', 'Dennis Obota', 'active', 'www.pochipos.com', '2026-01-17 23:57:57'),
(42, 'Book One Ltd', 'SME', 'Gilbert Masero', '+254724886517', 'robimasero@gmail.com', 'Kenya', 'Nairobi', 'Gallant Mall', 'IT Consulting', 'One Off', 'Betting integrations IT consulting', 'Dennis Obota', 'active', '', '2026-01-18 09:41:19');

INSERT INTO `payments` (`id`, `billing_id`, `payment_date`, `amount_paid`, `balance_snapshot`, `previous_paid_snapshot`, `payment_method`, `transaction_reference`, `notes`, `created_at`, `grand_total`, `total_received`, `outstanding_balance`) VALUES
(12, 19, '2026-01-10', 10000.00, NULL, NULL, 'Bank Transfer', 'NSKFNSFKNS', '2nd installment', '2026-01-10 18:20:20', 40000.00, 32000.00, 8000.00),
(20, 19, '2026-01-10', 16000.00, NULL, NULL, 'Bank Transfer', '', '', '2026-01-11 00:35:01', 0.00, 0.00, 0.00),
(33, 31, '2026-01-16', 5000.00, NULL, NULL, 'Bank Transfer', '', '', '2026-01-16 13:37:33', 0.00, 0.00, 0.00),
(34, 32, '2026-01-18', 300000.00, NULL, NULL, 'M-Pesa', 'BCSJBVBBS', '', '2026-01-18 07:37:23', 0.00, 0.00, 0.00),
(35, 32, '2026-01-18', 48000.00, NULL, NULL, 'Bank Transfer', '', '', '2026-01-18 09:16:10', 0.00, 0.00, 0.00),
(36, 33, '2025-11-17', 25000.00, NULL, NULL, 'Bank Transfer', 'Paid via Bookone Bank account', '', '2026-01-18 09:46:24', 0.00, 0.00, 0.00);

INSERT INTO `projects` (`id`, `project_name`, `description`, `client_id`, `lead_staff_id`, `project_type`, `status`, `project_url`, `repo_url`, `tech_stack`, `notes`, `created_at`) VALUES
(1, 'Novaplus Backup Server', '', 40, 8, 'Hosting Services', 'Completed', '173.212.248.196 ', '', 'Ubuntu Linux Server -Cloud VPS 20 SSD (no setup)', 'Cloud VPS 20 SSD (no setup) -173.212.248.196', '2026-01-16 11:12:37'),
(2, 'Milan Butchery POS', 'Development of butchery POS', 35, 9, 'ERP Development', 'Completed', 'www.erp.milanbutchery.co.ke', '', 'Wordpress', 'Website almost complete', '2026-01-16 13:01:24'),
(4, 'Pochi POS', 'Pochi POS is an ERP tailored for SMEs in Africa', 41, 8, 'SaaS Platform', 'Completed', 'www.app.pochipos.com', '1.2', 'Vue JS and Tailwind CSS', 'Version one done, version 2 coming soon', '2026-01-18 07:54:13'),
(5, 'Milan Butchery Website', 'Butchery website', 35, 8, 'Website Development', 'Design', 'www.milanbutchery.co.ke', '1.1', 'React, Typescript, Node JS', NULL, '2026-01-18 08:11:00'),
(6, 'Apollo Tours ERP', 'Car bookings and rentals ERP', 31, 8, 'ERP Development', 'Completed', 'https://bookings.apollotours.co.ke/', '1.3', 'Appgini RAD & Mysql', 'The platform has both testand production environment.', '2026-01-18 08:22:20'),
(7, '9U Bets Paybills Integrations', 'Integrations of 9U Bets C2B and B2C integrations', 42, 8, 'IT Consulting', 'Completed', 'https://9ubet.co.ke/', NULL, 'Safaricom Daraja APIs', 'Fully integrated', '2026-01-18 09:44:12');

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'admin', 'Super User - Access to everything', '2026-01-11 19:39:33'),
(2, 'manager', 'Can manage clients and billing but not system users', '2026-01-11 19:39:33'),
(3, 'staff', 'View only access to most modules', '2026-01-11 19:39:33');

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