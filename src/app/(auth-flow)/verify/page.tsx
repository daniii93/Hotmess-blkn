import { PageShell } from "@/components/shell/page-shell";
import { VerificationPanel } from "@/components/auth/verification-panel";

export default function VerifyPage() {
  return (
    <>
      <PageShell pageKey="verify" />
      <VerificationPanel />
    </>
  );
}
