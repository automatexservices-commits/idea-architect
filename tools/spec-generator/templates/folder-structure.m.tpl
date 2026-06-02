# {{project_name}} — Folder Structure

---

## Root Structure
{{root_structure}}

```json
{
  "root": "{{root_name}}",
  "description": "{{root_description}}",
  "tree": [
    
    {
      "name": "apps",
      "type": "folder",
      "description": "Contains all runnable applications (frontend, backend, admin panels).",
      "children": [
        {
          "name": "web",
          "type": "folder",
          "description": "Main frontend application (Next.js / React)."
        },
        {
          "name": "api",
          "type": "folder",
          "description": "Backend API server (Express / Node.js)."
        },
        {
          "name": "admin",
          "type": "folder",
          "description": "Admin dashboard application."
        }
      ]
    },

    {
      "name": "services",
      "type": "folder",
      "description": "Independent microservices (AI, billing, notifications).",
      "children": [
        {
          "name": "ai-service",
          "type": "folder",
          "description": "Handles AI orchestration and external API calls."
        },
        {
          "name": "billing-service",
          "type": "folder",
          "description": "Handles payments, subscriptions, Stripe integration."
        },
        {
          "name": "notification-service",
          "type": "folder",
          "description": "Handles emails, alerts, and messaging."
        }
      ]
    },

    {
      "name": "packages",
      "type": "folder",
      "description": "Shared libraries used across apps and services.",
      "children": [
        {
          "name": "config",
          "type": "folder",
          "description": "Centralized configuration (env, constants)."
        },
        {
          "name": "utils",
          "type": "folder",
          "description": "Shared helper functions."
        },
        {
          "name": "types",
          "type": "folder",
          "description": "Shared TypeScript types/interfaces."
        },
        {
          "name": "logger",
          "type": "folder",
          "description": "Central logging utilities."
        }
      ]
    },

    {
      "name": "infrastructure",
      "type": "folder",
      "description": "Infrastructure as Code (IaC) and deployment configs.",
      "children": [
        {
          "name": "terraform",
          "type": "folder",
          "description": "Terraform scripts for cloud infrastructure."
        },
        {
          "name": "docker",
          "type": "folder",
          "description": "Dockerfiles and container configs."
        },
        {
          "name": "k8s",
          "type": "folder",
          "description": "Kubernetes manifests."
        }
      ]
    },

    {
      "name": "database",
      "type": "folder",
      "description": "Database schemas, migrations, and seed scripts.",
      "children": [
        {
          "name": "schemas",
          "type": "folder",
          "description": "Data models and schema definitions."
        },
        {
          "name": "migrations",
          "type": "folder",
          "description": "Migration scripts."
        },
        {
          "name": "seeds",
          "type": "folder",
          "description": "Seed data for development/testing."
        }
      ]
    },

    {
      "name": "docs",
      "type": "folder",
      "description": "All technical documentation.",
      "children": [
        {
          "name": "prd.md",
          "type": "file",
          "description": "Product Requirements Document."
        },
        {
          "name": "design.md",
          "type": "file",
          "description": "System design document."
        },
        {
          "name": "architecture.md",
          "type": "file",
          "description": "Architecture specification."
        },
        {
          "name": "api-spec.md",
          "type": "file",
          "description": "API specification document."
        }
      ]
    },

    {
      "name": "tests",
      "type": "folder",
      "description": "All test suites (unit, integration, e2e).",
      "children": [
        {
          "name": "unit",
          "type": "folder",
          "description": "Unit tests."
        },
        {
          "name": "integration",
          "type": "folder",
          "description": "Integration tests."
        },
        {
          "name": "e2e",
          "type": "folder",
          "description": "End-to-end tests."
        }
      ]
    },

    {
      "name": "scripts",
      "type": "folder",
      "description": "Automation scripts (build, deploy, maintenance)."
    },

    {
      "name": ".github",
      "type": "folder",
      "description": "CI/CD workflows and GitHub configurations."
    },

    {
      "name": ".env.example",
      "type": "file",
      "description": "Example environment variables file."
    },

    {
      "name": "README.md",
      "type": "file",
      "description": "Project overview and setup instructions."
    },

    {
      "name": "package.json",
      "type": "file",
      "description": "Root dependencies and scripts."
    },

    {
      "name": "tsconfig.json",
      "type": "file",
      "description": "TypeScript configuration."
    }

  ]
}
