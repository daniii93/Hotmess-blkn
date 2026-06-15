import { PageShell } from "@/components/shell/page-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { getTranslations } from "next-intl/server";

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <>
      <PageShell pageKey="register" />
      <div className="mx-auto -mt-10 max-w-3xl px-4 pb-12">
        <AuthForm
          mode="register"
          labels={{
            email: t("email"),
            password: t("password"),
            firstName: t("firstName"),
            lastName: t("lastName"),
            dateOfBirth: t("dateOfBirth"),
            gender: t("gender"),
            female: t("female"),
            male: t("male"),
            diverse: t("diverse"),
            submit: t("submitRegister"),
            google: t("google"),
            apple: t("apple"),
          }}
        />
      </div>
    </>
  );
}
