# Wavely

Личный музыкальный плеер: своя коллекция, плейлисты, слушать вперемешку.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Zustand](https://img.shields.io/badge/Zustand-5-orange) ![Supabase](https://img.shields.io/badge/Supabase-self--hosted-3ECF8E?logo=supabase)

## Возможности

- Своя коллекция треков и плейлисты с загрузкой файлов
- Слушать вперемешку — коллекция и плейлисты в случайном порядке
- Поиск по трекам и плейлистам
- Перетаскиваемая пересортировка треков в плейлисте
- Тёмная и светлая тема

## Стек

React · TypeScript · Zustand · TanStack Query · Vite · SCSS/BEM · Supabase (self-hosted)

Архитектура — FSD.

## Запуск

```bash
pnpm install
pnpm dev
```

Переменные окружения — в `.env.example`, скопируй в `.env` и подставь свои.

Схема базы, RLS и storage-политики лежат в `supabase/` — накатываются на
свой проект руками, отдельного механизма миграций нет.

## Линт и форматирование

```bash
pnpm check
```
