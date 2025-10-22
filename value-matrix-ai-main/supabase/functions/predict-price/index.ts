import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'manual') {
      systemPrompt = `You are a house price prediction AI for Indian real estate. You predict prices in Indian Rupees based on property features using regression analysis principles. Consider location value, size, amenities, and market trends. Be realistic and provide detailed reasoning.`;
      
      userPrompt = `Predict the house price in Rupees for the following property:
- Bedrooms: ${data.bedrooms}
- Floors: ${data.floors}
- Area: ${data.area_sqft} sq ft
- Location: ${data.location}
- Amenities: ${data.amenities?.join(', ') || 'None specified'}

Provide:
1. Predicted price in Rupees (as a number)
2. Brief explanation of key price factors
3. Price range (min-max)

Format your response as JSON with keys: predicted_price (number), explanation (string), price_range (object with min and max).`;

    } else if (type === 'image') {
      systemPrompt = `You are a house price prediction AI analyzing property images. Assess the ambiance, quality, location type, architectural style, and condition to predict the price in Indian Rupees. Consider visible amenities, finishes, and overall appeal.`;
      
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this house image and predict its price in Indian Rupees. Provide:
1. Predicted price in Rupees (as a number)
2. Analysis of visible features affecting price
3. Price range (min-max)

Format your response as JSON with keys: predicted_price (number), explanation (string), price_range (object with min and max).`
            },
            {
              type: 'image_url',
              image_url: { url: data.image_url }
            }
          ]
        }
      ];

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages,
          response_format: { type: 'json_object' },
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('AI API error:', result);
        throw new Error(result.error?.message || 'AI prediction failed');
      }

      const prediction = JSON.parse(result.choices[0].message.content);

      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (type === 'voice') {
      systemPrompt = `You are a house price prediction AI. A user has described a property verbally. Extract relevant details and predict the price in Indian Rupees. Handle multilingual descriptions and informal language. Use regression analysis principles.`;
      
      userPrompt = `User's voice description: "${data.transcript}"

Based on this description, predict the house price in Indian Rupees. Provide:
1. Predicted price in Rupees (as a number)
2. Key features extracted from description
3. Price range (min-max)

Format your response as JSON with keys: predicted_price (number), explanation (string), price_range (object with min and max).`;
    }

    // For manual and voice predictions
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('AI API error:', result);
      throw new Error(result.error?.message || 'AI prediction failed');
    }

    const prediction = JSON.parse(result.choices[0].message.content);

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in predict-price function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
