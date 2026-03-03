# Fanbasis API Reference

> **AI-optimized reference** — every endpoint, parameter, request/response example, webhook event, and error code in the Fanbasis public API.

## Base URL

```
https://www.fanbasis.com/public-api/
```

## Authentication

All requests require an `x-api-key` header:

```
x-api-key: YOUR_API_KEY
```

## Environments

| Environment | Base URL |
|-------------|----------|
| Production  | `https://www.fanbasis.com/public-api/` |
| Sandbox     | `https://sandbox.fanbasis.com/public-api/` |

## Endpoints

### Webhooks

Webhooks Webhooks are the bridge between Fanbasis and your application. Instead of constantly asking "did something happen?", your server just listens and Fanbasis calls it automatically whenever an event occurs — like a payment coming in or a subscription being canceled. ⬡ How webhooks work You…

#### List Your Webhook Subscriptions

```
GET /public-api/webhook-subscriptions
```

Shows all webhook endpoints you've registered, what events they're listening for, and whether they're active.

**Request**

```bash
curl https://www.fanbasis.com/public-api/webhook-subscriptions \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "data": [
    {
      "id": "ws_abc123",
      "webhook_url": "https://yoursite.com/webhooks",
      "event_types": ["payment.succeeded", "subscription.created"],
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### Create a Webhook Subscription

```
POST /public-api/webhook-subscriptions
```

Registers a new URL to receive webhook events. You choose which events to subscribe to. The response includes a secret_key — use it to verify that incoming requests are genuinely from Fanbasis. The secret_key is only shown once. Store it securely (e.g., as an environment variable). You'll use it to validate the signature of every incoming webhook request.

**Request Body**

```json
{
  "webhook_url": "https://yoursite.com/webhooks/fanbasis",
  "event_types": [
    "payment.succeeded",
    "payment.failed",
    "subscription.created",
    "subscription.canceled"
  ]
}
```

**Request**

```bash
curl -X POST https://www.fanbasis.com/public-api/webhook-subscriptions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://yourapp.com/webhooks/fanbasis",
    "event_types": ["payment.succeeded", "subscription.created", "subscription.canceled"]
  }'
