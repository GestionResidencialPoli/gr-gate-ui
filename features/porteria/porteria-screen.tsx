"use client";

import { useState } from "react";
import { AforoIndicator } from "./aforo-indicator";
import { IngresoForm } from "./ingreso-form";
import { useAforoStream } from "./use-aforo-stream";
import { VisitasAbiertasList } from "./visitas-abiertas-list";

export function PorteriaScreen() {
  const { aforo, actualizadoEn, enVivo } = useAforoStream();
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="gr-porteria">
      <AforoIndicator aforo={aforo} actualizadoEn={actualizadoEn} enVivo={enVivo} />
      <div className="gr-porteria-grid">
        <IngresoForm onRegistrado={() => setRefreshToken((current) => current + 1)} />
        <VisitasAbiertasList
          refreshToken={refreshToken}
          onSalidaRegistrada={() => setRefreshToken((current) => current + 1)}
        />
      </div>
    </div>
  );
}
