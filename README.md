# Wavely

Личный музыкальный плеер: своя коллекция, плейлисты, слушать вперемешку.
Веб-версия и десктоп-приложение на Electron с нативной работой под Wayland.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Electron](https://img.shields.io/badge/Electron-43-47848F?logo=electron) ![Zustand](https://img.shields.io/badge/Zustand-5-orange) ![Supabase](https://img.shields.io/badge/Supabase-self--hosted-3ECF8E?logo=supabase)

## Возможности

- Своя коллекция треков и плейлисты с загрузкой файлов
- Слушать вперемешку — коллекция и плейлисты в случайном порядке
- Спотлайт-поиск по трекам и плейлистам (Ctrl+Space в десктоп-версии)
- Отдельный плавающий мини-плеер (Ctrl+Alt+M)
- Перетаскиваемая пересортировка треков в плейлисте
- MPRIS-интеграция и глобальные хоткеи управления плеером
- Работа в фоне через системный трей, автозапуск с системой
- Тёмная и светлая тема

## Стек

React · TypeScript · Zustand · TanStack Query · Vite · SCSS/BEM · Supabase (self-hosted) · Electron

Архитектура — FSD.

## Запуск (веб)

```bash
pnpm install
pnpm dev
```

Переменные окружения — в `.env.example`, скопируй в `.env` и подставь свои.

Схема базы, RLS и storage-политики лежат в `supabase/` — накатываются на
свой проект руками, отдельного механизма миграций нет.

## Запуск (десктоп)

```bash
pnpm electron:dev    # разработка
pnpm electron:build  # сборка AppImage (Linux)
```

Десктоп-часть живёт в отдельной ветке `wavely-desktop` и не смешивается с
веб-веткой `main`.

## Линт и форматирование

```bash
pnpm check
```