```

**Response**

```json
{
  "status": "success",
  "data": {
    "id": "ws_new123",
    "webhook_url": "https://yourapp.com/webhooks/fanbasis",
    "event_types": ["payment.succeeded", "subscription.created", "subscription.canceled"],
    "secret_key": "whsec_abcdef1234567890",
    "is_active": true,
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

#### Delete a Webhook Subscription

```
DELETE /public-api/webhook-subscriptions/:webhookSubscriptionId
```

Removes a webhook subscription. Fanbasis will immediately stop sending events to that URL.

**Path Parameters**

| Parameter             | Type   | Required | Description                                   |
| --------------------- | ------ | -------- | --------------------------------------------- |
| webhookSubscriptionId | string | Yes      | The ID of the webhook subscription to remove. |

**Request**

```bash
curl -X DELETE "https://www.fanbasis.com/public-api/webhook-subscriptions/ws_abc123" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "message": "Webhook subscription deleted successfully",
  "data": []
}
```

#### Test a Webhook Subscription

```
POST /public-api/webhook-subscriptions/:webhookSubscriptionId/test
```

Sends a simulated event to your webhook URL so you can verify everything is working before going live. Great for testing your server's response logic without needing a real payment. Once you start receiving real payment events, these practices will save you from subtle, hard-to-debug issues:

**Path Parameters**

| Parameter             | Type   | Required | Description                                 |
| --------------------- | ------ | -------- | ------------------------------------------- |
| webhookSubscriptionId | string | Yes      | The ID of the webhook subscription to test. |

**Request Body**

```json
{
  "event_type": "payment.succeeded"
}
```

**Request**

```bash
curl -X POST "https://www.fanbasis.com/public-api/webhook-subscriptions/ws_abc123/test" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "event_type": "payment.succeeded" }'
```

**Response**

```json
{
  "status": "success",
  "message": "Test event sent successfully",
  "data": {
    "event_sent": true,
    "response_status": 200,
    "response_body": "OK"
  }
}
```

---

### Checkout Sessions

A checkout session is how you create a payment page. Think of it as a product listing that Fanbasis hosts for you — you define the name, price, and type, and Fanbasis gives you a link customers can use to pay. One checkout session can be shared with unlimited customers and generates a new…

#### Create a Checkout Session

```
POST /public-api/checkout-sessions
```

This is the most important endpoint — you'll call it every time you want to offer a product for purchase. The payment link you get back is ready to use immediately. You're launching a new coaching package priced at $199 one-time. You call this endpoint, get a payment link, and paste it into your newsletter. Anyone who clicks and pays gets a transaction recorded automatically.

**Request Body**

```json
{
  "product": {
    "title": "Premium Membership",
    "description": "Access to all premium features"
  },
  "amount_cents": 2999,
  "application_fee": 0,
  "type": "subscription",
  "metadata": {
    "internal_ref": "plan_premium_monthly"
  },
  "expiration_date": "2025-12-31",
  "subscription": {
    "frequency_days": 30,
    "auto_expire_after_x_periods": null,
    "free_trial_days": 7,
    "initial_fee": 0,
    "initial_fee_days": 0
  },
  "success_url": "https://yoursite.com/success",
  "webhook_url": "https://yoursite.com/webhooks/fanbasis"
}
```

**Request**

```bash
curl -X POST https://www.fanbasis.com/public-api/checkout-sessions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "title": "Pro Monthly Membership",
      "description": "Full access including private Discord + weekly calls"
    },
    "amount_cents": 2999,
    "type": "subscription",
    "subscription": {
      "frequency_days": 30,
      "free_trial_days": 7
    },
    "success_url": "https://yoursite.com/welcome",
    "metadata": { "plan": "pro" }
  }'
```

**Response**

```json
{
  "status": "success",
  "message": "Created Product",
  "data": {
    "id": "NLxj6",
    "checkout_session_id": 345424,
    "payment_link": "https://www.fanbasis.com/agency-checkout/your-handle/NLxj6"
  },
  "request_id": "Root=1-xxxxxxxx-xxxxxxxxxxxxxxxxxxxx"
}
```

#### Look Up a Checkout Session

```
GET /public-api/checkout-sessions/:checkoutSessionId
```

Retrieves all the details of a checkout session — the product info, pricing, subscription settings, and expiration date. Useful if you've lost track of a session's configuration.

**Path Parameters**

| Parameter         | Type   | Required | Description                                                    |
| ----------------- | ------ | -------- | -------------------------------------------------------------- |
| checkoutSessionId | string | Yes      | The checkout_session_id returned when you created the session. |

**Request**

```bash
curl "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "data": {
    "product": {
      "id": "NLxj6",
      "title": "Pro Monthly Membership",
      "description": "Full access including private Discord + weekly calls"
    },
    "amount_cents": 2999,
    "type": "subscription",
    "subscription": { "frequency_days": 30, "free_trial_days": 7 },
    "success_url": "https://yoursite.com/welcome"
  }
}
```

#### Delete a Checkout Session

```
DELETE /public-api/checkout-sessions/:checkoutSessionId
```

Permanently deletes a checkout session and deactivates its payment link. Anyone who visits the link afterwards will see a "not found" error. Existing transactions and subscriptions created through this session are not affected — only the ability to make new purchases is removed.

**Path Parameters**

| Parameter         | Type   | Required | Description                               |
| ----------------- | ------ | -------- | ----------------------------------------- |
| checkoutSessionId | string | Yes      | The ID of the checkout session to delete. |

**Request**

```bash
curl -X DELETE "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{ "status": "success", "message": "Checkout session deleted successfully", "data": [] }
```

#### Get Transactions for a Checkout Session

```
GET /public-api/checkout-sessions/:checkoutSessionId/transactions
```

Returns all transactions associated with a specific checkout session. Useful when a single session has produced multiple payments (e.g. subscription renewals tied to the same session).

**Path Parameters**

| Parameter         | Type   | Required | Description              |
| ----------------- | ------ | -------- | ------------------------ |
| checkoutSessionId | string | Yes      | The checkout session ID. |

**Query Parameters**

| Parameter | Type    | Required | Description                                 |
| --------- | ------- | -------- | ------------------------------------------- |
| page      | integer | No       | Which page of results to show. Starts at 1. |
| per_page  | integer | No       | How many results per page (max 100).        |

**Request**

```bash
curl "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/transactions?page=1&per_page=20" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": "txn_abc123",
        "fan": { "name": "Jane Doe", "email": "jane@example.com" },
        "service": { "title": "Pro Monthly Membership", "price": 29.99 },
        "fee_amount": 1.20,
        "net_amount": 28.79
      }
    ],
    "pagination": { "current_page": 1, "total_pages": 3, "total_items": 48, "has_more": true }
  }
}
```

#### Create an Embedded Checkout Session

```
POST /public-api/checkout-sessions/embedded
```

Creates a checkout session designed to be embedded directly inside your app or website, rather than redirecting to a separate page. Requires an existing Fanbasis product_id. Returns a checkout_session_secret you use to construct the embedded checkout URL. The checkout_session_secret is scoped to your creator account, not to a single product. You can reuse the same secret and swap the product_id…

**Request Body**

```json
{
  "product_id": "NLxj6",
  "metadata": {
    "user_id": "usr_abc123",
    "source": "in-app"
  }
}
```

**Request**

```bash
curl -X POST https://www.fanbasis.com/public-api/checkout-sessions/embedded \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "product_id": "NLxj6", "metadata": { "source": "in-app" } }'
```

**Response**

```json
{
  "status": "success",
  "data": {
    "checkout_session_secret": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

---

### Customers

Your customer list includes everyone who has ever purchased from you through Fanbasis. The Customers API lets you search your list, view saved payment methods, and charge customers again directly — without them needing to go through checkout. ✦ When is this useful? A customer wants to add another…

#### List Your Customers

```
GET /public-api/customers
```

Returns a searchable, paginated list of all your customers — with their total spend, transaction count, and last payment date.

**Query Parameters**

| Parameter | Type    | Required | Description                                                            |
| --------- | ------- | -------- | ---------------------------------------------------------------------- |
| search    | string  | No       | Type a name, email, or phone number to search for a specific customer. |
| page      | integer | No       | Page number (starts at 1).                                             |
| per_page  | integer | No       | Results per page (max 100).                                            |

**Request**

```bash
curl "https://www.fanbasis.com/public-api/customers?search=jane@example.com" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "data": {
    "customers": [
      {
        "id": "cust_1",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "total_transactions": 5,
        "total_spent": 149.95,
        "last_transaction_date": "2025-01-10T00:00:00Z"
      }
    ],
    "pagination": { "current_page": 1, "total_items": 58 }
  }
}
```

#### Get a Customer's Saved Payment Methods

```
GET /public-api/customers/:customerId/payment-methods
```

Shows all payment cards a customer has on file. You'll need the payment method ID to charge them directly.

**Path Parameters**

| Parameter  | Type   | Required | Description                                 |
| ---------- | ------ | -------- | ------------------------------------------- |
| customerId | string | Yes      | The customer's ID (from the customer list). |

**Request**

```bash
curl "https://www.fanbasis.com/public-api/customers/cust_1/payment-methods" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "data": {
    "customer": { "name": "Jane Doe", "email": "jane@example.com" },
    "payment_methods": [
      {
        "id": "pm_abc",
        "type": "card",
        "last4": "4242",
        "brand": "visa",
        "exp_month": 12,
        "exp_year": 2027,
        "is_default": true
      }
    ]
  }
}
```

#### Charge a Customer Directly

```
POST /public-api/customers/:customerId/charge
```

Charges a customer using a saved payment method. No checkout page needed — the charge happens immediately.

**Path Parameters**

| Parameter  | Type   | Required | Description        |
| ---------- | ------ | -------- | ------------------ |
| customerId | string | Yes      | The customer's ID. |

**Request Body**

```json
{
  "payment_method_id": "pm_abc123xyz",
  "service_id": "svc_premium_monthly",
  "amount_cents": 1999,
  "description": "Monthly premium subscription charge",
  "metadata": {}
}
```

**Request**

```bash
curl -X POST "https://www.fanbasis.com/public-api/customers/cust_1/charge" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method_id": "pm_abc",
    "service_id": "svc_pro_plan",
    "amount_cents": 1999,
    "description": "Upgrade to Pro plan",
    "metadata": {}
  }'
