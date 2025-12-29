"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import React, { useState } from "react";
import Link from "next/link";
import { EyeClosedIcon, EyeIcon } from "lucide-react";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: credentials, 2: otp
  const [otp, setOtp] = useState("");
  const [isEnabled, setEnabled] = useState(false);


  const handleCredentials = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {

      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, action: "verify-credentials" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid credentials");

      setOtp("");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp, action: "signin-with-otp" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign in failed");

      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email/employee ID and password to sign in!
            </p>
          </div>



          {step === 1 ? (
            <form onSubmit={handleCredentials}>
              <div className="space-y-6">
                <div>
                  <Label>Email or Employee ID <span className="text-error-500">*</span></Label>
                  <Input
                    placeholder="adarsh@arinova.studio or emp-001"
                    type="text"
                    defaultValue={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Password <span className="text-error-500">*</span></Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      defaultValue={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      className="absolute right-3 top-3 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {!showPassword ? <EyeClosedIcon /> : <EyeIcon />}
                    </span>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex items-center justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div>
                  <Button type="submit" className="w-full" size="sm" disabled={loading || !email || !password}>
                    {loading ? "Verifying..." : "Continue"}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOtpSignin}>
              <div className="space-y-6">
                <div>
                  <Label>Enter OTP <span className="text-error-500">*</span></Label>
                  <Input
                    type="number"
                    placeholder="Enter 6-digit OTP sent to your email"
                    value={otp}
                    onChange={(e) => {setOtp(e.target.value), setEnabled(e.target.value.length === 6 && true)}}
                    autoComplete="off"
                    name="otp"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div>
                  <Button type="submit" className="w-full" size="sm" disabled={loading || !isEnabled}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>

                <div>
                  <Button type="button" onClick={() => setStep(1)} className="w-full" variant="outline" size="sm">
                    Back
                  </Button>
                </div>
              </div>
            </form>
          )}

        </div>
        <div className="mt-6">
          <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
            Don&#39;t have an account?
            <Link
              href="/signup"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              {" "}Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
