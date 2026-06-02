# {{project_name}}

{{tagline}}

---

## 🚀 Overview
{{overview}}

{{project_name}} is a {{project_type}} designed to {{core_purpose}}.

### Key Capabilities
- {{feature_1}}
- {{feature_2}}
- {{feature_3}}
- {{feature_4}}

---

## 🧠 Architecture Overview
{{architecture_summary}}

### High-Level Flow
Client → CDN → API Gateway → Services → Database → External APIs

### Core Principles
- Scalability (horizontal-first)
- Fault tolerance
- Security by design
- Observability-first

---

## 🏗️ Tech Stack

### Backend
- Node.js
- Express.js
- Next.js API Routes

### Database
- MongoDB Atlas (Mongoose)

### Infrastructure
- Vercel (Frontend)
- Railway / Render (Backend)

### Integrations
- AI APIs (Claude / OpenAI / Gemini)
- Stripe (Payments)
- AWS S3 / Cloudinary (Storage)

### Tooling
- Zod (validation)
- Winston + Morgan (logging)
- Jest + Supertest (testing)

---

## 📂 Project Structure
{{project_structure}}

```bash
/src
  /routes        # API route definitions
  /controllers   # Request handlers
  /services      # Business logic
  /repositories  # DB access layer
  /models        # Mongoose schemas
  /middleware    # Auth, validation, rate limiting
  /utils         # Helpers, constants
  /config        # Environment configs
/tests           # Unit & integration tests