```

**Response**

```json
{
  "status": "success",
  "data": {
    "charge_id": "ch_abc123",
    "amount": 19.99,
    "status": "succeeded",
    "created_at": "2025-01-15T14:30:00Z"
  }
}
```

---

### Subscribers

The Subscribers endpoint gives you a unified view of who is subscribed to what — combining customer profile info with their subscription status across all your products. Think of it as a live member directory.

#### List All Subscribers

```
GET /public-api/subscribers
```

Returns every subscriber across all your products. Filter by customer or product to narrow results.

**Query Parameters**

| Parameter   | Type    | Required | Description                                                      |
| ----------- | ------- | -------- | ---------------------------------------------------------------- |
| product_id  | string  | No       | Show only subscribers to this product.                           |
| customer_id | string  | No       | Show only subscriptions belonging to this customer.              |
| status      | string  | No       | Filter by subscription status (e.g. active, cancelled, expired). |
| page        | integer | No       | Page number.                                                     |
| per_page    | integer | No       | Results per page (max 100).                                      |

**Request**

```bash
curl "https://www.fanbasis.com/public-api/subscribers?product_id=NLxj6" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "data": {
    "subscribers": [
      {
        "id": "sub_1",
        "customer": { "name": "Jane Doe", "email": "jane@example.com" },
        "product": { "title": "Pro Monthly Membership", "price": 29.99 },
        "subscription": {
          "status": "active",
          "payment_frequency": 30,
          "created_at": "2025-01-01T00:00:00Z"
        }
      }
    ],
    "pagination": { "current_page": 1, "total_items": 80 }
  }
}
```

#### Get Subscriptions for a Checkout Session

```
GET /public-api/checkout-sessions/:checkoutSessionId/subscriptions
```

Returns all subscriptions created from a specific checkout session. Useful for subscription products that have multiple subscribers through the same session.

**Path Parameters**

| Parameter         | Type   | Required | Description              |
| ----------------- | ------ | -------- | ------------------------ |
| checkoutSessionId | string | Yes      | The checkout session ID. |

**Query Parameters**

| Parameter | Type    | Required | Description                 |
| --------- | ------- | -------- | --------------------------- |
| page      | integer | No       | Page number.                |
| per_page  | integer | No       | Results per page (max 100). |

**Request**

```bash
curl "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/subscriptions?page=1" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "data": {
    "subscriptions": [
      {
        "id": "sub_1",
        "email": "jane@example.com",
        "subscription_status": "active",
        "next_renewal_date": "2025-02-15T00:00:00Z"
      }
    ],
    "pagination": { "current_page": 1, "total_pages": 1, "total_items": 12 }
  }
}
```

#### Get Subscriptions for a Product

```
GET /public-api/checkout-sessions/:productId/subscriptions
```

Lists every subscriber to a specific product. Shows their email, subscription status, and when they'll next be billed. Great for managing your member list.

**Path Parameters**

| Parameter | Type   | Required | Description                                                    |
| --------- | ------ | -------- | -------------------------------------------------------------- |
| productId | string | Yes      | The checkout_session_id of the product to get subscribers for. |

**Query Parameters**

| Parameter | Type    | Required | Description                 |
| --------- | ------- | -------- | --------------------------- |
| page      | integer | No       | Page number.                |
| per_page  | integer | No       | Results per page (max 100). |

**Request**

```bash
curl "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/subscriptions?page=1" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "data": {
    "subscriptions": [
      {
        "id": "sub_1",
        "email": "jane@example.com",
        "subscription_status": "active",
        "next_renewal_date": "2025-02-15T00:00:00Z"
      }
    ],
    "pagination": { "current_page": 1, "total_pages": 2, "total_items": 40 }
  }
}
```

#### Cancel a Subscription

```
DELETE /public-api/checkout-sessions/:checkoutSessionId/subscriptions/:subscriptionId
```

Cancels a customer's subscription. They keep access until the end of the current billing period but won't be charged again. The subscriptionId is the id field returned in the subscription list above — not the customer's user ID.

**Path Parameters**

| Parameter         | Type   | Required | Description                                                    |
| ----------------- | ------ | -------- | -------------------------------------------------------------- |
| checkoutSessionId | string | Yes      | The ID of the product the subscription belongs to.             |
| subscriptionId    | string | Yes      | The subscription ID from the subscription list (the id field). |

**Request**

```bash
curl -X DELETE \
  "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/subscriptions/sub_xyz789" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "message": "Subscription cancelled successfully",
  "data": { "id": "sub_1", "cancelled_at": "2025-01-15T14:00:00Z", "subscription_status": "cancelled" }
}
```

#### Refund a Transaction

```
POST /public-api/checkout-sessions/transactions/:transactionId/refund
```

Issues a full or partial refund for a payment. For a full refund, don't include amount_cents. For a partial refund, specify exactly how much to refund. Once issued, a refund cannot be canceled. The customer receives the refunded amount back to their original payment method within a few business days.

**Path Parameters**

| Parameter     | Type   | Required | Description                          |
| ------------- | ------ | -------- | ------------------------------------ |
| transactionId | string | Yes      | The ID of the transaction to refund. |

**Request Body**

```json
{
  "amount_cents": 1500
}
```

**Request**

```bash
# Full refund — omit amount_cents
curl -X POST "https://www.fanbasis.com/public-api/checkout-sessions/transactions/txn_abc123/refund" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response**

