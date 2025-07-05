-- Убираем foreign key constraint который мешает создавать пользователей через Telegram
-- Этот constraint требовал, чтобы каждый user.id существовал в auth.users
-- Но для Telegram пользователей мы создаем свои UUID

-- Удаляем constraint если он существует
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_id_fkey' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;
    END IF;
END $$;

-- Also remove any other potential foreign key constraints on users.id
DO $$ 
BEGIN
    -- Check for any foreign key constraints on users.id column
    IF EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'users' 
        AND column_name = 'id'
        AND constraint_name LIKE '%fkey%'
    ) THEN
        -- Get the constraint name and drop it
        DECLARE
            constraint_rec RECORD;
        BEGIN
            FOR constraint_rec IN 
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = 'users' 
                AND constraint_type = 'FOREIGN KEY'
            LOOP
                EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT ' || constraint_rec.constraint_name;
            END LOOP;
        END;
    END IF;
END $$;