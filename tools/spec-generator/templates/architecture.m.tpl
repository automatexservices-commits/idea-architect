# {{title}} 
  {{Project name}}

## 0. Metadata
- Author: {{author}}
- Reviewers: {{reviewers}}
- Status: {{status}} (Draft | Review | Approved | Deprecated)
- Last Updated: {{date}}
- Related PRD: {{prd_link}}
- Related Design Doc: {{design_doc_link}}

---

## 1. Executive Summary
{{executive_summary}}

Summarize:
- Problem being solved
- Scale expectations (users, RPS)
- Core architectural approach
- Key trade-offs

---

## 2. System Scope
{{scope}}

### In Scope
- {{in_scope}}

### Out of Scope
- {{out_of_scope}}

---

## 3. Scale Assumptions (MANDATORY)
{{scale_assumptions}}

| Metric | Value |
|------|------|
| Daily Active Users (DAU) | {{dau}} |
| Monthly Active Users (MAU) | {{mau}} |
| Peak RPS | {{peak_rps}} |
| Avg RPS | {{avg_rps}} |
| Data Growth / day | {{data_growth}} |
| Storage (1 year) | {{storage_estimate}} |

### Traffic Pattern
- Peak hours:
- Read/Write ratio:
- Burst factor:

---

## 4. System Architecture Overview
{{architecture_overview}}

### 4.1 High-Level Flow
Client → CDN → API Gateway → Service Layer → Data Layer  
                                ↓  
            External Systems (AI / Payments / Storage)

### 4.2 Architecture Principles
- Stateless services
- Horizontal scalability
- Loose coupling
- Fault isolation
- Backward compatibility

---

## 5. Detailed Component Architecture
{{components}}

### 5.1 Edge Layer (CDN / WAF)
- Responsibilities:
- Caching rules:
- DDoS protection:

### 5.2 API Gateway
- Routing strategy
- Rate limiting
- Authentication enforcement

### 5.3 Application Services
Break into microservices:

#### Service: {{service_name}}
- Responsibility:
- API contracts:
- Scaling strategy:
- Dependencies:
- Failure impact:

---

## 6. Data Architecture
{{data_architecture}}

### 6.1 Data Stores
| Data Type | DB | Reason |
|----------|----|--------|
| User data | {{}} | {{}} |
| Logs | {{}} | {{}} |

### 6.2 Partitioning Strategy
- Sharding key:
- Hot partition handling:
- Rebalancing strategy:

### 6.3 Replication
- Primary-secondary model
- Read replicas
- Cross-region replication

### 6.4 Consistency Model
- Strong consistency: {{where}}
- Eventual consistency: {{where}}
- Trade-offs explained

---

## 7. Caching Strategy
{{caching}}

### Layers:
- CDN cache
- Application cache (Redis)
- DB cache

### Policies:
- TTL:
- Invalidation:
- Cache warming:

---

## 8. Asynchronous Processing
{{async}}

### Queue System
- Tool (Kafka / RabbitMQ / SQS)
- Message schema
- Retry policy

### Workers
- Scaling model
- Idempotency handling

---

## 9. API & Request Flow Deep Dive
{{request_flow}}

### End-to-End Flow
1. Request hits CDN  
2. Routed via API Gateway  
3. Auth validated  
4. Service logic executed  
5. DB interaction  
6. Response returned  

### Latency Budget
| Stage | Time |
|------|-----|
| Network | {{}} |
| Processing | {{}} |

---

## 10. Reliability & Fault Tolerance
{{reliability}}

### Failure Domains
- Region failure
- Service failure
- Dependency failure

### Strategies
- Retry with exponential backoff
- Circuit breakers
- Graceful degradation

---

## 11. Disaster Recovery
{{dr}}

### RTO / RPO
- RTO: {{time}}
- RPO: {{time}}

### Backup Strategy
- Frequency:
- Storage:

---

## 12. Security Architecture
{{security}}

- Authentication (JWT / OAuth)
- Authorization (RBAC / ABAC)
- Data encryption (TLS + at rest)
- Secrets management

---

## 13. Observability & Monitoring
{{observability}}

### Metrics
- Latency
- Throughput
- Error rate

### Logging
- Structured logs
- Correlation IDs

### Alerting
- Thresholds
- Incident response

---

## 14. Capacity Planning
{{capacity}}

### Compute
- Instances required:
- Autoscaling rules:

### Storage
- Growth projection:

### Network
- Bandwidth requirements:

---

## 15. Cost Analysis
{{cost}}

| Component | Cost |
|----------|------|
| Compute | {{}} |
| DB | {{}} |

---

## 16. Deployment Architecture
{{deployment}}

### Environments
- Dev
- Staging
- Production

### Strategy
- Blue/Green or Canary

---

## 17. Migration Strategy
{{migration}}

- Data migration plan
- Backward compatibility
- Rollback strategy

---

## 18. Trade-offs & Alternatives
{{tradeoffs}}

### Option A
Pros:
Cons:

### Option B
Pros:
Cons:

### Final Decision:
Explain clearly.

---

## 19. Risks & Mitigations
{{risks}}

| Risk | Impact | Mitigation |
|------|--------|-----------|

---

## 20. SLA / SLO / SLI
{{sla}}

- Availability: {{%}}
- Latency SLO:
- Error budget:

---

## 21. Testing & Validation
{{testing}}

- Load testing
- Chaos testing
- Failure injection

---

## 22. Open Questions
{{open_questions}}

---

## 23. Future Evolution
{{future}}

- Multi-region active-active
- Advanced caching
- ML optimization

---

## 24. Appendix
{{appendix}}

- Diagrams
- References
- Glossary