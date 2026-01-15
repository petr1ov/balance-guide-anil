// Centralized helpers for Telegram Mini App behavior

const TELEGRAM_BOT_URL = "https://t.me/test108_aibot";

export function openTelegramBot(payload?: string) {
  const url = payload ? `${TELEGRAM_BOT_URL}?start=${encodeURIComponent(payload)}` : TELEGRAM_BOT_URL;

  const tg = (window as any).Telegram?.WebApp;

  // Prefer Telegram's native deep-link opening when inside a Mini App
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
    return;
  }

  // Fallback for browser preview
  window.open(url, "_blank", "noopener,noreferrer");
}
