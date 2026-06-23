"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { C } from "../lib/brand";

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url || "";
  }
}

export function useLinkPreview(link) {
  const url = link?.url || "";
  const manualImage = link?.previewImage || "";
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    let cancelled = false;
    setData(null);

    if (!url || manualImage) {
      setStatus(manualImage ? "manual" : "idle");
      return () => { cancelled = true; };
    }

    setStatus("loading");
    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (cancelled) return;
        setData(payload || null);
        setStatus(payload?.image ? "ready" : "empty");
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
        setStatus("error");
      });

    return () => { cancelled = true; };
  }, [url, manualImage]);

  const domain = useMemo(() => data?.domain || getDomain(url), [data?.domain, url]);
  return {
    title: link?.title || data?.title || "Pixieset Gallery",
    image: manualImage || data?.image || "",
    domain,
    status,
  };
}

export function LinkPreviewCard({ link, fallbackTitle = "Pixieset Gallery", helperText = "Open Graph preview will be used when available." }) {
  const preview = useLinkPreview(link);
  const title = preview.title || fallbackTitle;
  const url = link?.url || "#";

  return (
    <a href={url} target="_blank" rel="noreferrer" className="block rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
      <div className="aspect-[16/9] flex items-center justify-center" style={{ background: preview.image ? "#fff" : C.bg }}>
        {preview.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-6" style={{ background: `linear-gradient(135deg, ${C.cream}, ${C.bg})` }}>
            <ImageIcon size={30} color={C.taupe} />
            <p className="ecc-display text-2xl mt-3" style={{ color: C.ink }}>{title}</p>
            <p className="text-xs mt-1 max-w-xs" style={{ color: C.taupe }}>
              {preview.status === "loading" ? "Looking for the link preview image..." : helperText}
            </p>
          </div>
        )}
      </div>
      <div className="p-3" style={{ background: "#fff" }}>
        <p className="text-sm font-medium" style={{ color: C.ink }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: C.taupe }}>{preview.domain}</p>
      </div>
    </a>
  );
}
