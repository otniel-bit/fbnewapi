FanBasis API Documentation
Official API documentation for the FanBasis platform.
Overview
FanBasis provides a suite of APIs for integrating payment processing, checkout systems, and subscription billing into your digital product workflows. This documentation covers authentication, available endpoints, webhooks, and integration guides.
Getting Started

Obtain API credentials — Contact your account manager or generate keys from your FanBasis dashboard.
Review authentication — All requests require a valid API key passed via the Authorization header.
Explore the docs — Browse the endpoint references below to find what you need.

Authentication
Authorization: Bearer YOUR_API_KEY
All API requests must be made over HTTPS.
Documentation Sections

Checkout Sessions — Create and manage embedded checkout flows
Subscriptions — Billing cycles, plan management, and subscriber lifecycle
Payments — Process one-time and recurring payments
Webhooks — Real-time event notifications for your integration
OAuth / Public API — Third-party app authorization and access

Quick Example
bashcurl -X POST https://api.fanbasis.com/v1/checkout/sessions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount": 2999, "currency": "usd", "success_url": "https://yoursite.com/success"}'
Support
Running into issues? Reach out to the FanBasis team:

Email: support@fanbasis.com
Slack: Connect with us via your dedicated Slack Connect channel

Contributing
Found a typo or want to improve the docs? PRs are welcome. Please open an issue first for any major changes.
License
Copyright © 2026 FanBasis. All rights reserved.


[![Netlify Status](https://api.netlify.com/api/v1/badges/53471a2c-7839-462f-bd81-09100bbae313/deploy-status)](https://app.netlify.com/projects/fbnewapi/deploys)
