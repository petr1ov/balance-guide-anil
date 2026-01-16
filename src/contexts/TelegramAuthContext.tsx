import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramAuthContextType {
  session: Session | null;
  user: User | null;
  telegramUser: TelegramUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  language: string;
  setLanguage: (lang: string) => void;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export function TelegramAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguageState] = useState<string>("en");

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  }, []);

  useEffect(() => {
    // Initialize Telegram Mini App
    const tg = (window as unknown as { Telegram?: { WebApp?: { ready: () => void; initData: string; initDataUnsafe?: { user?: TelegramUser } } } }).Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setTelegramUser(user);
        
        // Store telegram_id for identification without auth
        localStorage.setItem("telegram_id", String(user.id));
        
        // Track miniapp opened event
        trackEvent("miniapp_opened", { telegram_id: user.id });
        
        // Detect language from Telegram
        const langCode = user.language_code;
        const lang = langCode?.startsWith("ru")
          ? "ru"
          : langCode?.startsWith("hi")
          ? "hi"
          : "en";
        
        localStorage.setItem("app_language", lang);
        setLanguageState(lang);
      }
    }

    // Restore language from localStorage
    const savedLang = localStorage.getItem("app_language");
    if (savedLang && ["ru", "en", "hi"].includes(savedLang)) {
      setLanguageState(savedLang);
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // THEN check for existing session and Telegram auth
    const initAuth = async () => {
      try {
        // Check for existing Supabase session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession) {
          console.log("Existing session found:", existingSession.user.id);
          setSession(existingSession);
          setUser(existingSession.user);
          
          // Fetch user language from profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("language")
            .eq("id", existingSession.user.id)
            .maybeSingle();
          
          if (profile?.language) {
            setLanguage(profile.language);
          }
          
          setLoading(false);
          return;
        }

        // Check if running inside Telegram Mini App
        const tgApp = (window as unknown as { Telegram?: { WebApp?: { initData: string; initDataUnsafe?: { user?: TelegramUser } } } }).Telegram?.WebApp;
        
        if (tgApp?.initData) {
          console.log("Telegram Mini App detected, authenticating...");

          // Call edge function to validate and get session
          const response = await supabase.functions.invoke("login-with-telegram", {
            body: { initData: tgApp.initData },
          });

          if (response.error) {
            console.error("Telegram auth error:", response.error);
            setError("Failed to authenticate with Telegram");
            setLoading(false);
            return;
          }

          const { access_token, refresh_token } = response.data;

          if (access_token && refresh_token) {
            // Set the session in Supabase client
            const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (setSessionError) {
              console.error("Error setting session:", setSessionError);
              setError("Failed to set session");
            } else {
              console.log("Session set successfully:", setSessionData.user?.id);
              setSession(setSessionData.session);
              setUser(setSessionData.user);
              
              // Fetch user language from profile
              if (setSessionData.user) {
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("language")
                  .eq("id", setSessionData.user.id)
                  .maybeSingle();
                
                if (profile?.language) {
                  setLanguage(profile.language);
                }
              }
            }
          }
        } else {
          console.log("Not in Telegram Mini App, no auth required for demo");
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    return () => subscription.unsubscribe();
  }, [setLanguage]);

  return (
    <TelegramAuthContext.Provider
      value={{
        session,
        user,
        telegramUser,
        loading,
        error,
        isAuthenticated: !!session,
        language,
        setLanguage,
      }}
    >
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (context === undefined) {
    throw new Error("useTelegramAuth must be used within a TelegramAuthProvider");
  }
  return context;
}