# Wavely

Личный музыкальный плеер: своя коллекция, плейлисты, слушать вперемешку.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Zustand](https://img.shields.io/badge/Zustand-5-orange) ![Supabase](https://img.shields.io/badge/Supabase-self--hosted-3ECF8E?logo=supabase)

## Возможности

- Загрузка треков и плейлистов (обложки сжимаются и переводятся в WebP перед
  загрузкой), CRUD для обеих сущностей
- Очередь воспроизведения, shuffle, repeat (off/all/one), drag-and-drop
  сортировка треков в плейлисте (мышью и клавиатурой)
- Поиск по трекам и плейлистам, "любимый трек" по счётчику прослушиваний
- Авторизация: email OTP с повторной отправкой кода, GitHub/Google OAuth
- Профиль со статистикой, инлайн-редактированием аватарки/имени и удалением
  аккаунта
- Тёмная и светлая тема

## Стек

React 19 + TypeScript + Vite, SCSS (BEM), Zustand, TanStack Query,
react-hook-form + Zod, dnd-kit, Swiper, framer-motion, Supabase
(self-hosted, в докере). Архитектура — FSD.

## Запуск

```bash
pnpm install
pnpm dev
```

Переменные окружения — в `.env.example`, скопируй в `.env` и подставь свои
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

Схема базы, RLS, storage-политики и SQL-функции лежат в `supabase/` —
накатываются на свой проект руками (`schema.sql` → `auth.sql` → `RLS.sql` →
`grants.sql` → `storage.sql` → `functions.sql`), отдельного механизма
миграций нет.

## Линт и форматирование

```bash
pnpm check
```

## Desktop

Есть отдельная ветка [`wavely-desktop`](https://github.com/whoaskedssselery/wavely/tree/wavely-desktop)
с портом на Electron.
