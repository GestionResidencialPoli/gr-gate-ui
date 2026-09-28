"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Button,
  DOCUMENT_PATTERN,
  EmptyState,
  Skeleton,
  TextField,
  UNIT_CODE_PATTERN,
} from "@gestionresidencial/shared-ui";
import { listHistorico } from "@/lib/gate-client";
import type { PageResult, Visita } from "@/lib/types";

const PAGE_SIZE = 20;

type FiltrosHistorico = { desde?: string; hasta?: string; torre?: string; numero?: string; documento?: string };

export function HistoricoList() {
  const [filtros, setFiltros] = useState<FiltrosHistorico>({});
  return <HistoricoWindow key={JSON.stringify(filtros)} filtros={filtros} onFiltrar={setFiltros} />;
}

function HistoricoWindow({
  filtros,
  onFiltrar,
}: {
  filtros: FiltrosHistorico;
  onFiltrar: (filtros: FiltrosHistorico) => void;
}) {
  const [resultado, setResultado] = useState<PageResult<Visita> | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    listHistorico({ ...filtros, page: 0, size: PAGE_SIZE })
      .then((result) => {
        if (active) {
          setResultado(result);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  function aplicar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onFiltrar({
      desde: String(data.get("desde") || "") || undefined,
      hasta: String(data.get("hasta") || "") || undefined,
      torre: String(data.get("torre") || "").trim() || undefined,
      numero: String(data.get("numero") || "").trim() || undefined,
      documento: String(data.get("documento") || "").trim() || undefined,
    });
  }

  return (
    <div>
      <form className="gr-form gr-reserva-filtros" onSubmit={aplicar}>
        <TextField id="desde" name="desde" label="Desde" type="date" defaultValue={filtros.desde} />
        <TextField id="hasta" name="hasta" label="Hasta" type="date" defaultValue={filtros.hasta} />
        <TextField
          id="torre"
          name="torre"
          label="Torre"
          maxLength={20}
          pattern={UNIT_CODE_PATTERN}
          title="Letras, dígitos o guiones."
          defaultValue={filtros.torre}
        />
        <TextField
          id="numero"
          name="numero"
          label="Apartamento"
          maxLength={20}
          pattern={UNIT_CODE_PATTERN}
          title="Letras, dígitos o guiones."
          defaultValue={filtros.numero}
        />
        <TextField
          id="documento"
          name="documento"
          label="Documento"
          maxLength={30}
          pattern={DOCUMENT_PATTERN}
          title="Entre 4 y 30 letras, dígitos o guiones."
          defaultValue={filtros.documento}
        />
        <div className="gr-form-actions">
          <Button type="submit">Filtrar</Button>
        </div>
      </form>

      {status === "loading" && <Skeleton label="Cargando histórico" />}
      {status === "error" && (
        <EmptyState title="No pudimos cargar el histórico" description="Comprueba tu conexión e inténtalo de nuevo." />
      )}
      {status === "ready" && resultado && resultado.content.length === 0 && (
        <EmptyState title="No hay visitas con estos filtros" description="Ajusta los filtros e inténtalo de nuevo." />
      )}
      {status === "ready" && resultado && resultado.content.length > 0 && (
        <ul className="gr-reserva-list">
          {resultado.content.map((visita) => (
            <li key={visita.id} className="gr-reserva-item">
              <div>
                <strong>{visita.visitante.nombre}</strong>
                <span>
                  {visita.apartamento.torre} · {visita.apartamento.numero} — {visita.tipoVisita}
                </span>
                <span>
                  Entrada: {new Date(visita.entrada.en).toLocaleString("es-CO")} ({visita.entrada.vigilante.email})
                </span>
                <span>
                  {visita.salida
                    ? `Salida: ${new Date(visita.salida.en).toLocaleString("es-CO")} (${visita.salida.vigilante.email})`
                    : "Sin salida registrada"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
