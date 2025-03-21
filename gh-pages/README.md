# Inventory Management System

![Inventory Tracker Logo](client/src/assets/images/inventory-logo.svg)

## Overview

This Inventory Management System is an advanced tool designed to streamline equipment tracking, check-in/out processes, and user interactions. It's built with a focus on user experience, data integrity, and intuitive design, making it perfect for organizations that need to track valuable equipment and manage user access.

## 🚀 Live Demo

**View the interactive demo:** [https://codistech.github.io/InventoryTracker/demo.html](https://codistech.github.io/InventoryTracker/demo.html)

Experience our inventory management system firsthand through our interactive demo. The demo showcases the user interface and core functionalities, allowing you to explore the system's capabilities before deployment.

## 📸 Visual Overview

### Dashboard
![Dashboard](screenshots/dashboard.svg)
The Dashboard provides an at-a-glance overview of your inventory status, recent activities, and alerts for low stock and overdue items. Key metrics are displayed prominently for quick assessment of inventory health.

### Inventory Management
![Inventory](screenshots/inventory.svg)
The Inventory page offers comprehensive tools for managing your equipment inventory, with features for filtering, sorting, and detailed item information. Color-coded status indicators provide immediate visual feedback on item availability.

### Transaction History
![Transactions](screenshots/transactions.svg)
The Transactions view allows you to track all equipment check-ins and check-outs with detailed personnel information, timestamps, and status updates. Comprehensive filtering options help you find specific transactions quickly.

## 🔄 User Workflows

### Equipment Check-Out Process
1. Log in with your user credentials
2. Navigate to the Inventory section
3. Search or browse for the required equipment
4. Select the item and click "Check Out"
5. Fill in the required information (purpose, expected return date)
6. Confirm the transaction and receive a digital receipt

### Equipment Check-In Process
1. Log in with your user credentials
2. Navigate to the "Checked Out" section
3. Locate the item to be returned
4. Click "Check In" and confirm the condition of the returned item
5. Complete the transaction with optional notes

### Administrative Operations
1. Log in with admin or superadmin credentials
2. Access the admin dashboard for system-wide metrics
3. Manage users, departments, and permissions
4. Generate reports for compliance and inventory management
5. Configure system settings and integration options

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

- **Repository Configuration**
  - Support for three repository types (Private, Public, Sandbox)
  - Feature flags tailored to each repository type
  - Visual indicators of current repository type in UI
  - Easy switching between repository types for testing
  - Comprehensive documentation for repository types and features

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
   git clone https://github.com/codistech/InventoryTracker.git
   cd InventoryTracker
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

#### GitHub Pages Deployment (Interactive Demo)

The project includes configuration for GitHub Pages to showcase an interactive demo of the application:

1. Run the live demo deployment script
   ```
   ./deploy-live-demo.sh
   ```

2. Deploy to GitHub Pages using one of these methods:

   **Option 1: Manual Deployment**
   ```
   cd gh-pages
   git init
   git add .
   git commit -m "GitHub Pages Interactive Demo"
   git branch -M gh-pages
   git remote add origin https://github.com/codistech/InventoryTracker.git
   git push -u origin gh-pages --force
   ```

   **Option 2: Automated GitHub Actions Deployment**
   - Configure GitHub Actions using the provided workflow file in `.github/workflows/pages.yml`
   - Push changes to your repository, and GitHub Actions will automatically deploy the demo

3. Your interactive demo will be available at:
   ```
   https://codistech.github.io/InventoryTracker/demo.html
   ```

4. For detailed deployment instructions, see:
   ```
   github-pages-manual-deploy.md
   ```

**Live Demo Features:**
- Interactive UI showcase with animated components
- Sample dashboard with mock metrics and charts
- Inventory and transaction management demos
- Form interactions for common workflows
- Mobile-responsive design preview

Note: The GitHub Pages deployment provides an interactive showcase of the application UI. For full functionality, deploy the application with a backend server.

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
| `REPOSITORY_TYPE` | Repository type (private/public/sandbox) | private |

Repository type can also be configured by:
1. Creating a `.repository-type` file in the root directory with "private", "public", or "sandbox"
2. Using the provided script: `node change-repository-type.js <repository-type>`
3. Git branch name (main → private, public → public, sandbox → sandbox)

## Documentation

For more detailed documentation, see:

- [User Guide](docs/USER_GUIDE.md)
- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Docker Deployment](docs/DOCKER.md)
- [Repository Types](docs/REPOSITORY_TYPES.md)

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