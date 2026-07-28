import { Link } from "react-router-dom";
import { Instagram, Youtube, Mail } from "lucide-react";
import { useContent } from "@/context/ContentContext";

export default function Footer() {
  const { content } = useContent();
  const s = content?.settings || {};
  const socials = s.socials || {};

  return (
    <footer data-testid="site-footer" className="relative z-10 border-t border-white/10 bg-obsidian">
      <div className="max-w-[1600px] mx-auto px-5 md:px-10 py-16">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="font-display text-4xl tracking-wide">
              <span className="text-crimson">/</span> {s.siteName || "Din Colțul Cuștii"}
            </div>
            <p className="font-body text-neutral-500 mt-4 max-w-xs">
              Jurnalul real al unui luptător. Fără filtre, fără scuze.
            </p>
          </div>

          <div className="font-ui uppercase tracking-widest text-sm text-neutral-400 space-y-3">
            <Link to="/despre" className="block hover:text-crimson transition-colors" data-testid="footer-link-despre">Despre mine</Link>
            <Link to="/articole" className="block hover:text-crimson transition-colors" data-testid="footer-link-articole">Articole</Link>
            <Link to="/competitii" className="block hover:text-crimson transition-colors" data-testid="footer-link-competitii">Competiții</Link>
            <Link to="/contact" className="block hover:text-crimson transition-colors" data-testid="footer-link-contact">Contact</Link>
          </div>

          <div>
            <p className="font-ui uppercase tracking-widest text-xs text-crimson mb-4">Urmărește drumul</p>
            <div className="flex gap-4">
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noreferrer" data-testid="social-instagram" className="w-12 h-12 border border-white/15 flex items-center justify-center hover:bg-crimson hover:border-crimson transition-colors">
                  <Instagram size={20} />
                </a>
              )}
              {socials.youtube && (
                <a href={socials.youtube} target="_blank" rel="noreferrer" data-testid="social-youtube" className="w-12 h-12 border border-white/15 flex items-center justify-center hover:bg-crimson hover:border-crimson transition-colors">
                  <Youtube size={20} />
                </a>
              )}
              {socials.email && (
                <a href={`mailto:${socials.email}`} data-testid="social-email" className="w-12 h-12 border border-white/15 flex items-center justify-center hover:bg-crimson hover:border-crimson transition-colors">
                  <Mail size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-neutral-600 font-body text-sm">
          <span>© {new Date().getFullYear()} {s.siteName || "Din Colțul Cuștii"}. Toate drepturile rezervate.</span>
          <Link to="/admin/login" data-testid="footer-admin-link" className="hover:text-neutral-300 transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
