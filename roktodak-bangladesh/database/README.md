# Database

For local development, `backend\run-dev.ps1` runs the backend with a persistent H2 database in MySQL compatibility mode. Its files are stored under `backend\data` and are excluded from Git. MySQL remains the default datasource outside the `dev` Spring profile.

Tables are created automatically by Hibernate (`spring.jpa.hibernate.ddl-auto=update`) on first run.
Create an empty MySQL user/database or let `createDatabaseIfNotExist=true` do it.
For production, set `DDL_AUTO=validate` and manage schema with migrations (Flyway) instead.

## ER diagram (what is implemented in this version)

```mermaid
erDiagram
    USERS ||--o| DONOR_PROFILES : "has (donors only)"
    USERS ||--o{ BLOOD_REQUESTS : "posts"
    BLOOD_REQUESTS ||--o{ DONOR_RESPONSES : "receives"
    USERS ||--o{ DONOR_RESPONSES : "makes"
    USERS ||--o{ NOTIFICATIONS : "receives"
    BLOOD_REQUESTS ||--o{ NOTIFICATIONS : "triggers"

    USERS { bigint id PK
            string email UK
            string password_hash
            string full_name
            string phone
            enum role
            bool active
            string language }
    DONOR_PROFILES { bigint id PK
            bigint user_id FK,UK
            enum blood_group
            string division
            string district
            string upazila
            date last_donation_date
            bool available
            bool consent_search
            bool verified }
    BLOOD_REQUESTS { bigint id PK
            bigint requester_id FK
            enum blood_group
            int units
            string hospital_name
            string district
            datetime required_at
            enum urgency
            enum status }
    DONOR_RESPONSES { bigint id PK
            bigint request_id FK
            bigint donor_id FK
            enum status }
    NOTIFICATIONS { bigint id PK
            bigint user_id FK
            bigint request_id FK
            string kind
            string message
            bool seen }
    ADMIN_ACTIVITY_LOGS { bigint id PK
            string admin_email
            string action
            string target_type
            bigint target_id }
```

Unique constraints: `users.email`, `donor_profiles.user_id`, `(donor_responses.request_id, donor_id)`,
`(notifications.user_id, request_id, kind)` (prevents duplicate notifications).

## Not implemented yet
`Organization`, `OrganizationMember`, `Campaign`, `CampaignRegistration`, `Report`, `DonationHistory`,
and normalized `Division/District/Upazila` tables. Divisions and districts currently live in
`frontend/src/data/bd.js`, and the backend stores them as text.
