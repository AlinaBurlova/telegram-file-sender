# Telegram File Sender

**Автор:** Бурлова Алина Алексеевна, группа M3111  
**Название плагина:** Telegram File Sender

## Описание

Плагин для VS Code, который позволяет отправлять текущий открытый файл
в указанный Telegram-чат через бота.

## Возможности

- Команда `Telegram: Send Current File` — отправляет активный файл в Telegram.
- Команда `Telegram: Configure Bot Token and Chat ID` — сохраняет токен
  и chat_id в защищённом хранилище VS Code (SecretStorage).
- Индикатор прогресса при отправке.
- Обработка ошибок (неверный токен, отсутствие сети, превышение лимита).

## Установка

### 1. Создание бота
- Открой Telegram, найди `@BotFather`, отправь `/newbot`.
- Придумай имя и username (должен заканчиваться на `bot`).
- Скопируй токен вида `123456:ABC-DEF...`.

### 2. Получение chat_id
- Найди `@userinfobot`, отправь `/start`.
- Бот пришлёт твой числовой ID — это и есть chat_id.

### 3. Установка плагина
- Скачай `.vsix` из раздела Releases.
- В VS Code: Extensions → `...` → Install from VSIX.

### 4. Настройка
- `Ctrl+Shift+P` → `Telegram: Configure Bot Token and Chat ID`.
- Введи токен и chat_id.

## Использование
- Открой файл в VS Code.
- `Ctrl+Shift+P` → `Telegram: Send Current File`.
- Файл появится в чате с твоим ботом.

## Ограничения
- Telegram Bot API ограничивает размер файла **50 МБ**.
- Для файлов больше 50 МБ требуется локальный Bot API сервер.

## Архитектура
Плагин зарегистрирован в точке расширения `commands` (VS Code Extension API).
При активации по команде плагин через `vscode.window.activeTextEditor`
получает путь к файлу, через `vscode.SecretStorage` — токен и chat_id,
затем выполняет HTTP POST-запрос к Telegram Bot API (`sendDocument`)
и отображает результат через `vscode.window.showInformationMessage`.
Плагин работает в изолированном процессе Extension Host.