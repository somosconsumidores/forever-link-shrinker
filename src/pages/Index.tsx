import { UrlShortener } from "@/components/UrlShortener";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogIn, LayoutDashboard } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/hooks/useLanguage";

const Index = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Debug básico para verificar se JavaScript está funcionando
  console.log('=== INDEX COMPONENT RENDERIZADO ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('User object existe?', !!user);
  console.log('User email:', user?.email);
  console.log('User ID:', user?.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <img src="/lovable-uploads/ffe1df88-96db-42c1-8d8f-8522631e22bb.png" alt="Minify-URL.com" className="h-8" />
          <div className="flex items-center space-x-2">
            <LanguageSelector />
            {user ? (
              <Button asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {t('dashboard')}
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/auth">
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('signIn')}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* URL Shortener */}
      <UrlShortener />
    </div>
  );
};

export default Index;
