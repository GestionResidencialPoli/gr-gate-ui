"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Button, Feedback, TextField } from "@gestionresidencial/shared-ui";
import { errorCode, errorDetails, errorMessage } from "@/lib/error-message";
import { findVisitante, registrarIngreso } from "@/lib/gate-client";
import type { Aforo, IngresoInput, TipoVisita, Visita } from "@/lib/types";
import { TIPOS_VISITA } from "@/lib/types";

const TIPO_LABELS: Record<TipoVisita, string> = {
  SOCIAL: "Social",
  DOMICILIO: "Domicilio",
  SERVICIO: "Servicio",
  OTRO: "Otro",
};

export function IngresoForm({
  onRegistrado,
}: {
  onRegistrado: (resultado: { visita: Visita; aforo: Aforo }) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [nombreConocido, setNombreConocido] = useState(false);
  const [conVehiculo, setConVehiculo] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [visitaAbiertaId, setVisitaAbiertaId] = useState<number>();
  const [puedeSinVehiculo, setPuedeSinVehiculo] = useState(false);
  const [ultimoInput, setUltimoInput] = useState<IngresoInput>();
  const [formKey, setFormKey] = useState(0);

  async function autocompletar(documento: string) {
    const valor = documento.trim();
    if (!valor) return;
    const visitante = await findVisitante(valor);
    if (visitante) {
      setNombre(visitante.nombre);
      setNombreConocido(true);
    } else {
      setNombre("");
      setNombreConocido(false);
    }
  }

  function limpiarYReenfocar() {
    setNombre("");
    setNombreConocido(false);
    setConVehiculo(false);
    setVisitaAbiertaId(undefined);
    setPuedeSinVehiculo(false);
    setUltimoInput(undefined);
    setFormKey((current) => current + 1);
  }

  async function enviar(input: IngresoInput) {
    setPending(true);
    setError(undefined);
    try {
      const resultado = await registrarIngreso(input);
      onRegistrado(resultado);
      limpiarYReenfocar();
    } catch (caughtError) {
      const code = errorCode(caughtError);
      if (code === "VISITA_ABIERTA") {
        const details = errorDetails(caughtError) ?? {};
        setVisitaAbiertaId(Number(details.visitaAbiertaId));
        setUltimoInput(input);
        setError(errorMessage(caughtError, "Este visitante ya tiene una visita abierta."));
        return;
      }
      if (code === "AFORO_COMPLETO") {
        setPuedeSinVehiculo(true);
        setUltimoInput(input);
        setError(errorMessage(caughtError, "No hay cupos disponibles."));
        return;
      }
      setError(errorMessage(caughtError, "No se pudo registrar el ingreso."));
    } finally {
      setPending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVisitaAbiertaId(undefined);
    setPuedeSinVehiculo(false);
    const data = new FormData(event.currentTarget);

    const input: IngresoInput = {
      documento: String(data.get("documento") || "").trim(),
      nombre: nombreConocido ? undefined : String(data.get("nombre") || "").trim() || undefined,
      torre: String(data.get("torre") || "").trim(),
      numero: String(data.get("numero") || "").trim(),
      tipoVisita: String(data.get("tipoVisita")) as TipoVisita,
      conVehiculo,
      placa: conVehiculo ? String(data.get("placa") || "").trim() || undefined : undefined,
      cerrarVisitaAnterior: false,
    };

    await enviar(input);
  }

  async function reenviarConCierre() {
    if (!ultimoInput) return;
    await enviar({ ...ultimoInput, cerrarVisitaAnterior: true });
  }

  async function reenviarSinVehiculo() {
    if (!ultimoInput) return;
    setConVehiculo(false);
    await enviar({ ...ultimoInput, conVehiculo: false, placa: undefined });
  }

  function onDocumentoKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void autocompletar(event.currentTarget.value);
    }
  }

  return (
    <form key={formKey} className="gr-form gr-ingreso-form" onSubmit={handleSubmit}>
      <TextField
        id="documento"
        name="documento"
        label="Documento"
        autoFocus
        required
        maxLength={30}
        disabled={pending}
        onBlur={(event) => autocompletar(event.currentTarget.value)}
        onKeyDown={onDocumentoKeyDown}
      />
      <TextField
        id="nombre"
        name="nombre"
        label={nombreConocido ? "Nombre (autocompletado)" : "Nombre"}
        value={nombre}
        onChange={(event) => setNombre(event.currentTarget.value)}
        required
        maxLength={150}
        disabled={pending}
        readOnly={nombreConocido}
      />
      <div className="gr-ingreso-fila">
        <TextField id="torre" name="torre" label="Torre" required maxLength={20} disabled={pending} />
        <TextField id="numero" name="numero" label="Apartamento" required maxLength={20} disabled={pending} />
      </div>
      <div className="gr-field">
        <label htmlFor="tipoVisita">Tipo de visita</label>
        <select id="tipoVisita" name="tipoVisita" defaultValue="SOCIAL" disabled={pending}>
          {TIPOS_VISITA.map((tipo) => (
            <option key={tipo} value={tipo}>
              {TIPO_LABELS[tipo]}
            </option>
          ))}
        </select>
      </div>
      <label className="gr-checkbox">
        <input
          type="checkbox"
          checked={conVehiculo}
          onChange={(event) => setConVehiculo(event.currentTarget.checked)}
          disabled={pending}
        />
        Llega en vehículo
      </label>
      {conVehiculo && (
        <TextField id="placa" name="placa" label="Placa" maxLength={10} disabled={pending} />
      )}

      {error && <Feedback error>{error}</Feedback>}

      {visitaAbiertaId !== undefined && (
        <div className="gr-form-actions">
          <Button type="button" disabled={pending} onClick={reenviarConCierre}>
            Cerrar visita anterior y registrar
          </Button>
        </div>
      )}
      {puedeSinVehiculo && (
        <div className="gr-form-actions">
          <Button type="button" disabled={pending} onClick={reenviarSinVehiculo}>
            Registrar sin vehículo
          </Button>
        </div>
      )}

      <div className="gr-form-actions">
        <Button type="submit" disabled={pending}>
          {pending ? "Registrando…" : "Registrar ingreso"}
        </Button>
      </div>
    </form>
  );
}
