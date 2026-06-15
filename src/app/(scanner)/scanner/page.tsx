import { EventPicker, OfflineCache, QRScanner, ScanResult } from "@/components/scanner/scanner-sections";

export default function ScannerPage() {
  return (
    <main className="min-h-screen bg-[#14110D] px-4 py-6 text-white sm:px-6 lg:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.42fr_0.58fr]">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-luxury text-hm-gold">Scanner</p>
            <h1 className="hm-display mt-3 text-5xl text-white">QR Einlass</h1>
            <p className="mt-4 text-sm leading-7 text-hm-champagne">
              Event wählen, QR scannen, Foto prüfen und Ticket einmalig einlassen.
            </p>
          </div>
          <EventPicker />
          <ScanResult />
          <OfflineCache />
        </div>
        <QRScanner />
      </section>
    </main>
  );
}
