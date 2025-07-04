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

    const { telegram_id } = await req.json()
    
    if (!telegram_id) {
      return new Response(JSON.stringify({ success: false, message: 'Telegram ID не найден' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('🔄 Loading data for telegram_id:', telegram_id)

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

    // Получаем все данные пользователя
    const [
      { data: books },
      { data: chapters },
      { data: purchases },
      { data: favorites },
      { data: progress }
    ] = await Promise.all([
      supabase.from('books').select('*').eq('author_id', user.id),
      supabase.from('chapters').select('*').in('book_id', 
        (await supabase.from('books').select('id').eq('author_id', user.id)).data?.map(b => b.id) || []
      ),
      supabase.from('purchases').select('*').eq('user_id', user.id),
      supabase.from('favorites').select('*').eq('user_id', user.id),
      supabase.from('reading_progress').select('*').eq('user_id', user.id)
    ])

    // Формируем данные в формате localStorage
    const data = {
      'bookplatform_current_user': JSON.stringify({
        id: user.id,
        telegram_id: user.telegram_id,
        email: user.email,
        name: user.name || user.first_name,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        createdAt: user.created_at
      }),
      'bookplatform_users': JSON.stringify([{
        id: user.id,
        telegram_id: user.telegram_id,
        email: user.email,
        name: user.name || user.first_name,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        createdAt: user.created_at
      }]),
      'bookplatform_books': JSON.stringify(books?.map(book => ({
        id: book.id,
        title: book.title,
        description: book.description,
        genre: book.genre,
        status: book.status,
        coverImage: book.cover_image || book.cover_url,
        authorId: book.author_id,
        createdAt: book.created_at,
        updatedAt: book.updated_at,
        views: book.stats?.views || 0,
        isFavorite: book.is_favorite,
        source: book.source,
        format: book.format,
        price: book.price,
        is_public: book.is_public
      })) || []),
      'bookplatform_chapters': JSON.stringify(chapters?.map(chapter => ({
        id: chapter.id,
        bookId: chapter.book_id,
        title: chapter.title,
        content: chapter.content,
        chapterNumber: chapter.chapter_number,
        createdAt: chapter.created_at,
        updatedAt: chapter.updated_at
      })) || []),
      'bookplatform_purchases': JSON.stringify(purchases?.map(purchase => ({
        id: purchase.id,
        userId: purchase.user_id,
        bookId: purchase.book_id,
        purchaseDate: purchase.purchase_date,
        paid: purchase.paid
      })) || []),
      'bookplatform_favorites': JSON.stringify(favorites?.map(fav => ({
        id: fav.id,
        userId: fav.user_id,
        bookId: fav.book_id,
        addedAt: fav.added_at
      })) || []),
      'bookplatform_reading_progress': JSON.stringify(progress?.map(prog => ({
        id: prog.id,
        userId: prog.user_id,
        bookId: prog.book_id,
        currentChapter: prog.current_position,
        totalChapters: prog.total_chapters,
        lastReadAt: prog.last_read_at,
        progress: prog.progress_percentage
      })) || [])
    }

    console.log('✅ Data loaded successfully for user:', user.id)

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Данные загружены успешно',
      data 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('❌ Sync load error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Ошибка загрузки: ' + error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})