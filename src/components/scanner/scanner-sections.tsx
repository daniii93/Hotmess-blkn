"use client";

import { useEffect, useRef, useState } from "react";

export function EventPicker() {
  return (
    <label className="block rounded-card border border-hm-gold/40 bg-[#1f1a13] p-4 text-sm text-hm-champagne">
      Gate
      <select className="mt-3 w-full rounded-pill border border-hm-gold/40 bg-[#14110D] px-4 py-3 text-white" name="gate">
        <option>Haupteingang</option>
        <option>Fast-Lane</option>
      </select>
    </label>
  );
}

export function QRScanner({ onScan }: { onScan: (token: string) => void }) {
  const scannerRef = useRef<any>(null);
  const [state, setState] = useState<"idle" | "starting" | "active" | "error">("idle");

  useEffect(() => {
    return () => {
      void scannerRef.current?.stop?.().catch(() => null);
      scannerRef.current?.clear?.();
    };
  }, []);

  const start = async () => {
    setState("starting");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("hotmess-qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText: string) => {
          onScan(decodedText);
          void scanner.stop().catch(() => null);
          setState("idle");
        },
        () => undefined,
      );
      setState("active");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="rounded-card border border-hm-gold/40 bg-[#1f1a13] p-6 text-center text-hm-champagne">
      <div id="hotmess-qr-reader" className="mx-auto min-h-72 max-w-md overflow-hidden rounded-card" />
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-luxury text-hm-gold">Kamera Scanner</p>
        <p className="mt-3 text-sm">Kamera starten, QR erfassen, danach mit Einlassen serverseitig entwerten.</p>
        <button className="mt-4 rounded-pill bg-hm-gold px-5 py-3 text-sm font-semibold text-[#14110D] disabled:opacity-60" disabled={state === "starting" || state === "active"} onClick={start} type="button">
          {state === "starting" ? "Starte..." : state === "active" ? "Kamera aktiv" : "Kamera starten"}
        </button>
        {state === "error" ? <p className="mt-3 text-sm text-red-100">Kamera konnte nicht gestartet werden. Token-Eingabe bleibt verfuegbar.</p> : null}
      </div>
    </div>
  );
}

export function ScanResult() {
  const [qrToken, setQrToken] = useState("");
  const [gate, setGate] = useState("Haupteingang");
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const scan = async () => {
    setStatus("loading");
    setResult(null);
    const response = await fetch("/api/scanner/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ qrToken, gate }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; ticket?: { holder_name?: string; holder_gender?: string } } | null;

    if (!response.ok || payload?.error) {
      setStatus("error");
      setResult(payload?.error ?? "Scan fehlgeschlagen.");
      return;
    }

    setStatus("success");
    setResult(`Eingelassen: ${payload?.ticket?.holder_name ?? "Ticket"} (${payload?.ticket?.holder_gender ?? "-"})`);
  };

  return (
    <ScannerPanel qrToken={qrToken} setQrToken={setQrToken} gate={gate} setGate={setGate} result={result} status={status} scan={scan} />
  );
}

export function ScannerExperience() {
  const [qrToken, setQrToken] = useState("");
  const [gate, setGate] = useState("Haupteingang");
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const scan = async () => {
    setStatus("loading");
    setResult(null);
    const response = await fetch("/api/scanner/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ qrToken, gate }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; ticket?: { holder_name?: string; holder_gender?: string } } | null;

    if (!response.ok || payload?.error) {
      setStatus("error");
      setResult(payload?.error ?? "Scan fehlgeschlagen.");
      return;
    }

    setStatus("success");
    setResult(`Eingelassen: ${payload?.ticket?.holder_name ?? "Ticket"} (${payload?.ticket?.holder_gender ?? "-"})`);
  };

  return (
    <>
      <ScannerPanel qrToken={qrToken} setQrToken={setQrToken} gate={gate} setGate={setGate} result={result} status={status} scan={scan} />
      <QRScanner onScan={setQrToken} />
    </>
  );
}

function ScannerPanel({
  qrToken,
  setQrToken,
  gate,
  setGate,
  result,
  status,
  scan,
}: {
  qrToken: string;
  setQrToken: (value: string) => void;
  gate: string;
  setGate: (value: string) => void;
  result: string | null;
  status: "idle" | "loading" | "success" | "error";
  scan: () => void;
}) {
  return (
    <div className="rounded-card border border-hm-gold/40 bg-[#1f1a13] p-5 text-hm-champagne">
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-gold">Scan Ergebnis</p>
      <label className="mt-5 block text-sm">
        QR-Token
        <textarea className="mt-2 min-h-28 w-full rounded-card border border-hm-gold/40 bg-[#14110D] p-3 font-mono text-xs text-white outline-none" value={qrToken} onChange={(event) => setQrToken(event.target.value)} />
      </label>
      <label className="mt-3 block text-sm">
        Gate
        <select className="mt-2 w-full rounded-pill border border-hm-gold/40 bg-[#14110D] px-4 py-3 text-white" value={gate} onChange={(event) => setGate(event.target.value)}>
          <option>Haupteingang</option>
          <option>Fast-Lane</option>
        </select>
      </label>
      <button
        className="mt-6 w-full rounded-pill bg-hm-gold px-5 py-4 text-sm font-semibold text-[#14110D] disabled:opacity-60"
        disabled={status === "loading" || qrToken.length < 10}
        onClick={scan}
        type="button"
      >
        {status === "loading" ? "Pruefe..." : "Einlassen"}
      </button>
      {result ? (
        <p className={`mt-4 rounded-card px-4 py-3 text-sm ${status === "error" ? "bg-red-950/50 text-red-100" : "bg-emerald-950/50 text-emerald-100"}`}>
          {result}
        </p>
      ) : null}
    </div>
  );
}

export function OfflineCache() {
  return (
    <div className="rounded-card border border-hm-gold/40 bg-[#1f1a13] p-4 text-sm text-hm-champagne">
      Offline-Fallback: gueltige Ticket-IDs und Fotos werden vor Eventbeginn verschluesselt vorbereitet.
    </div>
  );
}
