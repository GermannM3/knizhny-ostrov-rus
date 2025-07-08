-- Сначала удаляем пользователя если он существует
DELETE FROM public.users WHERE email = 'admin@bookcraft.ru';

-- Создаем запись в таблице users (без связи с auth.users пока)
INSERT INTO public.users (
    id,
    email,
    full_name,
    name,
    telegram_id,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@bookcraft.ru',
    'Администратор',
    'admin',
    389694638,
    now(),
    now()
);