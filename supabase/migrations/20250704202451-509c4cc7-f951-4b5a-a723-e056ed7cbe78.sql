-- Исправляем RLS политики для users таблицы
-- Проблема: при создании пользователя через Telegram auth.uid() еще не существует

-- Удаляем проблемные политики INSERT
DROP POLICY IF EXISTS "Users can insert own user data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Создаем новую политику для INSERT которая позволяет создание пользователей через сервис
CREATE POLICY "Allow user creation via service" ON public.users
FOR INSERT 
WITH CHECK (true);

-- Обновляем политику SELECT для безопасности
DROP POLICY IF EXISTS "Users can view own user data" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

CREATE POLICY "Users can view their own data" ON public.users
FOR SELECT 
USING (auth.uid() = id OR auth.uid() IS NULL);

-- Создаем индекс для telegram_id если не существует
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);

-- Обновляем функцию sync_telegram_data для обработки дубликатов
CREATE OR REPLACE FUNCTION public.sync_telegram_data(p_telegram_id bigint, p_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB := '{}';
    user_exists BOOLEAN := FALSE;
    existing_user_id UUID;
BEGIN
    -- Проверяем существование пользователя по telegram_id
    SELECT id INTO existing_user_id 
    FROM users 
    WHERE telegram_id = p_telegram_id 
    LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Пользователь уже существует, обновляем данные
        UPDATE users SET
            first_name = COALESCE(p_data->>'first_name', first_name),
            last_name = COALESCE(p_data->>'last_name', last_name),
            username = COALESCE(p_data->>'username', username),
            updated_at = NOW()
        WHERE id = existing_user_id;
        
        user_exists := TRUE;
    ELSE
        -- Создаем нового пользователя
        INSERT INTO users (
            telegram_id, 
            email, 
            name, 
            first_name, 
            last_name, 
            username
        ) VALUES (
            p_telegram_id,
            'telegram_' || p_telegram_id || '@bookcraft.ru',
            COALESCE(p_data->>'first_name', 'User'),
            p_data->>'first_name',
            p_data->>'last_name',
            p_data->>'username'
        ) ON CONFLICT (email) DO NOTHING;
        
        user_exists := FALSE;
    END IF;
    
    -- Возвращаем результат
    result := jsonb_build_object(
        'success', true,
        'message', 'Синхронизация завершена',
        'user_exists', user_exists,
        'user_id', COALESCE(existing_user_id, (SELECT id FROM users WHERE telegram_id = p_telegram_id LIMIT 1))
    );
    
    RETURN result;
END;
$$;