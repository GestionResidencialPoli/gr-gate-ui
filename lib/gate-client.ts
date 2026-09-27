import { apiFetch } from "@gestionresidencial/auth-client";
import type { Aforo, CambioAforo, IngresoInput, PageResult, Visita, Visitante } from "./types";

const BASE_PATH = "/api/v1/porteria";

function query(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export async function getAforo(): Promise<Aforo> {
  const { payload } = await apiFetch<{ payload: Aforo }>(`${BASE_PATH}/aforo`);
  return payload;
}

export async function setAforoTotal(total: number): Promise<Aforo> {
  const { payload } = await apiFetch<{ payload: Aforo }>(`${BASE_PATH}/aforo/total`, {
    method: "PUT",
    body: { total },
  });
  return payload;
}

export async function listCambiosAforo(page = 0, size = 20): Promise<PageResult<CambioAforo>> {
  const { payload } = await apiFetch<{ payload: PageResult<CambioAforo> }>(
    `${BASE_PATH}/aforo/cambios${query({ page, size })}`,
  );
  return payload;
}

export async function registrarIngreso(input: IngresoInput): Promise<{ visita: Visita; aforo: Aforo }> {
  const { payload } = await apiFetch<{ payload: { visita: Visita; aforo: Aforo } }>(`${BASE_PATH}/visitas`, {
    method: "POST",
    body: input,
  });
  return payload;
}

export async function registrarSalida(id: number): Promise<{ visita: Visita; aforo: Aforo }> {
  const { payload } = await apiFetch<{ payload: { visita: Visita; aforo: Aforo } }>(
    `${BASE_PATH}/visitas/${id}/salida`,
    { method: "PATCH" },
  );
  return payload;
}

export async function listVisitasAbiertas(params: {
  documento?: string;
  torre?: string;
  numero?: string;
  conVehiculo?: boolean;
}): Promise<Visita[]> {
  const { payload } = await apiFetch<{ payload: Visita[] }>(`${BASE_PATH}/visitas/abiertas${query(params)}`);
  return payload;
}

export async function listHistorico(params: {
  desde?: string;
  hasta?: string;
  torre?: string;
  numero?: string;
  documento?: string;
  page?: number;
  size?: number;
}): Promise<PageResult<Visita>> {
  const { payload } = await apiFetch<{ payload: PageResult<Visita> }>(`${BASE_PATH}/visitas${query(params)}`);
  return payload;
}

export async function findVisitante(documento: string): Promise<Visitante | null> {
  try {
    const { payload } = await apiFetch<{ payload: Visitante }>(
      `${BASE_PATH}/visitantes/${encodeURIComponent(documento)}`,
    );
    return payload;
  } catch {
    return null;
  }
}
