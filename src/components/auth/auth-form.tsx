"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = loginSchema.extend({
  firstName: z.string().min(2).max(40),
  lastName: z.string().min(2).max(40),
  dateOfBirth: z.string().min(1),
  gender: z.enum(["female", "male", "diverse"]),
});

type AuthFormProps = {
  mode: "login" | "register";
  returnTo?: string;
  labels: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    female?: string;
    male?: string;
    diverse?: string;
    submit: string;
    google: string;
    apple: string;
  };
};

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function AuthForm({ mode, returnTo = "/feed", labels }: AuthFormProps) {
  const isRegister = mode === "register";
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<LoginValues | RegisterValues>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: isRegister
      ? { email: "", password: "", firstName: "", lastName: "", dateOfBirth: "", gender: "diverse" }
      : { email: "", password: "" },
  });

  const handlePasswordAuth = async (values: LoginValues | RegisterValues) => {
    setStatus("loading");
    setMessage(null);

    if (isRegister) {
      const registerValues = values as RegisterValues;
      const usernameBase = `${registerValues.firstName}.${registerValues.lastName}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9._]/g, ".")
        .replace(/\.+/g, ".")
        .replace(/^\.|\.$/g, "")
        .slice(0, 20);
      const username = `${usernameBase || "user"}.${Math.random().toString(36).slice(2, 7)}`.slice(0, 30);

      const { data, error } = await supabase.auth.signUp({
        email: registerValues.email,
        password: registerValues.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          data: {
            first_name: registerValues.firstName,
            last_name: registerValues.lastName,
            date_of_birth: registerValues.dateOfBirth,
            gender: registerValues.gender,
            username,
            onboarding_completed: false,
            role: "user",
          },
        },
      });

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      setStatus("success");

      if (data.session) {
        router.replace("/onboarding");
        router.refresh();
        return;
      }

      router.replace("/register/check-email");
      return;
    }

    const loginValues = values as LoginValues;
    const { error } = await supabase.auth.signInWithPassword({
      email: loginValues.email,
      password: loginValues.password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    router.replace(returnTo);
    router.refresh();
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setStatus("loading");
    setMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <form
      className="mt-8 grid gap-4 rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-soft"
      onSubmit={form.handleSubmit(handlePasswordAuth)}
    >
      {isRegister ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-hm-ink">
            {labels.firstName}
            <input className="rounded-pill border border-hm-border bg-hm-ivory px-4 py-3" {...form.register("firstName" as keyof RegisterValues)} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-hm-ink">
            {labels.lastName}
            <input className="rounded-pill border border-hm-border bg-hm-ivory px-4 py-3" {...form.register("lastName" as keyof RegisterValues)} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-hm-ink">
            {labels.dateOfBirth}
            <input type="date" className="rounded-pill border border-hm-border bg-hm-ivory px-4 py-3" {...form.register("dateOfBirth" as keyof RegisterValues)} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-hm-ink">
            {labels.gender}
            <select className="rounded-pill border border-hm-border bg-hm-ivory px-4 py-3" {...form.register("gender" as keyof RegisterValues)}>
              <option value="female">{labels.female}</option>
              <option value="male">{labels.male}</option>
              <option value="diverse">{labels.diverse}</option>
            </select>
          </label>
        </div>
      ) : null}
      <label className="grid gap-2 text-sm font-medium text-hm-ink">
        {labels.email}
        <input type="email" className="rounded-pill border border-hm-border bg-hm-ivory px-4 py-3" {...form.register("email")} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-hm-ink">
        {labels.password}
        <input type="password" className="rounded-pill border border-hm-border bg-hm-ivory px-4 py-3" {...form.register("password")} />
      </label>
      {message ? (
        <p className={`rounded-card px-4 py-3 text-sm ${status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>
          {message}
        </p>
      ) : null}
      <button
        className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-hm-porcelain transition hover:bg-hm-gold disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Bitte warten..." : labels.submit}
      </button>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          className="rounded-pill border border-hm-border px-4 py-3 text-sm font-semibold text-hm-ink disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          disabled={status === "loading"}
          onClick={() => handleOAuth("google")}
        >
          {labels.google}
        </button>
        <button
          className="rounded-pill border border-hm-border px-4 py-3 text-sm font-semibold text-hm-ink disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          disabled={status === "loading"}
          onClick={() => handleOAuth("apple")}
        >
          {labels.apple}
        </button>
      </div>
    </form>
  );
}
