import "server-only";
import { requireAppUser } from "@/features/auth/services/user";
import { getDashboardData } from "../repositories/dashboard";
export async function getDashboard() {
  return getDashboardData((await requireAppUser()).id);
}
