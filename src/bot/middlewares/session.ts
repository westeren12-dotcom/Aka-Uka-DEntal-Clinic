import { Context, MiddlewareFn } from "telegraf";
import { BotSession } from "../../types";

const sessions = new Map<number, BotSession>();

export const sessionMiddleware: MiddlewareFn<Context> = async (ctx, next) => {
  const chatId = ctx.chat?.id;
  if (!chatId) return next();

  if (!(ctx as any).session) {
    (ctx as any).session = sessions.get(chatId) ?? {};
  }

  await next();

  if ((ctx as any).session) {
    sessions.set(chatId, (ctx as any).session);
  }
};

export function clearSession(chatId: number) {
  const existing = sessions.get(chatId);
  sessions.set(chatId, { lang: existing?.lang });
}

export function getSession(chatId: number): BotSession {
  return sessions.get(chatId) ?? {};
}
