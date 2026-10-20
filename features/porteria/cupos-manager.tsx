"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, EmptyState, Feedback, Skeleton, TextField } from "@gestionresidencial/shared-ui";
import { errorMessage } from "@/lib/error-message";
import { getAforo, listCambiosAforo, setAforoTotal } from "@/lib/gate-client";
import type { Aforo, CambioAforo, PageResult } from "@/lib/types";

export function CuposManager() {
  const [aforo, setAforo] = useState<Aforo | null>(null);
  const [cambios, setCambios] = useState<PageResult<CambioAforo> | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    Promise.all([getAforo(), listCambiosAforo(0, 20)])
      .then(([aforoResult, cambiosResult]) => {
        if (!active) return;
        setAforo(aforoResult);
        setCambios(cambiosResult);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const total = Number(new FormData(event.currentTarget).get("total"));

    try {
      const actualizado = await setAforoTotal(total);
      setAforo(actualizado);
      const cambiosActualizados = await listCambiosAforo(0, 20);
      setCambios(cambiosActualizados);
    } catch (caughtError) {
      setError(errorMessage(caughtError, "No se pudo guardar el total de cupos."));
    } finally {
      setPending(false);
    }
  }

  if (status === "loading") return <Skeleton label="Cargando cupos" />;

  if (status === "error" || !aforo) {
    return <EmptyState title="No pudimos cargar los cupos" description="Comprueba tu conexión e inténtalo de nuevo." />;
  }

  return (
    <div className="gr-cupos">
      <section>
        <h2>Total de cupos</h2>
        <p>
          Actualmente hay {aforo.ocupados} vehículo(s) de visitantes dentro. Reducir el total por debajo de esa
          cifra no expulsa a nadie: solo bloquea nuevos ingresos con vehículo hasta que el conteo baje.
        </p>
        <form className="gr-form" onSubmit={guardar}>
          <TextField
            id="total"
            name="total"
            label="Total de cupos"
            type="number"
            min={1}
            max={10000}
            defaultValue={aforo.total}
            required
            disabled={pending}
          />
          {error && <Feedback error>{error}</Feedback>}
          <div className="gr-form-actions">
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </section>

      <section>
        <h2>Histórico de cambios</h2>
        {!cambios || cambios.content.length === 0 ? (
          <p>No hay cambios registrados.</p>
        ) : (
          <ul className="gr-reserva-list">
            {cambios.content.map((cambio) => (
              <li key={cambio.id} className="gr-reserva-item">
                <div>
                  <strong>
                    {cambio.totalAnterior} → {cambio.totalNuevo}
                  </strong>
                  <span>
                    {cambio.cambiadoPor.email} · {new Date(cambio.cambiadoEn).toLocaleString("es-CO")}
                  </span>
                  <span>Ocupados en el momento del cambio: {cambio.ocupadosEnElCambio}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
