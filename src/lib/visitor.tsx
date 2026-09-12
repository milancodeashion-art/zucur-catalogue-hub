import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";

export interface VisitorRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

const STORAGE_KEY = "zucur-mart-visitor";

interface VisitorContextValue {
  visitor: VisitorRecord | null;
  ready: boolean;
  register: (input: { name: string; phone: string; email?: string }) => Promise<void>;
}

const VisitorContext = createContext<VisitorContextValue | null>(null);

function readStored(): VisitorRecord | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VisitorRecord;
    return parsed?.id && parsed?.name && parsed?.phone ? parsed : null;
  } catch {
    return null;
  }
}

export function VisitorProvider({ children }: { children: ReactNode }) {
  const [visitor, setVisitor] = useState<VisitorRecord | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStored();
    setVisitor(stored);
    setReady(true);
    if (stored) {
      void supabase.rpc("register_visitor", {
        _name: stored.name,
        _phone: stored.phone,
        _email: stored.email ?? undefined,
        _visitor_id: stored.id,
      });
    }
  }, []);

  const register = useCallback(
    async (input: { name: string; phone: string; email?: string }) => {
      const email = input.email?.trim() ? input.email.trim() : null;
      const { data, error } = await supabase.rpc("register_visitor", {
        _name: input.name.trim(),
        _phone: input.phone.trim(),
        _email: email ?? undefined,
      });
      if (error) throw error;
      const record: VisitorRecord = {
        id: data as unknown as string,
        name: input.name.trim(),
        phone: input.phone.trim(),
        email,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      setVisitor(record);
    },
    [],
  );

  return (
    <VisitorContext.Provider value={{ visitor, ready, register }}>{children}</VisitorContext.Provider>
  );
}

export function useVisitor(): VisitorContextValue {
  const ctx = useContext(VisitorContext);
  if (!ctx) throw new Error("useVisitor must be used inside VisitorProvider");
  return ctx;
}
