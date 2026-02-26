/*
-------------------------------------------------
Author: Abraham Sharkey
File: demo_reset.sql
Responsibility:
    Resets the system to a clean testing state for
    frontend demonstrations and backend validation.

Purpose:
    Removes all active loans and reservations while
    keeping the existing library catalogue, members,
    and item copies intact.

Learning Outcomes:
    LO3 – Database manipulation and controlled state
-------------------------------------------------
*/

USE library_db;

-- -------------------------------------------------
-- Reset system state for demo/testing
-- -------------------------------------------------

-- Remove all active and historical loans
DELETE FROM Loan;

-- Remove all reservations
DELETE FROM Reservation;

-- Restore all item copies to an available state
UPDATE ItemCopy
SET Status = 'Available';
