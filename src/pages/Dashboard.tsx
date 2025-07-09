import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
import { Pencil, Trash2, Download, LogOut, Plus, Eye, BarChart3 } from 'lucide-react';
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
  const { user, signOut, loading: authLoading } = useAuth();
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
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Manage your shortened URLs</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
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

          <Card>
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
            </CardContent>
          </Card>

          <Card>
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
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="urls" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="urls">My URLs</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Shorten</TabsTrigger>
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
                  <p className="text-center text-muted-foreground py-8">
                    No URLs yet. Start by shortening your first URL!
                  </p>
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
                              
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <Link to={`/analytics/${url.short_code}`}>
                                  <BarChart3 className="w-4 h-4" />
                                </Link>
                              </Button>
                              
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
            <Card>
              <CardHeader>
                <CardTitle>Bulk URL Shortening</CardTitle>
                <CardDescription>
                  Paste multiple URLs (one per line) to shorten them all at once
                </CardDescription>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;