import { ApiError, USE_MOCK_API, apiFetch } from "./client";
import { nextId, readDb, writeDb } from "./mock-db";
import type {
  AuthTokens,
  Department,
  LeaveType,
  Portfolio,
  Role,
  StaffLeave,
  User,
} from "@/types";

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

function fakeToken(payload: Record<string, unknown>) {
  const body =
    typeof window === "undefined"
      ? ""
      : window.btoa(JSON.stringify({ ...payload, exp: Date.now() + 3600_000 }));
  return `mock.${body}.signature`;
}

/* ------------------------------- auth ---------------------------------- */

export interface RegisterPayload {
  username: string;
  fullname: string;
  gender: User["gender"];
  phone_number: string;
  password: string;
}

export const authApi = {
  async login(username: string, password: string): Promise<AuthTokens & { user: User }> {
    if (!USE_MOCK_API) {
      return apiFetch("/token/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
    }
    await delay();
    const db = readDb();
    const found = db.users.find((u) => u.username === username);
    if (!found || found.password !== password) throw new ApiError("Invalid username or password", 401);
    if (found.status === "pending") throw new ApiError("Your account is awaiting admin approval", 403);
    if (found.status === "rejected") throw new ApiError("Your registration was rejected", 403);
    if (found.status === "inactive") throw new ApiError("This account is inactive", 403);
    const { password: _pw, ...user } = found;
    return { access: fakeToken({ sub: user.id }), refresh: fakeToken({ sub: user.id }), user };
  },

  async register(payload: RegisterPayload): Promise<User> {
    if (!USE_MOCK_API) {
      return apiFetch("/register/", { method: "POST", body: JSON.stringify(payload) });
    }
    await delay();
    const db = readDb();
    if (db.users.some((u) => u.username === payload.username)) {
      throw new ApiError("That username is already taken", 400);
    }
    const user = {
      ...payload,
      id: nextId(db),
      role: "staff" as const,
      status: "pending" as const,
      created_at: new Date().toISOString().slice(0, 10),
    };
    db.users.push(user);
    writeDb(db);
    const { password: _pw, ...rest } = user;
    return rest;
  },

  async me(userId: number): Promise<User> {
    if (!USE_MOCK_API) return apiFetch("/me/");
    await delay(60);
    const db = readDb();
    const found = db.users.find((u) => u.id === userId);
    if (!found) throw new ApiError("Session user not found", 404);
    const { password: _pw, ...user } = found;
    return user;
  },
};

/* ----------------------------- generic CRUD ----------------------------- */

function crud<T extends { id: number }>(
  path: string,
  key: "departments" | "roles" | "leaveTypes" | "portfolios" | "leaves",
) {
  return {
    async list(): Promise<T[]> {
      if (!USE_MOCK_API) return apiFetch(`/${path}/`);
      await delay(120);
      return readDb()[key] as unknown as T[];
    },
    async create(data: Omit<T, "id">): Promise<T> {
      if (!USE_MOCK_API)
        return apiFetch(`/${path}/`, { method: "POST", body: JSON.stringify(data) });
      await delay();
      const db = readDb();
      const item = { ...(data as object), id: nextId(db) } as T;
      (db[key] as unknown as T[]).push(item);
      writeDb(db);
      return item;
    },
    async update(id: number, data: Partial<T>): Promise<T> {
      if (!USE_MOCK_API)
        return apiFetch(`/${path}/${id}/`, { method: "PATCH", body: JSON.stringify(data) });
      await delay();
      const db = readDb();
      const list = db[key] as unknown as T[];
      const idx = list.findIndex((i) => i.id === id);
      if (idx < 0) throw new ApiError("Record not found", 404);
      const updated = { ...list[idx], ...data } as T;
      list[idx] = updated;
      writeDb(db);
      return updated;
    },
    async remove(id: number): Promise<void> {
      if (!USE_MOCK_API) {
        await apiFetch(`/${path}/${id}/`, { method: "DELETE" });
        return;
      }
      await delay();
      const db = readDb();
      const list = db[key] as unknown as T[];
      const idx = list.findIndex((i) => i.id === id);
      if (idx >= 0) list.splice(idx, 1);
      writeDb(db);
    },
  };
}

export const departmentsApi = crud<Department>("departments", "departments");
export const rolesApi = crud<Role>("roles", "roles");
export const leaveTypesApi = crud<LeaveType>("leave-types", "leaveTypes");
export const portfoliosApi = crud<Portfolio>("portfolios", "portfolios");
export const leavesApi = {
  ...crud<StaffLeave>("staff-leaves", "leaves"),
  async setStatus(id: number, status: StaffLeave["status"]) {
    return leavesApi.update(id, { status });
  },
};

export const usersApi = {
  async list(): Promise<User[]> {
    if (!USE_MOCK_API) return apiFetch("/users/");
    await delay(120);
    return readDb().users.map(({ password: _pw, ...u }) => u);
  },
  async create(data: Omit<User, "id" | "created_at"> & { password: string }): Promise<User> {
    if (!USE_MOCK_API) return apiFetch("/users/", { method: "POST", body: JSON.stringify(data) });
    await delay();
    const db = readDb();
    const user = { ...data, id: nextId(db), created_at: new Date().toISOString().slice(0, 10) };
    db.users.push(user);
    writeDb(db);
    const { password: _pw, ...rest } = user;
    return rest;
  },
  async update(id: number, data: Partial<User> & { password?: string }): Promise<User> {
    if (!USE_MOCK_API)
      return apiFetch(`/users/${id}/`, { method: "PATCH", body: JSON.stringify(data) });
    await delay();
    const db = readDb();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx < 0) throw new ApiError("User not found", 404);
    if (!data.password) delete data.password;
    db.users[idx] = { ...db.users[idx], ...data } as (typeof db.users)[number];
    writeDb(db);
    const { password: _pw, ...rest } = db.users[idx];
    return rest;
  },
  async remove(id: number): Promise<void> {
    if (!USE_MOCK_API) {
      await apiFetch(`/users/${id}/`, { method: "DELETE" });
      return;
    }
    await delay();
    const db = readDb();
    db.users = db.users.filter((u) => u.id !== id);
    db.portfolios = db.portfolios.filter((p) => p.user !== id);
    db.leaves = db.leaves.filter((l) => l.user !== id);
    writeDb(db);
  },
  async decide(id: number, decision: "approve" | "reject"): Promise<User> {
    if (!USE_MOCK_API)
      return apiFetch(`/users/${id}/${decision}/`, { method: "POST", body: "{}" });
    return usersApi.update(id, { status: decision === "approve" ? "active" : "rejected" });
  },
};

export function businessDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(+s) || Number.isNaN(+e) || e < s) return 0;
  let days = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) days += 1;
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}
