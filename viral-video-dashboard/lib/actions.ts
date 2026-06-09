"use server";
import { revalidatePath } from "next/cache";
import { createDataClient } from "./supabase/data";
import { setPostStatus } from "./posts";

export async function approvePost(id: string): Promise<void> {
  await setPostStatus(createDataClient(), id, "approved");
  revalidatePath("/review");
}

export async function rejectPost(id: string): Promise<void> {
  await setPostStatus(createDataClient(), id, "rejected");
  revalidatePath("/review");
}

import { setSystemUserToken, connectBrandAccount, disconnectBrandAccount, parseAccountValue } from "./connections";
import { validateToken } from "./instagram";

export async function saveTokenAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "").trim();
  if (token && (await validateToken(token))) await setSystemUserToken(token);
  revalidatePath("/connections");
}

export async function connectBrandAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  const { igUserId, username } = parseAccountValue(String(formData.get("account") ?? ""));
  if (brandId && igUserId) await connectBrandAccount(brandId, igUserId, username);
  revalidatePath("/connections");
}

export async function disconnectBrandAction(formData: FormData): Promise<void> {
  const brandId = String(formData.get("brandId") ?? "");
  if (brandId) await disconnectBrandAccount(brandId);
  revalidatePath("/connections");
}
