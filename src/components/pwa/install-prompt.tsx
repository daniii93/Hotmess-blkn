"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Share2, Smartphone } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || Boolean(standaloneNavigator.standalone);
}

function isIosDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const ios = useMemo(isIosDevice, []);

  useEffect(() => {
    setInstalled(isStandaloneDisplay());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed) {
    return null;
  }

  async function installApp() {
    if (!promptEvent) {
      return;
    }

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    } else {
      setDismissed(true);
    }
    setPromptEvent(null);
  }

  if (ios) {
    return (
      <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-hm-ink text-hm-ivory">
            <Share2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-hm-ink">iPhone Installation</p>
            <p className="mt-2 text-sm leading-6 text-hm-inkSoft">
              In Safari das Teilen-Symbol oeffnen und danach "Zum Home-Bildschirm" waehlen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-hm-ink text-hm-ivory">
            <Smartphone className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-hm-ink">HotMess installieren</p>
            <p className="mt-2 text-sm leading-6 text-hm-inkSoft">
              Auf Android und Desktop kannst du HotMess als App im Vollbild starten.
            </p>
          </div>
        </div>
        {promptEvent ? (
          <button
            type="button"
            onClick={installApp}
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-hm-ivory transition hover:bg-hm-goldDeep"
          >
            <Download className="size-4" aria-hidden="true" />
            App installieren
          </button>
        ) : (
          <p className="rounded-pill border border-hm-border px-4 py-3 text-sm font-semibold text-hm-goldDeep">
            Chrome-Menue - App installieren
          </p>
        )}
      </div>
    </div>
  );
}
