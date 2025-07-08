-- RLS policies for the new payment tables

-- Books policies - anyone can read, only authenticated users can manage
CREATE POLICY "Anyone can view books" ON books FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create books" ON books FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update books" ON books FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete books" ON books FOR DELETE USING (auth.uid() IS NOT NULL);

-- Invoices policies - users can only see their own invoices
CREATE POLICY "Users can view their own invoices" ON invoices FOR SELECT USING (user_id = (SELECT telegram_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can create their own invoices" ON invoices FOR INSERT WITH CHECK (user_id = (SELECT telegram_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update their own invoices" ON invoices FOR UPDATE USING (user_id = (SELECT telegram_id FROM users WHERE id = auth.uid()));

-- Payments policies - users can only see payments for their invoices
CREATE POLICY "Users can view payments for their invoices" ON payments FOR SELECT USING (
  invoice_id IN (SELECT id FROM invoices WHERE user_id = (SELECT telegram_id FROM users WHERE id = auth.uid()))
);
CREATE POLICY "System can create payments" ON payments FOR INSERT WITH CHECK (true);

-- Downloads policies - users can only see their own downloads
CREATE POLICY "Users can view their own downloads" ON downloads FOR SELECT USING (user_id = (SELECT telegram_id FROM users WHERE id = auth.uid()));
CREATE POLICY "System can create downloads" ON downloads FOR INSERT WITH CHECK (true);