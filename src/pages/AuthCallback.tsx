import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { CheckCircle, Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus("error");
      setMessage("Authentication service not configured.");
      return;
    }

    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
        setStatus("success");
        setMessage("Your email has been confirmed! You can now log in.");
        setTimeout(() => navigate("/account"), 3000);
        return;
      }

      // Handle hash tokens (legacy / implicit flow)
      const hash = window.location.hash;
      if (hash.includes("access_token")) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus("success");
          setMessage("Your email has been confirmed! Welcome to YKonline Shop.");
          setTimeout(() => navigate("/account"), 3000);
          return;
        }
      }

      setStatus("error");
      setMessage("Invalid or expired confirmation link. Please try registering again.");
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream/40 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-xl">
        {status === "loading" && (
          <>
            <Loader2 size={48} className="mx-auto mb-4 text-green animate-spin" />
            <p className="text-gray-600">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle size={48} className="mx-auto mb-4 text-green" />
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Email confirmed!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link to="/account" className="btn-primary">Go to my account</Link>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Confirmation failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link to="/account" className="btn-primary">Back to account</Link>
          </>
        )}
      </div>
    </div>
  );
}
