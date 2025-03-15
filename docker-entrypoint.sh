#!/bin/sh
set -e

# Function to test database connection
check_db() {
  node -e "
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });
    client.connect()
      .then(() => {
        console.log('Database connection successful');
        client.end();
        process.exit(0);
      })
      .catch(err => {
        console.error('Database connection failed:', err.message);
        client.end();
        process.exit(1);
      });
  "
  return $?
}

# Wait for the DB to be ready with exponential backoff
echo "Waiting for PostgreSQL to become available..."
retry_count=1
max_retries=10
wait_time=1
while ! check_db && [ $retry_count -le $max_retries ]; do
  echo "Attempt $retry_count of $max_retries: Database not available yet, waiting ${wait_time}s before retry..."
  sleep $wait_time
  retry_count=$((retry_count + 1))
  wait_time=$((wait_time * 2))  # Exponential backoff
done

# Verify database is available
if ! check_db; then
  echo "ERROR: Could not connect to the database after $max_retries attempts. Exiting."
  exit 1
fi

# Initialize the database schema
echo "Initializing database schema..."
node setup-db.js

# Start the application
echo "Starting application..."
exec "$@"