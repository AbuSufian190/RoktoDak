# RoktoDak (রক্তডাক)

*One Call for Blood, One Step Towards Life.* / এক ডাকেই রক্তের সন্ধান, এক উদ্যোগে বাঁচুক প্রাণ।

A blood donor discovery and emergency request platform for Bangladesh. React + Vite + Tailwind frontend, Spring Boot 3 + MySQL backend.

> **Status: MVP.** Use the local development profile below for a persistent embedded database, or configure MySQL for deployment.

> RoktoDak connects people. It does not test blood, confirm medical eligibility or guarantee availability. Hospitals must verify blood type and compatibility.

## Features (implemented)
Registration and login for donors and seekers, donor profiles with consent and availability, privacy-safe donor search with pagination, blood requests reviewed by an admin before donors are notified, in-app notifications, donor accept/decline, admin dashboard with audit log, Bangla/English UI.

## Stack
React 18, Vite 5, Tailwind 3, React Router 6, Axios, React Hook Form, i18next, Lucide · Java 17, Spring Boot 3.3, Spring Security + JWT (jjwt), Spring Data JPA, Bean Validation, springdoc OpenAPI · H2 for local development, MySQL 8 for deployment.

## Run locally
Requirements: JDK 17+ and Node 18+. The Maven wrapper downloads Maven if it is not already cached. Local development uses a persistent H2 database and does not require MySQL.

```powershell
# 1) Backend (terminal 1)
cd backend
.\run-dev.ps1                 # http://localhost:8080 (Swagger: /swagger-ui.html)

# 2) Frontend (terminal 2)
cd frontend
npm install
npm run dev                   # http://localhost:5173 (proxies /api to :8080)
```

The first backend start creates `backend\.env.local` with a local JWT secret and admin credentials, and creates the persistent database under `backend\data`. The credentials are printed at startup. Both local files are ignored by Git.

For MySQL, use the default datasource settings in `application.properties` and set `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the environment. For production, also set `DDL_AUTO=validate` and manage schema changes with migrations.

## Test
```powershell
cd backend
.\mvnw.cmd test               # JwtServiceTest + ApiFlowTest (H2 in MySQL mode)
```
There are no frontend tests yet.

## Manual verification checklist
1. Register a donor (O+, Dhaka) and a seeker. Log in as each.
2. As the seeker, post a request for O+ in Dhaka. It shows as "Pending review" and is NOT on /requests.
3. Log in as the admin, approve it. It now appears on /requests.
4. Log in as the donor: a notification and a matching request appear. Accept it.
5. As the seeker: open "Donor responses". The donor's phone is visible only now.
6. Check that `/find` and the browser network tab never show any phone or email.
7. As the donor, open /api/admin/stats in the browser console with your token: expect 403.

## API (summary)
Public: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/donors/search`, `GET /api/requests`.
Authenticated: `GET /api/me`, `PUT /api/me/language`, `GET|PUT /api/donors/me`, `GET /api/donors/me/matching-requests`,
`POST /api/requests`, `GET /api/requests/mine`, `PUT /api/requests/{id}/cancel|fulfill`, `POST /api/requests/{id}/respond`,
`GET /api/requests/{id}/responses`, `GET /api/notifications`, `GET /api/notifications/unread-count`, `PUT /api/notifications/{id}/read`.
Admin: `GET /api/admin/stats|users|requests|logs`, `PUT /api/admin/requests/{id}/approve|reject`, `PUT /api/admin/users/{id}/active`, `PUT /api/admin/donors/{id}/verify`.
Full interactive docs: `/swagger-ui.html`.

## Structure
```
backend/   Spring Boot (controller, service, repository, entity, dto, security, config, exception)
frontend/  React app (components, pages, features, context, services, i18n, data)
database/  ER diagram and notes
docs/      scope and next steps
```

## Deployment notes
Set `JWT_SECRET`, `DB_*`, `CORS_ORIGINS` (your frontend URL) and `DDL_AUTO=validate` in the host's environment. For a separate frontend host, set `VITE_API_URL` at build time. Free tiers may sleep or lack persistent MySQL, so verify current limits of your chosen host before relying on it.

## Privacy and safety choices
Search shows only consenting donors with a shortened name and district; no phone, email or exact address. A donor's number is revealed to a requester only after that donor accepts that request. Requests start unverified and need admin approval. Admin actions are logged. Passwords are BCrypt-hashed.

## License
MIT
