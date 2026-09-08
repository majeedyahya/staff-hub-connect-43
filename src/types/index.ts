export type UserRole = "admin" | "staff";
export type UserStatus = "active" | "inactive" | "pending" | "rejected";
export type Gender = "male" | "female" | "other";
export type LeaveStatus = "pending" | "approved" | "rejected";

export interface User {
  id: number;
  username: string;
  fullname: string;
  gender: Gender;
  phone_number: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface LeaveType {
  id: number;
  name: string;
  description: string;
}

export interface Portfolio {
  id: number;
  user: number;
  role: number;
  department: number;
  image: string;
  address: string;
  linkedin: string;
}

export interface StaffLeave {
  id: number;
  user: number;
  leave_type: number;
  start_date: string;
  end_date: string;
  reason: string;
  days: number;
  status: LeaveStatus;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
