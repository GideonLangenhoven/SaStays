import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import logoSA from "./LOGOSA.png";
import salogoImg from "./SALOGO.png";

export default function Navbar() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const navigate = useNavigate();
  const menuButtonRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
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

  // Scroll/hide logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Show navbar on hover at the top
  const handleMouseEnter = () => {
    if (!isMobile) setShowNavbar(true);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1000);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsOwner(!!localStorage.getItem('owner_jwt'));
  }, []);

  // Prevent background scroll when mobile menu is open
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

  const handleLogout = () => {
    localStorage.removeItem('owner_jwt');
    setIsOwner(false);
    navigate('/owner-login');
  };

  // Solid background when visible
  const headerClass = cn(
    "fixed top-0 left-0 right-0 z-50 py-4 shadow-md transition-all duration-300 bg-white dark:bg-card",
    showNavbar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
  );

  return <header
    className={headerClass}
    onMouseEnter={handleMouseEnter}
  >
    <nav className="container flex justify-between items-center">
      <div className="flex items-center space-x-4">
        {/* Logo and Brand with LanguageSelector next to it on desktop */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center justify-center">
            <img
              src={logoSA}
              alt="SA Logo"
              className={isDesktop ? "h-15 w-auto" : "h-10 w-auto"}
              style={isDesktop ? { maxHeight: '60px' } : { maxHeight: '40px' }}
            />
            <img
              src={salogoImg}
              alt="SALOGO"
              className={isDesktop ? "h-10 w-auto ml-2" : "h-7 w-auto ml-2"}
              style={isDesktop ? { maxHeight: '40px' } : { maxHeight: '28px' }}
            />
          </Link>
          {isDesktop && (
            <LanguageSelector />
          )}
        </div>
      </div>

      {/* Desktop Navigation (1000px and up only) */}
      {isDesktop && (
        <ul className="flex space-x-8">
          {navLinks.map(link => <li key={link.name} className="relative">
              <Link to={link.path} className="font-medium transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">
                {link.name}
              </Link>
            </li>)}
          {isOwner && (
            <li>
              <Link to="/owner-dashboard" className="font-medium text-primary">Dashboard</Link>
            </li>
          )}
        </ul>
      )}

      {/* Desktop right actions (1000px and up only) */}
      {isDesktop && (
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button asChild className="btn-primary">
            <Link to="/booking">{t.nav.bookNow}</Link>
          </Button>
          {isOwner && (
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          )}
        </div>
      )}

      {/* Mobile Navigation (below 1000px only) */}
      {!isDesktop && (
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {/* Floating burger menu button, always visible on mobile */}
          <button
            ref={menuButtonRef}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              "fixed top-4 right-4 z-[9999] flex items-center justify-center rounded-full bg-white/90 dark:bg-card/90 shadow-lg border border-border w-12 h-12 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary",
              mobileMenuOpen ? "ring-2 ring-primary" : ""
            )}
            style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
          >
            {mobileMenuOpen ? (
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x text-black dark:text-white"><line x1="20" y1="8" x2="8" y2="20"/><line x1="8" y1="8" x2="20" y2="20"/></svg>
            ) : (
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu text-black dark:text-white"><line x1="4" y1="8" x2="24" y2="8"/><line x1="4" y1="14" x2="24" y2="14"/><line x1="4" y1="20" x2="24" y2="20"/></svg>
            )}
          </button>
        </div>
      )}
    </nav>

    {/* Mobile Menu Overlay */}
    {!isDesktop && (
      <div className={cn(
        "fixed inset-0 z-[9998] flex items-center justify-center transition-opacity duration-300",
        mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        {/* Blurred, semi-transparent background */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl transition-all duration-300" />
        {/* Fullscreen menu content for mobile */}
        <div className={cn(
          "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 dark:bg-card/95 p-8 gap-8 border-t border-border w-full h-full max-w-full max-h-full overflow-y-auto rounded-none",
          "transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "scale-100" : "scale-95"
        )}>
          {/* LanguageSelector and ThemeToggle at the top of the burger menu (mobile only) */}
          <div className="flex justify-between items-center w-full mb-4 gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="rounded-full hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary">
              <span className="sr-only">Close menu</span>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x text-black dark:text-white"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </Button>
          </div>
          <ul className="flex flex-col items-center gap-6 w-full">
            {navLinks.map(link => <li key={link.name} className="w-full">
                <Link to={link.path} className="block text-xl font-bold text-center transition-colors hover:text-primary focus:text-primary focus:outline-none py-2" onClick={() => setMobileMenuOpen(false)}>
                  {link.name}
                </Link>
              </li>)}
            {isOwner && (
              <li className="w-full">
                <Link to="/owner-dashboard" className="block text-xl font-bold text-primary text-center py-2" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
          <div className="flex flex-col gap-2 w-full mt-4">
            <Button asChild className="w-full btn-primary text-lg py-3">
              <Link to="/booking" onClick={() => setMobileMenuOpen(false)}>
                {t.nav.bookNow}
              </Link>
            </Button>
            {isOwner && (
              <Button variant="outline" className="w-full mt-2 text-lg py-3" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    )}
  </header>;
}
