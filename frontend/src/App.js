import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ReactLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

import { ContentProvider } from "@/context/ContentContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Articles from "@/pages/Articles";
import ArticleDetail from "@/pages/ArticleDetail";
import Competitions from "@/pages/Competitions";
import Training from "@/pages/Training";
import Mindset from "@/pages/Mindset";
import Equipment from "@/pages/Equipment";
import Contact from "@/pages/Contact";
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function SiteLayout({ children }) {
  return (
    <div className="grain min-h-screen">
      <Navbar />
      <motion.main
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{
    duration: 0.45,
    ease: [0.22, 1, 0.36, 1],
  }}
>
  {children}
</motion.main>
      <Footer />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === null)
    return <div className="min-h-screen bg-obsidian flex items-center justify-center font-ui text-neutral-500">Se încarcă...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<SiteLayout><Home /></SiteLayout>} />
        <Route path="/despre" element={<SiteLayout><About /></SiteLayout>} />
        <Route path="/articole" element={<SiteLayout><Articles /></SiteLayout>} />
        <Route path="/articole/:slug" element={<SiteLayout><ArticleDetail /></SiteLayout>} />
        <Route path="/competitii" element={<SiteLayout><Competitions /></SiteLayout>} />
        <Route path="/antrenamente" element={<SiteLayout><Training /></SiteLayout>} />
        <Route path="/mentalitate" element={<SiteLayout><Mindset /></SiteLayout>} />
        <Route path="/echipament" element={<SiteLayout><Equipment /></SiteLayout>} />
        <Route path="/contact" element={<SiteLayout><Contact /></SiteLayout>} />
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(false);
  }, 1000);

  return () => clearTimeout(timer);
}, []);
  return (
    <div className="App">
      <AnimatePresence>
  {loading && (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
    >
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="font-display text-5xl md:text-7xl tracking-widest"
      >
        <span className="text-crimson">/</span> DIN COLȚUL CUȘTII
      </motion.h1>
    </motion.div>
  )}
</AnimatePresence>
      <ReactLenis root options={{ lerp: 0.09, smoothWheel: true }}>
        <AuthProvider>
          <ContentProvider>
            <BrowserRouter>
              <ScrollTop />
              <Toaster theme="dark" position="top-center" richColors />
              <AnimatedRoutes />
            </BrowserRouter>
          </ContentProvider>
        </AuthProvider>
      </ReactLenis>
    </div>
  );
}

export default App;
