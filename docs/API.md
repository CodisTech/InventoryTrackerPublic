# Inventory Management System API Documentation

This document provides information about the Inventory Management System REST API endpoints for developers who need to integrate with the system.

## API Overview

The API follows REST principles and returns JSON responses. All endpoints are prefixed with `/api`.

## Authentication

Most API endpoints require authentication. The API uses session-based authentication.

### Login

```
POST /api/login
```

Request body:
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "id": "number",
  "username": "string",
  "fullName": "string",
  "role": "string",
  "isAuthorized": "boolean"
}
```

### Logout

```
POST /api/logout
```

Response: HTTP 200 OK

### Get Current User

```
GET /api/user
```

Response:
```json
{
  "id": "number",
  "username": "string",
  "fullName": "string",
  "role": "string",
  "isAuthorized": "boolean"
}
```

### Change Password

```
POST /api/change-password
```

Request body:
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

Response: HTTP 200 OK

## Inventory Management

### Get All Inventory Items

```
GET /api/inventory
```

Response:
```json
[
  {
    "id": "number",
    "itemCode": "string",
    "name": "string",
    "categoryId": "number",
    "description": "string",
    "totalQuantity": "number",
    "availableQuantity": "number",
    "category": {
      "id": "number",
      "name": "string"
    }
  }
]
```

### Get Inventory Item

```
GET /api/inventory/:id
```

Response:
```json
{
  "id": "number",
  "itemCode": "string",
  "name": "string",
  "categoryId": "number",
  "description": "string",
  "totalQuantity": "number",
  "availableQuantity": "number",
  "category": {
    "id": "number",
    "name": "string"
  }
}
```

### Create Inventory Item

```
POST /api/inventory
```

Request body:
```json
{
  "itemCode": "string",
  "name": "string",
  "categoryId": "number",
  "description": "string",
  "totalQuantity": "number"
}
```

Response: The created inventory item

### Update Inventory Item

```
PATCH /api/inventory/:id
```

Request body: Any fields to update

Response: The updated inventory item

## Category Management

### Get All Categories

```
GET /api/categories
```

Response:
```json
[
  {
    "id": "number",
    "name": "string"
  }
]
```

### Create Category

```
POST /api/categories
```

Request body:
```json
{
  "name": "string"
}
```

Response: The created category

## Personnel Management

### Get All Personnel

```
GET /api/personnel
```

Response:
```json
[
  {
    "id": "number",
    "firstName": "string",
    "lastName": "string",
    "division": "string",
    "department": "string",
    "jDial": "string",
    "lcpoName": "string"
  }
]
```

### Get Personnel

```
GET /api/personnel/:id
```

Response:
```json
{
  "id": "number",
  "firstName": "string",
  "lastName": "string",
  "division": "string",
  "department": "string",
  "jDial": "string",
  "lcpoName": "string"
}
```

### Create Personnel

```
POST /api/personnel
```

Request body:
```json
{
  "firstName": "string",
  "lastName": "string",
  "division": "string",
  "department": "string",
  "jDial": "string",
  "lcpoName": "string"
}
```

Response: The created personnel record

### Update Personnel

```
PATCH /api/personnel/:id
```

Request body: Any fields to update

Response: The updated personnel record

### Delete Personnel

```
DELETE /api/personnel/:id
```

Response: HTTP 200 OK

## Transaction Management

### Get All Transactions

```
GET /api/transactions
```

Response:
```json
[
  {
    "id": "number",
    "userId": "number",
    "itemId": "number",
    "personnelId": "number",
    "quantity": "number",
    "type": "string",
    "status": "string",
    "dueDate": "string",
    "checkoutDate": "string",
    "checkinDate": "string",
    "notes": "string",
    "user": {
      "id": "number",
      "username": "string",
      "fullName": "string"
    },
    "item": {
      "id": "number",
      "itemCode": "string",
      "name": "string",
      "category": {
        "id": "number",
        "name": "string"
      }
    },
    "personnel": {
      "id": "number",
      "firstName": "string",
      "lastName": "string",
      "division": "string",
      "department": "string"
    }
  }
]
```

### Check Out Item

```
POST /api/transactions/checkout
```

Request body:
```json
{
  "itemId": "number",
  "personnelId": "number",
  "quantity": "number",
  "dueDate": "string",
  "notes": "string"
}
```

Response: The created transaction

### Check In Item

```
POST /api/transactions/checkin/:id
```

Request body:
```json
{
  "notes": "string"
}
```

Response: The updated transaction

### Get Overdue Items

```
GET /api/overdue-items
```

Response: Array of transactions that are overdue

## Dashboard

### Get Dashboard Stats

```
GET /api/dashboard/stats
```

Response:
```json
{
  "totalItems": "number",
  "checkedOutItems": "number",
  "availableItems": "number",
  "personnelCount": "number",
  "recentTransactions": [
    {
      "id": "number",
      "type": "string",
      "status": "string",
      "item": {
        "name": "string"
      },
      "personnel": {
        "firstName": "string",
        "lastName": "string"
      },
      "checkoutDate": "string",
      "checkinDate": "string"
    }
  ]
}
```

## Reports

### Personnel Activity

```
GET /api/reports/personnel-activity
```

Response: Array of personnel activity data

### Department Usage

```
GET /api/reports/department-usage
```

Response: Array of department usage data

## User Management (Admin Only)

### Get All Users

```
GET /api/users
```

Response: Array of users

### Create User

```
POST /api/users
```

Request body:
```json
{
  "username": "string",
  "password": "string",
  "fullName": "string",
  "role": "string"
}
```

Response: The created user

### Update User

```
PATCH /api/users/:id
```

Request body: Any fields to update

Response: The updated user

## Error Responses

All API endpoints return the following error response format:

```json
{
  "message": "Error message description"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Security Features

### CSRF Protection

Cross-Site Request Forgery (CSRF) protection is implemented for all state-changing endpoints (POST, PATCH, DELETE). 
To make requests to these endpoints, you need to:

1. Obtain a CSRF token by making a GET request to `/api/csrf-token`
2. Include this token in subsequent requests as either:
   - An HTTP header: `X-CSRF-Token: <token>`
   - A request body parameter: `_csrf: <token>`

Example:
```javascript
// 1. Get the CSRF token
const tokenResponse = await fetch('/api/csrf-token', {
  credentials: 'include'  // Important: include cookies
});
const { csrfToken } = await tokenResponse.json();

// 2. Use the token in subsequent requests
const response = await fetch('/api/inventory', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken  // Include the token
  },
  body: JSON.stringify({
    // request data
  }),
  credentials: 'include'  // Important: include cookies
});
```

### Security Headers

The API implements the following security headers:

- `X-XSS-Protection`: Prevents reflected XSS attacks
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `X-Frame-Options`: Protects against clickjacking
- `Content-Security-Policy`: Restricts what resources can be loaded
- `Referrer-Policy`: Controls how much referrer information is included
- `Strict-Transport-Security`: Forces HTTPS usage (in production)

### Rate Limiting

API rate limiting is implemented to protect the service from abuse. Current limits:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Versioning

The current API version is v1. All endpoints are accessed via `/api/` without a version prefix. Future versions may be accessed via `/api/v2/` etc.

## Support

For API support or to report issues, please open an issue in the GitHub repository.