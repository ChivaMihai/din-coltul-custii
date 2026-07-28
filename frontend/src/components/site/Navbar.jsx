import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useContent } from "@/context/ContentContext";

const NAV = [
  { label: "Acasă", path: "/" },
  { label: "Despre mine", path: "/despre" },
  { label: "Articole", path: "/articole" },
  { label: "Competiții", path: "/competitii" },
  { label: "Antrenamente", path: "/antrenamente" },
  { label: "Mentalitate", path: "/mentalitate" },
  { label: "Echipament", path: "/echipament" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const { content } = useContent();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const siteName = content?.settings?.siteName || "Din Colțul Cuștii";

  return (
    <>
      <motion.header
  initial={{ opacity: 0, y: -30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.8,
    delay: 0.15,
    ease: [0.22, 1, 0.36, 1],
  }}
        data-testid="site-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "backdrop-blur-xl bg-black/70 border-b border-white/10" : "bg-transparent"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-5 md:px-10 h-20 flex items-center justify-between">
          <Link to="/" data-testid="nav-logo" className="font-display text-2xl md:text-3xl tracking-wide leading-none">
            <span className="text-crimson">/</span> {siteName}
          </Link>

          <nav className="hidden lg:flex items-center gap-8 font-ui text-sm uppercase tracking-widest">
            {NAV.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-link-${item.path === "/" ? "home" : item.path.slice(1)}`}
                className={`hover-underline pb-1 transition-colors ${
                  location.pathname === item.path ? "text-crimson" : "text-neutral-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            data-testid="nav-menu-toggle"
            className="lg:hidden text-white"
            onClick={() => setOpen((v) => !v)}
            aria-label="Meniu"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-obsidian lg:hidden pt-24 px-6"
          >
            <nav className="flex flex-col gap-2">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={item.path}
                    data-testid={`mobile-nav-link-${item.path === "/" ? "home" : item.path.slice(1)}`}
                    className="font-display text-4xl tracking-wide py-2 block border-b border-white/5 hover:text-crimson transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
