import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { resolveImg } from "@/lib/api";
import { Reveal } from "@/components/site/Reveal";
import BandMarquee from "@/components/site/Marquee";

const titleLines = (title) => title.split(" ");

export default function Home() {
  const { content } = useContent();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
 const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "70%"]);
const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.35, 1]);
  if (!content) return <div className="min-h-screen bg-obsidian" />;
  const h = content.home || {};

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden flex items-end">
        <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0 z-0">
          {h.heroImage ? (
            <motion.img
  src={resolveImg(h.heroImage)}
  alt="Luptător MMA"
  className="w-full h-full object-cover"
  data-testid="hero-image"
  initial={{ opacity: 0, scale: 1.08 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    duration: 1.2,
    ease: [0.22, 1, 0.36, 1],
  }}
/>
          ) : (
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-600 font-ui">
              Adaugă imaginea principală din admin
            </div>
          )}
        </motion.div>
        <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 z-[1] bg-black" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-obsidian via-transparent to-black/40" />

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-5 md:px-10 pb-16 md:pb-24">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-ui uppercase tracking-[0.3em] text-crimson font-bold text-sm mb-6"
          >
            Jurnalul unui luptător · 18 ani
          </motion.p>

          <h1 className="font-display uppercase leading-[0.82] tracking-tight text-[19vw] md:text-[15vw] lg:text-[12vw]">
            {titleLines(h.heroTitle || "Din Colțul Cuștii").map((word, i) => (
  <span key={i} className="reveal-mask mr-[0.15em]">
    <motion.span
      className="inline-block"
      initial={{ y: "110%" }}
      animate={{ y: "0%" }}
      transition={{
        delay: 0.35 + i * 0.12,
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {word}
    </motion.span>
  </span>
))}
          </h1>

          <div className="grid md:grid-cols-2 gap-8 items-end mt-8">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="font-body text-base md:text-lg text-neutral-300 max-w-xl leading-relaxed whitespace-pre-line"
            >
              {h.heroText}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 1 }}
              className="flex md:justify-end"
            >
              <Link
                to="/despre"
                data-testid="hero-cta"
                className="group inline-flex items-center gap-3 bg-crimson text-white font-ui uppercase tracking-widest font-bold px-8 py-4 hover:bg-white hover:text-black transition-colors duration-300"
              >
                {h.ctaText || "Citește povestea"}
                <ArrowUpRight size={20} className="group-hover:rotate-45 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 right-6 z-10 hidden md:flex text-neutral-400"
        >
          <ArrowDown size={22} />
        </motion.div>
      </section>

      {/* STATS */}
      <section className="relative z-10 bg-obsidian border-b border-white/10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4">
          {(h.stats || []).map((st, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="px-6 md:px-10 py-12 border-r border-white/10 last:border-r-0">
                <div className="font-display text-6xl md:text-7xl text-crimson leading-none">{st.value}</div>
                <div className="font-ui uppercase tracking-widest text-sm text-neutral-400 mt-3">{st.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* INTRO / MANIFESTO */}
      <section className="relative z-10 bg-obsidian py-24 md:py-40 px-5 md:px-10">
        <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-1 hidden lg:block">
            <div className="font-display text-2xl text-stroke">01</div>
          </div>
          <div className="lg:col-span-11">
            <Reveal>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase leading-[0.95] tracking-tight max-w-4xl">
                {h.introTitle}
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="font-body text-lg md:text-2xl text-neutral-400 max-w-3xl mt-10 leading-relaxed">
                {h.introText}
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="flex flex-wrap gap-4 mt-12">
                <Link to="/articole" data-testid="home-link-articole" className="inline-flex items-center gap-2 border border-white/20 px-8 py-4 font-ui uppercase tracking-widest text-sm hover:border-crimson hover:text-crimson transition-colors">
                  Articole <ArrowUpRight size={18} />
                </Link>
                <Link to="/competitii" data-testid="home-link-competitii" className="inline-flex items-center gap-2 border border-white/20 px-8 py-4 font-ui uppercase tracking-widest text-sm hover:border-crimson hover:text-crimson transition-colors">
                  Competiții <ArrowUpRight size={18} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <BandMarquee text={h.marqueeText} />

      {/* PILLARS */}
      <section className="relative z-10 bg-obsidian py-24 md:py-32 px-5 md:px-10">
        <div className="max-w-[1600px] mx-auto grid md:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {[
            { t: "Antrenamente", d: "BJJ, box, wrestling și pregătire fizică — cum îmi construiesc arsenalul.", to: "/antrenamente" },
            { t: "Mentalitate", d: "Disciplină, frică, încredere. Lupta cea mai grea e în minte.", to: "/mentalitate" },
            { t: "Echipament", d: "Recenzii sincere despre ce folosesc și ce merită banii.", to: "/echipament" },
          ].map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <Link to={p.to} data-testid={`home-pillar-${i}`} className="group block bg-obsidian p-8 md:p-12 h-full hover:bg-surface transition-colors">
                <div className="font-display text-crimson text-xl mb-8">0{i + 2}</div>
                <h3 className="font-display text-4xl uppercase tracking-tight group-hover:text-crimson transition-colors">{p.t}</h3>
                <p className="font-body text-neutral-400 mt-4 leading-relaxed">{p.d}</p>
                <ArrowUpRight className="mt-8 text-neutral-500 group-hover:text-crimson group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
