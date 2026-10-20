import { AuthenticatedShell } from "@/features/auth/authenticated-shell";
import { PorteriaScreen } from "@/features/porteria/porteria-screen";

export default function PorteriaPage() {
  return (
    <AuthenticatedShell>
      <PorteriaScreen />
    </AuthenticatedShell>
  );
}
