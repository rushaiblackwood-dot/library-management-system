/*
=================================================
Author: Abraham Sharkey
File: schema.sql
Module: CMP5387 – Backend Web Services & Database Engineering
Responsibility:
    Defines the relational database schema for the
    Library Management System used in D3.

Purpose:
    This schema supports item management, copy-level
    availability, member borrowing, loans, and
    reservation functionality required by the backend API.

Learning Outcomes:
    LO3 – Design and implementation of a relational database
=================================================
*/

USE library_db;

-- -------------------------------------------------
-- Branch
-- -------------------------------------------------
-- Represents physical library branches.
CREATE TABLE Branch (
    BranchID INT AUTO_INCREMENT PRIMARY KEY,
    BranchName VARCHAR(100) NOT NULL,
    Address VARCHAR(255) NOT NULL
);

-- -------------------------------------------------
-- Item (Book / Media)
-- -------------------------------------------------
-- Represents abstract library items (e.g. books).
-- Availability is managed at the copy level.
CREATE TABLE Item (
    ItemID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Author VARCHAR(150),
    ISBN VARCHAR(20),
    ItemType VARCHAR(50) NOT NULL
);

-- -------------------------------------------------
-- Item Copy
-- -------------------------------------------------
-- Represents individual physical copies of an item.
-- Status tracks availability (Available / OnLoan).
CREATE TABLE ItemCopy (
    CopyID INT AUTO_INCREMENT PRIMARY KEY,
    ItemID INT NOT NULL,
    BranchID INT NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Available',
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID),
    FOREIGN KEY (BranchID) REFERENCES Branch(BranchID)
);

-- -------------------------------------------------
-- Member
-- -------------------------------------------------
-- Represents registered library members.
CREATE TABLE Member (
    MemberID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    Phone VARCHAR(20)
);

-- -------------------------------------------------
-- Loan
-- -------------------------------------------------
-- Represents borrowing transactions.
-- A NULL ReturnDate indicates an active loan.
CREATE TABLE Loan (
    LoanID INT AUTO_INCREMENT PRIMARY KEY,
    CopyID INT NOT NULL,
    MemberID INT NOT NULL,
    LoanDate DATE NOT NULL,
    DueDate DATE NOT NULL,
    ReturnDate DATE,
    FOREIGN KEY (CopyID) REFERENCES ItemCopy(CopyID),
    FOREIGN KEY (MemberID) REFERENCES Member(MemberID)
);

-- -------------------------------------------------
-- Reservation
-- -------------------------------------------------
-- Represents reservations placed on items when
-- copies are unavailable.
CREATE TABLE Reservation (
    ReservationID INT AUTO_INCREMENT PRIMARY KEY,
    ItemID INT NOT NULL,
    MemberID INT NOT NULL,
    ReservationDate DATE NOT NULL,
    Status VARCHAR(20) DEFAULT 'Active',
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID),
    FOREIGN KEY (MemberID) REFERENCES Member(MemberID)
);
