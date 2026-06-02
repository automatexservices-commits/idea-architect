# {{title}} — Technical Design Document

---

# 0. Metadata

- **Author:** {{author}}
- **Engineering Lead:** {{engineering_lead}}
- **Product Owner:** {{product_owner}}
- **Reviewers:** {{reviewers}}
- **Stakeholders:** {{stakeholders}}
- **Status:** {{status}} (Draft | In Review | Approved | Deprecated)
- **Priority:** {{priority}}
- **Created At:** {{created_at}}
- **Last Updated:** {{date}}
- **Related PRD:** {{related_prd}}
- **Related SRS:** {{related_srs}}
- **RFC / Spec Links:** {{rfc_links}}

---

# 1. Executive Summary

{{executive_summary}}

**System Purpose:** {{system_purpose}}
**Business Objective:** {{business_objective}}
**Technical Objective:** {{technical_objective}}
**Primary Users:** {{primary_users}}
**Expected Scale:** {{expected_scale}}
**Core Differentiator:** {{core_differentiator}}

---

# 2. Problem Statement

{{problem_statement}}

**Current limitations:** {{current_limitations}}
**Technical pain points:** {{technical_pain_points}}
**Business impact:** {{business_impact}}
**User impact:** {{user_impact}}
**Operational impact:** {{operational_impact}}
**Why existing architecture fails:** {{why_existing_architecture_fails}}

---

# 3. Goals & Non-Goals

## 3.1 Goals

{{goals}}

- **p95 latency <** {{latency_target}}
- **Availability >=** {{availability_target}}
- **Cost per request <=** {{cost_target}}
- **Error rate <=** {{error_rate_target}}
- **Scalability target:** {{scalability_target}}
- **Recovery target:** {{recovery_target}}

---

## 3.2 Non-Goals

{{non_goals}}

**Explicit exclusions:** {{explicit_exclusions}}
**Deferred work:** {{deferred_work}}
**Future considerations:** {{future_considerations}}

---

# 4. Success Metrics

{{success_metrics}}

| Metric | Baseline | Target | Measurement Method |
|--------|----------|--------|--------------------|
| {{metric_1}} | {{baseline_1}} | {{target_1}} | {{measurement_1}} |
| {{metric_2}} | {{baseline_2}} | {{target_2}} | {{measurement_2}} |
| {{metric_3}} | {{baseline_3}} | {{target_3}} | {{measurement_3}} |
| {{metric_4}} | {{baseline_4}} | {{target_4}} | {{measurement_4}} |

**North star metric:** {{north_star_metric}}
**Failure signals:** {{failure_signals}}

---

# 5. System Overview

{{system_overview}}

**System type:** {{system_type}}
**Deployment model:** {{deployment_model}}
**Core modules:** {{core_modules}}
**Key services:** {{key_services}}
**External integrations:** {{external_integrations}}
**Dependencies:** {{dependencies}}

---

# 6. High-Level Architecture

{{high_level_architecture}}

**Architecture style:** {{architecture_style}}
**Frontend architecture:** {{frontend_architecture}}
**Backend architecture:** {{backend_architecture}}
**Database architecture:** {{database_architecture}}
**Infrastructure architecture:** {{infrastructure_architecture}}
**Cloud provider:** {{cloud_provider}}
**Multi-region strategy:** {{multi_region_strategy}}

---

# 7. Detailed Architecture

{{architecture}}

## Core Components

| Component | Responsibility | Technology | Owner |
|-----------|---------------|------------|-------|
| {{component_1}} | {{responsibility_1}} | {{technology_1}} | {{owner_1}} |
| {{component_2}} | {{responsibility_2}} | {{technology_2}} | {{owner_2}} |
| {{component_3}} | {{responsibility_3}} | {{technology_3}} | {{owner_3}} |
| {{component_4}} | {{responsibility_4}} | {{technology_4}} | {{owner_4}} |

---

## Service Communication

**Communication protocol:** {{communication_protocol}}
**Event architecture:** {{event_architecture}}
**Queueing strategy:** {{queueing_strategy}}
**Retry strategy:** {{retry_strategy}}
**Circuit breaker logic:** {{circuit_breaker_logic}}

---

## Request Lifecycle

{{request_lifecycle}}

**Authentication flow:** {{authentication_flow}}
**Authorization flow:** {{authorization_flow}}
**Caching flow:** {{caching_flow}}
**Fallback handling:** {{fallback_handling}}

---

# 8. Data Design

{{data_design}}

## Entity Focus

**Primary entity:** {{entity_name}}
**Entity relationships:** {{entity_relationships}}
**Data ownership:** {{data_ownership}}
**Data consistency model:** {{consistency_model}}

---

## Database Schema

| Table / Collection | Purpose | Relationships |
|-------------------|---------|---------------|
| {{table_1}} | {{purpose_1}} | {{relationship_1}} |
| {{table_2}} | {{purpose_2}} | {{relationship_2}} |
| {{table_3}} | {{purpose_3}} | {{relationship_3}} |
| {{table_4}} | {{purpose_4}} | {{relationship_4}} |

---

## Data Lifecycle

**Data creation flow:** {{data_creation_flow}}
**Data update flow:** {{data_update_flow}}
**Data deletion flow:** {{data_deletion_flow}}
**Retention policy:** {{retention_policy}}
**Archival strategy:** {{archival_strategy}}

---

# 9. API Design (Strict Contract)

{{api_design}}

## API Standards

