# ServerPE Admin API Documentation

## Overview

The ServerPE Admin API provides comprehensive endpoints for managing licenses, users, analytics, and system monitoring. All endpoints require admin authentication.

**Base URL:** `http://localhost:8888/admin`

---

## Authentication

All admin endpoints require:
1. **Valid JWT Token** - Passed via cookie
2. **Admin Privileges** - User must have `is_admin = true` in database

### How to Get JWT Token
1. Login via `/serverpeuser/login` endpoint
2. JWT token will be set in cookie automatically
3. Include cookie in all subsequent requests

### Error Responses

#### Not Authenticated (401)
```json
{
  "poweredby": "serverpe.in",
  "status": "Failed",
  "successstatus": false,
  "message": "Authentication required"
}
```

#### Not Admin (403)
```json
{
  "poweredby": "serverpe.in",
  "status": "Failed",
  "successstatus": false,
  "message": "Admin access required"
}
```

---

## API Endpoints

### 📊 Analytics & Statistics

#### 1. Get Platform Overview

**Endpoint:** `GET /admin/analytics/overview`

**Description:** Get comprehensive platform statistics including users, licenses, revenue, and downloads.

**Request:**
```http
GET /admin/analytics/overview HTTP/1.1
Host: localhost:8888
Cookie: token=YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "poweredby": "serverpe.in",
  "status": "Success",
  "successstatus": true,
  "data": {
    "users": {
      "total": 150,
      "new_last_7_days": 12,
      "new_last_30_days": 45
    },
    "licenses": {
      "total": 200,
      "active": 185,
      "inactive": 15,
      "bound_to_device": 170,
      "not_yet_used": 30
    },
    "revenue": {
      "total_orders": 200,
      "total_revenue": 250000.00,
      "average_order_value": 1250.00,
      "last_7_days": 15000.00,
      "last_30_days": 62500.00
    },
    "sales": {
      "last_7_days": 12,
      "last_30_days": 50
    },
    "projects": {
      "total": 15
    },
    "downloads": {
      "total": 450,
      "last_7_days": 45,
      "last_30_days": 180
    },
    "generated_at": "2026-01-09T18:00:00.000Z"
  }
}
```

---

### 🔑 License Management

#### 2. Get All Licenses

**Endpoint:** `GET /admin/licenses`

**Description:** Get paginated list of all licenses with filtering options.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `status` | string | - | Filter by status (ACTIVE/INACTIVE) |
| `bound` | boolean | - | Filter by fingerprint binding (true/false) |
| `search` | string | - | Search license key, user, or project |

**Request:**
```http
GET /admin/licenses?page=1&limit=20&status=ACTIVE&bound=true HTTP/1.1
Host: localhost:8888
Cookie: token=YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "poweredby": "serverpe.in",
  "status": "Success",
  "successstatus": true,
  "data": {
    "licenses": [
      {
        "license_key": "LIC-1-1736442784000",
        "status": "ACTIVE",
        "is_bound": true,
        "bound_at": "2026-01-09T10:30:00.000Z",
        "created_at": "2026-01-08T15:20:00.000Z",
        "user": {
          "name": "Student Name",
          "email": "student@example.com"
        },
        "project": {
          "title": "Train Reservation System",
          "code": "TRAIN001"
        },
        "download_count": 5
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 200,
    "total_pages": 10
  }
}
```

---

#### 3. Get License Details

**Endpoint:** `GET /admin/licenses/:license_key`

**Description:** Get detailed information about a specific license including user, project, order, and download history.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `license_key` | string | License key (e.g., LIC-1-1736442784000) |

**Request:**
```http
GET /admin/licenses/LIC-1-1736442784000 HTTP/1.1
Host: localhost:8888
Cookie: token=YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "poweredby": "serverpe.in",
  "status": "Success",
  "successstatus": true,
  "data": {
    "license": {
      "license_key": "LIC-1-1736442784000",
      "status": "ACTIVE",
      "created_at": "2026-01-08T15:20:00.000Z",
      "fingerprint": {
        "is_bound": true,
        "bound_at": "2026-01-09T10:30:00.000Z",
        "hash": "a7f9c3e2b1d4f5a6..."
      }
    },
    "user": {
      "id": 123,
      "name": "Student Name",
      "email": "student@example.com",
      "mobile": "+919876543210"
    },
    "project": {
      "id": 5,
      "title": "Train Reservation System",
      "code": "TRAIN001",
      "description": "Full-stack train ticket booking system"
    },
    "order": {
      "order_number": "SVRP/2026/123",
      "total_amount": 1059.32,
      "payable_amount": 1250.00,
      "gst_amount": 190.68,
      "order_status": "PAID",
      "order_date": "2026-01-08T15:15:00.000Z",
      "payment": {
        "gateway_payment_id": "pay_abc123xyz",
        "status": "SUCCESS"
      }
    },
    "download_history": {
      "total_downloads": 5,
      "recent_downloads": [
        {
          "ip": "192.168.1.100",
          "downloaded_at": "2026-01-09T11:00:00.000Z"
        }
      ]
    }
  }
}
```

