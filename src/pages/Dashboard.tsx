import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Download, LogOut, Plus, Eye, BarChart3, Crown, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QRCode from 'qrcode';

interface ShortenedUrl {
  id: string;
  original_url: string;
  custom_alias: string | null;
  short_code: string;
  click_count: number;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut, loading: authLoading, subscribed, subscriptionTier } = useAuth();
  const { checkUrlLimit, isFeatureAllowed, getRemainingUrls } = useSubscriptionLimits();
  const { toast } = useToast();
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUrl, setEditingUrl] = useState<ShortenedUrl | null>(null);
  const [bulkUrls, setBulkUrls] = useState('');
  const [processingBulk, setProcessingBulk] = useState(false);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const { data, error } = await supabase
        .from('shortened_urls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUrls(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch URLs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const createShortUrl = async (originalUrl: string, customAlias?: string) => {
    // Check if user has reached the limit using the hook
    if (!checkUrlLimit(urls.length)) {
      throw new Error('Limite de links atingido. Faça upgrade para Premium.');
    }
    
    const shortCode = customAlias || generateShortCode();
    
    const { data, error } = await supabase
      .from('shortened_urls')
      .insert({
        user_id: user.id,
        original_url: originalUrl,
        custom_alias: customAlias,
        short_code: shortCode,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Custom alias already exists');
      }
      throw error;
    }

    return data;
  };

  const handleBulkShorten = async () => {
    if (!bulkUrls.trim()) return;

    // Check if bulk shortening is allowed
    if (!isFeatureAllowed('bulk_shorten')) {
      toast({
        title: "Recurso Premium",
        description: "Encurtamento em massa está disponível apenas para usuários Premium.",
        variant: "destructive",
      });
      return;
    }

    setProcessingBulk(true);
    const urlList = bulkUrls.split('\n').filter(url => url.trim());
    const results = [];

    for (const url of urlList) {
      try {
        const shortened = await createShortUrl(url.trim());
        results.push(shortened);
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Failed to shorten ${url}: ${error.message}`,
          variant: "destructive",
        });
      }
    }

    if (results.length > 0) {
      toast({
        title: "Success",
        description: `Successfully shortened ${results.length} URLs`,
      });
      setBulkUrls('');
      fetchUrls();
    }

    setProcessingBulk(false);
  };

  const handleEditUrl = async (urlData: ShortenedUrl, newAlias: string) => {
    try {
      const { error } = await supabase
        .from('shortened_urls')
        .update({ 
          custom_alias: newAlias || null,
          short_code: newAlias || urlData.short_code 
        })
        .eq('id', urlData.id);

      if (error) {
        if (error.code === '23505') {
          throw new Error('Custom alias already exists');
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "URL updated successfully",
      });
      fetchUrls();
      setEditingUrl(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUrl = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shortened_urls')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "URL deleted successfully",
      });
      fetchUrls();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete URL",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = async (shortUrl: string, alias: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
        width: 300,
        margin: 2,
      });

      const link = document.createElement('a');
      link.download = `qr-${alias || 'code'}.png`;
      link.href = qrCodeDataUrl;
      link.click();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const downloadBulkQRCodes = async () => {
    if (!subscribed) {
      toast({
        title: "Premium Feature",
        description: "Bulk QR code export is available for Premium users only.",
        variant: "destructive",
      });
      return;
    }

    if (urls.length === 0) {
      toast({
        title: "No URLs",
        description: "You don't have any URLs to export QR codes for.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate all QR codes
      for (const url of urls) {
        await downloadQRCode(
          `https://short.ly/${url.short_code}`,
          url.custom_alias || url.short_code
        );
        // Small delay to prevent browser from blocking downloads
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      toast({
        title: "Success",
        description: `Downloaded ${urls.length} QR codes`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR codes",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Manage your shortened URLs</p>
            </div>
            {subscribed && (
              <Badge variant="default" className="bg-primary">
                <Crown className="w-3 h-3 mr-1" />
                {subscriptionTier}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="default">
              <Link to="/">
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Link
              </Link>
            </Button>
            {!subscribed && (
              <Button asChild variant="outline">
                <Link to="/subscription">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Link>
              </Button>
            )}
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Metrics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Links</p>
                  <p className="text-2xl font-bold">{urls.length}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={!subscribed ? "relative" : ""}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">{urls.reduce((sum, url) => sum + url.click_count, 0)}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
              </div>
              {!subscribed && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-1">
                    <Crown className="w-6 h-6 text-primary mx-auto" />
                    <p className="text-sm font-medium text-primary">Premium</p>
                    <p className="text-xs text-muted-foreground">Analytics detalhados</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={!subscribed ? "relative" : ""}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Clicks/Link</p>
                  <p className="text-2xl font-bold">
                    {urls.length > 0 ? (urls.reduce((sum, url) => sum + url.click_count, 0) / urls.length).toFixed(1) : '0'}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
              </div>
              {!subscribed && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-1">
                    <Crown className="w-6 h-6 text-primary mx-auto" />
                    <p className="text-sm font-medium text-primary">Premium</p>
                    <p className="text-xs text-muted-foreground">Analytics detalhados</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Premium Features Alert */}
        {!subscribed && (
          <Alert className={`mb-6 ${urls.length >= 45 ? 'border-orange-200 bg-orange-50' : ''}`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {urls.length >= 50 ? (
                <>
                  Você atingiu o limite gratuito de 50 URLs. 
                  <Link to="/subscription" className="underline ml-1">
                    Faça upgrade para Premium
                  </Link> para criar links ilimitados e desbloquear recursos avançados.
                </>
              ) : (
                <>
                  Você pode criar mais {getRemainingUrls(urls.length)} links no plano gratuito.
                  <Link to="/subscription" className="underline ml-1">
                    Upgrade para Premium
                  </Link> para links ilimitados e recursos avançados.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="urls" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="urls">My URLs</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Shorten</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="urls" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Shortened URLs</CardTitle>
                <CardDescription>
                  You have {urls.length} shortened URLs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {urls.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <p className="text-muted-foreground">
                      Nenhuma URL ainda. Comece criando seu primeiro link encurtado!
                    </p>
                    <Button asChild size="lg">
                      <Link to="/">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Link
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Short URL</TableHead>
                        <TableHead>Original URL</TableHead>
                        <TableHead>Clicks</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {urls.map((url) => (
                        <TableRow key={url.id}>
                          <TableCell>
                            <a
                              href={`https://short.ly/${url.short_code}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              short.ly/{url.short_code}
                            </a>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {url.original_url}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {url.click_count}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(url.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit URL</DialogTitle>
                                    <DialogDescription>
                                      Update the custom alias for this URL
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      const formData = new FormData(e.currentTarget);
                                      const newAlias = formData.get('alias') as string;
                                      handleEditUrl(url, newAlias);
                                    }}
                                    className="space-y-4"
                                  >
                                    <div className="space-y-2">
                                      <Label htmlFor="alias">Custom Alias</Label>
                                      <Input
                                        id="alias"
                                        name="alias"
                                        defaultValue={url.custom_alias || ''}
                                        placeholder="Enter custom alias"
                                      />
                                    </div>
                                    <Button type="submit" className="w-full">
                                      Update
                                    </Button>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              
                              {isFeatureAllowed('analytics') ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                >
                                  <Link to={`/analytics/${url.short_code}`}>
                                    <BarChart3 className="w-4 h-4" />
                                  </Link>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toast({
                                    title: "Recurso Premium",
                                    description: "Analytics detalhados estão disponíveis apenas para usuários Premium.",
                                    variant: "destructive",
                                  })}
                                >
                                  <BarChart3 className="w-4 h-4" />
                                </Button>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadQRCode(
                                  `https://short.ly/${url.short_code}`,
                                  url.custom_alias || url.short_code
                                )}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUrl(url.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            {!subscribed ? (
              <Card>
                <CardHeader>
                  <div className="text-center space-y-2">
                    <Crown className="w-12 h-12 text-primary mx-auto" />
                    <CardTitle>Encurtamento em Massa - Premium</CardTitle>
                    <CardDescription>
                      Este recurso está disponível apenas para usuários Premium
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/30">
                    <div className="text-center space-y-4">
                      <h3 className="text-lg font-semibold">Recursos Premium Inclusos:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span>Encurtamento em massa</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span>Export de QR codes em massa</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span>Analytics detalhados</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span>Links ilimitados</span>
                        </div>
                      </div>
                      <Button asChild size="lg" className="mt-4">
                        <Link to="/subscription">
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Premium
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Bulk URL Shortening</CardTitle>
                      <CardDescription>
                        Paste multiple URLs (one per line) to shorten them all at once
                      </CardDescription>
                    </div>
                    <Button
                      onClick={downloadBulkQRCodes}
                      disabled={urls.length === 0}
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export All QR Codes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-urls">URLs to Shorten</Label>
                    <Textarea
                      id="bulk-urls"
                      value={bulkUrls}
                      onChange={(e) => setBulkUrls(e.target.value)}
                      placeholder="https://example.com&#10;https://another-site.com&#10;https://third-site.com"
                      rows={10}
                    />
                  </div>
                  <Button
                    onClick={handleBulkShorten}
                    disabled={!bulkUrls.trim() || processingBulk}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {processingBulk ? "Processing..." : "Shorten All URLs"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Subscription Management
                </CardTitle>
                <CardDescription>
                  Manage your premium subscription and access advanced features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {subscribed ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <Badge variant="default" className="bg-primary">
                            {subscriptionTier}
                          </Badge>
                          Active Subscription
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Unlimited URLs, advanced analytics, and premium features
                        </p>
                      </div>
                      <Button asChild>
                        <Link to="/subscription">
                          <Crown className="w-4 h-4 mr-2" />
                          Manage Subscription
                        </Link>
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Current Usage</h4>
                        <p className="text-2xl font-bold">{urls.length}</p>
                        <p className="text-sm text-muted-foreground">URLs Created</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Total Clicks</h4>
                        <p className="text-2xl font-bold">{urls.reduce((sum, url) => sum + url.click_count, 0)}</p>
                        <p className="text-sm text-muted-foreground">Across All URLs</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Upgrade to Premium</h3>
                      <p className="text-muted-foreground mb-4">
                        Unlock unlimited URLs, advanced analytics, branded links, and bulk QR exports
                      </p>
                      <div className="text-sm text-muted-foreground mb-4">
                        Free Plan: {urls.length}/50 URLs used
                      </div>
                      <Button asChild size="lg">
                        <Link to="/subscription">
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Premium - $9.90/month
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;