import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
"""
-------------------------------------------------
Author: Abraham Sharkey
File: db.py
Responsibility:
    Provides a reusable database connection utility
    for the CMP5387 Library Loans System backend.
Learning Outcomes:
    LO3 – Database connectivity and configuration
-------------------------------------------------
"""

import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables from the .env file.
# This keeps database credentials out of source code
# and follows best security practices.
load_dotenv()


def get_db_connection():
    """
    Creates and returns a new MySQL database connection.

    Design Decision:
        A new connection is created per request to ensure
        thread safety and predictable connection lifecycle
        management within Flask.

    Returns:
        mysql.connector.connection.MySQLConnection
    """
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
