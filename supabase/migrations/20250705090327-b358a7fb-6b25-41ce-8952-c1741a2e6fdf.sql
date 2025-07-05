-- Удаляем проблемные foreign key constraints для SEO-таблиц
-- Эти таблицы не используются в книжном приложении

ALTER TABLE IF EXISTS project_keywords DROP CONSTRAINT IF EXISTS project_keywords_project_id_fkey;
ALTER TABLE IF EXISTS position_tracking DROP CONSTRAINT IF EXISTS position_tracking_project_id_fkey;

-- Комментарий: Удаляем foreign key constraints, которые вызывают ошибки в логах,
-- поскольку эти SEO-таблицы не используются в нашем книжном приложении