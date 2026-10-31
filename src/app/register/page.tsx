"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { LegalModal } from "@/components/legal/LegalModal";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  // Legal Modal States
  const [legalModalType, setLegalModalType] = useState<"terms" | "privacy">("terms");
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((providers) => {
        if (active) setGoogleEnabled(Boolean(providers?.google));
      })
      .catch(() => {
        if (active) setGoogleEnabled(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Transition to OTP verification step
      setStep("otp");
      setResendCooldown(45);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otpCode.length !== 6) {
      setError("Masukkan 6 digit kode verifikasi");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          code: otpCode,
          type: "EMAIL_VERIFICATION",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verifikasi kode gagal");
        setLoading(false);
        return;
      }

      // Redirect to login with verified flag
      router.push("/login?registered=1&verified=1");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          type: "EMAIL_VERIFICATION",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim ulang kode");
      }

      setResendCooldown(45);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const openLegal = (type: "terms" | "privacy") => {
    setLegalModalType(type);
    setIsLegalModalOpen(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/landing" className="mb-8 flex items-center justify-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl">
            <Image src="/logo-togather.png" alt="Togather" width={36} height={36} className="object-contain" />
          </div>
          <span className="text-2xl font-bold text-[#1F2937]">Togather</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {step === "form" ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-3xl font-bold text-[#1F2937]">Join Togather</h1>
                <p className="text-[#6B7280]">Create your account and start connecting</p>
              </div>

              {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
                    placeholder="Re-enter your password"
                  />
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 rounded border-gray-300 text-[#7960D7] focus:ring-[#7960D7]"
                  />
                  <label className="ml-2 text-sm text-[#6B7280]">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => openLegal("terms")}
                      className="text-[#7960D7] font-medium hover:underline inline"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => openLegal("privacy")}
                      className="text-[#7960D7] font-medium hover:underline inline"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[#7960D7] px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-[#6950c7] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>

              {googleEnabled && (
                <>
                  <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-sm text-[#6B7280]">Or sign up with</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-gray-300 px-6 py-3 font-medium text-[#1F2937] transition-colors hover:border-[#7960D7] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                </>
              )}

              <div className="mt-6 text-center text-sm text-[#6B7280]">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-[#7960D7] hover:underline">
                  Sign in
                </Link>
              </div>
            </>
          ) : (
            /* Step OTP */
            <div>
              <div className="mb-6 text-center">
                <div className="w-14 h-14 bg-purple-50 text-[#7960D7] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="mb-2 text-2xl font-bold text-[#1F2937]">Verifikasi Email Anda</h1>
                <p className="text-sm text-[#6B7280]">
                  Kami telah mengirimkan 6-digit kode verifikasi ke{" "}
                  <span className="font-semibold text-gray-800">{formData.email}</span>
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label htmlFor="otp" className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Kode Verifikasi (OTP)
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    required
                    className="w-full text-center tracking-widest text-2xl font-bold rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
                    placeholder="123456"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Tidak menerima kode?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResendOtp}
                    className="text-[#7960D7] font-semibold hover:underline disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : "Kirim ulang kode"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[#7960D7] px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-[#6950c7] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => router.push("/login?registered=1")}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Lewati untuk sekarang (Masuk nanti) →
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/landing" className="text-sm text-[#6B7280] transition-colors hover:text-[#7960D7]">
            ← Back to home
          </Link>
        </div>
      </div>

      {/* Legal Modal */}
      <LegalModal
        type={legalModalType}
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
}
