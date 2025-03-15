#!/bin/sh
set -e

# Wait for the DB to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Initialize the database schema
echo "Initializing database schema..."
node setup-db.js

# Start the application
echo "Starting application..."
exec "$@"