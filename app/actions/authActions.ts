"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutUsuario() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: "session", path: "/" });
  cookieStore.delete({ name: "drink_tonk_session", path: "/" });
  cookieStore.delete({ name: "drink_tonk_role", path: "/" });
  redirect("/login");
}