import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Plus, Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/language-context";
import {
  createThread,
  deleteThread,
  listMessages,
  listThreads,
  saveMessage,
  streamAssistantReply,
  type ChatMessage,
  type ThreadRecord,
} from "@/services/planner.service";

const QUICK_PROMPTS = [
  "Plan a weekend trip under $300",
  "Best spot for stargazing with 4 guests",
  "Compare lakeside and forest options",
  "Show 3 options for my budget and dates",
];

const Plan = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { dir } = useLanguage();

  const [threads, setThreads] = useState<ThreadRecord[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [pending, setPending] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    listThreads().then(setThreads).catch((e) => toast.error(e.message));
  }, [user]);

  useEffect(() => {
    if (!user || !threadId) {
      setMessages([]);
      return;
    }
    listMessages(threadId).then(setMessages).catch((e) => toast.error(e.message));
  }, [user, threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;
    setInput("");
    setStreaming(true);
    setPending("");

    try {
      let activeId = threadId;
      if (!activeId) {
        const thread = await createThread(content);
        activeId = thread.id;
        setThreads((prev) => [thread, ...prev]);
        navigate(`/plan/${thread.id}`, { replace: true });
      }

      const next: ChatMessage[] = [...messages, { role: "user", content }];
      setMessages(next);
      await saveMessage(activeId, "user", content);

      const reply = await streamAssistantReply(next, (delta) =>
        setPending((prev) => prev + delta),
      );
      if (reply) {
        await saveMessage(activeId, "assistant", reply);
        setMessages([...next, { role: "assistant", content: reply }]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Assistant unavailable");
    } finally {
      setPending("");
      setStreaming(false);
    }
  };

  const removeThread = async (id: string) => {
    try {
      await deleteThread(id);
      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (id === threadId) navigate("/plan", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete trip");
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navigation />
      <main className="container mx-auto px-6 lg:px-12 pt-32 pb-20">
        <header className="mb-10 text-center">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 block">
            AI Trip Planner
          </span>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">
            Intelligent tourism planning for you
          </h1>
        </header>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          <aside className="space-y-3">
            <Button
              variant="outline"
              className="w-full rounded-md text-[11px] uppercase tracking-wider font-normal"
              onClick={() => navigate("/plan")}
            >
              <Plus className="h-4 w-4 me-2" />
              New trip
            </Button>
            <div className="space-y-1">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-light cursor-pointer transition-colors ${
                    thread.id === threadId ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  }`}
                  onClick={() => navigate(`/plan/${thread.id}`)}
                >
                  <span className="flex-1 truncate">{thread.title || "Untitled trip"}</span>
                  <button
                    type="button"
                    aria-label="Delete trip"
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeThread(thread.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </aside>

          <Card className="flex flex-col p-6 shadow-soft border-border min-h-[60vh]">
            <div className="flex-1 space-y-4 overflow-y-auto">
              {messages.length === 0 && !pending && (
                <div className="text-center py-10 space-y-6">
                  <Sparkles className="h-10 w-10 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground font-light">
                    Tell me your budget, dates and travel style — I&apos;ll suggest three tailored trips.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="rounded-full border border-border px-3 py-1.5 text-xs font-light hover:bg-accent transition-colors"
                        onClick={() => send(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={message.id ?? index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-3 text-sm font-light whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent/40 text-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {pending && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg px-4 py-3 text-sm font-light whitespace-pre-wrap bg-accent/40 text-foreground">
                    {pending}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              className="flex items-center gap-2 pt-4 border-t border-border mt-4"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about destinations, budgets or itineraries…"
                className="rounded-md text-sm font-light"
              />
              <Button type="submit" disabled={streaming || !input.trim()} className="rounded-md">
                {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Plan;
