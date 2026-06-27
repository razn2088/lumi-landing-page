"use server";
import { revalidatePath } from "next/cache";
import { createDataClient } from "./supabase/data";
import { setPostStatus } from "./posts";

export async function rejectPost(id: string): Promise<void> {
  await setPostStatus(createDataClient(), id, "rejected");
  revalidatePath("/review");
}

import { setSystemUserToken, connectBrandAccount, disconnectBrandAccount, parseAccountValue } from "./connections";
import {
  validateBrandInput, deriveWpApiBase, wordpressReachable,
  createBrand, setBrandActive, deleteBrand,
} from "./brands-admin";
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

import { parseSelectedIds, enqueueGenerateJobs, setApproval } from "./jobs";

export async function createVideosAction(formData: FormData): Promise<void> {
  await enqueueGenerateJobs(parseSelectedIds(formData));
  const brandId = String(formData.get("brandId") ?? "");
  revalidatePath("/articles");
  redirect(brandId ? `/articles?brand=${brandId}&filter=in_progress` : "/articles?filter=in_progress");
}

export async function approveWithScheduleAction(formData: FormData): Promise<void> {
  const id = String(formData.get("postId") ?? "");
  const raw = String(formData.get("publishAt") ?? "").trim();
  const publishAtIso = raw ? new Date(raw).toISOString() : null;
  if (id) await setApproval(id, publishAtIso);
  revalidatePath("/review");
}

export async function reschedulePublishAction(formData: FormData): Promise<void> {
  const id = String(formData.get("postId") ?? "");
  const raw = String(formData.get("publishAt") ?? "").trim();
  if (id) await setApproval(id, raw ? new Date(raw).toISOString() : null);
  revalidatePath("/review");
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GATE_COOKIE, gateToken, sha256Hex, timingSafeEqual } from "./gate";

export async function createBrandAction(formData: FormData): Promise<void> {
  const input = {
    name: String(formData.get("name") ?? ""),
    siteUrl: String(formData.get("siteUrl") ?? ""),
    niche: String(formData.get("niche") ?? ""),
    tone: String(formData.get("tone") ?? ""),
    brandColor: String(formData.get("brandColor") ?? "#ffd60a"),
    useFeaturedImageBeat: formData.get("useFeaturedImageBeat") === "on",
  };
  const err = validateBrandInput(input);
  if (err) redirect(`/connections?error=${encodeURIComponent(err.message)}`);
  if (!(await wordpressReachable(deriveWpApiBase(input.siteUrl)))) {
    redirect(`/connections?error=${encodeURIComponent("Couldn't reach this site's WordPress API — check the URL.")}`);
  }
  await createBrand(input);
  revalidatePath("/connections");
  redirect("/connections");
}

export async function deleteBrandAction(formData: FormData): Promise<void> {
  const id = String(formData.get("brandId") ?? "");
  if (id) await deleteBrand(id);
  revalidatePath("/connections");
  redirect("/connections");
}

export async function deactivateBrandAction(formData: FormData): Promise<void> {
  const id = String(formData.get("brandId") ?? "");
  if (id) await setBrandActive(id, false);
  revalidatePath("/connections");
  redirect("/connections");
}

export async function activateBrandAction(formData: FormData): Promise<void> {
  const id = String(formData.get("brandId") ?? "");
  if (id) await setBrandActive(id, true);
  revalidatePath("/connections");
  redirect("/connections");
}

export async function gateLoginAction(formData: FormData): Promise<void> {
  const password = process.env.DASHBOARD_PASSWORD ?? "";
  const submitted = String(formData.get("password") ?? "");
  // Hash both sides so the constant-time compare never leaks the password length.
  const ok = password.length > 0 && timingSafeEqual(await sha256Hex(submitted), await sha256Hex(password));
  if (!ok) redirect("/gate?error=1");
  (await cookies()).set(GATE_COOKIE, await gateToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}
