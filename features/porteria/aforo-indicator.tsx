import type { Aforo } from "@/lib/types";

export function AforoIndicator({
  aforo,
  actualizadoEn,
  enVivo,
}: {
  aforo: Aforo | null;
  actualizadoEn: Date | null;
  enVivo: boolean;
}) {
  if (!aforo) {
    return (
      <div className="gr-aforo gr-aforo--cargando">
        <strong>Cargando aforo…</strong>
      </div>
    );
  }

  const tono = aforo.estado === "COMPLETO" ? "completo" : aforo.estado === "POCOS_CUPOS" ? "pocos" : "ok";

  return (
    <div className={`gr-aforo gr-aforo--${tono}`}>
      <div>
        <strong>{aforo.disponibles}</strong>
        <span>de {aforo.total} cupos disponibles</span>
      </div>
      {aforo.estado === "COMPLETO" && <span className="gr-aforo-aviso">Aforo completo</span>}
      {aforo.estado === "POCOS_CUPOS" && <span className="gr-aforo-aviso">Quedan pocos cupos</span>}
      {!enVivo && actualizadoEn && (
        <span className="gr-aforo-marca">Último dato: {actualizadoEn.toLocaleTimeString("es-CO")}</span>
      )}
    </div>
  );
}