```json
{
  "status": "success",
  "message": "Transaction refunded successfully",
  "data": { "refund_id": "re_1234567890", "transaction_id": "txn_abc123", "refund_amount": 29.99, "refund_type": "full" }
}
```

#### Extend a Subscription

```
POST /public-api/checkout-sessions/:checkoutSessionId/extend-subscription
```

Pushes out a customer's next billing date by a given number of days. Use this to comp members for downtime, run a loyalty promotion, or manually extend access.

**Path Parameters**

| Parameter         | Type   | Required | Description                                        |
| ----------------- | ------ | -------- | -------------------------------------------------- |
| checkoutSessionId | string | Yes      | The ID of the product the subscription belongs to. |

**Request Body**

```json
{
  "user_id": "usr_abc123",
  "duration_days": 30
}
```

**Request**

```bash
curl -X POST "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/extend-subscription" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "user_id": "usr_456", "duration_days": 30 }'
```

**Response**

```json
{
  "status": "success",
  "message": "Subscription extended successfully",
  "data": { "subscription_id": "sub_1", "new_completion_date": "2025-04-15T00:00:00Z" }
}
```

---

### Discount Codes

Discount codes let you offer reduced pricing to specific customers or as part of a promotion. You control the discount type (percentage or fixed amount), how long it applies, when it expires, and how many times it can be used. ✦ Ideas for using discount codes "SUMMER20" — 20% off the first payment.…

