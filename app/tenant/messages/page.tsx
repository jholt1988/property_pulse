"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api";

const list = (d: any) => (Array.isArray(d) ? d : d?.data || d?.items || d?.messages || d?.conversations || []);

export default function TenantMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const token = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )session_token=([^;]+)/)?.[1] : undefined;

  const fetchMessages = async (conversationId: number) => {
    const d = await apiClient<any>(`/messaging/conversations/${conversationId}/messages`, { method: "GET", ...(token ? { token } : {}) });
    setMessages(list(d));
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await apiClient<any>("/messaging/conversations", { method: "GET", ...(token ? { token } : {}) });
        const c = list(d);
        setConversations(c);
        if (c[0]) {
          setSelected(c[0]);
          await fetchMessages(c[0].id);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const title = useMemo(() => {
    if (!selected) return "Conversation";
    return selected.title || selected.subject || `Conversation #${selected.id}`;
  }, [selected]);

  const send = async () => {
    if (!selected || !newMessage.trim()) return;
    setSending(true);
    setError(null);
    try {
      await apiClient("/messaging/messages", {
        method: "POST",
        ...(token ? { token } : {}),
        body: JSON.stringify({ conversationId: selected.id, content: newMessage.trim() }),
      });
      setNewMessage("");
      await fetchMessages(selected.id);
    } catch (e: any) {
      setError(e?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <main className="p-6">Loading conversations...</main>;

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Messaging Inbox</h1>
        <p className="text-sm text-gray-500">Chat with staff and track conversation updates.</p>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_2fr]">
        <aside className="rounded border">
          <h2 className="border-b px-4 py-3 text-sm font-medium">Conversations</h2>
          <ul className="max-h-[32rem] divide-y overflow-y-auto">
            {conversations.length === 0 ? <li className="p-4 text-sm text-gray-500">No conversations yet.</li> : conversations.map((c) => (
              <li key={c.id}>
                <button className={`w-full px-4 py-3 text-left text-sm ${selected?.id === c.id ? "bg-gray-100" : "hover:bg-gray-50"}`} onClick={async () => { setSelected(c); await fetchMessages(c.id); }}>
                  <p className="font-medium">{c.title || c.subject || `Conversation #${c.id}`}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{c.lastMessage?.content || c.preview || "No messages yet."}</p>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex min-h-[32rem] flex-col rounded border">
          {selected ? (
            <>
              <h2 className="border-b px-4 py-3 text-lg font-medium">{title}</h2>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 ? <p className="text-sm text-gray-500">No messages yet.</p> : messages.map((m) => (
                  <article key={m.id || `${m.createdAt}-${m.content}`} className="rounded border bg-gray-50 p-3 text-sm">
                    <p className="font-medium">{m.author?.username || m.author?.name || m.sender?.username || "User"}</p>
                    <p className="mt-1 whitespace-pre-wrap">{m.content}</p>
                    <p className="mt-1 text-xs text-gray-500">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}</p>
                  </article>
                ))}
              </div>
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <textarea className="min-h-[64px] flex-1 rounded border px-3 py-2 text-sm" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Write a message..." />
                  <button className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50" disabled={sending || !newMessage.trim()} onClick={send}>{sending ? "Sending..." : "Send"}</button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-500">Select a conversation.</div>
          )}
        </section>
      </div>
    </main>
  );
}
