import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClickData {
  shortCode: string;
  userAgent: string;
  referrer?: string;
  ipAddress?: string;
}

// Parse user agent to extract device info
function parseUserAgent(userAgent: string) {
  const deviceType = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 
                    /Tablet|iPad/.test(userAgent) ? 'tablet' : 'desktop';
  
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return { deviceType, browser, os };
}

// Get country from IP address using a free service
async function getLocationFromIP(ip: string) {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`);
    const data = await response.json();
    return {
      country: data.country || 'Unknown',
      city: data.city || 'Unknown'
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return { country: 'Unknown', city: 'Unknown' };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const { shortCode, userAgent, referrer, ipAddress }: ClickData = await req.json();

      // Get the original URL
      const { data: urlData, error: urlError } = await supabase
        .from('shortened_urls')
        .select('original_url')
        .eq('short_code', shortCode)
        .single();

      if (urlError || !urlData) {
        return new Response(
          JSON.stringify({ error: 'Short URL not found' }),
          { 
            status: 404, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      // Parse user agent and get location
      const { deviceType, browser, os } = parseUserAgent(userAgent);
      const { country, city } = await getLocationFromIP(ipAddress || '');

      // Store analytics data
      const { error: analyticsError } = await supabase
        .from('link_analytics')
        .insert({
          short_code: shortCode,
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer: referrer || null,
          country,
          city,
          device_type: deviceType,
          browser,
          os,
        });

      if (analyticsError) {
        console.error('Error storing analytics:', analyticsError);
      }

      return new Response(
        JSON.stringify({ 
          originalUrl: urlData.original_url,
          success: true 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  } catch (error: any) {
    console.error('Error in track-click function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);