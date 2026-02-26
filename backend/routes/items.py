"""
-------------------------------------------------
Author: Abraham Sharkey
File: items.py
Responsibility:
    Provides read-only REST API endpoints for
    retrieving library items and their physical copies.
Learning Outcomes:
    LO2 – Design and implement RESTful web services
    LO3 – Retrieve and expose data from a relational database
-------------------------------------------------
"""

from flask import Blueprint, jsonify
from db import get_db_connection

# Blueprint for item-related routes.
# Using Blueprints improves modularity and keeps the API scalable.
items_bp = Blueprint("items", __name__)


# -------------------------------------------------
# GET /items
# -------------------------------------------------
# Author: Abraham Sharkey
# Responsibility:
#   Retrieves all library items from the database.
#   This endpoint is used by the frontend home/search page.
# Learning Outcome:
#   LO2 – RESTful GET endpoint
#   LO3 – Database querying using SQL
# -------------------------------------------------
@items_bp.route("/items", methods=["GET"])
def get_items():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Query only essential item attributes.
    # Copy-level availability is handled separately to avoid redundancy.
    cursor.execute("""
        SELECT ItemID, Title, Author, ItemType
        FROM Item
    """)
    items = cursor.fetchall()

    conn.close()

    # Returns a JSON array of items with HTTP 200 OK
    return jsonify(items), 200


# -------------------------------------------------
# GET /items/<item_id>
# -------------------------------------------------
# Author: Abraham Sharkey
# Responsibility:
#   Retrieves a single item by its unique identifier.
#   Used by the Item Details page in the frontend.
# Learning Outcome:
#   LO2 – Parameterised REST endpoint
#   LO4 – Graceful error handling using HTTP status codes
# -------------------------------------------------
@items_bp.route("/items/<int:item_id>", methods=["GET"])
def get_item(item_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Parameterised query prevents SQL injection
    cursor.execute("""
        SELECT ItemID, Title, Author, ItemType
        FROM Item
        WHERE ItemID = %s
    """, (item_id,))

    item = cursor.fetchone()
    conn.close()

    # Error handling:
    # Returns a clear JSON error if the item does not exist
    if not item:
        return jsonify({"error": "Item not found"}), 404

    return jsonify(item), 200


# -------------------------------------------------
# GET /items/<item_id>/copies
# -------------------------------------------------
# Author: Abraham Sharkey
# Responsibility:
#   Retrieves all physical copies of a given item,
#   including their availability status and branch location.
# Business Rationale:
#   Availability is tracked at copy level rather than item level
#   to support multi-branch libraries.
# Learning Outcome:
#   LO2 – RESTful resource design
#   LO3 – SQL JOINs across related tables
# -------------------------------------------------
@items_bp.route("/items/<int:item_id>/copies", methods=["GET"])
def get_item_copies(item_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Join ItemCopy with Branch to provide meaningful availability data
    cursor.execute("""
        SELECT
            ic.CopyID,
            ic.Status,
            b.BranchName
        FROM ItemCopy ic
        JOIN Branch b ON ic.BranchID = b.BranchID
        WHERE ic.ItemID = %s
    """, (item_id,))

    copies = cursor.fetchall()
    conn.close()

    # Error handling:
    # If an item exists but has no registered copies,
    # return a clear error message for frontend handling
    if not copies:
        return jsonify({"error": "No copies found for this item"}), 404

    return jsonify({
        "item_id": item_id,
        "copies": copies
    }), 200
