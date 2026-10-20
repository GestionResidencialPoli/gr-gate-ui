import { AuthenticatedShell } from "@/features/auth/authenticated-shell";
import { HistoricoList } from "@/features/porteria/historico-list";

export default function HistorialPage() {
  return (
    <AuthenticatedShell requiredRole="ADMINISTRACION">
      <div className="page-heading">
        <span className="gr-eyebrow">Portería</span>
        <h1>Histórico de ingresos</h1>
      </div>
      <HistoricoList />
    </AuthenticatedShell>
  );
}
