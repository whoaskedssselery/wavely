# Wavely

Личный музыкальный плеер: своя коллекция, плейлисты, слушать вперемешку.

React 19 + TypeScript + Vite, SCSS/BEM, Zustand, TanStack Query, Supabase
(self-hosted, в докере). Архитектура — FSD.

Поднимается как обычный Vite-проект: `pnpm install`, `pnpm dev`. Переменные
окружения — в `.env.example`, скопируй в `.env` и подставь свои.

Схема базы, RLS и storage-политики лежат в `supabase/` — накатываются на
свой проект руками, отдельного механизма миграций нет.

Линт и форматирование — `pnpm check`.
