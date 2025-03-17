# Inventory Management System

![Inventory Tracker Logo](client/src/assets/images/inventory-logo.svg)

## Overview

This Inventory Management System is an advanced tool designed to streamline equipment tracking, check-in/out processes, and user interactions. It's built with a focus on user experience, data integrity, and intuitive design, making it perfect for organizations that need to track valuable equipment and manage user access.

## Key Features

- **User Management**
  - Role-based authentication (Superadmin, Admin, User)
  - Personnel management with department tracking
  - Secure password handling and account management

- **Inventory Management**
  - Categorized inventory items with detailed tracking
  - Low stock alerts and availability status
  - Barcode/item code support for quick lookups

- **Transaction Processing**
  - Check-in/out workflow with signature capture
  - Due date tracking and overdue item alerts
  - Transaction history and activity logging

- **Dashboard and Reporting**
  - Real-time inventory status metrics
  - Personnel activity tracking
  - Department usage analytics
  - Exportable reports in multiple formats

- **Security Features**
  - CSRF protection for all state-changing operations
  - Rate limiting to prevent abuse
  - Secure HTTP response headers
  - Session security with timeouts and secure cookies
  - EULA and privacy policy agreements
  - Fine-grained permission system
  - Audit logging for compliance

## Technology Stack

- **Frontend**
  - React with TypeScript
  - TailwindCSS and ShadcnUI for styling
  - React Query for data fetching
  - React Hook Form for form management

- **Backend**
  - Node.js with Express
  - TypeScript for type-safe development
  - Passport.js for authentication
  - Drizzle ORM for database interactions

- **Database**
  - PostgreSQL (primary)
  - In-memory fallback for development

- **Deployment**
  - Docker containerization
  - Docker Compose for multi-container setup

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL (optional, fallback to in-memory storage available)
- Docker and Docker Compose (for containerized deployment)

### Development Setup

1. Clone the repository
   ```
   git clone https://github.com/codistech/inventory-management-system.git
   cd inventory-management-system
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Access the application
   - Frontend will be available at: `http://localhost:5000`
   - API endpoints accessible at: `http://localhost:5000/api/`

### Production Deployment

#### Using Docker (Recommended)

1. Build and start containers
   ```
   docker-compose up -d
   ```

2. Access the application
   ```
   http://localhost:5000
   ```

#### Manual Deployment

1. Build the application
   ```
   npm run build
   ```

2. Start the production server
   ```
   npm start
   ```

#### GitHub Pages Deployment

The project includes configuration for GitHub Pages to showcase the application:

1. Run the test deployment script
   ```
   ./test-github-deploy.sh
   ```

2. Create a GitHub repository and push the gh-pages directory
   ```
   cd gh-pages
   git init
   git add .
   git commit -m "Initial GitHub Pages deployment"
   git remote add origin https://github.com/codistech/inventory-management-system.git
   git push -u origin main
   ```

3. Enable GitHub Pages in your repository settings, selecting the main branch

4. Your GitHub Pages site will be available at:
   ```
   https://codistech.github.io/inventory-management-system/
   ```

Note: The GitHub Pages deployment provides a static showcase of the application UI. For full functionality, deploy the application with a backend server.

## Default Credentials

The system comes with pre-configured accounts for testing:

- **Superadmin**
  - Username: `superadmin`
  - Password: `superadmin123`

- **Admin**
  - Username: `admin`
  - Password: `admin123`

- **Regular User**
  - Username: `user`
  - Password: `user123`

⚠️ **Important**: Change default passwords after first login for security.

## Configuration

Configuration can be managed through environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | (in-memory) |
| `PORT` | Application port | 5000 |
| `SESSION_SECRET` | Secret for session encryption | (auto-generated) |
| `NODE_ENV` | Environment (development/production) | development |

## Documentation

For more detailed documentation, see:

- [User Guide](docs/USER_GUIDE.md)
- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Docker Deployment](docs/DOCKER.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support requests, please open an issue in the GitHub repository.