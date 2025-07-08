-- Обновляем существующего пользователя с telegram_id = 389694638
UPDATE public.users 
SET 
    email = 'admin@bookcraft.ru',
    password = 'admin123',  -- простой пароль для тестов
    full_name = 'Герман - Админ',
    updated_at = now()
WHERE telegram_id = 389694638;