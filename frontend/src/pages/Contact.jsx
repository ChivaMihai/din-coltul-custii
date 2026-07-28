import { Instagram, Youtube, Mail, ArrowUpRight, ExternalLink } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { Reveal } from "@/components/site/Reveal";
import PageHeader from "@/components/site/PageHeader";

export default function Contact() {
  const { content } = useContent();
  if (!content) return <div className="min-h-screen bg-obsidian" />;
  const c = content.contact || {};
  const socials = content.settings?.socials || {};

 const links = [
  { key: "instagram", label: "Instagram", icon: Instagram, href: socials.instagram },
  { key: "youtube", label: "YouTube", icon: Youtube, href: socials.youtube },
  { key: "tiktok", label: "TikTok", icon: ExternalLink, href: socials.tiktok },
  {
    key: "email",
    label: socials.email || c.email,
    icon: Mail,
    href: `mailto:${socials.email || c.email}`,
  },
].filter((l) => l.href);

  return (
    <div data-testid="contact-page" className="bg-obsidian min-h-screen">
      <PageHeader overline={c.overline} title={c.title} intro={c.text} />

      <section className="relative z-10 px-5 md:px-10 max-w-[1600px] mx-auto pb-32 md:pb-44">
        <div className="border-t border-white/10">
          {links.map((l, i) => (
            <Reveal key={l.key} delay={i * 0.08}>
              <a
                href={l.href}
                target={l.key === "email" ? undefined : "_blank"}
                rel="noreferrer"
                data-testid={`contact-${l.key}`}
                className="group flex items-center justify-between gap-6 py-8 md:py-12 border-b border-white/10 hover:px-4 transition-all"
              >
                <div className="flex items-center gap-6">
                  <l.icon className="text-crimson shrink-0" size={28} />
                  <span className="font-display text-4xl md:text-6xl uppercase tracking-tight group-hover:text-crimson transition-colors break-all">
                    {l.label}
                  </span>
                </div>
                <ArrowUpRight size={40} className="text-neutral-600 group-hover:text-crimson group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0" />
              </a>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
