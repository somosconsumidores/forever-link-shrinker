import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Globe, Smartphone, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AnalyticsData {
  total_clicks: number;
  today_clicks: number;
  this_week_clicks: number;
  this_month_clicks: number;
  top_countries: Array<{ country: string; count: number }> | null;
  top_devices: Array<{ device: string; count: number }> | null;
  top_browsers: Array<{ browser: string; count: number }> | null;
  hourly_clicks: Array<{ hour: number; count: number }> | null;
}

interface UrlData {
  original_url: string;
  short_code: string;
  created_at: string;
  click_count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Analytics = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [urlData, setUrlData] = useState<UrlData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (id) {
      fetchAnalytics();
    }
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      // Get URL data
      const { data: urlData, error: urlError } = await supabase
        .from('shortened_urls')
        .select('*')
        .eq('short_code', id)
        .single();

      if (urlError) throw urlError;
      setUrlData(urlData);

      // Get analytics summary
      const { data: analyticsData, error: analyticsError } = await supabase
        .rpc('get_link_analytics_summary', { link_short_code: id });

      if (analyticsError) throw analyticsError;
      
      if (analyticsData && analyticsData.length > 0) {
        const data = analyticsData[0];
        // Parse JSON fields safely
        setAnalytics({
          ...data,
          top_countries: data.top_countries ? JSON.parse(data.top_countries as string) : null,
          top_devices: data.top_devices ? JSON.parse(data.top_devices as string) : null,
          top_browsers: data.top_browsers ? JSON.parse(data.top_browsers as string) : null,
          hourly_clicks: data.hourly_clicks ? JSON.parse(data.hourly_clicks as string) : null,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading analytics...</div>;
  }

  if (!urlData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">URL Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested short URL was not found or you don't have access to it.</p>
            <Button asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Detailed analytics for your shortened URL</p>
          </div>
        </div>

        {/* URL Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              URL Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Short URL</label>
                <p className="text-primary font-mono">{window.location.host}/{urlData.short_code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Original URL</label>
                <p className="text-sm truncate">{urlData.original_url}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{new Date(urlData.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Clicks</label>
                <p className="text-2xl font-bold text-primary">{urlData.click_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {analytics && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.today_clicks}</div>
                  <p className="text-xs text-muted-foreground">clicks today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.this_week_clicks}</div>
                  <p className="text-xs text-muted-foreground">clicks this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.this_month_clicks}</div>
                  <p className="text-xs text-muted-foreground">clicks this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">All Time</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.total_clicks}</div>
                  <p className="text-xs text-muted-foreground">total clicks</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Countries Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Countries</CardTitle>
                  <CardDescription>Click distribution by country</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.top_countries && analytics.top_countries.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.top_countries}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="country" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-300 flex items-center justify-center text-muted-foreground">
                      No data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Device Types Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Types</CardTitle>
                  <CardDescription>Click distribution by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.top_devices && analytics.top_devices.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.top_devices}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ device, percent }) => `${device} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analytics.top_devices.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-300 flex items-center justify-center text-muted-foreground">
                      No data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Browsers Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Browsers</CardTitle>
                  <CardDescription>Click distribution by browser</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.top_browsers && analytics.top_browsers.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.top_browsers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="browser" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-300 flex items-center justify-center text-muted-foreground">
                      No data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hourly Clicks Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Distribution</CardTitle>
                  <CardDescription>Clicks by hour of day (last 7 days)</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.hourly_clicks && analytics.hourly_clicks.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.hourly_clicks}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-300 flex items-center justify-center text-muted-foreground">
                      No data available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {!analytics && (
          <Card>
            <CardContent className="p-6 text-center">
              <Smartphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
              <p className="text-muted-foreground">
                Start sharing your shortened URL to see detailed analytics and insights.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;