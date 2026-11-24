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
      <div className="page-heading">
        <h1>Portería</h1>
        <p>Registra ingresos y salidas y consulta las visitas que siguen en la unidad.</p>
      </div>
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
