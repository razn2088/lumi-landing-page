"use server";
import { revalidatePath } from "next/cache";
import { createDataClient } from "./supabase/data.js";
import { setPostStatus } from "./posts.js";

export async function approvePost(id: string): Promise<void> {
  await setPostStatus(createDataClient(), id, "approved");
  revalidatePath("/review");
}

export async function rejectPost(id: string): Promise<void> {
  await setPostStatus(createDataClient(), id, "rejected");
  revalidatePath("/review");
}
