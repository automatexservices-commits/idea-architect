import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Mail, Lock, Loader, RotateCcw, ShieldCheck } from "lucide-react";
import { exchangeResetPasswordToken, resetPasswordWithOtp, sendPasswordResetEmail } from "@/features/auth";

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
    status: typeof search.insforge_status === "string" ? search.insforge_status : "",
    type: typeof search.insforge_type === "string" ? search.insforge_type : "",
    error: typeof search.insforge_error === "string" ? search.insforge_error : "",
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth/reset-password" });
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetToken, setResetToken] = useState(search.token || "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const tokenReady = Boolean(resetToken);

  const sendCode = async () => {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setSending(true);
    setError(null);
    setMessage(null);
    try {
      await sendPasswordResetEmail(email.trim());
      setMessage("Password reset code sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send password reset code.");
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    if (!otp.trim()) {
      setError("Enter the reset code from your email.");
      return;
    }

    setVerifying(true);
    setError(null);
    setMessage(null);

    try {
      const data = await exchangeResetPasswordToken(email.trim(), otp.trim());
      if (!data?.token) {
        throw new Error("Invalid or expired verification token.");
      }

      setResetToken(data.token);
      setMessage("Reset code verified. You can now set a new password.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired verification token.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) {
      setError("Verify the reset code first.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await resetPasswordWithOtp(resetToken, newPassword);
      navigate({ to: "/", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed.");
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
            <h1 className="font-display text-2xl font-bold">Reset password</h1>
            <p className="text-sm text-muted-foreground">Enter the 6-digit code from InsForge.</p>
          </div>
        </div>

        {search.error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {search.error}
          </div>
        )}

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
              placeholder="Reset code"
              className="w-full h-12 rounded-full border border-border bg-surface px-4 text-foreground outline-none focus:border-primary"
            />
          </div>

          {!tokenReady ? (
            <button type="button" onClick={verifyCode} disabled={sending || loading || verifying} className="btn-3d btn-3d-outline w-full !rounded-full">
              {verifying ? <Loader className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {verifying ? "Verifying..." : "Verify reset code"}
            </button>
          ) : (
            <>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full h-12 rounded-full border border-border bg-surface pl-11 pr-4 text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full h-12 rounded-full border border-border bg-surface pl-11 pr-4 text-foreground outline-none focus:border-primary"
                />
              </div>
            </>
          )}

          <button type="button" onClick={sendCode} disabled={sending || loading || verifying} className="btn-3d btn-3d-outline w-full !rounded-full">
            {sending ? <Loader className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            {sending ? "Sending..." : "Resend OTP"}
          </button>

          {tokenReady && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button type="submit" disabled={loading || sending || verifying} className="btn-3d w-full !rounded-full">
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Back to <Link to="/welcome" className="text-primary hover:underline">login</Link>
        </p>
      </div>
    </div>
  );
}
