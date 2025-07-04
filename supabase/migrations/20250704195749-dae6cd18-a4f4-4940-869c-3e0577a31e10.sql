-- Обновляем таблицу users для поддержки Telegram данных
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Обновляем индексы для быстрого поиска по telegram_id
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_books_author_id ON public.books(author_id);
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON public.chapters(book_id);

-- Добавляем недостающие поля в books
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{"views": 0, "purchases": 0}'::jsonb;

-- Обновляем reading_progress для корректной работы
ALTER TABLE public.reading_progress 
ADD COLUMN IF NOT EXISTS position_text TEXT,
ADD COLUMN IF NOT EXISTS progress_percentage NUMERIC DEFAULT 0;

-- Создаем функцию для обновления статистики книг
CREATE OR REPLACE FUNCTION update_book_stats()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления статистики
DROP TRIGGER IF EXISTS trigger_update_book_stats ON purchases;
CREATE TRIGGER trigger_update_book_stats
    AFTER INSERT ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_book_stats();

-- Создаем функцию для синхронизации Telegram данных
CREATE OR REPLACE FUNCTION sync_telegram_data(
    p_telegram_id BIGINT,
    p_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB := '{}';
    user_exists BOOLEAN := FALSE;
BEGIN
    -- Проверяем существование пользователя
    SELECT EXISTS(SELECT 1 FROM users WHERE telegram_id = p_telegram_id) INTO user_exists;
    
    IF NOT user_exists THEN
        -- Создаем пользователя если не существует
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
        );
    END IF;
    
    -- Возвращаем результат
    result := jsonb_build_object(
        'success', true,
        'message', 'Синхронизация завершена',
        'user_exists', user_exists
    );
    
    RETURN result;
END;
$$;