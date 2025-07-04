import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { telegram_id, data } = await req.json()
    
    if (!telegram_id || !data) {
      return new Response(JSON.stringify({ success: false, message: 'Неверные данные' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('💾 Saving data for telegram_id:', telegram_id)

    // Получаем пользователя
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegram_id)
      .single()

    if (!user) {
      return new Response(JSON.stringify({ success: false, message: 'Пользователь не найден' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let updatedCount = 0

    // Обрабатываем книги
    if (data.bookplatform_books) {
      try {
        const books = JSON.parse(data.bookplatform_books)
        for (const book of books) {
          if (book.authorId === user.id) {
            const { error } = await supabase
              .from('books')
              .upsert({
                id: book.id,
                title: book.title,
                description: book.description,
                genre: book.genre,
                status: book.status,
                cover_image: book.coverImage,
                author_id: book.authorId,
                price: book.price || 0,
                is_public: book.is_public || false,
                source: book.source || 'internal',
                format: book.format || 'bookcraft'
              })
            
            if (!error) updatedCount++
          }
        }
      } catch (e) {
        console.error('Error saving books:', e)
      }
    }

    // Обрабатываем главы
    if (data.bookplatform_chapters) {
      try {
        const chapters = JSON.parse(data.bookplatform_chapters)
        for (const chapter of chapters) {
          // Проверяем что глава принадлежит книге пользователя
          const { data: book } = await supabase
            .from('books')
            .select('id')
            .eq('id', chapter.bookId)
            .eq('author_id', user.id)
            .single()

          if (book) {
            const { error } = await supabase
              .from('chapters')
              .upsert({
                id: chapter.id,
                book_id: chapter.bookId,
                title: chapter.title,
                content: chapter.content,
                chapter_number: chapter.chapterNumber,
                is_free: true
              })
            
            if (!error) updatedCount++
          }
        }
      } catch (e) {
        console.error('Error saving chapters:', e)
      }
    }

    // Обрабатываем покупки
    if (data.bookplatform_purchases) {
      try {
        const purchases = JSON.parse(data.bookplatform_purchases)
        for (const purchase of purchases) {
          if (purchase.userId === user.id) {
            const { error } = await supabase
              .from('purchases')
              .upsert({
                id: purchase.id,
                user_id: purchase.userId,
                book_id: purchase.bookId,
                paid: purchase.paid
              })
            
            if (!error) updatedCount++
          }
        }
      } catch (e) {
        console.error('Error saving purchases:', e)
      }
    }

    // Обрабатываем избранное
    if (data.bookplatform_favorites) {
      try {
        const favorites = JSON.parse(data.bookplatform_favorites)
        for (const favorite of favorites) {
          if (favorite.userId === user.id) {
            const { error } = await supabase
              .from('favorites')
              .upsert({
                id: favorite.id,
                user_id: favorite.userId,
                book_id: favorite.bookId
              })
            
            if (!error) updatedCount++
          }
        }
      } catch (e) {
        console.error('Error saving favorites:', e)
      }
    }

    // Обрабатываем прогресс чтения
    if (data.bookplatform_reading_progress) {
      try {
        const progress = JSON.parse(data.bookplatform_reading_progress)
        for (const prog of progress) {
          if (prog.userId === user.id) {
            const { error } = await supabase
              .from('reading_progress')
              .upsert({
                id: prog.id,
                user_id: prog.userId,
                book_id: prog.bookId,
                current_position: prog.currentChapter,
                total_chapters: prog.totalChapters,
                progress_percentage: prog.progress || 0
              })
            
            if (!error) updatedCount++
          }
        }
      } catch (e) {
        console.error('Error saving reading progress:', e)
      }
    }

    console.log('✅ Data saved successfully, updated:', updatedCount, 'records')

    return new Response(JSON.stringify({ 
      success: true, 
      message: updatedCount > 0 ? `Сохранено ${updatedCount} записей` : 'Нет изменений для сохранения'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('❌ Sync save error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Ошибка сохранения: ' + error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})