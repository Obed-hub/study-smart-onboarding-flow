
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePremiumStatus() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setIsPremium(false);
        setUserId(null);
        setLoading(false);
        return;
      }
      setUserId(session.user.id);
      const { data, error } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", session.user.id)
        .single();
      setIsPremium(!!data?.is_premium);
      setLoading(false);
    }
    fetchStatus();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => fetchStatus());
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isPremium, loading, userId };
}
