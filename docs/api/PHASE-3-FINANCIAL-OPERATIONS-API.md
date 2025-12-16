# Phase 3: Financial Operations API Documentation

## Overview
This document provides details on the REST API endpoints for the Financial Operations modules including Purchase Management, Sales Management, and Point of Sale (POS).

---

## Purchase Management

### Base URL
`/api/v1/purchases`

### Endpoints

#### 1. Create Purchase Order
**POST** `/purchases`

Creates a new purchase order with items.

**Request Body:**
```json
{
  "vendorId": "uuid",
  "supplierId": "uuid",
  "purchaseDate": "2025-12-16",
  "expectedDeliveryDate": "2025-12-25",
  "shippingCost": 500.00,
  "paymentMethod": "bank_transfer",
  "paymentTerms": "Net 30",
  "notes": "Urgent order",
  "items": [
    {
      "productId": "uuid",
      "quantity": 100,
      "unitCost": 50.00,
      "discountPercentage": 5,
      "taxPercentage": 7.5,
      "batchNumber": "BATCH001",
      "expiryDate": "2026-12-31"
    }
  ]
}
```

**Response:** `201 Created`
- Returns complete purchase order with generated purchase number

#### 2. Get All Purchases
**GET** `/purchases`

Retrieves purchases with optional filters.

**Query Parameters:**
- `vendorId` - Filter by vendor
- `supplierId` - Filter by supplier
- `status` - Filter by status (draft, pending, approved, received, cancelled)
- `paymentStatus` - Filter by payment status
- `startDate` - Start date filter
- `endDate` - End date filter
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response:** `200 OK`
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

#### 3. Get Purchase by ID
**GET** `/purchases/:id`

Retrieves a single purchase with all items.

**Response:** `200 OK`

#### 4. Update Purchase
**PATCH** `/purchases/:id`

Updates a purchase order.

**Request Body:** Partial purchase data

**Response:** `200 OK`

#### 5. Approve Purchase
**POST** `/purchases/:id/approve`

Approves a pending purchase order.

**Response:** `200 OK`

#### 6. Receive Purchase
**POST** `/purchases/:id/receive`

Marks purchase as received and updates inventory.

**Request Body:**
```json
{
  "items": [
    {
      "itemId": "uuid",
      "quantity": 95
    }
  ]
}
```

**Response:** `200 OK`

#### 7. Cancel Purchase
**POST** `/purchases/:id/cancel`

Cancels a purchase order.

**Response:** `200 OK`

#### 8. Delete Purchase
**DELETE** `/purchases/:id`

Deletes a purchase order (only if not received).

**Response:** `204 No Content`

#### 9. Get Average Purchase Price
**GET** `/purchases/products/:productId/average-price?vendorId=uuid`

Calculates average purchase price for a product.

**Response:** `200 OK`
```json
{
  "productId": "uuid",
  "avgPrice": 47.50
}
```

#### 10. Get Total Purchases
**GET** `/purchases/summary/total?vendorId=uuid&startDate=2025-01-01&endDate=2025-12-31`

Gets total purchase amount for a vendor.

**Response:** `200 OK`
```json
{
  "total": 125000.00
}
```

---

## Sales Management

### Base URL
`/api/v1/sales`

### Endpoints

#### 1. Create Sales Order/Quotation
**POST** `/sales`

Creates a new sales order or quotation.

**Request Body:**
```json
{
  "vendorId": "uuid",
  "clientId": "uuid",
  "customerId": "uuid",
  "salesDate": "2025-12-16",
  "dueDate": "2025-12-25",
  "paymentMethod": "cash",
  "paymentTerms": "Net 15",
  "notes": "Priority customer",
  "customerNotes": "Thank you for your business",
  "items": [
    {
      "productId": "uuid",
      "quantity": 10,
      "unitPrice": 150.00,
      "discountPercentage": 5,
      "taxPercentage": 7.5,
      "batchNumber": "BATCH001"
    }
  ]
}
```

**Response:** `201 Created`
- Returns complete sales order with generated sales number

