"use client";

import { useState } from "react";

export function EventPicker() {
  return (
    <label className="block rounded-card border border-hm-gold/40 bg-[#1f1a13] p-4 text-sm text-hm-champagne">
      Event wählen
      <select className="mt-3 w-full rounded-pill border border-hm-gold/40 bg-[#14110D] px-4 py-3 text-white">
        <option>HotMess Innsbruck</option>
      </select>
    </label>
  );
}

export function QRScanner() {
  return (
    <div className="grid min-h-72 place-items-center rounded-card border border-hm-gold/40 bg-[#1f1a13] p-6 text-center text-hm-champagne">
      <div>
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-gold">Kamera Scanner</p>
        <p className="mt-3 text-sm">html5-qrcode wird hier angebunden. Offline-Liste bleibt vorbereitet.</p>
      </div>
    </div>
  );
}

export function ScanResult() {
  const [used, setUsed] = useState(false);
  return (
    <div className="rounded-card border border-hm-gold/40 bg-[#1f1a13] p-5 text-hm-champagne">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-gold">Scan Ergebnis</p>
      <div className="mt-5 flex items-center gap-4">
        <div className="grid size-20 place-items-center rounded-full border border-hm-gold bg-[#14110D] text-xl">A</div>
        <div>
          <p className="text-lg font-semibold text-white">Ana Markovic</p>
          <p className="text-sm text-hm-champagne">Weiblich · Regular · Fast-Lane</p>
        </div>
      </div>
      <button
        className="mt-6 w-full rounded-pill bg-hm-gold px-5 py-4 text-sm font-semibold text-[#14110D] disabled:opacity-60"
        disabled={used}
        onClick={() => setUsed(true)}
        type="button"
      >
        {used ? "Eingelassen" : "Einlassen"}
      </button>
    </div>
  );
}

export function OfflineCache() {
  return (
    <div className="rounded-card border border-hm-gold/40 bg-[#1f1a13] p-4 text-sm text-hm-champagne">
      Offline-Fallback: gültige Ticket-IDs und Fotos werden vor Eventbeginn verschlüsselt vorbereitet.
    </div>
  );
}
