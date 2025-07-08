
-- 📘 BookCraft / Книжный остров — База данных Supabase для оплаты книг через Telegram Stars
-- Telegram ID: 389694638 (Герман) — все оплаты должны приходить на него

-- 1. Таблица книг
create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  magnet_link text not null,
  size text,
  seeds int,
  created_at timestamp default now()
);

-- 2. Инвойсы на оплату
create table invoices (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null,
  book_id uuid references books(id) on delete cascade,
  status text check (status in ('pending', 'paid', 'failed')) default 'pending',
  stars_amount int not null default 100,
  created_at timestamp default now()
);

-- 3. Платежи через Telegram
create table payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  payment_id text,
  paid_at timestamp default now()
);

-- 4. Хранилище скачанных книг
create table downloads (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade,
  user_id bigint,
  file_url text not null,
  completed_at timestamp default now()
);

-- 🔐 Ограничим чтение/запись только авторизованным пользователям
alter table books enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table downloads enable row level security;

-- Политики безопасности Supabase (RLS) ты можешь задать отдельно через Dashboard
