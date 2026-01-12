-- -------------------------------------------------------------
-- Brookstack ERP - Revised Migration (Full Structure + Data)
-- Fixes: Collation Error (#1273) and Foreign Key Error (#1452)
-- -------------------------------------------------------------

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0; -- Temporarily disable checks to allow clean import

-- ==========================================
-- 1. CUSTOMERS TABLE
-- ==========================================
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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting at least one customer to satisfy the Foreign Key constraint for billing
-- You can replace 'Default Client' with your actual client data
INSERT INTO `customers` (`id`, `companyName`, `status`) VALUES (1, 'Default Client', 'active');

-- ==========================================
-- 2. BILLING TABLE
-- ==========================================
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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restore Billing data from your files
INSERT INTO `billing` (`id`, `doc_no`, `type`, `client_id`, `grand_total`, `status`) VALUES 
(23, 'INV-023', 'invoice', 1, 16400.00, 'partial'),
(25, 'INV-025', 'invoice', 1, 160000.00, 'paid'),
(26, 'INV-026', 'invoice', 1, 580.00, 'paid');

-- ==========================================
-- 3. PAYMENTS TABLE
-- ==========================================
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restore Payments Data found in billing2.sql
INSERT INTO `payments` (`id`, `billing_id`, `payment_date`, `amount_paid`, `transaction_reference`, `notes`, `created_at`) VALUES 
(26, 25, '2026-01-11', 160000.00, 'KVBNDKVBD', 'Final installment', '2026-01-11 13:08:37'),
(27, 23, '2026-01-11', 10000.00, '', '', '2026-01-11 13:19:25'),
(28, 26, '2026-01-11', 580.00, '', '', '2026-01-11 13:20:22'),
(29, 23, '2026-01-11', 6400.00, '', '', '2026-01-11 13:22:15');

SET FOREIGN_KEY_CHECKS = 1; -- Re-enable checks