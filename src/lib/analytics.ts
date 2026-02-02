import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export type EventName =
  | "user_created"
  | "miniapp_opened"
  | "mode_selected"
  | "sphere_scored"
  | "point_a_completed"
  | "point_b_recorded"
  | "onboarding_completed"
  | "subscription_started"
  | "subscription_cancelled"
  | "notification_enabled"
  | "notification_disabled"
  | "ai_message_sent"
  | "language_changed"
  | "sphere_details_viewed"
  | "history_viewed"
  | "balance_reassess_started"
  | "astrology_frequency_selected";

interface EventMetadata {
  [key: string]: string | number | boolean | null | undefined | Record<string, unknown>;
}

/**
 * Track an analytics event to the Supabase events table.
 * Works with or without authentication - uses telegram_id as fallback.
 */
export async function trackEvent(
  event: EventName,
  metadata?: EventMetadata
): Promise<void> {
  try {
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get telegram_id from localStorage as fallback
    const telegramId = localStorage.getItem("telegram_id");
    
    // Don't track if we have no way to identify the user
    if (!user && !telegramId) {
      console.log(`[Analytics] Skipping event "${event}" - no user identity`);
      return;
    }

    const eventData: {
      event: string;
      user_id: string | null;
      telegram_id: string | null;
      metadata: Json;
    } = {
      event,
      user_id: user?.id ?? null,
      telegram_id: telegramId,
      metadata: (metadata as Json) ?? null,
    };

    const { error } = await supabase.from("events").insert(eventData);

    if (error) {
      console.error(`[Analytics] Failed to track event "${event}":`, error);
    } else {
      console.log(`[Analytics] Tracked event: ${event}`, metadata || "");
    }
  } catch (err) {
    console.error(`[Analytics] Error tracking event "${event}":`, err);
  }
}

/**
 * Track AI usage for cost monitoring
 */
export async function trackAIUsage(params: {
  usageType: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  costUsd?: number;
  metadata?: EventMetadata;
}): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const telegramId = localStorage.getItem("telegram_id");

    if (!user && !telegramId) {
      console.log("[Analytics] Skipping AI usage - no user identity");
      return;
    }

    const { error } = await supabase.from("ai_usage").insert({
      user_id: user?.id ?? null,
      telegram_id: telegramId,
      usage_type: params.usageType,
      model: params.model ?? null,
      input_tokens: params.inputTokens ?? null,
      output_tokens: params.outputTokens ?? null,
      total_tokens: params.totalTokens ?? null,
      cost_usd: params.costUsd ?? null,
      metadata: (params.metadata as Json) ?? null,
    });

    if (error) {
      console.error("[Analytics] Failed to track AI usage:", error);
    }
  } catch (err) {
    console.error("[Analytics] Error tracking AI usage:", err);
  }
}
