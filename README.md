# AroCare Exact-Design Full-Stack Project

A complete development/demo pharmacy and healthcare web application built to closely match the three supplied AroCare mockups:

1. Homepage
2. Medicine catalogue
3. Product-detail page

The branding and source code are original AroCare assets. The project does not copy Arogga source code, logo or private data.

## Core features

- Mockup-matched responsive header, utility bar, navigation, hero and footer
- Home page with quick services, featured categories, popular products, trust cards, lab banner and reviews
- Medicine catalogue with search, category, brand, form, price and availability filters
- Product detail page with quantity, wishlist, add-to-cart, buy-now, prescription notice, delivery details, tabs and recommendations
- Persistent cart and wishlist
- Functional checkout with delivery details, COD, bKash demo and card demo
- Order creation and tracking
- Demo tracking ID: `AC-1042`
- Prescription JPG/PNG/WEBP/PDF upload with pharmacist-review status
- Lab-test home-collection booking
- Doctor appointment booking
- Account sign-in/register demo, orders, refill/reorder, wishlist, medical-record metadata, wallet and referral
- বাংলা, English and Banglish customer-support chatbot
- Gemini API through the backend only, with model fallback
- Local support answers when Gemini is unavailable
- Emergency-keyword warning and human-agent ticket form
- Functional admin dashboard with overview, orders, inventory, prescriptions, bookings, support queue, order-status update and CSV export

## Project structure

```text
AroCare_ExactDesign_FullStack/
├── backend/
│   ├── src/
│   ├── uploads/
│   ├── data-store.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   └── .env.example
├── design-reference/
├── setup.bat
├── start.bat
└── package.json
```

## Windows: easiest setup

1. Extract the ZIP completely.
2. Open the extracted project folder.
3. Double-click `setup.bat` once.
4. Open `backend/.env` and add the Gemini API key.
5. Double-click `start.bat`.

Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/health`
- Admin: `http://localhost:5173/admin`

## VS Code commands

Open the project root in VS Code, then run:

```powershell
npm run install:all
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
npm run dev
```

After the first setup:

```powershell
npm run dev
```

Run separately:

```powershell
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm run dev
```

## Gemini setup

Put the API key only in `backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173,http://localhost:5174
GEMINI_API_KEY=YOUR_GOOGLE_AI_STUDIO_KEY
GEMINI_MODEL=gemini-3-flash-preview
```

The backend tries the configured model first and then compatible Flash fallbacks when a model is unavailable. The local customer-support fallback continues to work when no key is configured or the free quota is unavailable.

## Important production notes

This is a functional development/demo application. A real pharmacy launch still requires:

- Licensed pharmacy and regulatory review
- Secure server-side authentication and OTP
- Production database and encrypted health-file storage
- Verified live inventory
- Approved payment gateway and webhook verification
- Pharmacist workflow and prescription audit logs
- Delivery-provider integration
- Rate limiting, malware scanning, backups and penetration testing
- Privacy policy, consent, retention and deletion controls

Do not use the demo chatbot to diagnose, prescribe or replace emergency care.

## Image and chatbot repair notes (v3.1)

This package includes 18 local PNG product images and a fallback image. Open `PRODUCT_IMAGE_PREVIEW.jpg` to see all product assets.

The chatbot now follows this routing order:

1. Emergency safety rules
2. Explicit human-agent requests
3. Order ID and store-service rules
4. Exact product matching
5. Gemini for open-ended AroCare questions
6. Local fallback without automatic human handoff

The chat header shows one of these modes:

- `Gemini ready • model-name`
- `Local support mode`
- `Backend offline`

To verify the repair before starting the UI:

```powershell
npm run verify
```

To confirm Gemini configuration after starting the backend, open:

```text
http://localhost:5000/api/chat/status
```

A recognised product question such as `Vitamin C 500 er dam koto?` also displays a product image card in the chatbot.
