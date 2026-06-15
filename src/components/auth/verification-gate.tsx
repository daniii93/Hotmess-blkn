type VerificationGateProps = {
  verified: boolean;
  children: React.ReactNode;
};

export function VerificationGate({ verified, children }: VerificationGateProps) {
  if (!verified) {
    return (
      <div className="rounded-card border border-hm-border bg-hm-champagne p-5 text-sm text-hm-ink">
        Fuer diese Aktion brauchst du eine einmalige Verifikation.
      </div>
    );
  }

  return <>{children}</>;
}
