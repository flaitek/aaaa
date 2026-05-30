# 🏋️ Fitness Center REST API

REST API для управления фитнес-центром. **Часть 1** — данные хранятся in-memory.

## Технологии

| Компонент | Выбор |
|-----------|-------|
| Язык | Node.js |
| Фреймворк | Express 4 |
| Валидация | express-validator |
| Идентификаторы | UUID v4 |
| Хранилище | In-memory (`Map`) |

## Структура проекта

```
src/
├── index.js                  # Точка входа, Express-приложение
├── routes/
│   ├── clients.js            # Маршруты /api/clients
│   └── trainers.js           # Маршруты /api/trainers
├── controllers/
│   ├── clientController.js   # Правила валидации + хендлеры клиентов
│   └── trainerController.js  # Правила валидации + хендлеры тренеров
├── services/
│   ├── clientService.js      # Бизнес-логика клиентов
│   └── trainerService.js     # Бизнес-логика тренеров
├── repositories/
│   ├── clientRepository.js   # In-memory CRUD клиентов (→ заменить на БД в Ч.2)
│   └── trainerRepository.js  # In-memory CRUD тренеров (→ заменить на БД в Ч.2)
└── middleware/
    ├── validate.js           # Обработчик ошибок валидации
    └── errorHandler.js       # Глобальный обработчик ошибок
```

> **Для перехода к Отчёту 2** достаточно заменить реализацию `repositories/*.js` — контроллеры и сервисы не трогаются.

## Запуск

```bash
npm install
npm start          # продакшн
npm run dev        # с авто-перезапуском (nodemon)
```

Сервер запускается на `http://localhost:3000`.

---

## API Reference

### Клиенты `/api/clients`

#### `POST /api/clients` — Создать клиента
**Тело запроса:**
```json
{
  "surname": "Иванов",
  "name": "Иван",
  "patronymic": "Иванович",
  "birthday": "1990-05-15",
  "phone": "+79001234567",
  "email": "ivan@example.com",
  "trainer_id": "uuid-опционально"
}
```
**Ответ `201`:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "surname": "Иванов",
  "name": "Иван",
  "patronymic": "Иванович",
  "birthday": "1990-05-15",
  "phone": "+79001234567",
  "email": "ivan@example.com",
  "is_active": true,
  "trainer_id": null
}
```

---

#### `PUT /api/clients/{id}` — Обновить клиента
Принимает те же поля, что и POST (все опциональны). **Ответ `200`.**

---

#### `GET /api/clients` — Список всех клиентов
**Ответ `200`:** массив объектов клиентов.

---

#### `GET /api/clients/{id}` — Краткая информация
**Ответ `200`:** объект клиента (с `trainer_id`, без вложенного объекта тренера).

---

#### `GET /api/clients/{id}/detail` — Подробная информация
**Ответ `200`:**
```json
{
  "id": "...",
  "surname": "Иванов",
  "name": "Иван",
  "is_active": true,
  "trainer": {
    "id": "...",
    "surname": "Петров",
    "name": "Алексей",
    "patronymic": "Сергеевич",
    "status": "WORKING"
  }
}
```
Поле `trainer` — `null`, если тренер не назначен.

---

#### `PATCH /api/clients/{id}/status` — Изменить статус
```json
{ "is_active": false }
```
**Ответ `200`:** обновлённый объект клиента.

---

#### `POST /api/clients/{clientId}/trainer/{trainerId}` — Назначить тренера
**Ответ `200`:** обновлённый объект клиента с заполненным `trainer_id`.

---

### Тренеры `/api/trainers`

#### `POST /api/trainers` — Создать тренера
```json
{
  "surname": "Петров",
  "name": "Алексей",
  "patronymic": "Сергеевич",
  "phone": "+79001112233",
  "status": "WORKING"
}
```
Допустимые значения `status`: `WORKING` | `ON_LEAVE` | `NOT_WORKING`. По умолчанию `WORKING`.
**Ответ `201`.**

---

#### `PUT /api/trainers/{id}` — Обновить тренера
Те же поля, все опциональны. **Ответ `200`.**

---

#### `PATCH /api/trainers/{id}/status` — Изменить статус
```json
{ "status": "ON_LEAVE" }
```
**Ответ `200`.**

---

#### `GET /api/trainers` — Список всех тренеров
**Ответ `200`:** массив объектов тренеров.

---

#### `GET /api/trainers/{id}/detail` — Подробная информация
**Ответ `200`:** объект тренера + поле `clients` — массив его клиентов.

---

## Коды ответов

| Код | Значение |
|-----|----------|
| 200 | Успешное чтение / обновление |
| 201 | Успешное создание |
| 400 | Ошибка валидации или бизнес-ошибка |
| 404 | Ресурс не найден |
| 500 | Внутренняя ошибка сервера |

### Пример ошибки валидации `400`
```json
{
  "error": "Ошибка валидации",
  "details": [
    { "field": "email", "message": "Некорректный формат email" },
    { "field": "birthday", "message": "Дата рождения обязательна" }
  ]
}
```
