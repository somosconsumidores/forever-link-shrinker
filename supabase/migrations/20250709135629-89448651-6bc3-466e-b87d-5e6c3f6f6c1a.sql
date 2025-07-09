-- Create analytics table for tracking clicks
CREATE TABLE public.link_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code TEXT NOT NULL REFERENCES public.shortened_urls(short_code) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.link_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for analytics - users can view analytics for their own URLs
CREATE POLICY "Users can view analytics for their own URLs" 
ON public.link_analytics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shortened_urls 
    WHERE shortened_urls.short_code = link_analytics.short_code 
    AND shortened_urls.user_id = auth.uid()
  )
);

-- Create function to update click count when analytics record is created
CREATE OR REPLACE FUNCTION public.update_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.shortened_urls 
  SET click_count = click_count + 1 
  WHERE short_code = NEW.short_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update click count
CREATE TRIGGER update_click_count_trigger
  AFTER INSERT ON public.link_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_click_count();

-- Create indexes for better performance
CREATE INDEX idx_link_analytics_short_code ON public.link_analytics(short_code);
CREATE INDEX idx_link_analytics_clicked_at ON public.link_analytics(clicked_at);
CREATE INDEX idx_link_analytics_country ON public.link_analytics(country);
CREATE INDEX idx_link_analytics_device_type ON public.link_analytics(device_type);

-- Create function to get analytics summary
CREATE OR REPLACE FUNCTION public.get_link_analytics_summary(link_short_code TEXT)
RETURNS TABLE (
  total_clicks BIGINT,
  today_clicks BIGINT,
  this_week_clicks BIGINT,
  this_month_clicks BIGINT,
  top_countries JSON,
  top_devices JSON,
  top_browsers JSON,
  hourly_clicks JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.link_analytics WHERE short_code = link_short_code) as total_clicks,
    (SELECT COUNT(*) FROM public.link_analytics 
     WHERE short_code = link_short_code 
     AND clicked_at >= CURRENT_DATE) as today_clicks,
    (SELECT COUNT(*) FROM public.link_analytics 
     WHERE short_code = link_short_code 
     AND clicked_at >= DATE_TRUNC('week', CURRENT_DATE)) as this_week_clicks,
    (SELECT COUNT(*) FROM public.link_analytics 
     WHERE short_code = link_short_code 
     AND clicked_at >= DATE_TRUNC('month', CURRENT_DATE)) as this_month_clicks,
    (SELECT JSON_AGG(JSON_BUILD_OBJECT('country', country, 'count', count))
     FROM (
       SELECT country, COUNT(*) as count
       FROM public.link_analytics 
       WHERE short_code = link_short_code AND country IS NOT NULL
       GROUP BY country 
       ORDER BY count DESC 
       LIMIT 10
     ) t) as top_countries,
    (SELECT JSON_AGG(JSON_BUILD_OBJECT('device', device_type, 'count', count))
     FROM (
       SELECT device_type, COUNT(*) as count
       FROM public.link_analytics 
       WHERE short_code = link_short_code AND device_type IS NOT NULL
       GROUP BY device_type 
       ORDER BY count DESC 
       LIMIT 10
     ) t) as top_devices,
    (SELECT JSON_AGG(JSON_BUILD_OBJECT('browser', browser, 'count', count))
     FROM (
       SELECT browser, COUNT(*) as count
       FROM public.link_analytics 
       WHERE short_code = link_short_code AND browser IS NOT NULL
       GROUP BY browser 
       ORDER BY count DESC 
       LIMIT 10
     ) t) as top_browsers,
    (SELECT JSON_AGG(JSON_BUILD_OBJECT('hour', hour, 'count', count))
     FROM (
       SELECT EXTRACT(HOUR FROM clicked_at) as hour, COUNT(*) as count
       FROM public.link_analytics 
       WHERE short_code = link_short_code 
       AND clicked_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY EXTRACT(HOUR FROM clicked_at)
       ORDER BY hour
     ) t) as hourly_clicks;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;