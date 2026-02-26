/*
-------------------------------------------------
Author: Abraham Sharkey
File: sample_data.sql
Responsibility:
    Provides sample data for testing and demonstrating
    the CMP5387 Library Loans System backend.

Purpose:
    This script populates the database with a small,
    realistic dataset to support API testing, frontend
    development, and video demonstration scenarios.

Learning Outcomes:
    LO3 – Relational database population and integrity
-------------------------------------------------
*/

USE library_db;

-- -------------------------------------------------
-- Branches
-- -------------------------------------------------
-- Sample library branches used to demonstrate
-- multi-branch item availability.
INSERT INTO Branch (BranchName, Address) VALUES
('Central Library', 'Birmingham City Centre'),
('North Branch', 'Sutton Coldfield');

-- -------------------------------------------------
-- Items
-- -------------------------------------------------
-- Sample library items representing books.
INSERT INTO Item (Title, Author, ISBN, ItemType) VALUES
('Clean Code', 'Robert C. Martin', '9780132350884', 'Book'),
('Introduction to Algorithms', 'Thomas H. Cormen', '9780262033848', 'Book');

-- -------------------------------------------------
-- Item Copies
-- -------------------------------------------------
-- Multiple copies per item to demonstrate
-- availability tracking and loan status.
INSERT INTO ItemCopy (ItemID, BranchID, Status) VALUES
(1, 1, 'Available'),
(1, 2, 'Available'),
(2, 1, 'Available'),
(2, 2, 'Available');

-- -------------------------------------------------
-- Members
-- -------------------------------------------------
-- Sample members used for loan and reservation testing.
INSERT INTO Member (FirstName, LastName, Email, Phone) VALUES
('Abraham', 'Sharkey', 'abraham@mail.com', '07123456789'),
('Malaika', 'Noor', 'malaika@mail.com', '07987654321');

