# CV -- Priya Nandakumar

**Location:** Amsterdam, Netherlands
**Email:** priya@example.com
**LinkedIn:** linkedin.com/in/priyanandakumar
**Portfolio:** priyan.dev
**GitHub:** github.com/priyanandakumar

## Professional Summary

Data engineer with 6 years building reliable analytics and ML feature pipelines. Shipped lakehouse-style platforms (Iceberg, dbt, Spark) for a global fintech, cutting nightly batch windows and enabling near-real-time risk dashboards. Strong in SQL, Python, data modeling, and pragmatic data quality.

## Work Experience

### NorthRiver Payments -- Amsterdam, Netherlands
**Senior Data Engineer**
2020-2025

- Owned core ingestion from OLTP to the analytics lake (Airflow, Spark on Kubernetes): CDC streams plus batch backfills with idempotent loads and schema evolution
- Introduced dbt for the warehouse layer: standardized tests, documentation, and CI for SQL changes; reduced broken dashboards from recurring incidents to rare exceptions
- Partnered with ML teams on feature stores and offline training datasets: SLAs, partitioning strategy, and PII handling aligned with legal review
- Led data quality program: Great Expectations checks at ingest, anomaly alerts, and quarterly reviews with domain owners
- Mentored 3 engineers on SQL performance, incremental models, and incident response for pipeline failures

### BrightMetrics BV -- Utrecht, Netherlands
**Data Engineer**
2017-2020

- Built ETL from SaaS APIs and files into PostgreSQL and Redshift; migrated critical jobs from cron scripts to Airflow with retries and alerting
- Designed star-schema marts for finance and product analytics; supported self-serve BI (Looker) adoption
- Improved warehouse costs by pruning unused tables, compressing wide fact tables, and rightsizing clusters after usage analysis

## Projects

- **dq-patterns** (Internal playbook) -- Reusable patterns for row-level checks, freshness SLAs, and ownership RACI; presented at internal data guild
- **streamline-blog** (Writing) -- Short posts on incremental dbt models and backfill safety for event data

## Education

- MSc Computer Science (Data Systems track), University of Amsterdam (2017)

## Skills

- **Pipelines:** Airflow, Dagster basics, dbt, Spark, Kafka (consumer patterns)
- **Storage:** PostgreSQL, Snowflake, S3, Apache Iceberg
- **Languages:** SQL, Python, Bash
- **Ops:** Docker, Kubernetes basics, Terraform (modules for data jobs), GitHub Actions
- **Practices:** Data modeling (dimensional + wide marts), cost awareness, documentation-as-code
