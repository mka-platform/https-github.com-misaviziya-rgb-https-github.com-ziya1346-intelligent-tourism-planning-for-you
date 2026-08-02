# Contributing — Mosavi Holding Travel Platform

راهنمای مشارکت در پروژه. مرجع کامل استانداردها: [`docs/development/MOS-0400_Development_Standards.md`](docs/development/MOS-0400_Development_Standards.md)

> حاکمیت پروژه (MOS-0000): **AI can suggest, AI cannot approve, a human approves.**

---

## 1. پیش‌نیازها (Prerequisites)

- Node.js LTS
- pnpm
- Docker + Docker Compose
- PostgreSQL و Redis (از طریق Docker Compose)

---

## 2. شروع کار (Getting Started)

```bash
pnpm install
cp .env.example .env
pnpm dev
```

هرگز مقادیر واقعی Secret را در مخزن commit نکنید.

---

## 3. جریان کاری Git (Git Workflow)

### Branchهای اصلی

| Branch | کاربرد |
|---|---|
| `main` | نسخه پایدار / production |
| `develop` | یکپارچه‌سازی توسعه |
| `architecture` | اسناد و تصمیمات معماری |

### ایجاد Branch

```bash
git checkout develop
git checkout -b feature/hotel-search
```

الگوها:

```text
feature/<scope>
hotfix/<scope>
docs/<scope>
refactor/<scope>
```

### Commit — Conventional Commits

```text
feat(auth): add JWT authentication
fix(payment): resolve callback issue
docs(architecture): update API standards
refactor(user): improve validation
test(booking): add unit tests
```

در صورت امکان شناسه نیازمندی ذکر شود: `feat(hotel): implement SRS-HTL-02 price revalidation`

---

## 4. Pull Request

هر PR باید:

- به `develop` هدف‌گذاری شود (به‌جز hotfix).
- عنوان آن با فرمت Conventional Commits باشد.
- توضیح مختصر، فنی و شفاف داشته باشد (انگلیسی).
- شناسه‌های MOS/ADR/FR/SRS مرتبط را ذکر کند.
- تست‌های مرتبط را همراه داشته باشد.
- lint، format، typecheck و test را با موفقیت پشت سر بگذارد.
- تصمیمات معماریِ ناگزیر را صراحتاً علامت‌گذاری کند (`// NOTE (MOS-0200 TBD): ...`).

### چک‌لیست پیش از ارسال

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
```

---

## 5. استانداردهای کد (Code Standards)

خلاصه — جزئیات در MOS-0400:

- TypeScript strict، بدون `any` مگر با دلیل مستند
- فایل‌ها: `kebab-case` · کلاس‌ها: `PascalCase` · متغیرها: `camelCase` · ثابت‌ها: `UPPER_SNAKE_CASE`
- بدون پیشوند `I` برای Interfaceها
- مسیرهای API با حروف کوچک: `/api/v1/hotels`
- Clean Architecture + DDD؛ وابستگی فقط به سمت Domain
- بدون Singleton سفارشی — از Dependency Injection استفاده شود
- تمام کد، کامنت‌ها و پیام‌های commit به زبان انگلیسی

---

## 6. تست (Testing)

| نوع | الزام |
|---|---|
| Unit | پوشش ≥ 80% |
| Integration | تمام سرویس‌های اصلی |
| E2E | کل فرآیند رزرو |

---

## 7. امنیت (Security)

- هرگز Secret، توکن، کلید API یا PII را commit نکنید.
- تمام ورودی‌ها را با DTO و Validation اعتبارسنجی کنید.
- رمز عبور فقط با Argon2 هش شود.
- Rate Limiting، Helmet و CORS برای تمام endpointهای عمومی الزامی است.

گزارش آسیب‌پذیری‌ها را به‌صورت خصوصی به تیم امنیت ارسال کنید، نه در Issue عمومی.

---

## 8. مستندسازی (Documentation)

- هر ماژول یک `README.md` دارد.
- هر API عمومی مستندات Swagger/OpenAPI 3.1 دارد.
- اسناد MOS-xxxx از قالب هدر استاندارد پیروی می‌کنند.
- اسناد تجاری/حقوقی می‌توانند فارسی باشند؛ مستندات فنی انگلیسی است.

---

## 9. مشارکت ابزارهای هوش مصنوعی (AI-Assisted Contributions)

اگر بخشی از کد توسط ابزار هوش مصنوعی تولید شده است:

- آن را در توضیح PR اعلام کنید.
- قوانین [`AGENTS.md`](AGENTS.md) را رعایت کنید.
- مسئولیت صحت، امنیت و انطباق کد بر عهده مشارکت‌کننده انسانی است.