#### 2. Get All Sales
**GET** `/sales`

Retrieves sales with optional filters.

**Query Parameters:**
- `vendorId` - Filter by vendor
- `clientId` - Filter by client
- `customerId` - Filter by customer
- `status` - Filter by status (quotation, confirmed, invoiced, paid, cancelled, returned)
- `paymentStatus` - Filter by payment status
- `startDate` - Start date filter
- `endDate` - End date filter
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response:** `200 OK`

#### 3. Get Sales by ID
**GET** `/sales/:id`

Retrieves a single sales record with all items.

**Response:** `200 OK`

#### 4. Update Sales
**PATCH** `/sales/:id`

Updates a sales order.

**Request Body:** Partial sales data

**Response:** `200 OK`

#### 5. Confirm Sales
**POST** `/sales/:id/confirm`

Confirms a sales quotation.

**Response:** `200 OK`

#### 6. Generate Invoice
**POST** `/sales/:id/generate-invoice`

Generates an invoice for confirmed sales.

**Response:** `200 OK`
- Returns sales with generated invoice number

#### 7. Record Payment
**POST** `/sales/:id/payment`

Records a payment for sales.

**Request Body:**
```json
{
  "amount": 1500.00,
  "paymentMethod": "card"
}
```

**Response:** `200 OK`

#### 8. Cancel Sales
**POST** `/sales/:id/cancel`

Cancels a sales order.

**Response:** `200 OK`

#### 9. Process Return
**POST** `/sales/:id/return`

Processes a sales return.

**Request Body:**
```json
{
  "items": [
    {
      "itemId": "uuid",
      "quantity": 2
    }
  ]
}
```

**Response:** `200 OK`

#### 10. Delete Sales
**DELETE** `/sales/:id`

Deletes a sales record (only if not paid).

**Response:** `204 No Content`

#### 11. Get Total Sales
**GET** `/sales/summary/total?vendorId=uuid&startDate=2025-01-01&endDate=2025-12-31`

Gets total sales amount for a vendor.

**Response:** `200 OK`
```json
{
  "total": 250000.00
}
```

#### 12. Get Sales by Status
**GET** `/sales/summary/by-status?vendorId=uuid&startDate=2025-01-01&endDate=2025-12-31`

Gets sales summary grouped by status.

**Response:** `200 OK`
```json
[
  {
    "status": "paid",
    "count": "45",
    "total": "125000.00"
  },
  {
    "status": "invoiced",
    "count": "12",
    "total": "35000.00"
  }
]
```

---

## Point of Sale (POS)

### Base URL
`/api/v1/pos`

### Session Management

#### 1. Open POS Session
**POST** `/pos/sessions`

Opens a new POS session.

**Request Body:**
```json
{
  "vendorId": "uuid",
  "openingBalance": 1000.00,
  "notes": "Morning shift"
}
```

**Response:** `201 Created`
- Returns session with generated session number

#### 2. Close POS Session
**POST** `/pos/sessions/:id/close`

Closes a POS session.

**Request Body:**
```json
{
  "closingBalance": 1550.00,
  "notes": "End of shift"
}
```

**Response:** `200 OK`

#### 3. Get Active Sessions
**GET** `/pos/sessions/active?vendorId=uuid`

Gets all active POS sessions for a vendor.

**Response:** `200 OK`

#### 4. Get My Sessions
**GET** `/pos/sessions/my-sessions?limit=10`

Gets current cashier's sessions.

**Response:** `200 OK`

#### 5. Get Session Details
**GET** `/pos/sessions/:id`

Gets detailed information about a session.

**Response:** `200 OK`

#### 6. Get Session Report
**GET** `/pos/sessions/:id/report`

Gets a comprehensive session report.

**Response:** `200 OK`
```json
{
  "session": {...},
  "transactions": [...],
  "summary": {
    "totalTransactions": 25,
    "totalSales": 5500.00,
    "cashSales": 3000.00,
    "cardSales": 2000.00,
    "bankTransferSales": 500.00,
    "openingBalance": 1000.00,
    "closingBalance": 1550.00,
    "expectedBalance": 4000.00,
    "variance": -50.00
  }
}
```