#### List Discount Codes

```
GET /public-api/discount-codes
```

Returns all your discount codes. Use the search parameter to quickly find a specific code.

**Query Parameters**

| Parameter | Type    | Required | Description                                       |
| --------- | ------- | -------- | ------------------------------------------------- |
| search    | string  | No       | Filter codes by their code string or description. |
| per_page  | integer | No       | Results per page (max 100).                       |

**Request**

```bash
curl "https://www.fanbasis.com/public-api/discount-codes" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "code": "SUMMER20",
        "discount_type": "percentage",
        "value": 20,
        "duration": "once",
        "is_active": true
      }
    ],
    "total": 1
  }
}
```

#### Create a Discount Code

```
POST /public-api/discount-codes
```

Creates a new discount code with the settings you define.

**Request Body**

```json
{
  "code": "SUMMER20",
  "description": "20% off for new subscribers",
  "discount_type": "percentage",
  "value": 20,
  "duration": "multiple_months",
  "no_of_months": 3,
  "expiry": "2025-08-31",
  "limited_redemptions": true,
  "usable_number": 100,
  "one_time": true,
  "service_ids": [101, 102]
}
```

**Request**

```bash
curl -X POST https://www.fanbasis.com/public-api/discount-codes \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SUMMER20",
    "discount_type": "percentage",
    "value": 20,
    "duration": "once",
    "service_ids": [101],
    "expiry": "2025-08-31",
    "one_time": true
  }'
```

**Response**

```json
{ "status": "success", "message": "Discount code created successfully", "data": {} }
```

#### Get a Discount Code

```
GET /public-api/discount-codes/:id
```

Fetches the details of one discount code, including how many times it's been used.

**Path Parameters**

| Parameter | Type   | Required | Description             |
| --------- | ------ | -------- | ----------------------- |
| id        | string | Yes      | The discount code's ID. |

**Request**

```bash
curl "https://www.fanbasis.com/public-api/discount-codes/1" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "code": "SUMMER20",
    "discount_type": "percentage",
    "value": 20,
    "duration": "once",
    "expiry": "2025-08-31",
    "times_used": 12,
    "is_active": true
  }
}
```

#### Update a Discount Code

```
PUT /public-api/discount-codes/:id
```

Updates an existing discount code. Only include the fields you want to change.

**Path Parameters**

| Parameter | Type   | Required | Description             |
| --------- | ------ | -------- | ----------------------- |
| id        | string | Yes      | The discount code's ID. |

**Request Body**

