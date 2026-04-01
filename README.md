<p align="center">
  <img src="https://www.fanbasis.com/images/fanbasis_red.svg" alt="FanBasis" width="220" />
</p>

<h1 align="center">FanBasis API Documentation</h1>

<p align="center">
  <strong>Complete API reference for the FanBasis payment platform.</strong><br>
  Checkout sessions, webhooks, subscriptions, customers, discount codes, transactions, refunds, disputes, and more.
</p>

<p align="center">
  <a href="https://fbnewapi.netlify.app">Live Docs</a> &middot;
  <a href="https://www.fanbasis.com">FanBasis.com</a> &middot;
  <a href="mailto:support@fanbasis.com">Support</a>
</p>

<p align="center">
  <a href="https://app.netlify.com/projects/fbnewapi/deploys">
    <img src="https://api.netlify.com/api/v1/badges/53471a2c-7839-462f-bd81-09100bbae313/deploy-status" alt="Netlify Status" />
  </a>
</p>

---

## Overview

This repository contains the official FanBasis API documentation site, deployed as a single-page static site on Netlify. It provides everything a developer needs to integrate with the FanBasis payment platform — from authentication and endpoint references to an interactive API playground, webhook event catalog, and AI agent integration.

**Live site:** [fbnewapi.netlify.app](https://fbnewapi.netlify.app)

---

## Documentation Sections

### Getting Started
| Section | Description |
|---------|-------------|
| **Introduction** | Platform overview, key concepts (checkout sessions, webhooks, transactions), and authentication |
| **Quick Start** | Step-by-step guide to accepting your first payment in ~10 minutes |
| **Environments** | Production vs. Sandbox environments with test card numbers |
| **API Change Policy** | Versioning approach and breaking change policy |

### Platform
| Section | Description |
|---------|-------------|
| **Merchant of Record** | How FanBasis acts as the merchant of record — fee structure, payouts, tax handling |
| **Webhooks** | How to register endpoints, verify signatures, and handle retries |
| **Webhook Events Reference** | Full catalog of 13 event types with payload examples |

### API Reference
| Section | Description |
|---------|-------------|
| **Checkout Sessions** | Create, retrieve, delete checkout sessions and embedded checkout |
| **Customers** | Search customers, view payment methods, charge saved cards |
| **Subscribers** | List subscribers, manage subscriptions by session or product |
| **Discount Codes** | Create, update, delete promotional codes (percentage or fixed) |
| **Products** | List all products with pricing and metadata |
| **Transactions** | List, filter, and retrieve transaction details |
| **Refunds** | Issue full or partial refunds with fee breakdowns |
| **Disputes** | Handle chargebacks and dispute resolution |

### Errors & Limits
| Section | Description |
|---------|-------------|
| **Rate Limits & Pagination** | Request limits, pagination parameters, and response format |
| **Error Reference** | HTTP status codes, error response structure, and field-level validation errors |

### FAQ & Support
| Section | Description |
|---------|-------------|
| **FAQ** | Common questions about API keys, testing, webhooks, and subscriptions |
| **Help & Support** | Contact information and support channels |
| **Common Workflows** | End-to-end examples for typical integration patterns |

### Tools
| Section | Description |
|---------|-------------|
| **API Playground** | Interactive endpoint tester — pick an endpoint, fill params, hit Send. No terminal needed. |
| **Connect an AI Agent** | MCP server integration for Claude Desktop and other AI assistants |

---

## Features

### Interactive API Playground
Test any FanBasis API endpoint directly from the docs. Enter your API key, choose an environment (sandbox or production), select an endpoint, and send requests — all without leaving the browser. Includes request history with localStorage persistence.

### Webhook Events Catalog
Complete reference for all 13 webhook event types with example JSON payloads:
- `payment.succeeded`, `payment.failed`, `payment.expired`, `payment.canceled`
- `product.purchased`
- `subscription.created`, `subscription.renewed`, `subscription.completed`, `subscription.canceled`, `subscription.payment_failed`
- `refund.created`
- `dispute.created`, `dispute.updated`

### Search & Navigation
- **CMD+K / Ctrl+K** search modal for instant documentation lookup
- **Sidebar search** with real-time filtering
- **Keyboard navigation** — `j`/`k` for next/prev section, `/` to focus search
- **Section-based navigation** with scroll-spy, breadcrumbs, and reading progress bar
- **Right-side table of contents** for in-section heading navigation

### Dark Mode
Full light/dark theme support with system preference detection, localStorage persistence, and smooth radial transition animation via the View Transitions API.

### Multi-Language Support
18 languages via Google Translate integration — English, Spanish, Portuguese, French, German, Italian, Japanese, Korean, Chinese (Simplified & Traditional), Arabic, Hindi, Russian, Turkish, Dutch, Polish, Vietnamese, and Thai.

### Code Examples
Every endpoint includes cURL request examples and JSON response samples. The API Playground also generates cURL and Python code snippets for any request you build.

### AI Agent Integration (MCP)
Documentation for connecting AI assistants (Claude, ChatGPT, Grok) to the FanBasis API via the MCP protocol. Includes a ready-to-use MCP server configuration for Claude Desktop.

---

## Tech Stack

- **Single HTML file** — The entire documentation site is a self-contained `index.html` (~614 KB)
- **No build step** — Zero dependencies, no bundler, no framework. Just HTML + embedded CSS + embedded JS.
- **Hosting** — [Netlify](https://www.netlify.com) with automatic deploys from GitHub
- **Fonts** — [Inter](https://fonts.google.com/specimen/Inter) (UI) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (code)
- **Translation** — Google Translate widget integration

---

## Project Structure

```
fbnewapi/
├── index.html      # Complete documentation site (HTML + CSS + JS)
├── api-docs.md     # Markdown source reference for API documentation
└── README.md       # This file
```

---

## Local Development

No install required. Just open the file in a browser:

```bash
git clone https://github.com/otniel-bit/fbnewapi.git
cd fbnewapi
open index.html
```

Or use a local server for a more accurate experience:

```bash
npx serve .
```

---

## Deployment

The site auto-deploys to Netlify on every push to `main`. No build command or configuration needed — Netlify serves the static `index.html` directly.

| Setting | Value |
|---------|-------|
| **Deploy branch** | `main` |
| **Build command** | *(none)* |
| **Publish directory** | `.` (root) |
| **Production URL** | [fbnewapi.netlify.app](https://fbnewapi.netlify.app) |

---

## API Base URLs

| Environment | Base URL |
|------------|----------|
| **Production** | `https://www.fanbasis.com/public-api` |
| **Sandbox** | `https://qa.dev-fan-basis.com/public-api` |

### Authentication

All requests require an API key in the `x-api-key` header:

```bash
curl https://www.fanbasis.com/public-api/products \
  -H "x-api-key: YOUR_API_KEY"
```

### Sandbox Test Cards

| Card | Number | CVV | Expiry |
|------|--------|-----|--------|
| Visa | `4242 4242 4242 4242` | Any 3 digits | Any future date |
| Mastercard | `5555 5555 5555 4444` | Any 3 digits | Any future date |
| Amex | `3782 822463 10005` | Any 4 digits | Any future date |
| Discover | `6011 1111 1111 1117` | Any 3 digits | Any future date |

---

## Support

Running into issues with the API or these docs?

- **Email:** [support@fanbasis.com](mailto:support@fanbasis.com)
- **Website:** [fanbasis.com](https://www.fanbasis.com)

Found a bug in the docs? Open an [issue](https://github.com/otniel-bit/fbnewapi/issues) or submit a PR.

---

## License

Copyright &copy; 2026 FanBasis, Inc. All rights reserved.
