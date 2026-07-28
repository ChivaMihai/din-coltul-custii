import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grain min-h-screen bg-obsidian flex items-center justify-center px-6">
      <div className="relative z-10 w-full max-w-md">
        <div className="font-display text-5xl uppercase tracking-tight mb-2">
          <span className="text-crimson">/</span> Admin
        </div>
        <p className="font-body text-neutral-500 mb-10">Din Colțul Cuștii · panou de editare</p>

        <form onSubmit={submit} className="space-y-5" data-testid="login-form">
          <div>
            <label className="font-ui uppercase tracking-widest text-xs text-neutral-400">Email</label>
            <input
              data-testid="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-2 bg-surface border border-white/15 px-4 py-3 font-body text-white focus:border-crimson outline-none transition-colors"
            />
          </div>
          <div>
            <label className="font-ui uppercase tracking-widest text-xs text-neutral-400">Parolă</label>
            <input
              data-testid="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-2 bg-surface border border-white/15 px-4 py-3 font-body text-white focus:border-crimson outline-none transition-colors"
            />
          </div>
          {error && <p className="text-crimson font-body text-sm" data-testid="login-error">{error}</p>}
          <button
            data-testid="login-submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-crimson text-white font-ui uppercase tracking-widest font-bold px-8 py-4 hover:bg-white hover:text-black transition-colors disabled:opacity-50"
          >
            <LogIn size={18} /> {loading ? "Se conectează..." : "Autentificare"}
          </button>
        </form>
      </div>
    </div>
  );
}
