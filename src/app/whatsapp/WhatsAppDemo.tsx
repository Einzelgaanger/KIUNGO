"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { submitClaim } from "@/actions/claims";
import { Button } from "@/components/ui/button";
import { formatKes } from "@/lib/format";
import { offsetLatLng } from "@/lib/geo";

type Msg = { id: string; dir: "in" | "out"; text?: string; kind?: "photo" | "location" | "checks" };

const SCRIPT: Msg[] = [
  {
    id: "1",
    dir: "in",
    text: "Karibu Kiungo. Habari Amina 👋\nYou have 2 active contracts at Mukuru Phase 2.\nWhat would you like to do?\n[1] Report a delivery\n[2] Check payment status\n[3] My contracts",
  },
  { id: "2", dir: "out", text: "1" },
  {
    id: "3",
    dir: "in",
    text: "Which contract?\n[1] AHP/MKR/2026/0142 — Steel door frames\n[2] AHP/MKR/2026/0187 — Flush door shutters",
  },
  { id: "4", dir: "out", text: "1" },
  {
    id: "5",
    dir: "in",
    text: "Line: DR-STL-900 · Steel door frame 900mm\nBalance remaining: 180 units\nHow many units did you deliver?",
  },
  { id: "6", dir: "out", text: "40" },
  { id: "7", dir: "in", text: "40 units. Now send one photo of the delivery. 📷" },
  { id: "8", dir: "out", kind: "photo" },
  { id: "9", dir: "in", text: "Got it. Now share your location. 📍" },
  { id: "10", dir: "out", kind: "location" },
  { id: "11", dir: "in", kind: "checks" },
];

const LOG = [
  "POST /claims                      202",
  "  geo.resolve(-1.3089, 36.8726)  → site:mukuru-phase-2  drift=84m",
  "  edge.exif_gps_match             pass  Δ=11m  (tol 200m)",
  "  edge.timestamp_plausible        pass  captured 4m ago",
  "  edge.duplicate_hash             pass  sha256:9f3a1c… unseen",
  "  edge.quantity_within_balance    pass  40 ≤ 180",
  "  route.reviewer                 → user:daniel-kiptoo (node: mukuru-site)",
  "  claim.status                    SUBMITTED → EDGE_CHECKED → QUEUED",
];

