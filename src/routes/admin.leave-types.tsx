import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { NamedCrud } from "@/components/CrudPage";
import { leaveTypesApi } from "@/lib/api/services";
import type { LeaveType } from "@/types";

export const Route = createFileRoute("/admin/leave-types")({
  head: () => ({
    meta: [
      { title: "Leave types — Northbeam Staff Information System" },
      {
        name: "description",
        content: "Configure the leave categories staff can choose when requesting time off.",
      },
      { property: "og:title", content: "Leave types — Northbeam" },
      {
        property: "og:description",
        content: "Configure the leave categories available to staff.",
      },
    ],
  }),
  component: LeaveTypesPage,
});

function LeaveTypesPage() {
  return (
    <AppShell title="Leave types" requireAdmin>
      <NamedCrud<LeaveType> api={leaveTypesApi} singular="Leave type" plural="Leave types" />
    </AppShell>
  );
}
