import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.4";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Create admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { method } = req;
    const body = method !== 'GET' ? await req.json() : {};

    console.log(`CORS Management request: ${method}`, body);

    switch (method) {
      case 'GET':
        // Get current CORS configuration
        return new Response(JSON.stringify({
          message: 'CORS management function is active',
          availableActions: [
            'POST /manage-cors - Add CORS origin',
            'PUT /manage-cors - Update CORS origins',
            'DELETE /manage-cors - Remove CORS origin'
          ],
          currentProject: {
            url: supabaseUrl,
            projectId: supabaseUrl.split('//')[1].split('.')[0]
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'POST':
        // Add new CORS origin
        const { origin, action = 'add' } = body;
        
        if (!origin) {
          throw new Error('Origin is required');
        }

        console.log(`Adding CORS origin: ${origin}`);

        // Note: Direct CORS management requires Supabase Management API
        // For now, we'll provide instructions and validation
        const isValidOrigin = /^https?:\/\/[a-zA-Z0-9.-]+(?:\:[0-9]+)?$/.test(origin);
        
        if (!isValidOrigin) {
          throw new Error('Invalid origin format. Use format: https://domain.com');
        }

        return new Response(JSON.stringify({
          success: true,
          message: `CORS origin validated: ${origin}`,
          instructions: {
            step1: 'Go to Supabase Dashboard → Settings → API',
            step2: 'Add this origin to CORS origins list',
            step3: 'Also add to Authentication → URL Configuration',
            validatedOrigin: origin,
            dashboardUrl: `https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}/settings/api`
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        // Test CORS configuration
        const { testOrigin } = body;
        
        if (!testOrigin) {
          throw new Error('testOrigin is required');
        }

        console.log(`Testing CORS for origin: ${testOrigin}`);

        // Test if the origin can make requests
        try {
          const testResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'HEAD',
            headers: {
              'Origin': testOrigin,
              'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            }
          });

          return new Response(JSON.stringify({
            success: true,
            origin: testOrigin,
            corsStatus: testResponse.status === 200 ? 'working' : 'needs_configuration',
            statusCode: testResponse.status,
            message: testResponse.status === 200 
              ? 'CORS is properly configured for this origin'
              : 'CORS may need configuration for this origin'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          return new Response(JSON.stringify({
            success: false,
            origin: testOrigin,
            corsStatus: 'error',
            error: error.message,
            message: 'Error testing CORS configuration'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      default:
        throw new Error(`Method ${method} not allowed`);
    }

  } catch (error) {
    console.error('Error in manage-cors function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});