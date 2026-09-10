import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { NamedCrud } from "@/components/CrudPage";
import { rolesApi } from "@/lib/api/services";
import type { Role } from "@/types";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({
    meta: [
      { title: "Roles — Northbeam Staff Information System" },
      {
        name: "description",
        content: "Define the job roles that staff members can be assigned in their portfolios.",
      },
      { property: "og:title", content: "Roles — Northbeam" },
      { property: "og:description", content: "Define the job roles used across staff portfolios." },
    ],
  }),
  component: RolesPage,
});

function RolesPage() {
  return (
    <AppShell title="Roles" requireAdmin>
      <NamedCrud<Role> api={rolesApi} singular="Role" plural="Roles" />
    </AppShell>
  );
}
