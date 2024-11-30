import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from 'https://esm.sh/replicate@0.25.1';

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
    const { audioDataUri } = await req.json();
    
    const replicate = new Replicate({
      auth: Deno.env.get('REPLICATE_API_KEY'),
    });

    console.log('Starting Whisper transcription...');
    
    // Create a temporary URL for the audio data
    const audioUrl = `data:audio/mp3;base64,${audioDataUri}`;
    
    const output = await replicate.run(
      "openai/whisper:3c08daf437fe359eb158a5123c395673f0a113dd8b4bd01ddce5936850e2a981",
      {
        input: {
          audio: audioUrl,
          model: "large-v3",
          language: "auto",
          translate: false,
          temperature: 0,
          transcription: "plain text",
          suppress_tokens: "-1",
          logprob_threshold: -1,
          no_speech_threshold: 0.6,
          condition_on_previous_text: true,
          compression_ratio_threshold: 2.4,
          temperature_increment_on_fallback: 0.2
        }
      }
    );

    console.log('Transcription completed:', output);

    if (!output || !output.transcription) {
      throw new Error('No transcription received from Whisper');
    }

    // Trim the transcription before returning
    const trimmedTranscription = output.transcription.trim();
    console.log('Trimmed transcription:', trimmedTranscription);

    return new Response(JSON.stringify({ transcription: trimmedTranscription }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in transcribe function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});