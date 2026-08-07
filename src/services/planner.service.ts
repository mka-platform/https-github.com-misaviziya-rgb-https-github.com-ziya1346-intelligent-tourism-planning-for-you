// Trip planner data access + AI streaming (Implements SRS-AI-01).
// NOTE (MOS-0300 TBD): direct Lovable Cloud client access pending repository layer decision.
import { supabase } from "@/integrations/supabase/client";

export interface ThreadRecord {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export const listThreads = async (): Promise<ThreadRecord[]> => {
  const { data, error } = await supabase
    .from("threads")
    .select("id, title, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
};

export const createThread = async (title: string): Promise<ThreadRecord> => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("You must be signed in to plan a trip");
  const { data, error } = await supabase
    .from("threads")
    .insert({ user_id: auth.user.id, title: title.slice(0, 80) })
    .select("id, title, created_at, updated_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteThread = async (threadId: string): Promise<void> => {
  const { error } = await supabase.from("threads").delete().eq("id", threadId);
  if (error) throw new Error(error.message);
};

export const listMessages = async (threadId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    role: row.role as ChatMessage["role"],
    content: row.content,
  }));
};

export const saveMessage = async (
  threadId: string,
  role: ChatMessage["role"],
  content: string,
): Promise<void> => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("You must be signed in");
  const { error } = await supabase
    .from("messages")
    .insert({ thread_id: threadId, user_id: auth.user.id, role, content });
  if (error) throw new Error(error.message);
  await supabase.from("threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
};

/** Streams an assistant reply, invoking `onDelta` for each token chunk. */
export const streamAssistantReply = async (
  messages: ChatMessage[],
  onDelta: (delta: string) => void,
): Promise<string> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  const response = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      messages: messages.map(({ role, content }) => ({ role, content })),
    }),
  });

  if (!response.ok || !response.body) {
    const payload = await response.json().catch(() => ({ error: "Assistant unavailable" }));
    throw new Error(payload.error ?? "Assistant unavailable");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) {
          full += delta;
          onDelta(delta);
        }
      } catch {
        // Ignore partial/keep-alive frames.
      }
    }
  }

  return full;
};
