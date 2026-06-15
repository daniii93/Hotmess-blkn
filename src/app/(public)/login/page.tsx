import { PageShell } from "@/components/shell/page-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { getTranslations } from "next-intl/server";

type LoginPageProps = {
  searchParams?: Promise<{
    returnTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const t = await getTranslations("auth");
  const params = await searchParams;
  const returnTo = params?.returnTo?.startsWith("/") ? params.returnTo : "/feed";

  return (
    <>
      <PageShell pageKey="login" />
      <div className="mx-auto -mt-10 max-w-2xl px-4 pb-12">
        <AuthForm
          mode="login"
          returnTo={returnTo}
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
