import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, style, instruction, selectedText } = await req.json();
    console.log('Received request:', { text, style, instruction, selectedText });

    let systemPrompt = "You are a helpful assistant that refines and improves text while maintaining its core meaning.";
    let userPrompt = "";

    if (style) {
      switch (style) {
        case "formal":
          userPrompt = `Transform the following text into a formal style suitable for business communication:\n\nText: "${text}"`;
          break;
        case "casual":
          userPrompt = `Transform the following text into a casual, friendly style:\n\nText: "${text}"`;
          break;
        case "neutral":
          userPrompt = `Correct errors and improve phrasing while maintaining a neutral tone:\n\nText: "${text}"`;
          break;
        default:
          userPrompt = `Review the text and only correct obvious errors while maintaining the exact same meaning and style:\n\nText: "${text}"`;
      }
    } else if (instruction && selectedText) {
      userPrompt = `Given the text: "${text}"\n\nApply the following instruction: "${instruction}"\nTo this selected portion: "${selectedText}"`;
    } else if (instruction) {
      userPrompt = `Given the text: "${text}"\n\nApply the following instruction: "${instruction}"`;
    }

    console.log('Sending request to OpenAI with prompt:', userPrompt);

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${openAIResponse.status} ${errorData}`);
    }

    const data = await openAIResponse.json();
    console.log('Received response from OpenAI:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI');
    }

    const refinedText = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ text: refinedText }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in refine-text function:', error);
    return new Response(
      JSON.stringify({ 
        error: `Error processing text: ${error.message}`,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});