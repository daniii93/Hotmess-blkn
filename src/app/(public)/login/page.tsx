import { PageShell } from "@/components/shell/page-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { getTranslations } from "next-intl/server";

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <>
      <PageShell pageKey="login" />
      <div className="mx-auto -mt-10 max-w-2xl px-4 pb-12">
        <AuthForm
          mode="login"
          labels={{
            email: t("email"),
            password: t("password"),
            submit: t("submitLogin"),
            google: t("google"),
            apple: t("apple"),
          }}
        />
      </div>
    </>
  );
}
