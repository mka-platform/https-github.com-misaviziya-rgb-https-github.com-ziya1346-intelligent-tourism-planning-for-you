# MOS-0400 — Development Standards

| فیلد | مقدار |
|---|---|
| Document Code | MOS-0400 |
| Version | 1.0 |
| Revision | 0 |
| Status | Approved |
| Author | Production Engineer |
| Technical Review | Chief Solution Architect |
| Approval | Project Owner |
| Related | MOS-0000, MOS-0010, MOS-0100, MOS-0110, MOS-0200, MOS-0300, ADR-0001 |

---

## 1. هدف (Purpose)

این سند استانداردهای کدنویسی، نام‌گذاری، معماری، قالب‌بندی، مستندسازی و همکاری تیم توسعه را تعریف می‌کند تا تمام اعضای تیم و ابزارهای هوش مصنوعی (ChatGPT، Claude، Codex، GitHub Copilot، Cursor) از یک مجموعه قوانین مشترک پیروی کنند.

این سند بر حاکمیت MOS-0000 ارجحیت ندارد: **AI پیشنهاد می‌دهد، انسان تأیید می‌کند.**

---

## 2. زبان‌ها و فناوری‌ها (Languages & Technologies)

| بخش | فناوری |
|---|---|
| Frontend | TypeScript |
| Backend | TypeScript |
| Mobile | React Native (TypeScript) |
| Database | PostgreSQL |
| ORM | Prisma |
| API | REST (OpenAPI 3.1) |
| AI | Python + LangChain |

---

## 3. سبک کدنویسی (Coding Style)

### TypeScript

- `strict = true`
- `noImplicitAny = true`
- ESLint اجباری
- Prettier اجباری
- استفاده از `async/await`
- عدم استفاده از `var`
- ترجیح `const` بر `let`

```ts
const hotel = await hotelService.findById(id);
```

### ساختار فایل

هر کلاس در فایل جداگانه قرار می‌گیرد:

```text
hotel.service.ts
hotel.controller.ts
hotel.module.ts
hotel.entity.ts
hotel.dto.ts
```

---

## 4. قراردادهای نام‌گذاری (Naming Conventions)

### فایل‌ها — kebab-case

```text
hotel.service.ts
booking.controller.ts
user.repository.ts
```

### کلاس‌ها — PascalCase

```text
HotelService
BookingController
PaymentGateway
```

### Interface — بدون پیشوند `I`

درست: `User`, `Hotel`, `Booking`
نادرست: `IUser`, `IHotel`

### Enum — PascalCase

```text
BookingStatus
PaymentStatus
```

### متغیرها — camelCase

```text
userId
bookingDate
hotelName
```

### ثابت‌ها — UPPER_SNAKE_CASE

```text
MAX_BOOKING_DAYS
JWT_SECRET
DEFAULT_LANGUAGE
```

### توابع — camelCase

```text
findHotel()
calculatePrice()
createReservation()
```

### مسیرهای API — lowercase

```text
/api/v1/users
/api/v1/hotels
/api/v1/bookings
```

### جداول و ستون‌های دیتابیس — snake_case

مطابق MOS-0300 (Database Design).

---

## 5. معماری پروژه (Architecture)

الگوی معماری:

```text
Clean Architecture + DDD + Microservices
```

لایه‌ها:

```text
Presentation
      ↓
Application
      ↓
   Domain
      ↓
Infrastructure
```

قواعد وابستگی: وابستگی‌ها فقط رو به داخل (به سمت Domain) مجاز است. لایه Domain نباید به هیچ فریم‌ورک یا زیرساختی وابسته باشد.

---

## 6. چارچوب‌های استاندارد (Standard Frameworks)

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand

### Backend

- NestJS
- Prisma
- PostgreSQL
- Redis
- Swagger
- Passport JWT

### Mobile

- React Native
- Expo
- TypeScript

### DevOps

- Docker
- Docker Compose
- GitHub Actions
- Nginx
- Kubernetes (فاز بعد)

---

## 7. الگوهای طراحی (Design Patterns)

مجاز و توصیه‌شده:

- Repository Pattern
- Service Layer
- Dependency Injection
- CQRS (در صورت نیاز)
- Event-Driven Architecture
- Strategy Pattern
- Factory Pattern

ممنوع:

- Singleton سفارشی — به‌جای آن از Dependency Injection استفاده شود.

---

## 8. قوانین Git

### Branchهای اصلی

```text
main
develop
architecture
```

### Branchهای ویژگی

```text
feature/user-auth
feature/hotel-search
feature/payment
```

### اصلاح خطا

```text
hotfix/payment-bug
```

---

## 9. پیام Commit (Conventional Commits)

```text
feat(auth): add JWT authentication
fix(payment): resolve callback issue
docs(architecture): update API standards
refactor(user): improve validation
test(booking): add unit tests
```

در صورت امکان، شناسه سند یا نیازمندی مرتبط ذکر شود:

```text
feat(hotel): implement SRS-HTL-02 price revalidation
```

---

## 10. مستندسازی (Documentation)

- تمام APIها باید Swagger/OpenAPI 3.1 داشته باشند.
- تمام ماژول‌ها باید `README.md` داشته باشند.
- کلاس‌های پیچیده باید توضیح مختصر (JSDoc) داشته باشند.
- کدی که یک نیازمندی مشخص را پیاده‌سازی می‌کند، شناسه آن را در کامنت ذکر کند: `// Implements SRS-HTL-01`

---

## 11. تست (Testing)

| نوع | حداقل الزام |
|---|---|
| Unit Test | پوشش ≥ 80% |
| Integration Test | برای تمام سرویس‌های اصلی |
| E2E Test | برای کل فرآیند رزرو |

---

## 12. امنیت (Security)

- JWT
- Refresh Token
- RBAC
- Rate Limiting
- Input Validation (DTO + class-validator یا Zod)
- Helmet
- CORS
- Argon2 برای هش رمز عبور
- **عدم ذخیره Secretها در کد** — استفاده از متغیرهای محیطی / Secret Manager

جزئیات تکمیلی در MOS-0500 (Security Architecture).

---

## 13. زبان و مستندسازی (Language Policy)

- تمام کد، نام فایل‌ها، متغیرها، کلاس‌ها، Commitها و مستندات فنی به **زبان انگلیسی**.
- اسناد تجاری، حقوقی و مدیریتی می‌توانند به **زبان فارسی** تهیه شوند.
- توضیحات Pull Requestها مختصر، فنی و شفاف باشد.
- پشتیبانی از RTL و `lang="fa"` در Frontend یک الزام سخت است (Multi-Language First — MOS-0000).

---

## 14. قوانین برای ابزارهای هوش مصنوعی (AI Agent Rules)

هنگام تولید کد توسط ChatGPT، Claude، Codex، GitHub Copilot یا Cursor:

1. از TypeScript Strict Mode پیروی شود.
2. کد مطابق Clean Architecture باشد.
3. از `any` استفاده نشود مگر با دلیل مستند در کامنت.
4. تمام APIها دارای DTO و Validation باشند.
5. هر ویژگی جدید همراه با تست و مستندات ارائه شود.
6. کد تولیدی باید با ESLint و Prettier سازگار باشد.
7. تصمیمات معماری، دیتابیس یا طراحی API به‌صورت مستقل گرفته نشود؛ حداقل گزینه معقول پیاده و با `// NOTE (MOS-0200 TBD): ...` علامت‌گذاری و در پاسخ اعلام شود.
8. خارج از محدوده Work Package جاری، refactor انجام نشود.
9. محدوده MVP طبق ADR-0001 رعایت شود (Hotel + Tour + Auth + Wallet + AI Trip Planner + CMS + Loyalty + Notification + Reporting).
10. هیچ داده حساسی (Secret، PII، داده مالی واقعی) در prompt یا خروجی قرار نگیرد.

---

## 15. Change Log

| Version | Change |
|---|---|
| 1.0 | نسخه اولیه استانداردهای توسعه — کدنویسی، نام‌گذاری، معماری، Git، تست، امنیت و قوانین ابزارهای هوش مصنوعی |
