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

// Parse user agent to extract device info with input sanitization
function parseUserAgent(userAgent: string) {
  // Sanitize user agent input
  if (!userAgent || typeof userAgent !== 'string') {
    return { deviceType: 'Unknown', browser: 'Unknown', os: 'Unknown' };
  }
  
  // Limit user agent length to prevent large payloads
  const sanitizedUA = userAgent.substring(0, 500);
  
  const deviceType = /Mobile|Android|iPhone|iPad/.test(sanitizedUA) ? 'mobile' : 
                    /Tablet|iPad/.test(sanitizedUA) ? 'tablet' : 'desktop';
  
  let browser = 'Unknown';
  if (sanitizedUA.includes('Chrome')) browser = 'Chrome';
  else if (sanitizedUA.includes('Firefox')) browser = 'Firefox';
  else if (sanitizedUA.includes('Safari')) browser = 'Safari';
  else if (sanitizedUA.includes('Edge')) browser = 'Edge';
  else if (sanitizedUA.includes('Opera')) browser = 'Opera';
  
  let os = 'Unknown';
  if (sanitizedUA.includes('Windows')) os = 'Windows';
  else if (sanitizedUA.includes('Mac')) os = 'macOS';
  else if (sanitizedUA.includes('Linux')) os = 'Linux';
  else if (sanitizedUA.includes('Android')) os = 'Android';
  else if (sanitizedUA.includes('iOS')) os = 'iOS';
  
  return { 
    deviceType: deviceType.substring(0, 20), 
    browser: browser.substring(0, 20), 
    os: os.substring(0, 20) 
  };
}

// Get country from IP address using HTTPS service with validation
async function getLocationFromIP(ip: string) {
  try {
    // Validate IP address format
    if (!ip || typeof ip !== 'string') {
      return { country: 'Unknown', city: 'Unknown' };
    }
    
    // Basic IP validation (IPv4)
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) {
      console.warn('Invalid IP format:', ip);
      return { country: 'Unknown', city: 'Unknown' };
    }
    
    // Use HTTPS endpoint for security
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'Minify-URL-Service/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Sanitize response data
    return {
      country: (data.country_name || 'Unknown').substring(0, 100),
      city: (data.city || 'Unknown').substring(0, 100)
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
      const requestData = await req.json();
      
      // Validate and sanitize input data
      const shortCode = (requestData.shortCode || '').substring(0, 50);
      const userAgent = (requestData.userAgent || '').substring(0, 500);
      const referrer = requestData.referrer ? requestData.referrer.substring(0, 200) : null;
      const ipAddress = requestData.ipAddress ? requestData.ipAddress.substring(0, 45) : null;
      
      // Validate shortCode format
      if (!shortCode || !/^[a-zA-Z0-9-]+$/.test(shortCode)) {
        return new Response(
          JSON.stringify({ error: 'Invalid short code format' }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

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

      // Store analytics data with additional validation
      const { error: analyticsError } = await supabase
        .from('link_analytics')
        .insert({
          short_code: shortCode,
          ip_address: ipAddress,
          user_agent: userAgent.substring(0, 500), // Ensure truncation
          referrer: referrer,
          country: country.substring(0, 100),
          city: city.substring(0, 100),
          device_type: deviceType,
          browser: browser,
          os: os,
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
    
    // Don't expose internal error details to client
    const sanitizedError = error.message?.includes('duplicate') ? 'Duplicate request' : 'Internal server error';
    
    return new Response(
      JSON.stringify({ error: sanitizedError }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);