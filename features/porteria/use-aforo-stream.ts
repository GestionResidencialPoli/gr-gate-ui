"use client";

import { useEffect, useRef, useState } from "react";
import { getAforo } from "@/lib/gate-client";
import type { Aforo } from "@/lib/types";

const POLL_MS_POR_DEFECTO = 10_000;

export function useAforoStream() {
  const [aforo, setAforo] = useState<Aforo | null>(null);
  const [actualizadoEn, setActualizadoEn] = useState<Date | null>(null);
  const [enVivo, setEnVivo] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    let active = true;
    let source: EventSource | undefined;

    function aplicar(data: Aforo) {
      if (!active) return;
      setAforo(data);
      setActualizadoEn(new Date());
    }

    function iniciarPolling(intervaloMs: number) {
      setEnVivo(false);
      clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        getAforo()
          .then(aplicar)
          .catch(() => undefined);
      }, intervaloMs);
    }

    try {
      source = new EventSource("/api/v1/porteria/eventos");

      source.addEventListener("aforo.actual", (event) => aplicar(JSON.parse((event as MessageEvent).data).aforo));
      source.addEventListener("aforo.actualizado", (event) =>
        aplicar(JSON.parse((event as MessageEvent).data).aforo),
      );
      source.addEventListener("tiempo-real-no-disponible", (event) => {
        const datos = JSON.parse((event as MessageEvent).data) as { reintentarEnMs?: number };
        iniciarPolling(datos.reintentarEnMs ?? POLL_MS_POR_DEFECTO);
      });
      source.onerror = () => iniciarPolling(POLL_MS_POR_DEFECTO);
      source.onopen = () => setEnVivo(true);
    } catch {
      iniciarPolling(POLL_MS_POR_DEFECTO);
    }

    getAforo()
      .then(aplicar)
      .catch(() => undefined);

    return () => {
      active = false;
      source?.close();
      clearInterval(pollRef.current);
    };
  }, []);

  return { aforo, actualizadoEn, enVivo };
}
