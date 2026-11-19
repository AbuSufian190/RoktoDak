# What is built, what is not

## Built (MVP)
- Registration/login (BCrypt, JWT Bearer), roles DONOR / SEEKER / ADMIN, backend-enforced with `@PreAuthorize` and `/api/admin/**` rules
- Donor profile (consent, availability, visibility of last donation date), privacy-safe public search with pagination
- Blood requests: submit -> PENDING -> admin approve/reject -> ACTIVE -> fulfil/cancel; hourly auto-expiry
- On approval: de-duplicated in-app notifications to same-blood-group, same-district, available, consenting donors
- Donor accept/decline; requester sees a donor's phone only after that donor accepted
- Admin: stats, request review, user suspend/reactivate, donor verification, audit log
- Bangla/English (react-i18next), language preference saved per user
- Rate limit on login/register, global error handler, Swagger UI at /swagger-ui.html

## Not built (from the original brief)
Leaflet map, organization portal, campaigns, reports, donation history, reminders, FAQ/AI assistant,
charts, distance ranking (Haversine), password reset, contact form, email/SMS, normalized location tables,
upazila data, profile completion meter, frontend tests, repository/Mockito tests.

## Needs your attention
1. **Backend verified:** `.\mvnw.cmd test` passes (8 tests), and the local H2 development profile starts and serves the API. Run the manual workflow in README.md to verify the full donor/seeker/admin journey.
2. **Upazila data**: import a verified open Bangladesh administrative dataset yourself; none is bundled.
3. **Token storage**: the JWT is kept in sessionStorage (cleared when the tab closes) and sent as a Bearer header.
   This is simple but readable by injected scripts (XSS). The brief's preferred option is an HttpOnly cookie + CSRF protection; that is a good next hardening step.
4. **Rate limiter** is in-memory and per server instance.
5. Notification text is stored in English only.
