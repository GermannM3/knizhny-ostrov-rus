import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LibgenBook {
  title: string;
  author: string;
  size: string;
  format: string;
  downloadLink: string;
  torrentLink?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    
    if (!query?.trim()) {
      return new Response(JSON.stringify({ error: 'Нет запроса для поиска' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('🔍 Поиск книг в Libgen:', query)
    
    const libgenUrl = `https://libgen.rs/search.php?req=${encodeURIComponent(query)}&res=10&sort=year&sortmode=DESC`
    
    const response = await fetch(libgenUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      console.error('❌ Ошибка запроса к Libgen:', response.status)
      throw new Error(`Libgen недоступен: ${response.status}`)
    }
    
    const html = await response.text()
    console.log('✅ HTML получен, длина:', html.length)
    
    // Парсим HTML для извлечения информации о книгах
    const books: LibgenBook[] = []
    
    // Ищем строки таблицы с книгами
    const tableRegex = /<tr[^>]*>.*?<\/tr>/gs
    const rows = html.match(tableRegex) || []
    
    console.log('📖 Найдено строк таблицы:', rows.length)
    
    for (let i = 1; i < rows.length && books.length < 10; i++) { // Пропускаем заголовок
      const row = rows[i]
      
      // Извлекаем данные из ячеек
      const titleMatch = row.match(/<a[^>]*href="\/book\/index\.php[^"]*"[^>]*>([^<]+)<\/a>/)
      const authorMatch = row.match(/<td[^>]*>([^<]*)<\/td>/)
      
      if (titleMatch) {
        const title = titleMatch[1].trim()
        
        // Ищем ссылки для скачивания
        const downloadMatch = row.match(/<a[^>]*href="([^"]*)"[^>]*>[^<]*(?:GET|Download|download)[^<]*<\/a>/i)
        const torrentMatch = row.match(/<a[^>]*href="([^"]*)"[^>]*>[^<]*torrent[^<]*<\/a>/i)
        
        // Извлекаем размер и формат
        const cells = row.match(/<td[^>]*>([^<]*)<\/td>/g) || []
        const size = cells[7]?.replace(/<\/?[^>]+(>|$)/g, '')?.trim() || ''
        const format = cells[8]?.replace(/<\/?[^>]+(>|$)/g, '')?.trim() || ''
        
        const downloadLink = downloadMatch ? 
          (downloadMatch[1].startsWith('http') ? downloadMatch[1] : `https://libgen.rs${downloadMatch[1]}`) : 
          `https://libgen.rs/book/index.php?md5=${encodeURIComponent(title)}`
        
        const torrentLink = torrentMatch ? 
          (torrentMatch[1].startsWith('http') ? torrentMatch[1] : `https://libgen.rs${torrentMatch[1]}`) : 
          undefined
        
        books.push({
          title,
          author: authorMatch?.[1]?.trim() || 'Неизвестный автор',
          size: size || 'Неизвестно',
          format: format || 'Неизвестно',
          downloadLink,
          torrentLink
        })
        
        console.log(`📚 Добавлена книга: ${title}`)
      }
    }
    
    console.log(`✅ Найдено книг: ${books.length}`)
    
    return new Response(JSON.stringify({ books }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('❌ Ошибка поиска книг:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Ошибка поиска книг',
      books: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})