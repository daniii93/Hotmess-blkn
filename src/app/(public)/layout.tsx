import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const t = await getTranslations("nav.public");

  return (
    <div className="min-h-screen bg-hm-ivory text-hm-ink">
      <header className="border-b border-hm-border bg-hm-ivory/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/hotmess-logo-mark.svg" alt="HotMess" width={42} height={42} priority />
          </Link>
          <nav className="flex flex-wrap justify-end gap-2 text-sm text-hm-inkSoft" aria-label="Public Navigation">
            <Link className="rounded-pill px-3 py-2 hover:bg-hm-champagne hover:text-hm-ink" href="/login">{t("login")}</Link>
            <Link className="rounded-pill bg-hm-ink px-4 py-2 text-hm-porcelain hover:bg-hm-gold" href="/register">{t("register")}</Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
