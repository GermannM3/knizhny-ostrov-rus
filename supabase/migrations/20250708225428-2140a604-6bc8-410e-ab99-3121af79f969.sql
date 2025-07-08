-- Создаем тестового админского пользователя для входа
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud
) VALUES (
    gen_random_uuid(),
    'admin@bookcraft.ru',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('admin123', gen_salt('bf')),
    updated_at = now();

-- Создаем соответствующую запись в таблице users
INSERT INTO public.users (
    id,
    email,
    full_name,
    name,
    telegram_id,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@bookcraft.ru'),
    'admin@bookcraft.ru',
    'Администратор',
    'admin',
    389694638,
    now(),
    now()
) ON CONFLICT (email) DO UPDATE SET
    full_name = 'Администратор',
    name = 'admin',
    telegram_id = 389694638,
    updated_at = now();