import { EmptyState } from "@gestionresidencial/shared-ui";
import { AuthenticatedShell } from "@/features/auth/authenticated-shell";

export default function PorteriaPage() {
  return (
    <AuthenticatedShell>
      <EmptyState title="Portería" description="Próximamente." />
    </AuthenticatedShell>
  );
}
