"""
-------------------------------------------------
Author: Abraham Sharkey
File: app.py
Responsibility:
    Application entry point for the CMP5387 Library
    Loans System backend. This file initialises the
    Flask application, registers API routes, and
    defines global error handling.
Learning Outcomes:
    LO2 – Backend web-service configuration
    LO4 – Robust API design and error handling
-------------------------------------------------
"""

from flask import Flask, jsonify
from flask_cors import CORS
from db import get_db_connection

# Import route blueprints implemented as part of
# the backend service layer.
from routes.items import items_bp
from routes.loans import loans_bp
from routes.members import members_bp
from routes.reservations import reservations_bp

# -------------------------------------------------
# Application setup
# -------------------------------------------------
# Author: Abraham Sharkey
# Responsibility:
#   Initialises the Flask application and enables
#   Cross-Origin Resource Sharing (CORS) to allow
#   browser-based frontend access.
app = Flask(__name__)
CORS(app)

# -------------------------------------------------
# Register API blueprints
# -------------------------------------------------
# Each blueprint encapsulates a specific domain
# of backend functionality.
app.register_blueprint(items_bp)
app.register_blueprint(loans_bp)
app.register_blueprint(members_bp)
app.register_blueprint(reservations_bp)


# -------------------------------------------------
# Root health-check endpoint
# -------------------------------------------------
@app.route("/")
def home():
    # Simple endpoint used to verify that the backend
    # service is running correctly.
    return "Library system backend is running"


# -------------------------------------------------
# Database connectivity test endpoint
# -------------------------------------------------
@app.route("/test-db")
def test_db():
    # Opens and closes a database connection to
    # verify configuration and connectivity.
    conn = get_db_connection()
    conn.close()
    return "Database connection successful"


# -------------------------------------------------
# Global JSON error handlers
# -------------------------------------------------
# These handlers ensure that all errors are returned
# in a consistent JSON format suitable for API clients.

@app.errorhandler(404)
def not_found(_e):
    return jsonify({"error": "Route not found"}), 404


@app.errorhandler(405)
def method_not_allowed(_e):
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(500)
def internal_error(_e):
    # Keeps error responses clean and avoids leaking
    # internal server details to the client.
    return jsonify({"error": "Internal server error"}), 500


# -------------------------------------------------
# Application entry point
# -------------------------------------------------
if __name__ == "__main__":
    # Debug mode enabled for development and testing
    # purposes only.
    app.run(debug=True)
