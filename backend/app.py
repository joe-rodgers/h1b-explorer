from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'database': os.environ.get('DB_NAME', 'h1b_explorer'),
    'user': os.environ.get('DB_USER', 'postgres'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'port': os.environ.get('DB_PORT', '5432')
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return None

@app.route('/')
def home():
    """Root endpoint"""
    return jsonify({
        "message": "H1B Explorer Backend API",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "test": "/api/test",
            "db_status": "/api/db-status",
            "health": "/api/health"
        }
    })

@app.route('/api/test')
def test_endpoint():
    """Test endpoint to verify backend is live"""
    return jsonify({
        "message": "Backend is live!",
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

@app.route('/api/db-status')
def db_status():
    """Check database connection and return table count"""
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({
                "db_connected": False,
                "error": "Failed to connect to database",
                "timestamp": datetime.now().isoformat(),
                "config": {
                    "host": DB_CONFIG['host'],
                    "database": DB_CONFIG['database'],
                    "user": DB_CONFIG['user'],
                    "port": DB_CONFIG['port']
                }
            }), 500
        
        cursor = conn.cursor()
        
        # Get table count
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        table_count = cursor.fetchone()[0]
        
        # Get database info
        cursor.execute("SELECT version()")
        db_version = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "db_connected": True,
            "table_count": table_count,
            "db_version": db_version,
            "timestamp": datetime.now().isoformat(),
            "config": {
                "host": DB_CONFIG['host'],
                "database": DB_CONFIG['database'],
                "user": DB_CONFIG['user'],
                "port": DB_CONFIG['port']
            }
        })
        
    except Exception as e:
        logger.error(f"Database status error: {e}")
        return jsonify({
            "db_connected": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
            "config": {
                "host": DB_CONFIG['host'],
                "database": DB_CONFIG['database'],
                "user": DB_CONFIG['user'],
                "port": DB_CONFIG['port']
            }
        }), 500

@app.route('/api/health')
def health_check():
    """Comprehensive health check endpoint"""
    try:
        # Test backend
        backend_status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
        
        # Test database
        db_response = db_status()
        db_status_data = db_response.json
        
        return jsonify({
            "backend": backend_status,
            "database": db_status_data,
            "overall_status": "healthy" if db_status_data.get("db_connected", False) else "degraded",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            "backend": {"status": "error", "error": str(e)},
            "database": {"db_connected": False, "error": str(e)},
            "overall_status": "unhealthy",
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/info')
def api_info():
    """API information endpoint"""
    return jsonify({
        "name": "H1B Explorer API",
        "version": "1.0.0",
        "description": "Backend API for H1B Explorer data visualization platform",
        "endpoints": {
            "root": "/",
            "test": "/api/test",
            "db_status": "/api/db-status",
            "health": "/api/health",
            "info": "/api/info",
            "setup_db": "/api/setup-db"
        },
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/setup-db')
def setup_database():
    """Setup database tables and initial data"""
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({
                "success": False,
                "error": "Failed to connect to database",
                "timestamp": datetime.now().isoformat()
            }), 500
        
        cursor = conn.cursor()
        
        # Create H1B applications table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS h1b_applications (
                id SERIAL PRIMARY KEY,
                employer_name VARCHAR(255) NOT NULL,
                job_title VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                salary DECIMAL(10,2) NOT NULL,
                year INTEGER NOT NULL,
                case_status VARCHAR(100),
                visa_class VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_employer ON h1b_applications(employer_name);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_job_title ON h1b_applications(job_title);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_year ON h1b_applications(year);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_location ON h1b_applications(location);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_salary ON h1b_applications(salary);")
        
        # Create statistics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS h1b_statistics (
                id SERIAL PRIMARY KEY,
                year INTEGER NOT NULL,
                total_applications INTEGER DEFAULT 0,
                avg_salary DECIMAL(10,2) DEFAULT 0,
                top_employer VARCHAR(255),
                top_location VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Insert sample data
        sample_data = [
            ('Google LLC', 'Software Engineer', 'Mountain View, CA', 150000, 2023, 'Certified', 'H-1B'),
            ('Microsoft Corporation', 'Data Scientist', 'Redmond, WA', 140000, 2023, 'Certified', 'H-1B'),
            ('Apple Inc.', 'Product Manager', 'Cupertino, CA', 160000, 2023, 'Certified', 'H-1B'),
        ]
        
        cursor.executemany("""
            INSERT INTO h1b_applications (employer_name, job_title, location, salary, year, case_status, visa_class)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, sample_data)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Database setup completed successfully",
            "tables_created": ["h1b_applications", "h1b_statistics"],
            "sample_data_inserted": len(sample_data),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Database setup error: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "error": "Endpoint not found",
        "message": "The requested endpoint does not exist",
        "available_endpoints": [
            "/",
            "/api/test",
            "/api/db-status", 
            "/api/health",
            "/api/info"
        ],
        "timestamp": datetime.now().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        "error": "Internal server error",
        "message": "Something went wrong on the server",
        "timestamp": datetime.now().isoformat()
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting H1B Explorer Backend on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