export function WhatsAppDemo({
  contractLineId,
  siteLat,
  siteLng,
}: {
  contractLineId: string;
  siteLat: number;
  siteLng: number;
}) {
  const [visible, setVisible] = useState(0);
  const [typing, setTyping] = useState(false);
  const [draftOut, setDraftOut] = useState<string | null>(null);
  const [checks, setChecks] = useState(0);
  const [logs, setLogs] = useState(0);
  const [ref, setRef] = useState<string | null>(null);
  const [approvedCopy, setApprovedCopy] = useState<string | null>(null);
  const [mode, setMode] = useState<"idle" | "play" | "step">("idle");
  const [pending, start] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);
  const written = useRef(false);
  const timers = useRef<number[]>([]);

  const shown = SCRIPT.slice(0, visible);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visible, typing, checks, draftOut, approvedCopy]);

  function clearTimers() {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }

  function later(ms: number, fn: () => void) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  function reset() {
    clearTimers();
    setVisible(0);
    setTyping(false);
    setDraftOut(null);
    setChecks(0);
    setLogs(0);
    setRef(null);
    setApprovedCopy(null);
    setMode("idle");
    written.current = false;
  }

  function writeClaim() {
    if (written.current || !contractLineId) return;
    written.current = true;
    const pin = offsetLatLng({ lat: siteLat, lng: siteLng }, 84, 11);
    start(async () => {
      const result = await submitClaim({
        contractLineId,
        quantity: 40,
        lat: pin.lat,
        lng: pin.lng,
        channel: "WHATSAPP",
        evidence: [
          {
            url: "/mock/delivery-07.jpg",
            sha256: `wa${Date.now().toString(16)}`.padEnd(64, "a"),
            exifLat: pin.lat,
            exifLng: pin.lng,
            capturedAt: new Date().toISOString(),
            deviceHint: "WhatsApp Android",
          },
        ],
      });
      if (result.ok) {
        setRef(result.data.ref);
        later(3000, () => {
          setApprovedCopy(
            `✅ ${result.data.ref} approved by D. Kiptoo.\nQuality multiplier: 1.05\nValue: ${formatKes(203700)}\nYour share: ${formatKes(162960)}\nPayment reference: MPX7K4Q2N1\nReliability score: 78 → 79 ⬆`,
          );
        });
      }
    });
  }

  function runChecks() {
    let i = 0;
    const tick = () => {
      i += 1;
      setChecks(i);
      if (i < 4) later(450, tick);
    };
    later(450, tick);
    LOG.forEach((_, index) => {
      later(index * 120, () => setLogs(index + 1));
    });
  }

  function revealNext() {
    if (visible >= SCRIPT.length) {
      writeClaim();
      return;
    }
    const next = SCRIPT[visible];
    if (!next) return;
    if (next.dir === "in") {
      setTyping(true);
      later(800, () => {
        setTyping(false);
        setVisible((v) => v + 1);
        if (next.kind === "checks") runChecks();
      });
      return;
    }
    if (next.text && mode === "play") {
      let i = 0;
      const type = () => {
        i += 1;
        setDraftOut(next.text?.slice(0, i) ?? "");
        if (i < (next.text?.length ?? 0)) later(55, type);
        else {
          setDraftOut(null);
          setVisible((v) => v + 1);
        }
      };
      type();
      return;
    }
    setVisible((v) => v + 1);
  }

  useEffect(() => {
    if (mode !== "play") return;
    if (visible >= SCRIPT.length) {
      if (checks >= 4) writeClaim();
      return;
    }
    if (typing || draftOut !== null) return;
    const delay = visible === 0 ? 400 : SCRIPT[visible]?.dir === "out" ? 500 : 900;
    later(delay, revealNext);
    return () => {
      /* timers cleared on reset */
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, visible, typing, draftOut, checks]);

  const submittedCopy = ref
    ? `Claim ${ref} submitted.\nRouted to: D. Kiptoo, Site Officer\nIndicative value: ${formatKes(194000)}\nYou'll get a message when it's approved.`
    : null;

  return (
    <div className="relative min-h-svh bg-forest-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-forest-800) 1px, transparent 1px), linear-gradient(90deg, var(--color-forest-800) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto flex min-h-svh w-full max-w-[1100px] flex-col items-center gap-6 px-4 py-8 lg:flex-row lg:items-center lg:justify-center">
        <div className="w-full max-w-[280px]">
          <div
            className="overflow-hidden rounded-[28px] border-[6px] border-forest-950 bg-paper text-ink-900 shadow-lg"
            style={{ height: 560 }}
          >
            <div className="flex h-10 items-center gap-2 rounded-t-[22px] bg-forest-900 px-2.5 text-white">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-500 font-display text-[10px] font-bold text-forest-900">
                K
              </span>
              <div>
                <p className="text-[11px] font-medium leading-tight">Kiungo</p>
                <p className="text-[8px] leading-tight text-forest-100/70">housing.delivery.v1</p>
              </div>
            </div>
            <div className="flex h-[calc(560px-40px)] flex-col gap-1.5 overflow-y-auto bg-paper p-2">
              {shown.map((msg) => (
                <Bubble key={msg.id} msg={msg} checks={checks} />
              ))}
              {draftOut !== null ? (
                <Bubble msg={{ id: "draft", dir: "out", text: draftOut }} checks={0} />
              ) : null}
              {submittedCopy && visible >= SCRIPT.length && checks >= 4 ? (
                <Bubble msg={{ id: "sub", dir: "in", text: submittedCopy }} checks={4} />
              ) : null}
              {approvedCopy ? <Bubble msg={{ id: "ok", dir: "in", text: approvedCopy }} checks={4} /> : null}
              {typing ? (
                <div className="flex w-12 gap-1 rounded-md rounded-tl-sm bg-surface px-2 py-1.5 shadow-xs">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-ink-400" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-ink-400 [animation-delay:120ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-ink-400 [animation-delay:240ms]" />
                </div>
              ) : null}
              <div ref={endRef} />
            </div>
          </div>
          <p className="mt-2.5 text-center text-[11px] text-forest-100/70">
            Simulated. Production uses WhatsApp Business API with the same flow definition.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button
              variant="accent"
              onClick={() => {
                reset();
                setMode("play");
              }}
            >
              Play demo
            </Button>
            <Button
              variant="darkGhost"
              onClick={() => {
                setMode("step");
                revealNext();
              }}
              disabled={pending}
            >
              Step
            </Button>
            <Button variant="darkGhost" onClick={reset}>
              Reset
            </Button>
          </div>
        </div>

        <aside className="hidden w-full max-w-md rounded-lg border border-forest-700 bg-forest-900 p-3 font-mono text-[11px] leading-relaxed text-forest-100 lg:block">
          <p className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-500">
            System view
          </p>
          {LOG.slice(0, logs).map((line) => (
            <p key={line} className="whitespace-pre">
              {line}
            </p>
          ))}
          {ref ? <p className="mt-3 text-lime-500">claim.ref {ref} · status QUEUED</p> : null}
        </aside>
      </div>
    </div>
  );
}

function Bubble({ msg, checks }: { msg: Msg; checks: number }) {
  const base =
    msg.dir === "out"
      ? "ml-auto bg-lime-100 text-forest-900 rounded-lg rounded-tr-sm"
      : "mr-auto bg-surface text-ink-900 rounded-lg rounded-tl-sm";
  if (msg.kind === "photo") {
    return (
      <div className={`max-w-[80%] overflow-hidden p-1 ${base}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mock/delivery-07.jpg"
          alt="Delivery evidence for WhatsApp demo"
          className="h-24 w-full rounded-md object-cover"
        />
        <p className="px-1.5 py-0.5 text-[8px] text-ink-400">11:04 ✓✓</p>
      </div>
    );
  }
  if (msg.kind === "location") {
    return (
      <div className={`max-w-[80%] p-1.5 ${base}`}>
        <p className="text-[11px]">Mukuru Phase 2 · −1.3089, 36.8726</p>
        <p className="text-[8px] text-ink-400">11:04 ✓✓</p>
      </div>
    );
  }
  if (msg.kind === "checks") {
    const items = [
      "Location matched: Mukuru Phase 2 (84 m)",
      "Photo timestamp valid",
      "Photo location matched device",
      "Quantity within contract balance",
    ];
    return (
      <div className={`max-w-[85%] p-2 ${base}`}>
        <p className="text-[11px]">⏳ Checking...</p>
        <ul className="mt-1.5 space-y-0.5 text-[11px]">
          {items.slice(0, checks).map((item) => (
            <li key={item} className="text-lime-700">
              ✓ {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className={`max-w-[85%] whitespace-pre-wrap p-2 text-[11px] leading-snug ${base}`}>
      {msg.text}
      <p className="mt-0.5 text-[8px] text-ink-400">11:04 {msg.dir === "out" ? "✓✓" : ""}</p>
    </div>
  );
}
