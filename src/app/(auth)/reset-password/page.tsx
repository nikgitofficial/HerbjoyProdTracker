"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";
import { AuthCard, AuthCardHeader } from "@/components/ui/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PasswordStrength } from "@/components/ui/PasswordStrength";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const otp = searchParams.get("otp") ?? "";

  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email || !otp) router.replace("/forgot-password");
  }, [email, otp, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email, otp },
  });

  const password = watch("password", "");

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError("");

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      setServerError(json.error ?? "Something went wrong");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2500);
  };

  if (success) {
    return (
      <AuthCard>
        <div className="text-center py-8 animate-scale-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/20 mb-4">
            <CheckCircle2 size={28} className="text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Password updated!
          </h2>
          <p className="text-sm text-surface-500">
            Your password has been reset successfully. Redirecting to login…
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthCardHeader
        icon={<Lock size={20} />}
        title="Set new password"
        subtitle="Choose a strong password for your account"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Hidden fields */}
        <input type="hidden" {...register("email")} />
        <input type="hidden" {...register("otp")} />

        <div>
          <Input
            {...register("password")}
            label="New password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            autoFocus
            leftIcon={<Lock size={15} />}
            error={errors.password?.message}
          />
          <PasswordStrength password={password} />
        </div>

        <Input
          {...register("confirmPassword")}
          label="Confirm new password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          leftIcon={<Lock size={15} />}
          error={errors.confirmPassword?.message}
        />

        {serverError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 animate-slide-down">
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isSubmitting}
          rightIcon={<ArrowRight size={16} />}
        >
          {isSubmitting ? "Resetting…" : "Reset password"}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-surface-800 text-center">
        <Link
          href="/login"
          className="text-sm text-surface-500 hover:text-surface-300 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
