import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileUrl, type } = await req.json()
    
    // Recuperar claves de Sightengine
    const apiUser = Deno.env.get('SIGHTENGINE_USER')
    const apiSecret = Deno.env.get('SIGHTENGINE_SECRET')

    if (!apiUser || !apiSecret) {
      throw new Error('Faltan las credenciales de Sightengine')
    }

    // Endpoint de Sightengine para detectar IA (modelo 'genai')
    // Documentación: https://sightengine.com/docs/reference?python#check-image
    const endpoint = `https://api.sightengine.com/1.0/check.json?models=genai&api_user=${apiUser}&api_secret=${apiSecret}&url=${fileUrl}`

    console.log(`Analizando con Sightengine: ${fileUrl}`)

    const response = await fetch(endpoint)
    const data = await response.json()

    // Mapear la respuesta de Sightengine a un formato simple para tu frontend
    // Sightengine devuelve: type.ai_generated (score de 0 a 1)
    
    let scoreIA = 0
    if (data.type && data.type.ai_generated) {
      scoreIA = data.type.ai_generated
    }

    // Creamos una respuesta unificada
    const result = {
      provider: 'sightengine',
      score: scoreIA,
      raw: data
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})