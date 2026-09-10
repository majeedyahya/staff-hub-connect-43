import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { NamedCrud } from "@/components/CrudPage";
import { departmentsApi } from "@/lib/api/services";
import type { Department } from "@/types";

export const Route = createFileRoute("/admin/departments")({
  head: () => ({
    meta: [
      { title: "Departments — Northbeam Staff Information System" },
      {
        name: "description",
        content: "Create, rename and remove the departments staff portfolios are assigned to.",
      },
      { property: "og:title", content: "Departments — Northbeam" },
      { property: "og:description", content: "Manage the departments used across staff records." },
    ],
  }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  return (
    <AppShell title="Departments" requireAdmin>
      <NamedCrud<Department> api={departmentsApi} singular="Department" plural="Departments" />
    </AppShell>
  );
}
