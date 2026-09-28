"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, DOCUMENT_PATTERN, EmptyState, Skeleton, TextField } from "@gestionresidencial/shared-ui";
import { listVisitasAbiertas, registrarSalida } from "@/lib/gate-client";
import type { Aforo, Visita } from "@/lib/types";

export function VisitasAbiertasList({
  refreshToken,
  onSalidaRegistrada,
}: {
  refreshToken: number;
  onSalidaRegistrada: (aforo: Aforo) => void;
}) {
  const [documento, setDocumento] = useState("");
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pendingId, setPendingId] = useState<number>();

  useEffect(() => {
    let active = true;
    listVisitasAbiertas({ documento: documento || undefined })
      .then((result) => {
        if (active) {
          setVisitas(result);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [refreshToken]);

  function buscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    listVisitasAbiertas({ documento: documento || undefined })
      .then((result) => {
        setVisitas(result);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  async function salida(visita: Visita) {
    setPendingId(visita.id);
    try {
      const resultado = await registrarSalida(visita.id);
      setVisitas((previous) => previous.filter((item) => item.id !== visita.id));
      onSalidaRegistrada(resultado.aforo);
    } finally {
      setPendingId(undefined);
    }
  }

  return (
    <div className="gr-visitas-abiertas">
      <h2>Visitas abiertas</h2>
      <form className="gr-buscar-form" onSubmit={buscar}>
        <TextField
          id="buscar-documento"
          name="buscar-documento"
          label="Buscar por documento"
          maxLength={30}
          pattern={DOCUMENT_PATTERN}
          title="Entre 4 y 30 letras, dígitos o guiones."
          value={documento}
          onChange={(event) => setDocumento(event.currentTarget.value)}
        />
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {status === "loading" && <Skeleton label="Cargando visitas abiertas" />}
      {status === "error" && (
        <EmptyState title="No pudimos cargar las visitas" description="Comprueba tu conexión e inténtalo de nuevo." />
      )}
      {status === "ready" && visitas.length === 0 && <p>No hay visitas abiertas.</p>}
      {status === "ready" && visitas.length > 0 && (
        <ul className="gr-reserva-list">
          {visitas.map((visita) => (
            <li
              key={visita.id}
              className={`gr-reserva-item${visita.posibleOlvido ? " gr-visita-olvido" : ""}`}
            >
              <div>
                <strong>{visita.visitante.nombre}</strong>
                <span>
                  {visita.apartamento.torre} · {visita.apartamento.numero} — {visita.tipoVisita}
                  {visita.conVehiculo && ` · ${visita.placa ?? "con vehículo"}`}
                </span>
                <span>
                  Hace {visita.minutosDentro} min
                  {visita.posibleOlvido && " · posible olvido de salida"}
                </span>
              </div>
              <Button variant="secondary" disabled={pendingId === visita.id} onClick={() => salida(visita)}>
                Registrar salida
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
