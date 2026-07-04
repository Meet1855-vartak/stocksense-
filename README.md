# 📦 StockSense — AI-Powered Inventory & Sales Assistant

> This project was built as part of the Major Project assignment shared by **Prathamesh Sir**.

StockSense is an AI-powered inventory and sales management platform built for small shop owners. It lets you manage products, track stock, record sales, and get AI-driven insights — all with the option to use your phone camera to scan shelves and receipts instead of typing everything manually.

---

## 🌐 Live Demo

- **Live URL:** https://stocksense-inventory.vercel.app
- **GitHub Repo:** https://github.com/Meet1855-vartak/stocksense-

---

## ✨ Features

- 🔐 **Authentication** — Secure signup/login via Supabase Auth
- 🛡️ **Protected Routes** — Dashboard and all core features are only accessible when logged in
- 📦 **Product CRUD** — Add, edit, delete, and view inventory items with price, category, quantity, and reorder threshold
- 📸 **AI Vision — Stock Entry** — Photograph a shelf and Groq Vision automatically detects products and estimated quantities
- 🧾 **AI Vision — Sales Receipt Scanning** — Photograph a receipt and Groq Vision extracts items, quantities, and prices
- 🤖 **AI Insights (Groq AI)** — Ask natural-language questions about your inventory and sales ("What should I reorder?", "What sold best this month?")
- 📧 **Email Notifications (Resend)**
  - Automatic low-stock alert emails after a sale drops inventory below the reorder threshold
  - On-demand weekly sales summary emails
  - Contact Us form that emails the site owner directly
- 📊 **Analytics Dashboard** — Interactive charts (Recharts) for revenue trends, best/worst sellers, stock levels, and revenue by category
- 🎨 **Landing Page** — Marketing-style landing page with scroll animations and light/dark theme support
- 🌗 **Light/Dark Theme** — Full theme system using CSS variables, toggled from the navbar

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Backend / Database / Auth:** Supabase (Postgres, Auth, Row Level Security, Edge Functions)
- **AI:** Groq AI (text insights) & Groq Vision (image analysis) via Supabase Edge Functions
- **Email:** Resend via Supabase Edge Functions
- **Charts:** Recharts
- **Routing:** React Router
- **Deployment:** Vercel

---

## 🗄️ Database Schema (Supabase)

- `products` — id, user_id, name, category, price, quantity, reorder_threshold, created_at
- `stock_entries` — id, product_id, quantity_added, source (manual/photo), created_at
- `sales` — id, user_id, total_amount, created_at
- `sale_items` — id, sale_id, product_id, quantity, price
- `suppliers` — id, user_id, name, contact_info, created_at (optional)

All tables have Row Level Security enabled so users can only access their own data.

---

## ⚙️ Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- A Supabase account and project
- A Groq API key ([console.groq.com](https://console.groq.com))
- A Resend API key ([resend.com](https://resend.com))
- Supabase CLI installed (`npm install -g supabase`)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd stocksense
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the project root:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up Supabase
- Create a new Supabase project
- Under **Authentication → Providers → Email**, disable "Confirm email" for easier local testing
- Run the SQL scripts (see `/supabase` folder or the schema section above) to create tables and Row Level Security policies

### 5. Deploy Supabase Edge Functions
This project uses several Edge Functions to securely call Groq and Resend APIs without exposing keys in the frontend:

```bash
supabase login
supabase link --project-ref your-project-ref

supabase secrets set GROQ_API_KEY=your_groq_key
supabase secrets set RESEND_API_KEY=your_resend_key

supabase functions deploy analyze-stock-image
supabase functions deploy analyze-receipt
supabase functions deploy ai-insights
supabase functions deploy send-email --no-verify-jwt
```

### 6. Run the app locally
```bash
npm run dev
```
Visit `http://localhost:5173`

---

## 📝 Design Notes

- **AI results always require human confirmation** — Groq Vision pre-fills forms for stock entries and sales, but the user must review and submit manually. This avoids incorrect AI estimates silently entering inventory records.
- **Sending emails to dynamic user addresses** requires a verified custom domain in Resend; this demo uses Resend's sandbox sender, which restricts delivery to the developer's verified test address. In production, a verified domain would allow full dynamic delivery to any user's registered email.
- **Products with sales history cannot be deleted** (enforced by a database foreign key constraint) to protect the integrity of past sales records. Users are shown a friendly message and can set quantity to 0 instead.

---

## 📸 Screenshots

Landing Page
<img width="1919" height="913" alt="image" src="https://github.com/user-attachments/assets/4eea4ef7-bcbe-4f90-b560-14ccc78afde6" />

Signup page
<img width="1919" height="912" alt="image" src="https://github.com/user-attachments/assets/7b70200d-dc72-4cb9-aec0-21241e2975dd" />

Dashboard 
<img width="1919" height="895" alt="image" src="https://github.com/user-attachments/assets/4e7b0508-da5e-4b09-8051-bf82232b6207" />

Products page
<img width="1919" height="912" alt="image" src="https://github.com/user-attachments/assets/05c4f780-4182-46d3-9f33-d85cdd9d17d0" />

Stock Entry (AI Scan) 
<img width="1919" height="919" alt="image" src="https://github.com/user-attachments/assets/f9fe0e4c-c6a7-46cf-a6dc-c9fa8dcf64b6" />

Sales (Receipt Scan) 
<img width="1919" height="901" alt="image" src="https://github.com/user-attachments/assets/ca6cf27c-ac01-4522-b374-a9833f7e0928" />

Analytics Dashboard  
<img width="1919" height="919" alt="image" src="https://github.com/user-attachments/assets/c7b076c6-558d-499d-89ec-113fcc053ebf" />

AI Insights 
<img width="1919" height="916" alt="image" src="https://github.com/user-attachments/assets/750c6714-bcbc-44ef-936a-da56319a018c" />

Reports
<img width="1919" height="916" alt="image" src="https://github.com/user-attachments/assets/9bedb62b-c9d2-4738-b3eb-75616adb24f1" />

Contact Us
<img width="1919" height="903" alt="image" src="https://github.com/user-attachments/assets/5eae1a9d-8a08-4a6b-b33a-b2899bbae567" />


---

## 👤 Author

Built by **Meet Vartak** as part of the Major Project assignment.
