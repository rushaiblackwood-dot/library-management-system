"""
-------------------------------------------------
Author: Abraham Sharkey
File: members.py
Responsibility:
    Provides a summary view of a library member, including
    their personal details and currently active loans.
Learning Outcomes:
    LO2 – Design and implement RESTful web services
    LO3 – Aggregate and retrieve data from a relational database
-------------------------------------------------
"""

from flask import Blueprint, jsonify
from db import get_db_connection
from datetime import date

# Blueprint for member-related routes.
# This endpoint aggregates data across multiple tables to
# provide a meaningful backend-driven summary.
members_bp = Blueprint("members", __name__)


# -------------------------------------------------
# GET /members/<member_id>
# -------------------------------------------------
# Author: Abraham Sharkey
# Responsibility:
#   Retrieves a single member's details along with all
#   currently active loans.
# Design Decision:
#   Overdue status is calculated dynamically at runtime
#   rather than stored in the database to avoid redundant state.
# Learning Outcomes:
#   LO2 – RESTful GET endpoint
#   LO3 – SQL JOINs and data aggregation
# -------------------------------------------------
@members_bp.route("/members/<int:member_id>", methods=["GET"])
def get_member_summary(member_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # -------------------------
    # Retrieve member details
    # -------------------------
    cursor.execute(
        """
        SELECT 
            MemberID,
            FirstName,
            LastName,
            Email,
            Phone
        FROM Member
        WHERE MemberID = %s
        """,
        (member_id,)
    )
    member = cursor.fetchone()

    # Error handling:
    # Return a clear 404 response if the member does not exist
    if not member:
        conn.close()
        return jsonify({"error": "Member not found"}), 404

    # -------------------------
    # Retrieve active loans
    # -------------------------
    # Active loans are defined as loans that have not yet been returned.
    # Data is joined across Loan, ItemCopy, and Item to provide
    # meaningful item information (e.g. title).
    cursor.execute(
        """
        SELECT
            l.LoanID,
            l.CopyID,
            i.Title,
            l.DueDate
        FROM Loan l
        JOIN ItemCopy ic ON l.CopyID = ic.CopyID
        JOIN Item i ON ic.ItemID = i.ItemID
        WHERE l.MemberID = %s
        AND l.ReturnDate IS NULL
        """,
        (member_id,)
    )

    active_loans = cursor.fetchall()
    conn.close()

    # -------------------------
    # Dynamic overdue detection
    # -------------------------
    # Overdue status is intentionally calculated at runtime
    # to ensure accuracy and prevent stale or duplicated data.
    today = date.today()

    for loan in active_loans:
        due_date = loan["DueDate"]
        if due_date < today:
            loan["is_overdue"] = True
            loan["days_overdue"] = (today - due_date).days
        else:
            loan["is_overdue"] = False
            loan["days_overdue"] = 0

    # Attach active loan data to the member summary
    member["active_loans"] = active_loans

    # Return structured JSON response
    return jsonify(member), 200



# -------------------------------------------------
# GET /members/<member_id>/reservations
# -------------------------------------------------
# Author: Abraham Sharkey
# Responsibility:
#   Retrieves all reservations made by a specific member.
# Design Decision:
#   Reservations are returned in chronological order to
#   reflect queue position and ensure fairness.
# Learning Outcomes:
#   LO2 – RESTful GET endpoint
#   LO3 – Relational data retrieval using JOINs
# -------------------------------------------------

@members_bp.route("/members/<int:member_id>/reservations", methods=["GET"])
def get_member_reservations(member_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            r.ReservationID,
            r.ReservationDate,
            i.Title
        FROM Reservation r
        JOIN Item i ON r.ItemID = i.ItemID
        WHERE r.MemberID = %s
        ORDER BY r.ReservationDate ASC
        """,
        (member_id,)
    )

    reservations = cursor.fetchall()
    conn.close()

    return jsonify({"reservations": reservations}), 200
