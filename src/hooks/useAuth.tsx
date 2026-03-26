import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContext {
  user: User | null;
  session: Session | null;
  loading: boolean;
  householdId: string | null;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext>({
  user: null,
  session: null,
  loading: true,
  householdId: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch household_id from profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("household_id")
            .eq("user_id", session.user.id)
            .single();
          setHouseholdId(profile?.household_id ?? null);
        } else {
          setHouseholdId(null);
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        supabase
          .from("profiles")
          .select("household_id")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            setHouseholdId(profile?.household_id ?? null);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthCtx.Provider value={{ user, session, loading, householdId, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
