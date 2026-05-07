# {{api_name}} — API Specification

---

## 1. Overview
{{overview}}

This document defines the complete API contract for {{api_name}}, including authentication, endpoint specifications, validation rules, error handling, rate limits, and operational guarantees.

---

## 2. Base Configuration

### Base URL
{{base_url}}

### Protocol
{{protocol}}

### Content Type
- Request: {{request_content_type}}
- Response: {{response_content_type}}

### Timeout Configuration
- Client Timeout: {{client_timeout}}
- Server Timeout: {{server_timeout}}

---

## 3. Versioning Strategy
{{versioning_strategy}}

---

## 4. Authentication & Authorization

### Authentication Method
{{auth_method}}

### Header Format
{{auth_header_format}}

### Token Structure
{{token_structure}}

### Roles (RBAC)
{{roles}}

### Permission Matrix
{{permission_matrix}}

---

## 5. Request / Response Standards

### Success Response Format
{{success_response_format}}

### Error Response Format
{{error_response_format}}

---

## 6. Global Query Parameters
{{query_parameters}}

---

## 7. Rate Limiting & Quotas
{{rate_limits}}

### Behavior
{{rate_limit_behavior}}

---

## 8. Idempotency
{{idempotency}}

---

## 9. API Modules (Complete Specification)

---

## 9.1 AUTH MODULE

### POST /auth/register
**Description:** {{auth_register_description}}

**Request Body:**
{{auth_register_request}}

**Validation Rules:**
{{auth_register_validation}}

**Success Response:**
{{auth_register_response}}

**Error Responses:**
{{auth_register_errors}}

**Internal Flow:**
{{auth_register_flow}}

---

### POST /auth/login
**Description:** {{auth_login_description}}

**Request Body:**
{{auth_login_request}}

**Success Response:**
{{auth_login_response}}

**Error Responses:**
{{auth_login_errors}}

**Edge Cases:**
{{auth_login_edge_cases}}

**Internal Flow:**
{{auth_login_flow}}

---

### POST /auth/refresh
**Description:** {{auth_refresh_description}}

**Request Body:**
{{auth_refresh_request}}

**Success Response:**
{{auth_refresh_response}}

**Error Responses:**
{{auth_refresh_errors}}

---

### POST /auth/logout
**Description:** {{auth_logout_description}}

**Success Response:**
{{auth_logout_response}}

---

## 9.2 USER MODULE

### GET /user/me
**Description:** {{user_me_description}}

**Success Response:**
{{user_me_response}}

---

### PATCH /user/me
**Description:** {{user_update_description}}

**Request Body:**
{{user_update_request}}

**Validation Rules:**
{{user_update_validation}}

---

## 9.3 PROJECT MODULE

### POST /projects
**Description:** {{project_create_description}}

**Request Body:**
{{project_create_request}}

**Success Response:**
{{project_create_response}}

**Internal Flow:**
{{project_create_flow}}

---

### GET /projects
**Description:** {{project_list_description}}

**Query Params:**
{{project_list_query}}

**Success Response:**
{{project_list_response}}

---

### GET /projects/:id
**Description:** {{project_get_description}}

**Success Response:**
{{project_get_response}}

---

### POST /projects/:id/generate
**Description:** {{project_generate_description}}

**Behavior:**
{{project_generate_behavior}}

**Success Response:**
{{project_generate_response}}

---

### GET /projects/:id/status
**Description:** {{project_status_description}}

**Success Response:**
{{project_status_response}}

---

## 9.4 AI MODULE

### POST /ai/extract
**Description:** {{ai_extract_description}}

**Request Body:**
{{ai_extract_request}}

**Success Response:**
{{ai_extract_response}}

**Failure Handling:**
{{ai_extract_failure}}

---

### POST /ai/questions
{{ai_questions}}

---

### POST /ai/recommend-stack
{{ai_recommend_stack}}

---

## 9.5 PAYMENTS MODULE

### POST /payments/create-checkout
**Description:** {{payment_checkout_description}}

**Request Body:**
{{payment_checkout_request}}

**Success Response:**
{{payment_checkout_response}}

---

### POST /webhooks/stripe
**Description:** {{stripe_webhook_description}}

**Validation:**
{{stripe_webhook_validation}}

**Handled Events:**
{{stripe_webhook_events}}

---

## 9.6 SHARE MODULE

### GET /share/:id
**Description:** {{share_get_description}}

**Success Response:**
{{share_get_response}}

---

### GET /share/:id/download
**Description:** {{share_download_description}}

---

## 9.7 ADMIN MODULE

### GET /admin/users
**Description:** {{admin_users_description}}

**Success Response:**
{{admin_users_response}}

---

### PATCH /admin/users/:id
**Description:** {{admin_update_description}}

---

### GET /admin/analytics
**Description:** {{admin_analytics_description}}

**Success Response:**
{{admin_analytics_response}}

---

## 10. Request Lifecycle
{{request_lifecycle}}

---

## 11. Error Codes
{{error_codes}}

---

## 12. Pagination Standard
{{pagination}}

---

## 13. Observability
{{observability}}

---

## 14. Security
{{security}}

---

## 15. Performance Targets
{{performance}}

---

## 16. Testing Requirements
{{testing}}

---

## 17. Future Enhancements
{{future}}

---

## 18. Appendix
{{appendix}}