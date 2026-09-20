import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Plus, Send, Sparkles, Trash2, Pencil, Users, Moon, Wallet } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type BudgetLevel = "economic" | "medium" | "premium";
type TravelStyle = "calm" | "adventure" | "family" | "romantic" | "nature" | "cultural";

interface Preferences {
  budget: BudgetLevel;
  nights: number;
  adults: number;
  children: number;
  style: TravelStyle;
  activities: string[];
  notes: string;
}

const BUDGET_OPTIONS: { value: BudgetLevel; labelFa: string; labelEn: string }[] = [
  { value: "economic", labelFa: "اقتصادی", labelEn: "Economic" },
  { value: "medium", labelFa: "متوسط", labelEn: "Medium" },
  { value: "premium", labelFa: "عالی", labelEn: "Premium" },
];

const STYLE_OPTIONS: { value: TravelStyle; labelFa: string; labelEn: string }[] = [
  { value: "calm", labelFa: "آرام", labelEn: "Calm" },
  { value: "adventure", labelFa: "ماجراجویی", labelEn: "Adventure" },
  { value: "family", labelFa: "خانوادگی", labelEn: "Family" },
  { value: "romantic", labelFa: "رمانتیک", labelEn: "Romantic" },
  { value: "nature", labelFa: "طبیعت‌گردی", labelEn: "Nature" },
  { value: "cultural", labelFa: "فرهنگی", labelEn: "Cultural" },
];

const ACTIVITY_OPTIONS = [
  { value: "hiking", labelFa: "پیاده‌روی", labelEn: "Hiking" },
  { value: "stargazing", labelFa: "ستاره‌بینی", labelEn: "Stargazing" },
  { value: "kayaking", labelFa: "قایق‌سواری", labelEn: "Kayaking" },
  { value: "fishing", labelFa: "ماهیگیری", labelEn: "Fishing" },
  { value: "wildlife", labelFa: "مشاهده حیات وحش", labelEn: "Wildlife" },
  { value: "photography", labelFa: "عکاسی", labelEn: "Photography" },
  { value: "campfire", labelFa: "آتش‌افروزی", labelEn: "Campfire" },
  { value: "swimming", labelFa: "شنا", labelEn: "Swimming" },
];

const defaultPrefs: Preferences = {
  budget: "medium",
  nights: 2,
  adults: 2,
  children: 0,
  style: "nature",
  activities: [],
  notes: "",
};

