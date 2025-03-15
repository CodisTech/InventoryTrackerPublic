#!/bin/sh
set -e

# Wait for the DB to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Run database migrations
echo "Running database migrations..."
npm run db:push

# Start the application
echo "Starting application..."
exec "$@"