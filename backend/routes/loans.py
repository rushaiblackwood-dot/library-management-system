"""
-------------------------------------------------
Author: Abraham Sharkey
File: loans.py
Responsibility:
    Handles borrowing and returning of item copies.
    Enforces all loan-related business rules at the backend.
Learning Outcomes:
    LO2 – Design and implement RESTful web services
    LO3 – Interact with a relational database using SQL
    LO4 – Apply validation and robust error handling
-------------------------------------------------
"""

from flask import Blueprint, request, jsonify
from db import get_db_connection
from datetime import date, timedelta

# Blueprint for loan-related routes.
# Separating loan logic improves maintainability and clarity.
loans_bp = Blueprint("loans", __name__)


# -------------------------------------------------
# POST /loans
# -------------------------------------------------
# Author: Abraham Sharkey
# Responsibility:
#   Allows a member to borrow a specific item copy.
# Business Rules Enforced:
#   1. Member must exist
#   2. Member may have a maximum of 3 active loans
#   3. Copy must exist and be available
#   4. Borrowing is blocked if the item is reserved by another member
# Learning Outcomes:
#   LO2 – RESTful POST endpoint
#   LO3 – SQL queries and transactions
#   LO4 – Validation and business rule enforcement
# -------------------------------------------------
@loans_bp.route("/loans", methods=["POST"])
def borrow_item():
    data = request.get_json()

    # Input validation:
    # Ensures the request contains a JSON body
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    copy_id = data.get("copy_id")
    member_id = data.get("member_id")

    # Input validation:
    # Both copy_id and member_id are required to proceed
    if not copy_id or not member_id:
        return jsonify({
            "error": "copy_id and member_id are required"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # -------------------------
    # Business Rule 1:
    # Member must exist
    # -------------------------
    cursor.execute(
        "SELECT MemberID FROM Member WHERE MemberID = %s",
        (member_id,)
    )
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Member not found"}), 404

    # -------------------------
    # Business Rule 2:
    # Maximum of 3 active loans per member
    # This rule is enforced at the backend to prevent bypassing
    # via the frontend.
    # -------------------------
    cursor.execute(
        """
        SELECT COUNT(*) AS active_loans
        FROM Loan
        WHERE MemberID = %s
        AND ReturnDate IS NULL
        """,
        (member_id,)
    )
    if cursor.fetchone()["active_loans"] >= 3:
        conn.close()
        return jsonify({
            "error": "Borrowing limit reached (maximum 3 active loans)"
        }), 409

    # -------------------------
    # Business Rule 3:
    # Copy must exist and be available
    # -------------------------
    cursor.execute(
        "SELECT ItemID, Status FROM ItemCopy WHERE CopyID = %s",
        (copy_id,)
    )
    copy = cursor.fetchone()

    if not copy:
        conn.close()
        return jsonify({"error": "Copy not found"}), 404

    if copy["Status"] != "Available":
        conn.close()
        return jsonify({"error": "Copy not available"}), 409

    item_id = copy["ItemID"]

    # -------------------------
    # Business Rule 4:
    # Reservation-aware borrowing
    # Prevents borrowing if another member has an active reservation
    # for the same item, ensuring fairness.
    # -------------------------
    cursor.execute(
        """
        SELECT ReservationID
        FROM Reservation
        WHERE ItemID = %s
        AND MemberID != %s
        """,
        (item_id, member_id)
    )
    if cursor.fetchone():
        conn.close()
        return jsonify({
            "error": "Item is reserved by another member"
        }), 409

    # Loan dates:
    # Due date is calculated dynamically rather than stored as a rule
    loan_date = date.today()
    due_date = loan_date + timedelta(days=14)

    # -------------------------
    # Create loan record
    # -------------------------
    cursor.execute(
        """
        INSERT INTO Loan (CopyID, MemberID, LoanDate, DueDate)
        VALUES (%s, %s, %s, %s)
        """,
        (copy_id, member_id, loan_date, due_date)
    )

    # Update copy status to reflect new loan
    cursor.execute(
        "UPDATE ItemCopy SET Status = 'OnLoan' WHERE CopyID = %s",
        (copy_id,)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "copy_id": copy_id,
        "member_id": member_id,
        "loan_date": str(loan_date),
        "due_date": str(due_date)
    }), 201


# -------------------------------------------------
# PUT /loans/<loan_id>/return
# -------------------------------------------------
# Author: Abraham Sharkey
# Responsibility:
#   Handles the return of a borrowed item copy.
# Business Rules Enforced:
#   1. Loan must exist
#   2. Loan must not already be returned
# Learning Outcomes:
#   LO2 – RESTful PUT endpoint
#   LO3 – SQL updates across related tables
#   LO4 – Error handling and validation
# -------------------------------------------------
@loans_bp.route("/loans/<int:loan_id>/return", methods=["PUT"])
def return_item(loan_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Validate loan existence
    cursor.execute(
        "SELECT * FROM Loan WHERE LoanID = %s",
        (loan_id,)
    )
    loan = cursor.fetchone()

    if not loan:
        conn.close()
        return jsonify({"error": "Loan not found"}), 404

    # Prevent returning the same loan twice
    if loan["ReturnDate"] is not None:
        conn.close()
        return jsonify({"error": "Loan already returned"}), 409

    return_date = date.today()

    # Mark loan as returned
    cursor.execute(
        "UPDATE Loan SET ReturnDate = %s WHERE LoanID = %s",
        (return_date, loan_id)
    )

    # Make the copy available again
    cursor.execute(
        "UPDATE ItemCopy SET Status = 'Available' WHERE CopyID = %s",
        (loan["CopyID"],)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Item returned successfully",
        "return_date": str(return_date)
    }), 200