### Transactions

#### 7. Create Transaction
**POST** `/pos/transactions`

Creates a new POS transaction.

**Request Body:**
```json
{
  "sessionId": "uuid",
  "customerId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 150.00,
      "discountPercentage": 5,
      "taxPercentage": 7.5
    }
  ],
  "amountPaid": 300.00,
  "paymentMethod": "cash",
  "notes": "Regular customer"
}
```

**Response:** `201 Created`
- Returns transaction with calculated totals and change

#### 8. Get Transaction Details
**GET** `/pos/transactions/:id`

Gets transaction details.

**Response:** `200 OK`

#### 9. Get Session Transactions
**GET** `/pos/sessions/:id/transactions`

Gets all transactions for a session.

**Response:** `200 OK`

#### 10. Mark Receipt Printed
**POST** `/pos/transactions/:id/print-receipt`

Marks a transaction receipt as printed.

**Response:** `200 OK`

### Product Search

#### 11. Search Products
**GET** `/pos/products/search?vendorId=uuid&q=searchTerm&limit=20`

Searches products by SKU, barcode, or name for POS.

**Query Parameters:**
- `vendorId` - Vendor ID (required)
- `q` - Search term: SKU, barcode, or product name (required)
- `limit` - Number of results (optional, default: 20)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "sku": "PROD-001",
    "barcode": "1234567890",
    "name": "Paracetamol 500mg",
    "unitPrice": 50.00,
    "availableQuantity": 100
  }
]
```

---

## Common Response Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Resource deleted successfully
- `400 Bad Request` - Invalid request data or business logic violation
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Permissions Required

### Purchases
- `purchases.create` - Create purchase orders
- `purchases.read` - View purchases
- `purchases.update` - Update purchases
- `purchases.approve` - Approve purchases
- `purchases.receive` - Receive purchases
- `purchases.cancel` - Cancel purchases
- `purchases.delete` - Delete purchases

### Sales
- `sales.create` - Create sales/quotations
- `sales.read` - View sales
- `sales.update` - Update sales
- `sales.confirm` - Confirm quotations
- `sales.invoice` - Generate invoices
- `sales.payment` - Record payments
- `sales.cancel` - Cancel sales
- `sales.return` - Process returns
- `sales.delete` - Delete sales

### POS
- `pos.create` - Open POS sessions
- `pos.read` - View POS data
- `pos.transaction` - Create transactions
- `pos.close` - Close sessions

---

## Status Workflows

### Purchase Status Flow
```
draft → pending → approved → received
  ↓         ↓         ↓
cancelled cancelled cancelled
```

### Sales Status Flow
```
quotation → confirmed → invoiced → paid
    ↓           ↓          ↓         ↓
cancelled  cancelled  cancelled returned
                        returned
```

### POS Session Status
- `open` - Session is active
- `closed` - Session is closed

---

## Notes

1. All amounts are in the configured currency (default: NGN)
2. All dates should be in ISO 8601 format (YYYY-MM-DD)
3. All endpoints require authentication (JWT token in Authorization header)
4. Pagination is supported on list endpoints
5. Product search for POS supports fuzzy matching
6. Inventory is automatically updated when purchases are received
7. Sales can be created as quotations and converted to invoices
8. POS transactions automatically update session totals
9. All operations are vendor-scoped for multi-tenancy

---

## Integration Points

### Inventory Synchronization
- Purchase receiving automatically updates inventory
- POS/Sales transactions reduce inventory
- Returns update inventory accordingly

### Notification Triggers
- Purchase approval/receiving → Supplier notifications
- Sales invoice generation → Customer notifications
- Payment recording → Customer receipts

### Accounting Integration
- All transactions create corresponding accounting entries
- Payment methods are tracked for reconciliation
- Reports aggregate financial data

---

**Last Updated:** December 16, 2025
**API Version:** 1.0.0