**Response (404 Not Found):**
```json
{
  "poweredby": "serverpe.in",
  "status": "Failed",
  "successstatus": false,
  "message": "License not found"
}
```

---

#### 4. Reset License Fingerprint

**Endpoint:** `POST /admin/licenses/:license_key/reset-fingerprint`

**Description:** Reset device fingerprint for a license, allowing it to be used on a different device.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `license_key` | string | License key to reset |

**Request:**
```http
POST /admin/licenses/LIC-1-1736442784000/reset-fingerprint HTTP/1.1
Host: localhost:8888
Cookie: token=YOUR_JWT_TOKEN
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "poweredby": "serverpe.in",
  "status": "Success",
  "successstatus": true,
  "message": "License fingerprint reset successfully",
  "data": {
    "license_key": "LIC-1-1736442784000",
    "user": {
      "name": "Student Name",
      "email": "student@example.com",
      "mobile": "+919876543210"
    },
    "project": "Train Reservation System",
    "previous_fingerprint": "a7f9c3e2b1d4f5a6e8c9d0b1a2f3e4d5...",
    "previous_bound_at": "2026-01-09T10:30:00.000Z",
    "reset_by_admin": 1,
    "reset_at": "2026-01-10T14:00:00.000Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "poweredby": "serverpe.in",
  "status": "Failed",
  "successstatus": false,
  "message": "License fingerprint not yet bound (never used)"
}
```

---

#### 5. Activate License

**Endpoint:** `POST /admin/licenses/:license_key/activate`

**Description:** Activate a license (sets status to ACTIVE).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `license_key` | string | License key to activate |

**Request:**
```http
POST /admin/licenses/LIC-1-1736442784000/activate HTTP/1.1
Host: localhost:8888
Cookie: token=YOUR_JWT_TOKEN
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "poweredby": "serverpe.in",
  "status": "Success",
  "successstatus": true,
  "message": "License activated successfully",
  "data": {
    "license_key": "LIC-1-1736442784000",
    "previous_status": "INACTIVE",
    "new_status": "ACTIVE",
    "updated_by_admin": 1,
    "updated_at": "2026-01-10T14:00:00.000Z"
  }
}
```

---

#### 6. Deactivate License

**Endpoint:** `POST /admin/licenses/:license_key/deactivate`

**Description:** Deactivate a license (sets status to INACTIVE, prevents usage).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `license_key` | string | License key to deactivate |

**Request:**
```http
POST /admin/licenses/LIC-1-1736442784000/deactivate HTTP/1.1
Host: localhost:8888
Cookie: token=YOUR_JWT_TOKEN
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "poweredby": "serverpe.in",
  "status": "Success",
  "successstatus": true,
  "message": "License deactivated successfully",
  "data": {
    "license_key": "LIC-1-1736442784000",
    "previous_status": "ACTIVE",
    "new_status": "INACTIVE",
    "updated_by_admin": 1,
    "updated_at": "2026-01-10T14:00:00.000Z"
  }
}
```

---

### 👥 User Management

#### 7. Get All Users

**Endpoint:** `GET /admin/users`

**Description:** Get paginated list of all users with their statistics.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `search` | string | - | Search by name, email, or mobile |

