
import type { APIRoute } from 'astro'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'

let apiKey = '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'

export const post: APIRoute = async (context) => {
  const body = await context.request.json()
  const messages = body.messages
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  if (!messages) {
    return new Response('No input text')
  }
  let apiKey_index = 0
  for (let i = 0; i < messages.length; i++) {
    const content_ = messages[i].content
    if (content_.startsWith('apikey=')) {
      apiKey = content_.split('=')[1]
      apiKey_index = i
    }
  }
  const newmessage = (messages as string[]).slice(apiKey_index)

  const completion = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: newmessage,
      temperature: 0.6,
      stream: true,
    }),
  })

  const stream = new ReadableStream({
    async start(controller) {
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data
          if (data === '[DONE]') {
            controller.close()
            return
          }
          try {
            const json = JSON.parse(data)
            const text = json.choices[0].delta?.content            
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }

      const parser = createParser(streamParser)
      for await (const chunk of completion.body as any) {
        const chunkd = decoder.decode(chunk)
        try {
          const error = JSON.parse(chunkd).error
          if (error) {
            console.error('err:', error)
            const queue = encoder.encode(error.message)
            controller.enqueue(queue)
            controller.enqueue('\nto continue, type in "apikey=YOUR_API_KEY" ')
            controller.close()
          }
        }catch (e) {
          
        }
        parser.feed(decoder.decode(chunk))
      }
    },
  })

  return new Response(stream)
}