**Protocol:** {{protocol}}
**Authentication:** {{authentication}}
**Authorization:** {{authorization}}
**Versioning strategy:** {{versioning_strategy}}
**Serialization format:** {{serialization_format}}

---

## Endpoint Definitions

| Endpoint | Method | Purpose | Auth Required | Response Type |
|----------|--------|---------|--------------|---------------|
| {{endpoint_1}} | {{method_1}} | {{purpose_1}} | {{auth_1}} | {{response_1}} |
| {{endpoint_2}} | {{method_2}} | {{purpose_2}} | {{auth_2}} | {{response_2}} |
| {{endpoint_3}} | {{method_3}} | {{purpose_3}} | {{auth_3}} | {{response_3}} |
| {{endpoint_4}} | {{method_4}} | {{purpose_4}} | {{auth_4}} | {{response_4}} |

---

## Rate Limits

**Global limit:** {{limit}}
**Per-user limit:** {{per_user_limit}}
**Burst handling:** {{burst_handling}}
**Abuse prevention:** {{abuse_prevention}}

---

## Error Handling

| Error Code | Meaning | Recovery Action |
|------------|---------|----------------|
| {{error_code_1}} | {{meaning_1}} | {{recovery_1}} |
| {{error_code_2}} | {{meaning_2}} | {{recovery_2}} |
| {{error_code_3}} | {{meaning_3}} | {{recovery_3}} |

---

# 10. Security Design

{{security_design}}

**Threat model:** {{threat_model}}
**Encryption standards:** {{encryption_standards}}
**Secrets management:** {{secrets_management}}
**Audit logging:** {{audit_logging}}
**Fraud prevention:** {{fraud_prevention}}
**Abuse prevention:** {{abuse_prevention_security}}

---

# 11. Scalability & Performance

{{scalability_and_performance}}

**Expected DAU:** {{expected_dau}}
**Expected MAU:** {{expected_mau}}
**Concurrent users:** {{concurrent_users}}
**Peak requests/sec:** {{peak_requests}}
**Caching strategy:** {{caching_strategy}}
**Horizontal scaling:** {{horizontal_scaling}}
**Load balancing:** {{load_balancing}}

---

# 12. Reliability & Disaster Recovery

{{reliability_and_disaster_recovery}}

**Availability target:** {{availability_target_detail}}
**Backup strategy:** {{backup_strategy}}
**Recovery objectives:** {{recovery_objectives}}
**Failover strategy:** {{failover_strategy}}
**Incident response:** {{incident_response}}

---

# 13. Observability & Monitoring

{{observability_and_monitoring}}

**Metrics tracking:** {{metrics_tracking}}
**Logging strategy:** {{logging_strategy}}
**Tracing strategy:** {{tracing_strategy}}
**Alerting rules:** {{alerting_rules}}
**Monitoring stack:** {{monitoring_stack}}

---

# 14. DevOps & Deployment

{{devops_and_deployment}}

**CI/CD pipeline:** {{cicd_pipeline}}
**Deployment strategy:** {{deployment_strategy}}
**Feature flags:** {{feature_flags}}
**Rollback strategy:** {{rollback_strategy}}
**Environment strategy:** {{environment_strategy}}

---

# 15. Testing Strategy

{{testing_strategy}}

| Test Type | Scope | Tools | Owner |
|-----------|------|------|------|
| Unit Testing | {{unit_scope}} | {{unit_tools}} | {{unit_owner}} |
| Integration Testing | {{integration_scope}} | {{integration_tools}} | {{integration_owner}} |
| Load Testing | {{load_scope}} | {{load_tools}} | {{load_owner}} |
| Security Testing | {{security_scope}} | {{security_tools}} | {{security_owner}} |

**Coverage target:** {{coverage_target}}
**Performance benchmarks:** {{performance_benchmarks}}

---

# 16. Risks & Tradeoffs

{{risks_and_tradeoffs}}

| Risk / Tradeoff | Impact | Mitigation |
|----------------|--------|------------|
| {{risk_1}} | {{impact_1}} | {{mitigation_1}} |
| {{risk_2}} | {{impact_2}} | {{mitigation_2}} |
| {{risk_3}} | {{impact_3}} | {{mitigation_3}} |

**Technical debt considerations:** {{technical_debt_considerations}}
**Known limitations:** {{known_limitations}}

---

# 17. Open Questions

{{open_questions}}

- {{question_1}}
- {{question_2}}
- {{question_3}}

---

# 18. Timeline & Milestones

| Milestone | Description | Owner | Deadline | Status |
|-----------|-------------|-------|----------|--------|
| {{milestone_1}} | {{description_1}} | {{owner_1}} | {{deadline_1}} | {{status_1}} |
| {{milestone_2}} | {{description_2}} | {{owner_2}} | {{deadline_2}} | {{status_2}} |
| {{milestone_3}} | {{description_3}} | {{owner_3}} | {{deadline_3}} | {{status_3}} |

**Critical path:** {{critical_path}}
**Launch target:** {{launch_target}}

---

# 19. Appendix

{{appendix}}

**Architecture diagrams:** {{architecture_diagrams}}
**Sequence diagrams:** {{sequence_diagrams}}
**ER diagrams:** {{er_diagrams}}
**API references:** {{api_references}}
**Related PRDs:** {{related_prds}}
**Related SRS docs:** {{related_srs_docs}}
**Technical references:** {{technical_references}}
**Glossary:** {{glossary}}