"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

export function AuthForm({ mode, labels }: AuthFormProps) {
  const isRegister = mode === "register";
  const form = useForm<LoginValues | RegisterValues>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: isRegister
      ? { email: "", password: "", firstName: "", lastName: "", dateOfBirth: "", gender: "diverse" }
      : { email: "", password: "" },
  });

  return (
    <form
      className="mt-8 grid gap-4 rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-soft"
      onSubmit={form.handleSubmit(() => undefined)}
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
      <button className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-hm-porcelain transition hover:bg-hm-gold" type="submit">
        {labels.submit}
      </button>
      <div className="grid gap-2 sm:grid-cols-2">
        <button className="rounded-pill border border-hm-border px-4 py-3 text-sm font-semibold text-hm-ink" type="button">
          {labels.google}
        </button>
        <button className="rounded-pill border border-hm-border px-4 py-3 text-sm font-semibold text-hm-ink" type="button">
          {labels.apple}
        </button>
      </div>
    </form>
  );
}
