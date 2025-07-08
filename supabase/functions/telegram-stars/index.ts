import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Если это webhook от Telegram, обрабатываем напрямую
    if (req.url.includes('/webhook')) {
      const update = await req.json()
      console.log('📲 Telegram webhook received:', JSON.stringify(update))
      
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      // Обрабатываем успешный платеж
      if (update.successful_payment) {
        const payment = update.successful_payment
        const payload = JSON.parse(payment.invoice_payload)
        const invoiceId = payload.invoice_id

        console.log(`💰 Payment successful for invoice ${invoiceId}`)

        // Обновляем статус инвойса
        const { error: updateError } = await supabaseClient
          .from('payment_invoices')
          .update({ status: 'paid' })
          .eq('id', invoiceId)

        if (updateError) {
          console.error('Failed to update invoice:', updateError)
          throw updateError
        }

        // Сохраняем информацию о платеже
        const { error: paymentError } = await supabaseClient
          .from('telegram_payments')
          .insert({
            invoice_id: invoiceId,
            payment_id: payment.telegram_payment_charge_id
          })

        if (paymentError) {
          console.error('Failed to save payment:', paymentError)
          throw paymentError
        }

        // Получаем информацию об инвойсе для создания ссылки на скачивание
        const { data: invoice } = await supabaseClient
          .from('payment_invoices')
          .select('*, torrent_books(*)')
          .eq('id', invoiceId)
          .single()

        if (invoice) {
          // Создаем запись о скачивании
          const { error: downloadError } = await supabaseClient
            .from('book_downloads')
            .insert({
              book_id: invoice.book_id,
              user_id: invoice.user_id,
              file_url: invoice.torrent_books.magnet_link
            })

          if (downloadError) {
            console.error('Failed to create download record:', downloadError)
          } else {
            console.log(`📥 Download access granted for book ${invoice.torrent_books.title}`)
          }
        }
      }

      return new Response('OK', { status: 200 })
    }

    const { action, ...data } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured')
    }

    console.log(`📟 Telegram Stars action: ${action}`)

    switch (action) {
      case 'create_invoice': {
        const { bookId, userId, starsAmount = 100 } = data
        
        // Получаем информацию о книге
        const { data: book, error: bookError } = await supabaseClient
          .from('torrent_books')
          .select('*')
          .eq('id', bookId)
          .single()

        if (bookError || !book) {
          throw new Error('Book not found')
        }

        // Создаем инвойс в базе данных
        const { data: invoice, error: invoiceError } = await supabaseClient
          .from('payment_invoices')
          .insert({
            user_id: userId,
            book_id: bookId,
            stars_amount: starsAmount,
            status: 'pending'
          })
          .select()
          .single()

        if (invoiceError) {
          throw new Error('Failed to create invoice')
        }

        // Создаем инвойс через Telegram Bot API
        const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: book.title,
            description: `Скачать книгу: ${book.title}`,
            payload: JSON.stringify({ invoice_id: invoice.id }),
            currency: 'XTR', // Telegram Stars
            prices: [{ label: book.title, amount: starsAmount }]
          })
        })

        const telegramData = await telegramResponse.json()
        
        if (!telegramData.ok) {
          throw new Error(`Telegram API error: ${telegramData.description}`)
        }

        console.log(`✅ Invoice created for book ${book.title}, amount: ${starsAmount} stars`)

        return new Response(JSON.stringify({
          success: true,
          invoice_id: invoice.id,
          invoice_link: telegramData.result,
          book: book
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'webhook': {
        // Обработка webhook от Telegram
        const update = data

        console.log('📲 Telegram webhook received:', JSON.stringify(update))

        // Обрабатываем успешный платеж
        if (update.successful_payment) {
          const payment = update.successful_payment
          const payload = JSON.parse(payment.invoice_payload)
          const invoiceId = payload.invoice_id

          console.log(`💰 Payment successful for invoice ${invoiceId}`)

          // Обновляем статус инвойса
          const { error: updateError } = await supabaseClient
            .from('payment_invoices')
            .update({ status: 'paid' })
            .eq('id', invoiceId)

          if (updateError) {
            console.error('Failed to update invoice:', updateError)
            throw updateError
          }

          // Сохраняем информацию о платеже
          const { error: paymentError } = await supabaseClient
            .from('telegram_payments')
            .insert({
              invoice_id: invoiceId,
              payment_id: payment.telegram_payment_charge_id
            })

          if (paymentError) {
            console.error('Failed to save payment:', paymentError)
            throw paymentError
          }

          // Получаем информацию об инвойсе для создания ссылки на скачивание
          const { data: invoice } = await supabaseClient
            .from('payment_invoices')
            .select('*, torrent_books(*)')
            .eq('id', invoiceId)
            .single()

          if (invoice) {
            // Создаем запись о скачивании
            const { error: downloadError } = await supabaseClient
              .from('book_downloads')
              .insert({
                book_id: invoice.book_id,
                user_id: invoice.user_id,
                file_url: invoice.torrent_books.magnet_link
              })

            if (downloadError) {
              console.error('Failed to create download record:', downloadError)
            } else {
              console.log(`📥 Download access granted for book ${invoice.torrent_books.title}`)
            }
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get_user_downloads': {
        const { userId } = data
        
        const { data: downloads, error } = await supabaseClient
          .from('book_downloads')
          .select('*, torrent_books(*)')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })

        if (error) {
          throw error
        }

        return new Response(JSON.stringify({
          success: true,
          downloads
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'setup_webhook': {
        // Настройка webhook для бота
        const webhookUrl = `https://hvzxsjoszgakugpstipe.supabase.co/functions/v1/telegram-stars/webhook`
        
        const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ['message', 'successful_payment', 'pre_checkout_query']
          })
        })

        const result = await response.json()
        console.log('🔗 Webhook setup result:', result)

        return new Response(JSON.stringify({
          success: result.ok,
          description: result.description,
          webhook_url: webhookUrl
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('❌ Error in telegram-stars function:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})