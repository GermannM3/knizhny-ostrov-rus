-- Исправляем функцию sync_telegram_data для правильного создания пользователей
CREATE OR REPLACE FUNCTION public.sync_telegram_data(p_telegram_id bigint, p_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB := '{}';
    user_exists BOOLEAN := FALSE;
    existing_user_id UUID;
    new_user_id UUID;
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
        new_user_id := existing_user_id;
    ELSE
        -- Генерируем новый UUID для пользователя
        new_user_id := gen_random_uuid();
        
        -- Создаем нового пользователя с правильным ID
        INSERT INTO users (
            id,
            telegram_id, 
            email, 
            name, 
            first_name, 
            last_name, 
            username,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            p_telegram_id,
            'telegram_' || p_telegram_id || '@bookcraft.ru',
            COALESCE(p_data->>'first_name', 'User'),
            p_data->>'first_name',
            p_data->>'last_name',
            p_data->>'username',
            NOW(),
            NOW()
        ) ON CONFLICT (email) DO NOTHING;
        
        user_exists := FALSE;
    END IF;
    
    -- Возвращаем результат
    result := jsonb_build_object(
        'success', true,
        'message', 'Синхронизация завершена',
        'user_exists', user_exists,
        'user_id', new_user_id,
        'telegram_id', p_telegram_id
    );
    
    RETURN result;
END;
$$;