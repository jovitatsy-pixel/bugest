# SpendSmart – Smart Daily Expense Tracker and Budget Alert System

A simple, clean, responsive fintech web app tailored for **students (managing pocket money)** and **working professionals** to effortlessly track daily expenses and manage budgets with real-time alert thresholds.

---

## Key Features

1. **Authentication (Login / Register)**
   - Secure email & password authentication with form validation.
   - Built-in **1-Click Demo / Guest Mode** with realistic sample expenses for students and working professionals to explore instantly without manual setup.
   - Seamless live integration with Supabase Auth.

2. **Dashboard**
   - Personalized greeting with the user's name.
   - **4 Core Fintech Metric Cards**:
     - *Today's Spending*
     - *Today's Remaining Daily Budget*
     - *Monthly Spending*
     - *Monthly Remaining Budget*
   - **Spending Progress Bars**: Color-coded with threshold tick markers.
   - **Recent Transactions List**: Quick view of latest expenses with category badges and actions.
   - **Smart Insights Preview**: Instant alerts and velocity advice.

3. **Add & Edit Expenses**
   - Inputs: Amount, Category, Description / Note, Payment Method, and Date.
   - **8 Categories**: Food, Transport, Shopping, Education, Entertainment, Bills, Health, Other.
   - **5 Payment Methods**: UPI, Cash, Debit Card, Credit Card, Bank Transfer.

4. **Expense List Management**
   - Full searchable transaction history.
   - Filter by Category pills (Food, Transport, Bills, etc.).
   - Sort by Newest, Oldest, Highest, and Lowest amount.
   - **Edit Expense**: Modify amount, date, category, note, or payment method.
   - **Delete Expense**: Protected with a safety confirmation modal.

5. **Budget Management**
   - Configure **Daily Budget** (e.g. ₹500) and **Monthly Budget** (e.g. ₹15,000).
   - Automated calculations:
     - Amount Spent
     - Amount Remaining
     - Budget Usage Percentage (`(spent / budget) * 100`)
   - Safe daily spending pace advice based on remaining days in the month.

6. **Smart Budget Alerts**
   - **Below 70%** → Normal (Emerald)
   - **70% – 89%** → Warning (Amber)
   - **90% – 99%** → Critical (Orange)
   - **100% or more** → Budget Exceeded (Rose)
   - Dynamic alert banners and badges appear automatically when spending crosses these thresholds.

7. **Basic Analytics & Charts**
   - Period selector: Last 7 Days, Last 30 Days, All Time.
   - **Donut / Pie Chart** (using `Recharts`) for Spending by Category with interactive tooltips.
   - **Daily Spending Bar Chart** (using `Recharts`) for spending trends over time.
   - Payment method distribution (UPI, Cash, Cards).

8. **Genuine Automated Insights**
   - Calculated strictly from real user expense data:
     - Highest spending category and percentage share.
     - Safe daily spending allowance for remaining days in the month.
     - Week-over-week or Month-over-month trend comparison (increased/decreased spend).

9. **Profile & Settings**
   - View and update user's full name.
   - Adjust default Daily and Monthly budget limits.
   - Light and Dark mode toggle with persistent state.
   - Currency selector (₹ INR, \$ USD, € EUR, £ GBP).
   - Supabase connection status check.
   - Sign Out action.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (with Dark Mode support)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Dates**: date-fns
- **Backend & Database**: Supabase (`@supabase/supabase-js`) with Row Level Security (RLS)
- **Local Fallback**: LocalStorage for zero-friction Demo & Offline mode

---

## Supabase Database Setup

SpendSmart is fully configured to connect to your Supabase PostgreSQL database.

### 1. Run the Database Schema
In your Supabase project dashboard (https://app.supabase.com):
1. Navigate to the **SQL Editor**.
2. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. Click **Run**.

This script sets up:
- `profiles` table (id, full_name, email, daily_budget, monthly_budget, created_at)
- `expenses` table (id, user_id, amount, category, description, payment_method, expense_date, created_at)
- Row Level Security (RLS) policies ensuring users can only read, insert, edit, and delete their own data.
- An automated trigger `handle_new_user` on `auth.users` to automatically initialize user profiles.

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update with your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

*(Note: If no Supabase credentials are provided, SpendSmart seamlessly defaults to built-in Demo mode with realistic mock data and full local persistence!)*

---

## Getting Started

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```
