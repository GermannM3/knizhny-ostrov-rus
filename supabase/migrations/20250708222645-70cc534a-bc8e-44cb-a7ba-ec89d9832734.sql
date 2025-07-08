-- First, let's create the missing tables with different names to avoid conflicts
-- We'll use different table names for the payment system

-- Torrent books table (different from existing books table)
CREATE TABLE torrent_books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  magnet_link text not null,
  size text,
  seeds int,
  created_at timestamp default now()
);

-- Invoices for payments
CREATE TABLE payment_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null,
  book_id uuid references torrent_books(id) on delete cascade,
  status text check (status in ('pending', 'paid', 'failed')) default 'pending',
  stars_amount int not null default 100,
  created_at timestamp default now()
);

-- Telegram payments
CREATE TABLE telegram_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references payment_invoices(id) on delete cascade,
  payment_id text,
  paid_at timestamp default now()
);

-- Book downloads
CREATE TABLE book_downloads (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references torrent_books(id) on delete cascade,
  user_id bigint,
  file_url text not null,
  completed_at timestamp default now()
);

-- Enable RLS
ALTER TABLE torrent_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_downloads ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Torrent books - anyone can read
CREATE POLICY "Anyone can view torrent books" ON torrent_books FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create torrent books" ON torrent_books FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Payment invoices - users can only see their own
CREATE POLICY "Users can view their own payment invoices" ON payment_invoices FOR SELECT USING (user_id = (SELECT telegram_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can create their own payment invoices" ON payment_invoices FOR INSERT WITH CHECK (user_id = (SELECT telegram_id FROM users WHERE id = auth.uid()));

-- Telegram payments - users can only see payments for their invoices
CREATE POLICY "Users can view payments for their invoices" ON telegram_payments FOR SELECT USING (
  invoice_id IN (SELECT id FROM payment_invoices WHERE user_id = (SELECT telegram_id FROM users WHERE id = auth.uid()))
);
CREATE POLICY "System can create payments" ON telegram_payments FOR INSERT WITH CHECK (true);

-- Book downloads - users can only see their own downloads
CREATE POLICY "Users can view their own downloads" ON book_downloads FOR SELECT USING (user_id = (SELECT telegram_id FROM users WHERE id = auth.uid()));
CREATE POLICY "System can create downloads" ON book_downloads FOR INSERT WITH CHECK (true);