-- HotMess Teil 3a: Gruppenchats & Call-Scaffold

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS needs_member_approval BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS calls_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS public.group_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (conversation_id, user_id)
);

ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read own group join requests" ON public.group_join_requests;
CREATE POLICY "read own group join requests" ON public.group_join_requests
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = group_join_requests.conversation_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
        AND cm.left_at IS NULL
    )
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "create own group join request" ON public.group_join_requests;
CREATE POLICY "create own group join request" ON public.group_join_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  started_by UUID REFERENCES public.profiles(id),
  type TEXT CHECK (type IN ('audio','video')),
  status TEXT DEFAULT 'ringing' CHECK (status IN ('ringing','active','ended')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  max_participants INTEGER DEFAULT 8
);

CREATE TABLE IF NOT EXISTS public.call_participants (
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  PRIMARY KEY (call_id, user_id)
);

ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read calls for conversation members" ON public.calls;
CREATE POLICY "read calls for conversation members" ON public.calls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = calls.conversation_id
        AND cm.user_id = auth.uid()
        AND cm.left_at IS NULL
    )
  );

DROP POLICY IF EXISTS "read own call participants" ON public.call_participants;
CREATE POLICY "read own call participants" ON public.call_participants
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.calls c
      JOIN public.conversation_members cm ON cm.conversation_id = c.conversation_id
      WHERE c.id = call_participants.call_id
        AND cm.user_id = auth.uid()
        AND cm.left_at IS NULL
    )
  );
