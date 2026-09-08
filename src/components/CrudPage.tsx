import { useEffect, useState } from "react";
import { Button, Card, EmptyRow, Field, Input, Modal, Textarea } from "@/components/ui/primitives";

interface NamedRecord {
  id: number;
  name: string;
  description: string;
}

interface Api<T> {
  list: () => Promise<T[]>;
  create: (data: Omit<T, "id">) => Promise<T>;
  update: (id: number, data: Partial<T>) => Promise<T>;
  remove: (id: number) => Promise<void>;
}

/** Reusable name/description CRUD table used for Departments, Roles and Leave types. */
export function NamedCrud<T extends NamedRecord>({
  api,
  singular,
  plural,
}: {
  api: Api<T>;
  singular: string;
  plural: string;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [saving, setSaving] = useState(false);

  const load = () =>
    api
      .list()
      .then((data) => setItems([...data]))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "" });
    setErrors({});
    setOpen(true);
  }

  function openEdit(item: T) {
    setEditing(item);
    setForm({ name: item.name, description: item.description });
    setErrors({});
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (form.name.trim().length < 2) next.name = "Name must be at least 2 characters.";
    if (form.description.trim().length < 4) next.description = "Add a short description.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      if (editing) await api.update(editing.id, form as Partial<T>);
      else await api.create(form as unknown as Omit<T, "id">);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function destroy(item: T) {
    if (!window.confirm(`Delete ${singular.toLowerCase()} “${item.name}”?`)) return;
    await api.remove(item.id);
    await load();
  }

  return (
    <>
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-base font-semibold">{plural}</h2>
        <Button variant="ink" size="sm" onClick={openCreate}>
          + New {singular.toLowerCase()}
        </Button>
      </div>

      <Card className="p-0">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.12em] text-ink/40">
            <tr className="border-b border-white/60">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={3} label="Loading…" />
            ) : items.length === 0 ? (
              <EmptyRow colSpan={3} label={`No ${plural.toLowerCase()} yet.`} />
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-white/50 last:border-0">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-ink/60">{item.description}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                        Edit
                      </Button>
                      <Button variant="bad" size="sm" onClick={() => void destroy(item)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        open={open}
        title={`${editing ? "Edit" : "New"} ${singular.toLowerCase()}`}
        onClose={() => setOpen(false)}
      >
        <form className="space-y-3" onSubmit={submit}>
          <Field label="Name" error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={`${singular} name`}
            />
          </Field>
          <Field label="Description" error={errors.description}>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What this is used for"
            />
          </Field>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
