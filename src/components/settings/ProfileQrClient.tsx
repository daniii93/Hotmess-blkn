"use client";

import { Download, QrCode, Share2 } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

const palette = {
  gold: { label: "Gold", dark: "#A8853F", light: "#FAF7F2" },
  ink: { label: "Ink", dark: "#1C1915", light: "#FAF7F2" },
  champagne: { label: "Champagne", dark: "#6E675C", light: "#EFE7DA" },
} as const;

type QrColor = keyof typeof palette;

export function ProfileQrClient({ username, initialColor }: { username: string; initialColor: QrColor }) {
  const [color, setColor] = useState<QrColor>(initialColor);
  const [dataUrl, setDataUrl] = useState("");
  const [profileUrl, setProfileUrl] = useState(`/u/${username}`);

  useEffect(() => {
    setProfileUrl(`${window.location.origin}/u/${username}`);
  }, [username]);

  useEffect(() => {
    const selected = palette[color];
    QRCode.toDataURL(profileUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: selected.dark,
        light: selected.light,
      },
    }).then(setDataUrl).catch(() => setDataUrl(""));
  }, [color, profileUrl]);

  const saveColor = async (next: QrColor) => {
    setColor(next);
    await fetch("/api/settings/qr", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ color: next }),
    }).catch(() => null);
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: `@${username} auf HotMess`, url: profileUrl }).catch(() => null);
      return;
    }
    await navigator.clipboard?.writeText(profileUrl).catch(() => null);
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Profil teilen</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Dein QR-Code</h1>
        <p className="mt-3 text-sm leading-6 text-hm-inkSoft">Der QR-Code oeffnet dein Profil. Er ist nicht fuer Login gedacht.</p>
      </section>

      <section className="mt-5 rounded-card border border-hm-border bg-hm-porcelain p-5 text-center shadow-soft">
        <div className="mx-auto grid max-w-sm place-items-center rounded-[28px] border border-hm-gold/25 bg-hm-ivory p-5">
          {dataUrl ? <img src={dataUrl} alt={`QR-Code fuer @${username}`} className="h-72 w-72 rounded-card" /> : <QrCode className="h-32 w-32 text-hm-gold" />}
          <p className="mt-4 text-sm font-bold text-hm-ink">@{username}</p>
          <p className="mt-1 break-all text-xs text-hm-inkSoft">{profileUrl}</p>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {(Object.keys(palette) as QrColor[]).map((key) => (
            <button
              key={key}
              className={`rounded-pill border px-4 py-2 text-sm font-bold ${color === key ? "border-hm-ink bg-hm-ink text-white" : "border-hm-gold/30 bg-hm-champagne text-hm-ink"}`}
              type="button"
              onClick={() => saveColor(key)}
            >
              {palette[key].label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-hm-ink px-4 py-3 text-sm font-bold text-white" type="button" onClick={share}>
            <Share2 className="h-4 w-4" />
            Teilen
          </button>
          <a className="inline-flex items-center justify-center gap-2 rounded-xl bg-hm-champagne px-4 py-3 text-sm font-bold text-hm-ink" href={dataUrl || "#"} download={`hotmess-${username}-qr.png`}>
            <Download className="h-4 w-4" />
            Herunterladen
          </a>
        </div>
      </section>
    </main>
  );
}