```json
{
  "code": "SUMMER20",
  "description": "Updated discount — 20% off for 3 months",
  "discount_type": "percentage",
  "value": 20,
  "duration": "multiple_months",
  "no_of_months": 3,
  "expiry": "2026-03-31",
  "limited_redemptions": true,
  "usable_number": 200,
  "one_time": false,
  "service_ids": [101, 102]
}
```

**Request**

```bash
curl -X PUT "https://www.fanbasis.com/public-api/discount-codes/1" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "expiry": "2025-12-31" }'
```

**Response**

```json
{ "status": "success", "message": "Discount code updated successfully", "data": {} }
```

#### Delete a Discount Code

```
DELETE /public-api/discount-codes/:id
```

Deletes a discount code. Customers with active subscriptions already using this code won't be affected — they'll keep their discount.

**Path Parameters**

| Parameter | Type   | Required | Description             |
| --------- | ------ | -------- | ----------------------- |
| id        | string | Yes      | The discount code's ID. |

**Request**

```bash
curl -X DELETE "https://www.fanbasis.com/public-api/discount-codes/1" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{ "status": "success", "message": "Discount code deleted successfully", "data": [] }
```

---

### Products

Products Products (called "services" in some parts of the API) are the items you've set up to sell. Each product has its own payment link. Use the Products endpoint to pull a list of everything you offer — useful for building dynamic product pages or dropdowns in your own app.

#### List Your Products

```
GET /public-api/products
```

Returns all your products with their titles, prices, and ready-to-use payment links.

**Query Parameters**

| Parameter | Type    | Required | Description                 |
| --------- | ------- | -------- | --------------------------- |
| page      | integer | No       | Page number.                |
| per_page  | integer | No       | Results per page (max 100). |

**Request**

```bash
curl "https://www.fanbasis.com/public-api/products" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": "prod_1",
        "title": "Pro Monthly",
        "description": "Full access to all features, billed monthly.",
        "price": 29.99,
        "payment_link": "https://www.fanbasis.com/agency-checkout/your-handle/prod_1"
      }
    ],
    "total": 5
  }
}
```

---

### Transactions

A transaction is a record of a single completed payment. Every time a customer pays — one-time or recurring — a transaction is created. The Transactions API lets you pull detailed records including customer info, the product sold, Fanbasis's fee, and your net payout.

#### Look Up a Transaction

```
GET /public-api/transactions/:transactionId
```

Returns the full details of a single payment. Useful for customer support lookups, accounting, or building transaction receipts.

**Path Parameters**

| Parameter     | Type   | Required | Description                                                                                      |
| ------------- | ------ | -------- | ------------------------------------------------------------------------------------------------ |
| transactionId | string | Yes      | The transaction ID. This appears in webhook events and in the transactions list as the id field. |

**Request**

```bash
curl "https://www.fanbasis.com/public-api/transactions/txn_abc123" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "data": {
    "id": "txn_abc123",
    "transaction_date": "2025-01-15T14:30:00Z",
    "fan": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "country_code": "US"
    },
    "service": {
      "title": "Pro Monthly Membership",
      "price": 29.99
    },
    "fee_amount": 1.20,
    "net_amount": 28.79,
    "refunds": []
  }
}
```

#### Get All Transactions

```
GET /public-api/checkout-sessions/transactions
```

Returns every payment that's been made across all your products. Each result shows who paid, what they bought, your fee, and your net payout. You can filter by product or customer.

**Query Parameters**

| Parameter   | Type    | Required | Description                                 |
| ----------- | ------- | -------- | ------------------------------------------- |
| product_id  | string  | No       | Only show transactions for this product.    |
| customer_id | string  | No       | Only show transactions from this customer.  |
| page        | integer | No       | Which page of results to show. Starts at 1. |
| per_page    | integer | No       | How many results per page (max 100).        |

**Request**

