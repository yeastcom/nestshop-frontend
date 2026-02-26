# NestShop — Frontend

Aplikacja frontendowa platformy e-commerce NestShop. Zbudowana na [Next.js 16](https://nextjs.org/) z React 19, Tailwind CSS 4 i shadcn/ui.

## Technologie

| Warstwa | Technologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| Formularze | React Hook Form + Zod |
| Tabele | TanStack Table |
| Drag & Drop | dnd-kit |
| Edytor tekstu | TipTap |
| Powiadomienia | Sonner |
| Ikonki | Lucide, Tabler Icons |

## Wymagania

- Node.js 20+
- Działający backend NestShop (`http://localhost:3000`)

## Uruchomienie lokalnie

### 1. Instalacja zależności

```bash
npm install
```

### 2. Zmienne środowiskowe

Utwórz plik `.env.local`:

```bash
cp .env.local.example .env.local
```

| Zmienna | Opis | Przykład |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL API backendu | `http://localhost:3000/api` |
| `NEXT_PUBLIC_BACKEND_URL` | URL backendu (pliki statyczne) | `http://localhost:3000` |

### 3. Start serwera developerskiego

```bash
npm run dev
```

Aplikacja dostępna pod: `http://localhost:3001`

---

## Struktura projektu

```
app/
├── (store)/             # Publiczny sklep
│   ├── page.tsx         # Strona główna
│   ├── [slugOrId]/      # Strony produktów i kategorii
│   ├── cart/            # Koszyk
│   ├── content/         # Strony CMS
│   └── account/         # Konto klienta (login, rejestracja, profil, adresy)
├── (checkout)/          # Proces zamówienia
│   └── checkout/        # Kroki: klient → adres → dostawa → płatność
└── admin/               # Panel administracyjny
    ├── login/           # Logowanie admina
    └── (panel)/         # Zarządzanie: produkty, kategorie, menu, CMS, klienci, zamówienia

components/
├── ui/                  # Komponenty bazowe (shadcn/ui)
├── store/               # Komponenty sklepu (header, koszyk, produkt)
├── checkout/            # Komponenty procesu zamówienia
└── admin/               # Komponenty panelu admina (formularze, tabele)

lib/
├── api.client.ts        # API client (po stronie klienta)
├── api.server.ts        # API client (po stronie serwera)
├── admin-api.client.ts  # Admin API client
└── schemas/             # Schematy walidacji Zod
```

---

## Sekcje aplikacji

### Sklep (`/`)

Publiczna część sklepu dostępna dla wszystkich użytkowników:

- **Strona główna** — lista produktów i kategorii
- **Kategoria** — produkty z paginacją
- **Produkt** — szczegóły produktu, dodawanie do koszyka
- **Koszyk** (`/cart`) — zarządzanie pozycjami
- **Treści CMS** (`/content/:slug`) — strony statyczne (regulamin, polityka itp.)

### Konto klienta (`/account`)

Wymaga zalogowania (przekierowanie do `/account/login`):

- **Logowanie / Rejestracja**
- **Profil** — edycja danych osobowych
- **Adresy** — zarządzanie adresami dostawy i faktury
- **Zamówienia** — historia zakupów

### Checkout (`/checkout`)

Proces składania zamówienia w 4 krokach:

1. Dane klienta
2. Adres dostawy
3. Metoda dostawy
4. Płatność

### Panel administracyjny (`/admin`)

Wymaga zalogowania jako admin:

| Sekcja | Ścieżka | Opis |
|---|---|---|
| Produkty | `/admin/product` | CRUD produktów, upload zdjęć, przypisanie kategorii |
| Kategorie | `/admin/category` | Drzewo kategorii, zarządzanie hierarchią |
| Menu | `/admin/menu` | Budowanie menu nawigacyjnego (max 2 poziomy) |
| CMS | `/admin/cms` | Edycja stron statycznych z edytorem rich-text |
| Klienci | `/admin/customer` | Lista klientów |
| Adresy | `/admin/address` | Lista adresów klientów |
| Zamówienia | `/admin/order` | Lista i zarządzanie zamówieniami |

---

## Autentykacja

Aplikacja używa sesji cookie (httpOnly):

- **Klienci** — cookie `customer.sid`
- **Admini** — cookie `admin.sid`

Middleware (`middleware.ts`) automatycznie chroni ścieżki `/account/*` i `/admin/*`, przekierowując niezalogowanych użytkowników na odpowiednie strony logowania.

---

## Skrypty

```bash
npm run dev      # Tryb developerski (http://localhost:3001)
npm run build    # Build produkcyjny
npm run start    # Uruchom build produkcyjny
npm run lint     # Linting (ESLint)
```
