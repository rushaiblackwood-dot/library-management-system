"""
-------------------------------------------------
Author: Abraham Sharkey
File: reservations.py
Responsibility:
    Handles creation and retrieval of item reservations
    within the library system.
Learning Outcomes:
    LO2 – Design and implement RESTful web services
    LO3 – Enforce business rules using database queries
-------------------------------------------------
"""

from flask import Blueprint, request, jsonify
from db import get_db_connection
from datetime import date

# Blueprint responsible for reservation-related routes.
# Reservations are used to control borrowing priority
# when items are not immediately available.
reservations_bp = Blueprint("reservations", __name__)


# -------------------------------------------------
# POST /reservations
# -------------------------------------------------
# Author: Abraham Sharkey
# Responsibility:
#   Creates a reservation for a specific item by a member.
# Business Rules Enforced:
#   - Member must exist
#   - Item must exist
#   - Duplicate reservations by the same member are not allowed
#   - Member cannot reserve an item they currently have on loan
# Learning Outcomes:
#   LO2 – RESTful POST endpoint
#   LO3 – Validation and constraint enforcement
# -------------------------------------------------
@reservations_bp.route("/reservations", methods=["POST"])
def create_reservation():
    data = request.get_json()

    # Validate request body
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    item_id = data.get("item_id")
    member_id = data.get("member_id")

    # Validate required fields
    if not item_id or not member_id:
        return jsonify({"error": "item_id and member_id are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # -------------------------
    # Validate member existence
    # -------------------------
    cursor.execute(
        "SELECT MemberID FROM Member WHERE MemberID = %s",
        (member_id,)
    )
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Member not found"}), 404

    # -------------------------
    # Validate item existence
    # -------------------------
    cursor.execute(
        "SELECT ItemID FROM Item WHERE ItemID = %s",
        (item_id,)
    )
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Item not found"}), 404

    # -------------------------
    # Prevent duplicate reservations
    # -------------------------
    cursor.execute(
        """
        SELECT ReservationID
        FROM Reservation
        WHERE ItemID = %s AND MemberID = %s
        """,
        (item_id, member_id)
    )
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "Item already reserved by this member"}), 409

    # -------------------------
    # Prevent reserving item already on loan by the same member
    # -------------------------
    cursor.execute(
        """
        SELECT 1
        FROM Loan l
        JOIN ItemCopy ic ON l.CopyID = ic.CopyID
        WHERE l.MemberID = %s
          AND ic.ItemID = %s
          AND l.ReturnDate IS NULL
        LIMIT 1
        """,
        (member_id, item_id)
    )
    if cursor.fetchone():
        conn.close()
        return jsonify({
            "error": "You cannot reserve an item you currently have on loan"
        }), 400

    # -------------------------
    # Create reservation
    # -------------------------
    reservation_date = date.today()

    cursor.execute(
        """
        INSERT INTO Reservation (ItemID, MemberID, ReservationDate)
        VALUES (%s, %s, %s)
        """,
        (item_id, member_id, reservation_date)
    )

    conn.commit()
    conn.close()

    # Return confirmation response
    return jsonify({
        "item_id": item_id,
        "member_id": member_id,
        "reservation_date": str(reservation_date)
    }), 201


# -------------------------------------------------
# GET /items/<item_id>/reservations
# -------------------------------------------------
# Author: Abraham Sharkey
# Responsibility:
#   Retrieves all reservations for a specific item.
# Design Decision:
#   Reservations are ordered by reservation date to
#   reflect queue priority.
# Learning Outcomes:
#   LO2 – RESTful GET endpoint
#   LO3 – JOIN-based data retrieval
# -------------------------------------------------
@reservations_bp.route("/items/<int:item_id>/reservations", methods=["GET"])
def get_item_reservations(item_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            r.ReservationID,
            r.ReservationDate,
            m.MemberID,
            m.FirstName,
            m.LastName
        FROM Reservation r
        JOIN Member m ON r.MemberID = m.MemberID
        WHERE r.ItemID = %s
        ORDER BY r.ReservationDate ASC
        """,
        (item_id,)
    )

    reservations = cursor.fetchall()
    conn.close()

    return jsonify({
        "item_id": item_id,
        "reservations": reservations
    }), 200
