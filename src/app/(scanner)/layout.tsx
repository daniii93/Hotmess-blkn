export default function ScannerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-hm-scannerBg text-hm-porcelain">{children}</div>;
}
