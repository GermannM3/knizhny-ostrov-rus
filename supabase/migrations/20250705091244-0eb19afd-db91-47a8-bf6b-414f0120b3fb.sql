-- Исправляем предупреждения function_search_path_mutable для всех функций
-- Добавляем правильный search_path для предотвращения SQL-инъекций

-- 1. Пересоздаем функцию handle_updated_at с правильным search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. Пересоздаем функцию update_book_stats с правильным search_path
CREATE OR REPLACE FUNCTION public.update_book_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Обновляем статистику покупок
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'purchases' THEN
        UPDATE books 
        SET stats = jsonb_set(
            COALESCE(stats, '{}'), 
            '{purchases}', 
            (COALESCE((stats->>'purchases')::int, 0) + 1)::text::jsonb
        )
        WHERE id = NEW.book_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- 3. Пересоздаем функцию sync_telegram_data с правильным search_path
CREATE OR REPLACE FUNCTION public.sync_telegram_data(p_telegram_id bigint, p_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Комментарий: Исправлены 3 предупреждения function_search_path_mutable
-- Добавлен SET search_path TO 'public' во все функции для безопасности