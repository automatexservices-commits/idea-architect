import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Mail, ShieldCheck, Loader, RotateCcw } from "lucide-react";
import { resendVerificationEmail, verifyEmail } from "@/features/auth";

export const Route = createFileRoute("/auth/verify")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { email: initialEmail } = useSearch({ from: "/auth/verify" });
  const [email, setEmail] = useState(initialEmail ?? "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const sendCode = async () => {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setSending(true);
    setError(null);
    setMessage(null);
    try {
      await resendVerificationEmail(email.trim());
      setMessage("Verification code sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send verification code.");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await verifyEmail(email.trim(), otp.trim());
      navigate({ to: "/", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-elevated">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Verify email</h1>
            <p className="text-sm text-muted-foreground">Enter the 6-digit code from InsForge.</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

        <div className="space-y-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full h-12 rounded-full border border-border bg-surface pl-11 pr-4 text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              className="w-full h-12 rounded-full border border-border bg-surface px-4 text-foreground outline-none focus:border-primary"
            />
          </div>

          <button type="button" onClick={sendCode} disabled={sending || loading} className="btn-3d btn-3d-outline w-full !rounded-full">
            {sending ? <Loader className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            {sending ? "Sending..." : "Resend OTP"}
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <button type="submit" disabled={loading || sending} className="btn-3d w-full !rounded-full">
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? "Verifying..." : "Verify email"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Back to <Link to="/welcome" className="text-primary hover:underline">login</Link>
        </p>
      </div>
    </div>
  );
}
