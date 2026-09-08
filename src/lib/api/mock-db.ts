import type {
  Department,
  LeaveType,
  Portfolio,
  Role,
  StaffLeave,
  User,
} from "@/types";

export interface DbShape {
  users: (User & { password: string })[];
  departments: Department[];
  roles: Role[];
  leaveTypes: LeaveType[];
  portfolios: Portfolio[];
  leaves: StaffLeave[];
  seq: number;
}

const STORAGE_KEY = "sis.db.v1";

function seed(): DbShape {
  return {
    seq: 100,
    users: [
      {
        id: 1,
        username: "admin",
        fullname: "Ava Osei",
        gender: "female",
        phone_number: "+254 700 100 100",
        role: "admin",
        status: "active",
        password: "admin123",
        created_at: "2026-01-04",
      },
      {
        id: 2,
        username: "dcho",
        fullname: "Daniel Cho",
        gender: "male",
        phone_number: "+254 700 200 200",
        role: "staff",
        status: "active",
        password: "staff123",
        created_at: "2026-01-11",
      },
      {
        id: 3,
        username: "smarin",
        fullname: "Sofia Marín",
        gender: "female",
        phone_number: "+254 700 300 300",
        role: "staff",
        status: "pending",
        password: "staff123",
        created_at: "2026-02-02",
      },
      {
        id: 4,
        username: "kwatanabe",
        fullname: "Kenji Watanabe",
        gender: "male",
        phone_number: "+254 700 400 400",
        role: "staff",
        status: "inactive",
        password: "staff123",
        created_at: "2025-11-20",
      },
      {
        id: 5,
        username: "mhale",
        fullname: "Marcus Hale",
        gender: "male",
        phone_number: "+254 700 500 500",
        role: "staff",
        status: "pending",
        password: "staff123",
        created_at: "2026-02-14",
      },
      {
        id: 6,
        username: "pnair",
        fullname: "Priya Nair",
        gender: "female",
        phone_number: "+254 700 600 600",
        role: "staff",
        status: "pending",
        password: "staff123",
        created_at: "2026-02-18",
      },
    ],
    departments: [
      { id: 1, name: "Platform", description: "Core services and infrastructure" },
      { id: 2, name: "Growth", description: "Marketing, design and acquisition" },
      { id: 3, name: "Insights", description: "Data engineering and analytics" },
      { id: 4, name: "People Ops", description: "HR, hiring and staff welfare" },
    ],
    roles: [
      { id: 1, name: "Backend Engineer", description: "Builds APIs and services" },
      { id: 2, name: "Frontend Engineer", description: "Builds user interfaces" },
      { id: 3, name: "Design Lead", description: "Owns product design" },
      { id: 4, name: "Data Analyst", description: "Reporting and insights" },
      { id: 5, name: "Ops Manager", description: "Operations and coordination" },
    ],
    leaveTypes: [
      { id: 1, name: "Annual leave", description: "Paid yearly time off" },
      { id: 2, name: "Sick leave", description: "Medical absence" },
      { id: 3, name: "Compassionate leave", description: "Family emergencies" },
      { id: 4, name: "Unpaid leave", description: "Approved unpaid absence" },
    ],
    portfolios: [
      {
        id: 1,
        user: 2,
        role: 1,
        department: 1,
        image: "",
        address: "14 Harbour Way, Mombasa",
        linkedin: "https://linkedin.com/in/danielcho",
      },
      {
        id: 2,
        user: 4,
        role: 5,
        department: 3,
        image: "",
        address: "8 Riverside Drive, Nairobi",
        linkedin: "https://linkedin.com/in/kenjiwatanabe",
      },
    ],
    leaves: [
      {
        id: 1,
        user: 2,
        leave_type: 1,
        start_date: "2026-03-18",
        end_date: "2026-03-22",
        reason: "Family trip — pre-booked",
        days: 5,
        status: "pending",
      },
      {
        id: 2,
        user: 4,
        leave_type: 2,
        start_date: "2026-02-10",
        end_date: "2026-02-12",
        reason: "Flu recovery",
        days: 3,
        status: "approved",
      },
    ],
  };
}

let cache: DbShape | null = null;

export function readDb(): DbShape {
  if (cache) return cache;
  if (typeof window === "undefined") {
    cache = seed();
    return cache;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  cache = raw ? (JSON.parse(raw) as DbShape) : seed();
  return cache;
}

export function writeDb(db: DbShape) {
  cache = db;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
}

export function nextId(db: DbShape) {
  db.seq += 1;
  return db.seq;
}

export function resetDb() {
  cache = seed();
  writeDb(cache);
}
