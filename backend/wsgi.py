#!/usr/bin/env python3
"""
WSGI entry point for H1B Explorer Flask app on SiteGround
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Import the Flask app
from app import app

# For WSGI servers
application = app

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False)