```bash
curl "https://www.fanbasis.com/public-api/checkout-sessions/transactions?page=1&per_page=20" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**

```json
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": "txn_abc123",
        "fan": { "name": "Jane Doe", "email": "jane@example.com" },
        "service": { "title": "Pro Monthly Membership", "price": 29.99 },
        "fee_amount": 1.20,
        "net_amount": 28.79
      }
    ],
    "pagination": { "current_page": 1, "total_pages": 5, "total_items": 95, "has_more": true }
  }
}
```

---

### Refunds

The Fanbasis API allows you to issue full or partial refunds for successful payments. Refunds are processed back to the original payment method.

**Note:** The refund endpoint is `POST /public-api/checkout-sessions/transactions/:transactionId/refund` — documented under Subscribers above.

**Refund Rules**

| Rule | Details |
|------|--------|
| Payment must have succeeded | Only payments with status succeeded are eligible. Failed, pending, or cancelled payments cannot be refunded. |
| Within processor refund window | Refunds must be initiated within the payment processor's refund window. For Affirm and Afterpay transactions this is 120 days; for Cash App Pay it is 90 days. Requests outside the processor window are automatically blocked. Contact support@fanbasis.com for off-platform options if the window has passed. |
| No duplicate in-flight refund | If a refund request is already in a pending state for the same payment, a second request will be rejected until the first completes. |
| Amount ≤ amount paid | The cumulative refund amount across all partial refunds cannot exceed the original payment amount. Overage requests are rejected with REFUND_AMOUNT_EXCEEDS_PAID_AMOUNT. |
| Not already fully refunded | If a payment has already been fully refunded, additional refund requests are rejected with PAYMENT_ALREADY_REFUNDED. |

**Refund Statuses**

| Status | Meaning |
|--------|---------|
| amount | integer |
| reason | string |

---

### Disputes

A dispute (chargeback) occurs when a customer contacts their bank to reverse a charge. Fanbasis notifies you when a dispute is filed and provides tools to respond.

**Important:** Dispute response deadlines are strict and set by the card network. Respond as quickly as possible.

**Dispute Statuses**

| Status | Description |
|--------|-------------|
| opened | A dispute has been filed by the customer's bank. Fanbasis sends a dispute.created webhook. Respond as quickly as possible. |
| challenged | You have submitted evidence to counter the dispute. The card network is reviewing your submission. |
| won | The dispute was resolved in your favor. No funds were reversed. |
| lost | The dispute was resolved in the customer's favor. The disputed amount (plus any chargeback fee) has been debited from your balance. |
| accepted | You accepted the dispute without contesting it. Funds were returned to the customer. |
| expired | The response window passed without a submission. Treated the same as lost. |
| cancelled | The customer withdrew the dispute before it was resolved. |

**Dispute Reason Categories**

| dispute.created | A dispute was filed by the customer's bank. Act immediately and submit evidence as soon as possible. |
| --- | --- |
| dispute.updated | The dispute's status changed (e.g., challenged, won, lost, accepted, expired, cancelled). Check data.status to see the new state. |

---

### Webhook Events

Events your webhook endpoint will receive:

- `payment.succeeded`
- `payment.failed`
- `payment.expired`
- `payment.canceled`
- `product.purchased`
- `subscription.created`
- `subscription.renewed`
- `subscription.completed`
- `subscription.canceled`
- `dispute.created`
- `dispute.updated`
- `refund.created`
- `subscription.id`
- `subscription.status`

#### Example Webhook Payload

```json
{
  "payment_id": "txn_abc123",
  "checkout_session_id": 345424,
  "customer_id": "cust_def456",
  "subscription_id": "sub_ghi012",
  "buyer": {
    "id": 12345,
    "email": "alex@example.com",
    "name": "Alex Johnson",
    "country_code": "US",
    "ip_address": "203.0.113.42"
  },
  "item": {
    "id": 678,
    "name": "Pro Membership",
    "type": "subscription",
    "description": "Monthly access to all premium content",
    "image": "https://cdn.example.com/pro-icon.png",
    "quantity": 1,
    "unit_price": 2900,
    "tax": 0
  },
  "amount": 2900,
  "currency": "USD",
  "status": "paid",
  "payment_method": "card",
  "api_metadata": {
    "discord_user_id": "123456789",
    "plan": "monthly"
  }
}
```

---

### Rate Limits & Pagination

The API enforces rate limits per account/endpoint. When exceeded, returns HTTP `429 Too Many Requests`.

Implement exponential backoff and check the `Retry-After` header.

**Pagination** — All list endpoints support:

| Parameter | Type    | Default | Description |
|-----------|---------|---------|-------------|
| `page`    | integer | 1       | Page number (starts at 1) |
| `per_page`| integer | 20      | Results per page (max 100) |

---

### Error Reference

| Code | Status | Description | Action |
|------|--------|-------------|--------|
| 200 | OK | Request succeeded. | Nothing — all good! Your data is in the data field. |
| 201 | Created | A new resource was created. | Store the returned ID for future requests. |
| 400 | Bad Request | Your request was invalid. | Check the errors field in the response for field-by-field details. |
| 401 | Unauthorized | API key missing or wrong. | Check that your x-api-key header is included and spelled correctly. |
| 403 | Forbidden | You don't have permission. | Your account may not have access to this feature. Contact support. |
| 404 | Not Found | The resource doesn't exist. | Double-check the ID in your URL. It may have been deleted. |
| 500 | Server Error | Something broke on our end. | Try again in a moment. Contact Fanbasis support if it keeps happening. |
| CHECKOUT_SESSION_CONSUMED | 400 | The checkout session is no longer available (e.g. it has been deleted or explicitly closed). Active sessions can accept multiple payments. | |
| PAYMENT_NOT_SUCCEEDED | 400 | The referenced payment has not reached a succeeded status. Check payment status before proceeding. | |
| PREVIOUS_PAYMENT_PENDING | 400 | Cannot create a new charge — a previous payment for this subscription is still processing. | |
| TOTAL_PAYMENT_AMOUNT_BELOW_MINIMUM_AMOUNT | 400 | Cart total is below the minimum amount required to process a payment through the gateway. | |
| NO_ELIGIBLE_PAYMENT_METHODS | 400 | After applying all filters (country, currency, etc.) no valid payment methods remain for this transaction. | |
| UNSUPPORTED_COUNTRY | 400 | The buyer's country is not yet supported. Check the supported countries list. | |
| UNSUPPORTED_CURRENCY | 400 | The requested currency is not supported. Currently USD and select currencies are available. | |
| PAYMENT_ALREADY_REFUNDED | 400 | This payment has already been fully refunded. Duplicate refund requests are not allowed. | |
| PAYMENT_HAS_BEEN_REFUNDED | 400 | The payment ID has been fully refunded and no further refunds can be applied. | |
| REFUND_WINDOW_EXPIRED | 400 | The refund window for this processor has closed (120 days for Affirm/Afterpay, 90 days for Cash App Pay). Contact support@fanbasis.com for off-platform options. | |
| REFUND_AMOUNT_EXCEEDS_PAID_AMOUNT | 400 | The requested refund amount (including any previous partial refunds) exceeds the original paid amount. | |
| EXISTING_REFUND_REQUEST_PROCESSING | 409 | A refund with status pending is already being processed for this payment. Wait for it to settle before submitting another. | |
| ZERO_AMOUNT_PAYMENT_REFUND_NOT_ALLOWED | 400 | Cannot refund a payment with a zero-currency amount. | |
| INVALID_DISCOUNT_CODE | 400 | The discount code does not exist or cannot be applied to any product in the cart. | |
| DISCOUNT_CODE_EXPIRED | 400 | The discount code is past its expires_at date and is no longer valid. | |
| DISCOUNT_CODE_USAGE_LIMIT_EXCEEDED | 400 | The code has reached its maximum usage limit and cannot be applied to new orders. | |
| DISCOUNT_CODE_ALREADY_EXISTS | 409 | A discount code with this code string already exists. Use a unique code value. | |
| DISCOUNT_NOT_AVAILABLE_FOR_PRODUCT | 400 | The discount code is restricted to specific products and cannot be applied to one or more items in the cart. | |
| SUBSCRIPTION_INACTIVE | 400 | The subscription is not in an active state. Check its current status before performing operations. | |
| SUBSCRIPTION_EXPIRED | 400 | The subscription's billing period has ended. No new charges can be created. | |
| SUBSCRIPTION_PAYMENT_RETRY_LIMIT_EXCEEDED | 400 | The subscription has hit the maximum number of payment retry attempts. Manual intervention is required. | |
| UNAUTHORIZED | 401 | No API key provided, or the key is invalid / lacks the required scope for this action. | |
| TOO_MANY_REQUESTS | 429 | Rate limit exceeded. Check the Retry-After header for how long to wait, then retry with exponential backoff. | |
| INVALID_REQUEST_BODY | 400 | The request body is malformed JSON or fails schema validation. Check the errors field for field-level details. | |
| INVALID_REQUEST_PARAMETERS | 400 | One or more request parameters have invalid semantics (e.g. a date set in the past). | |
| NOT_FOUND | 404 | The requested resource does not exist. Verify the ID is correct and the resource has not been deleted. | |
| INTERNAL_SERVER_ERROR | 500 | An unexpected server-side error occurred. Log the request details and contact support if it persists. | |

**Standard error response format:**

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "errors": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```
