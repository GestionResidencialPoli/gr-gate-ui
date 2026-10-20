import { AuthenticatedShell } from "@/features/auth/authenticated-shell";
import { CuposManager } from "@/features/porteria/cupos-manager";

export default function CuposPage() {
  return (
    <AuthenticatedShell requiredRole="ADMINISTRACION">
      <div className="page-heading">
        <span className="gr-eyebrow">Portería</span>
        <h1>Cupos de parqueadero</h1>
      </div>
      <CuposManager />
    </AuthenticatedShell>
  );
}
