import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { name: 'Library', path: '/library' },
    { name: 'Join Channel', path: '/mesh-network' },
    { name: 'Upload', path: '/creator' },
    { name: 'Login', path: '/auth' },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/40 backdrop-blur-xl border-b border-primary/20 shadow-cyber' 
            : 'bg-background/20 backdrop-blur-md'
        }`}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="container mx-auto px-5 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <img
                src="/images/mesh-tv-network-logo.png"
                alt="Mesh TV Network"
                className="w-28 md:w-40 max-h-16 object-contain transition-all duration-300 group-hover:brightness-120 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-foreground/80 hover:text-primary transition-all duration-300 relative group font-medium"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={toggleMenu}
      >
        {/* Mobile Menu Content */}
        <div 
          className={`fixed right-0 top-0 h-full w-80 max-w-full bg-card/90 backdrop-blur-xl border-l border-primary/20 shadow-2xl transform transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary/20">
            <h3 className="text-lg font-bold bg-gradient-cyber bg-clip-text text-transparent">
              Navigation
            </h3>
            <button
              onClick={toggleMenu}
              className="p-2 text-foreground hover:text-primary transition-colors duration-300"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile Menu Links */}
          <nav className="p-6 space-y-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={toggleMenu}
                className={`block p-4 text-lg font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg border border-transparent hover:border-primary/20 transition-all duration-300 animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Footer */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="p-4 bg-card/50 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground text-center">
                Mesh TV Network
              </p>
              <p className="text-xs text-muted-foreground/60 text-center">
                Decentralized Streaming
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;