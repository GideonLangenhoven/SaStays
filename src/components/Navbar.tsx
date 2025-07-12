import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import logoSA from "./LOGOSA.png";
import salogoImg from "./SALOGO.png";
import { LogOut, LayoutDashboard, UserCircle, Inbox } from "lucide-react";

export default function Navbar() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(window.scrollY);

  const navLinks = [
    { name: t.nav.home, path: "/" },
    { name: t.nav.apartments, path: "/apartments" },
    { name: t.nav.amenities, path: "/amenities" },
    { name: t.nav.gallery, path: "/gallery" },
    { name: t.nav.contact, path: "/contact" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (mobileMenuOpen) return;
      const currentScrollY = window.scrollY;
      if (currentScrollY < 100) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY.current) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };
  
  const headerClass = cn(
    "fixed top-0 left-0 right-0 z-50 py-2 shadow-md transition-all duration-300 bg-white/80 dark:bg-card/80 backdrop-blur-sm",
    showNavbar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
  );

  return (
    <header className={headerClass}>
      <nav className="container flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center justify-center">
            <img src={logoSA} alt="SA Logo" className="h-10 w-auto" style={{ maxHeight: '40px' }} />
            <img src={salogoImg} alt="SALOGO" className="h-7 w-auto ml-2" style={{ maxHeight: '28px' }} />
          </Link>
          {!isMobile && <LanguageSelector />}
        </div>

        {!isMobile && (
          <ul className="flex items-center space-x-6">
            {navLinks.map(link => (
              <li key={link.name}>
                <Link to={link.path} className="font-medium text-sm transition-colors hover:text-primary">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        
        <div className="flex items-center space-x-2">
            {!isMobile && (
              <>
                <ThemeToggle />
                {user ? (
                    <div className="flex items-center gap-2">
                        {(user.role === 'owner' || user.role === 'co-host') && (
                            <>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/owner-dashboard')}>
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/owner-inbox')}>
                                    <Inbox className="mr-2 h-4 w-4" />
                                    Inbox
                                </Button>
                            </>
                        )}
                        <span className="text-sm font-medium">Hi, {user.name}</span>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4"/>
                            Logout
                        </Button>
                    </div>
                ) : (
                    <Button asChild size="sm">
                        <Link to="/login">Login / Register</Link>
                    </Button>
                )}
              </>
            )}
            {isMobile && <ThemeToggle />}
            {isMobile && (
                <button
                    aria-label="Toggle menu"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 -mr-2"
                >
                    <UserCircle />
                </button>
            )}
        </div>
      </nav>

      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity",
            mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className={cn(
              "fixed top-0 right-0 h-full w-full max-w-xs bg-card shadow-lg p-6 transition-transform duration-300 ease-in-out",
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-semibold">Menu</h2>
                <LanguageSelector />
            </div>
            <ul className="flex flex-col gap-4">
              {navLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="block text-base font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t my-6"></div>
            {user ? (
                <div className="space-y-4">
                    <p className="font-semibold">Welcome, {user.name}</p>
                     {(user.role === 'owner' || user.role === 'co-host') && (
                        <>
                            <Button variant="outline" className="w-full justify-start" onClick={() => {navigate('/owner-dashboard'); setMobileMenuOpen(false);}}>
                               <LayoutDashboard className="mr-2 h-4 w-4" />
                               Dashboard
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => {navigate('/owner-inbox'); setMobileMenuOpen(false);}}>
                               <Inbox className="mr-2 h-4 w-4" />
                               Inbox
                            </Button>
                        </>
                    )}
                    <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            ) : (
                <Button asChild className="w-full">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login / Register</Link>
                </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}