const buildStructuredPrompt = (prefs: Preferences, isFa: boolean): string => {
  const budgetLabel = BUDGET_OPTIONS.find((b) => b.value === prefs.budget)?.[isFa ? "labelFa" : "labelEn"] ?? prefs.budget;
  const styleLabel = STYLE_OPTIONS.find((s) => s.value === prefs.style)?.[isFa ? "labelFa" : "labelEn"] ?? prefs.style;
  const acts = prefs.activities
    .map((a) => ACTIVITY_OPTIONS.find((o) => o.value === a)?.[isFa ? "labelFa" : "labelEn"] ?? a)
    .join(", ");

  if (isFa) {
    return [
      `لطفاً سه برنامه سفر پیشنهادی در سطح بودجه «${budgetLabel}» ارائه بده.`,
      `تعداد شب: ${prefs.nights}`,
      `تعداد نفر: ${prefs.adults} بزرگسال${prefs.children > 0 ? ` و ${prefs.children} کودک` : ""}`,
      `سبک سفر: ${styleLabel}`,
      acts ? `تفریحات مورد علاقه: ${acts}` : "",
      prefs.notes ? `توضیحات اضافی: ${prefs.notes}` : "",
      "برای هر برنامه زمان‌بندی، برآورد هزینه تقریبی و دلیل انتخاب را ذکر کن.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `Please suggest three tailored trip plans at the «${budgetLabel}» budget level.`,
    `Nights: ${prefs.nights}`,
    `Guests: ${prefs.adults} adults${prefs.children > 0 ? ` and ${prefs.children} children` : ""}`,
    `Travel style: ${styleLabel}`,
    acts ? `Preferred activities: ${acts}` : "",
    prefs.notes ? `Additional notes: ${prefs.notes}` : "",
    "For each plan include approximate timing, cost estimate and the reason for selection.",
  ]
    .filter(Boolean)
    .join("\n");
};

const Plan = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { dir, language } = useLanguage();
  const isFa = language.startsWith("fa") || language.startsWith("ar");

  const [threads, setThreads] = useState<ThreadRecord[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [pending, setPending] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
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
      setShowForm(true);
      return;
    }
    listMessages(threadId)
      .then((msgs) => {
        setMessages(msgs);
        if (msgs.length > 0) setShowForm(false);
      })
      .catch((e) => toast.error(e.message));
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
        const thread = await createThread(content.slice(0, 80));
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

  const startWithPreferences = async () => {
    if (streaming) return;
    const prompt = buildStructuredPrompt(prefs, isFa);
    setShowForm(false);
    await send(prompt);
  };

  const removeThread = async (id: string) => {
    try {
      await deleteThread(id);
      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (id === threadId) {
        navigate("/plan", { replace: true });
        setShowForm(true);
        setPrefs(defaultPrefs);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete trip");
    }
  };

  const toggleActivity = (value: string) => {
    setPrefs((prev) => ({
      ...prev,
      activities: prev.activities.includes(value)
        ? prev.activities.filter((a) => a !== value)
        : [...prev.activities, value],
    }));
  };

  const label = (fa: string, en: string) => (isFa ? fa : en);

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navigation />
      <main className="container mx-auto px-6 lg:px-12 pt-32 pb-20">
        <header className="mb-10 text-center">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 block">
            AI Trip Planner
          </span>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">
            {label("برنامه‌ریزی هوشمند گردشگری", "Intelligent tourism planning for you")}
          </h1>
        </header>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          <aside className="space-y-3">
            <Button
              variant="outline"
              className="w-full rounded-md text-[11px] uppercase tracking-wider font-normal"
              onClick={() => {
                navigate("/plan");
                setShowForm(true);
                setPrefs(defaultPrefs);
                setMessages([]);
              }}
            >
              <Plus className="h-4 w-4 me-2" />
              {label("سفر جدید", "New trip")}
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
                  <span className="flex-1 truncate">{thread.title || label("سفر بدون عنوان", "Untitled trip")}</span>
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
            {showForm && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <Sparkles className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground font-light">
                    {label(
                      "ترجیحات خود را مشخص کنید تا سه برنامه متناسب با بودجه و سبک سفر شما پیشنهاد شود.",
                      "Set your preferences so I can suggest three tailored plans matching your budget and style.",
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Wallet className="h-4 w-4" />
                    {label("سطح بودجه", "Budget level")}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {BUDGET_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPrefs((p) => ({ ...p, budget: opt.value }))}
                        className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                          prefs.budget === opt.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        {isFa ? opt.labelFa : opt.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <Moon className="h-4 w-4" />
                      {label("تعداد شب", "Nights")}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={prefs.nights}
                      onChange={(e) =>
                        setPrefs((p) => ({ ...p, nights: Math.max(1, Number(e.target.value) || 1) }))
                      }
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      {label("بزرگسال", "Adults")}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={prefs.adults}
                      onChange={(e) =>
                        setPrefs((p) => ({ ...p, adults: Math.max(1, Number(e.target.value) || 1) }))
                      }
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{label("کودک", "Children")}</Label>
                    <Input
                      type="number"
                      min={0}
                      max={15}
                      value={prefs.children}
                      onChange={(e) =>
                        setPrefs((p) => ({ ...p, children: Math.max(0, Number(e.target.value) || 0) }))
                      }
                      className="rounded-md"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{label("سبک / مود سفر", "Travel style / mood")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPrefs((p) => ({ ...p, style: opt.value }))}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                          prefs.style === opt.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        {isFa ? opt.labelFa : opt.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{label("تفریحات مورد علاقه", "Preferred activities")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {ACTIVITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleActivity(opt.value)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                          prefs.activities.includes(opt.value)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        {isFa ? opt.labelFa : opt.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">{label("توضیحات اضافی (اختیاری)", "Additional notes (optional)")}</Label>
                  <Input
                    value={prefs.notes}
                    onChange={(e) => setPrefs((p) => ({ ...p, notes: e.target.value }))}
                    placeholder={label("مثلاً محدودیت زمانی، حساسیت غذایی...", "e.g. time limits, dietary needs...")}
                    className="rounded-md"
                  />
                </div>

                <Button
                  className="w-full rounded-md"
                  onClick={startWithPreferences}
                  disabled={streaming}
                >
                  {streaming ? (
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 me-2" />
                  )}
                  {label("شروع برنامه‌ریزی هوشمند", "Start intelligent planning")}
                </Button>
              </div>
            )}

            {!showForm && (
              <>
                <div className="flex justify-end mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-md text-xs"
                    onClick={() => setShowForm(true)}
                  >
                    <Pencil className="h-3.5 w-3.5 me-1.5" />
                    {label("ویرایش ترجیحات", "Edit preferences")}
                  </Button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto">
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
                    placeholder={label(
                      "سوال بیشتر درباره مقصد، بودجه یا برنامه...",
                      "Ask about destinations, budgets or itineraries…",
                    )}
                    className="rounded-md text-sm font-light"
                  />
                  <Button type="submit" disabled={streaming || !input.trim()} className="rounded-md">
                    {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Plan;