**Request:**
```http
GET /admin/users?page=1&limit=20&search=john HTTP/1.1
Host: localhost:8888
Cookie: token=YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "poweredby": "serverpe.in",
  "status": "Success",
  "successstatus": true,
  "data": {
    "users": [
      {
        "id": 123,
        "name": "John Doe",
        "email": "john@example.com",
        "mobile": "+919876543210",
        "is_admin": false,
        "joined_date": "2026-01-05T10:00:00.000Z",
        "stats": {
          "total_licenses": 3,
          "active_licenses": 3,
          "total_spent": 3750.00
        }
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

---

#### 8. Get User Purchases

**Endpoint:** `GET /admin/users/:user_id/purchases`

**Description:** Get specific user's complete purchase history.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | integer | User ID |

**Request:**
```http
GET /admin/users/123/purchases HTTP/1.1
Host: localhost:8888
Cookie: token=YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "poweredby": "serverpe.in",
  "status": "Success",
  "successstatus": true,
  "data": {
    "purchases": [
      {
        "license_key": "LIC-123-1736442784000",
        "status": "ACTIVE",
        "purchased_at": "2026-01-08T15:20:00.000Z",
        "is_bound": true,
        "project_title": "Train Reservation System",
        "project_code": "TRAIN001",
        "order_number": "SVRP/2026/123",
        "payable_amount": 1250.00,
        "download_count": 5
      }
    ]
  }
}
```

---

#### 9. Grant Admin Privileges

**Endpoint:** `POST /admin/users/:user_id/make-admin`

**Description:** Grant admin privileges to a user (sets `is_admin = true`).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | integer | User ID to grant admin |

**Request:**
```http
POST /admin/users/456/make-admin HTTP/1.1
Host: localhost:8888
Cookie: token=YOUR_JWT_TOKEN
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "poweredby": "serverpe.in",
  "status": "Success",
  "successstatus": true,
  "message": "Admin privileges granted successfully"
}
```

---

#### 10. Revoke Admin Privileges

**Endpoint:** `POST /admin/users/:user_id/remove-admin`

**Description:** Revoke admin privileges from a user (sets `is_admin = false`).

**Important:** Cannot remove your own admin privileges.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | integer | User ID to revoke admin |

**Request:**
```http
POST /admin/users/456/remove-admin HTTP/1.1
Host: localhost:8888
Cookie: token=YOUR_JWT_TOKEN
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "poweredby": "serverpe.in",
  "status": "Success",
  "successstatus": true,
  "message": "Admin privileges revoked successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "poweredby": "serverpe.in",
  "status": "Failed",
  "successstatus": false,
  "message": "Cannot remove your own admin privileges"
}
```

---

### 🔧 System Monitoring

#### 11. System Health Check

**Endpoint:** `GET /admin/system/health`

**Description:** Check system health and database connectivity.

**Request:**
```http
GET /admin/system/health HTTP/1.1
Host: localhost:8888
Cookie: token=YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "poweredby": "serverpe.in",
  "status": "Success",
  "successstatus": true,
  "data": {
    "database": "connected",
    "server": "running",
    "timestamp": "2026-01-10T14:00:00.000Z"
  }
}
```

---

## Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (not admin) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Internal Server Error |

---

## Response Format

All responses follow this consistent structure:

```json
{
  "poweredby": "serverpe.in",
  "status": "Success" | "Failed",
  "successstatus": true | false,
  "message": "Optional message",
  "data": { },
  "pagination": { } // Only for paginated endpoints
}
```

---

## Frontend Integration Examples

### React/Axios Example

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8888';

// Create axios instance with credentials
const adminAPI = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  withCredentials: true // Important: includes cookies
});

// Get platform statistics
const getStatistics = async () => {
  try {
    const response = await adminAPI.get('/analytics/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics:', error.response?.data);
    throw error;
  }
};

// Reset license fingerprint
const resetFingerprint = async (licenseKey) => {
  try {
    const response = await adminAPI.post(`/licenses/${licenseKey}/reset-fingerprint`);
    return response.data;
  } catch (error) {
    console.error('Error resetting fingerprint:', error.response?.data);
    throw error;
  }
};

// Get all licenses with filters
const getLicenses = async (filters = {}) => {
  try {
    const { page = 1, limit = 20, status, bound, search } = filters;
    const response = await adminAPI.get('/licenses', {
      params: { page, limit, status, bound, search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching licenses:', error.response?.data);
    throw error;
  }
};
```

### Fetch API Example

```javascript
const API_BASE_URL = 'http://localhost:8888';

// Get platform statistics
const getStatistics = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/analytics/overview`, {
    credentials: 'include' // Important: includes cookies
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }
  
  return response.json();
};

// Reset fingerprint
const resetFingerprint = async (licenseKey) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/licenses/${licenseKey}/reset-fingerprint`,
    {
      method: 'POST',
      credentials: 'include'
    }
  );
  
  return response.json();
};
```

---

## Error Handling Best Practices

```javascript
try {
  const data = await adminAPI.get('/analytics/overview');
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        // Show "Admin access required" message
        showError('You need admin privileges');
        break;
      case 404:
        showError('Resource not found');
        break;
      default:
        showError(data.message || 'An error occurred');
    }
  } else {
    // Network error
    showError('Network error. Please check your connection.');
  }
}
```

---

## UI Component Suggestions

### Dashboard Overview
- **Cards**: Display total users, licenses, revenue
- **Charts**: Line charts for revenue trends, user growth
- **Recent Activity**: Table of recent purchases/downloads

### License Management
- **Table**: Sortable, filterable license list
- **Details Modal**: Show full license details on click
- **Actions**: Reset fingerprint, activate/deactivate buttons
- **Search Bar**: Real-time search
- **Filters**: Status dropdown, bound/unbound toggle

### User Management
- **Table**: User list with stats
- **User Details**: Click to view purchase history
- **Admin Toggle**: Grant/revoke admin privileges
- **Search**: Search by name, email, mobile

### System Health
- **Status Indicators**: Green/red for database, server
- **Refresh Button**: Manual refresh option
- **Auto-refresh**: Optional polling every 30s

---

## Development Tips

1. **CORS**: Ensure backend CORS is configured to accept credentials from your frontend URL
2. **Cookies**: Use `withCredentials: true` (Axios) or `credentials: 'include'` (Fetch)
3. **Error Handling**: Always handle 401/403 errors to redirect to login
4. **Loading States**: Show loaders during API calls
5. **Pagination**: Implement pagination UI for lists
6. **Real-time Updates**: Consider polling or WebSockets for live statistics

---

## Security Notes

- All endpoints require admin authentication
- Admin status is verified from database on every request
- JWT tokens expire (check backend token expiry settings)
- Cannot remove own admin privileges (safety feature)
- All admin actions are logged server-side

---

## Support

For issues or questions:
- Backend Repository: [Link to repo]
- Contact: admin@serverpe.in
