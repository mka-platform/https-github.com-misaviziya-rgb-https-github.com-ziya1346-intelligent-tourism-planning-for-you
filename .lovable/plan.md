# Intelligent Tourism Planning App

## Overview
Transform this remixed camping/glamping site into an AI-powered tourism planning assistant. The existing locations become the recommendation catalog, while a new threaded chat experience lets users plan trips, compare options, and receive budget/duration-based suggestions.

## Goals

1. Give the app a clear travel-planning identity (name, copy, and hero).
2. Add an AI chat interface for trip planning, using the existing location data as ground truth.
3. Persist chat history per trip session in the database, with real thread URLs.
4. Enable the AI to recommend destinations, build itineraries, compare options, and answer travel questions.
5. Build a special “3 suggested options” flow based on budget, stay duration, and current offers.

## User Flow

```text
Landing page
    ↓
User chooses a quick trip-planning prompt or a destination
    ↓
New thread is created and navigated to /plan/:threadId
    ↓
Chat assistant gathers details (budget, duration, travel style)
    ↓
AI returns 3 tailored options, each tied to a real location
    ↓
User can refine, compare, or ask follow-up questions
    ↓
Conversation persists; returning to /plan/:threadId restores it
```

## Database Schema

Create one migration with the following tables:

### `public.threads`

```sql
CREATE TABLE public.threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.threads TO authenticated;
GRANT ALL ON public.threads TO service_role;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own threads"
  ON public.threads
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### `public.messages`

```sql
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES public.threads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage messages in their own threads"
  ON public.messages
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

`content` stores AI SDK `UIMessage` compatible JSON.

## Backend

Add a Supabase Edge Function `supabase/functions/chat/index.ts`:

- Accepts `{ threadId, messages }` from the client.
- Verifies the user session from the `Authorization` header.
- Loads prior messages from `public.messages` for that thread if needed, scoped to the user.
- Uses the AI SDK with the Lovable AI Gateway provider and `google/gemini-3.6-flash`.
- System prompt instructs the assistant to act as a travel planner using the existing `locations` catalog as the source of truth for destinations, prices, amenities, and features.
- Returns `streamText(...).toUIMessageStreamResponse()` with CORS headers.

Static tools (functions can be added now or later) include:

- `recommendLocations`: filters by budget, duration, and group size.
- `buildItinerary`: returns a day-by-day plan for a chosen location.
- `compareOptions`: returns a structured comparison table of 2-4 locations.
- `getSpecialOffers`: returns current promotions (initially hardcoded; can be made editable in admin later).

Keep the model call and tools in the Edge Function only. Do not expose `LOVABLE_API_KEY` to the client.

## Frontend

### Routing

Update `App.tsx` to add:

- `/plan/:threadId` — active planning session.
- `/plan` — redirects to a new thread or lists recent threads.

### AI Elements Chat UI

Install AI Elements primitives (`conversation`, `message`, `prompt-input`, `shimmer`, and `tool` as needed). Compose them into a planning page with:

- A thread sidebar showing the user's recent trip sessions.
- A “New trip” button that creates a thread and navigates to `/plan/:threadId`.
- The chat window keyed by `threadId`, loading persisted messages from the database.
- A composer that sends user messages to the Edge Function via `DefaultChatTransport`.
- Assistant messages rendered with markdown and tool call summaries.

### Quick-start Planning Prompts

Add chips/buttons above the composer for common starters:

- “Plan a weekend trip under $300”
- “Best spot for stargazing with 4 guests”
- “Compare lakeside and forest options”
- “Show 3 options for my budget and dates”

Clicking one creates a new thread and sends the prompt.

### Location Tied Recommendations

The AI should cite real locations from `src/data/locations.ts`. Each recommendation card in the chat includes:

- Location name, image, price, rating, and a short description.
- A link to the existing `/location/:id` detail page.
- A “Book this trip” CTA that scrolls to or links to the booking flow.

### Branding & Content

- Update the app name in the navigation and footer from “Wild Haven” to “Tripwise” (or another chosen name).
- Replace the hero headline and subcopy with a travel-planning focus.
- Keep the existing location imagery and detail pages.
- Add a “Plan a trip” primary CTA alongside the existing “Book Now” CTA.
- Update `index.html` title and meta description to match the new purpose.

## Admin Enhancements

The existing admin dashboard remains useful. Optionally add:

- A “Special Offers” editor so admins can create promotions that the AI reads.
- A view of recent threads/messages for support (read-only).

These are secondary; the first milestone focuses on the user-facing planner.

## Technical Details

- **Model**: `google/gemini-3.6-flash` via Lovable AI Gateway.
- **Backend**: Supabase Edge Function (`chat`).
- **Auth**: Existing `useAuth` + Supabase auth. Users must be signed in to create or persist threads; anonymous browsing of locations remains open.
- **Chat library**: AI SDK (`@ai-sdk/react`, `streamText`, `DefaultChatTransport`, `toUIMessageStreamResponse`).
- **UI primitives**: AI Elements components (`@/components/ai-elements/*`), existing shadcn/ui components.
- **Persistence**: `public.threads` and `public.messages`, with RLS policies scoped to `auth.uid()`.
- **Thread routing**: React Router `/plan/:threadId`; `threadId` is passed as the AI SDK chat `id` and used to load/save messages.

## Open Decisions

1. Final app name and brand colors (proposed: “Tripwise” with the existing sage/forest palette).
2. Whether the AI “3 options” response should always include an itinerary, or just destination cards.
3. Whether special offers should be hardcoded for the first version or stored in a new `offers` table from the start.

## Milestones

1. **Foundation**: migrations, Edge Function, AI Gateway provider, and database persistence.
2. **Chat UI**: AI Elements installation, thread routes, sidebar, and message rendering.
3. **Intelligence**: system prompt, location-aware tools, 3-option suggestion flow.
4. **Polish**: rebrand, quick-start prompts, detail-page links, and admin offer editor.
