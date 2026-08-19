# Бэкенд админки Bull Bike (Yandex Cloud Function)

Админка живёт на GitHub Pages (статика). Чтобы вход по логину/паролю работал
и изменения сохранялись **прямо в репозиторий GitHub**, нужен маленький сервер —
это одна облачная функция в **Yandex Cloud**. Токен GitHub хранится только на
сервере (в переменных окружения функции) и никогда не попадает в браузер.

```
[Админка на GitHub Pages]  ──login/save──►  [Yandex Cloud Function]  ──commit──►  [GitHub-репозиторий]  ──►  [Сайт пересобирается]
```

## 1. Создай GitHub Personal Access Token

1. GitHub → Settings → Developer settings → **Personal access tokens** → **Fine-grained tokens** → Generate new token.
2. Repository access: **Only select repositories** → выбери свой репозиторий сайта.
3. Permissions → Repository permissions → **Contents: Read and write**.
4. Скопируй токен (он показывается один раз) — это `GITHUB_TOKEN`.

## 2. Сгенерируй хеш пароля

Пароль хранится не в открытом виде, а как SHA-256 хеш. Придумай пароль и посчитай хеш:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('ТВОЙ_ПАРОЛЬ').digest('hex'))"
```

Полученную строку положишь в `ADMIN_PASSWORD_HASH`.

## 3. Создай функцию в Yandex Cloud

1. Консоль Yandex Cloud → **Cloud Functions** → Создать функцию.
2. Среда выполнения: **nodejs18** (или новее).
3. Загрузи содержимое папки `backend/` (файлы `index.js` и `package.json`).
4. Точка входа (Entrypoint): `index.handler`.
5. Таймаут: 30 сек, память: 128–256 МБ.
6. Сделай функцию **публичной** ("Публичная функция") — тогда у неё будет URL вида
   `https://functions.yandexcloud.net/xxxxxxxx`. Этот URL вставишь в админку
   (`admin/assets/config.js` → `API_BASE`).

### Переменные окружения функции

| Переменная | Значение |
|---|---|
| `ADMIN_LOGIN` | Логин администратора, например `admin` |
| `ADMIN_PASSWORD_HASH` | SHA-256 хеш пароля из шага 2 |
| `JWT_SECRET` | Любая длинная случайная строка (напр. вывод `openssl rand -hex 32`) |
| `GITHUB_TOKEN` | Токен из шага 1 |
| `GITHUB_REPO` | `владелец/репозиторий`, напр. `kaARAss/bullbike` |
| `GITHUB_BRANCH` | Ветка, обычно `main` |
| `ALLOW_ORIGIN` | Адрес сайта для CORS, напр. `https://bullbike.ru` (или `*` на время настройки) |

## 4. Пропиши адрес функции в админке

Открой `admin/assets/config.js` и вставь URL функции:

```js
window.BULLBIKE_ADMIN = {
  API_BASE: "https://functions.yandexcloud.net/xxxxxxxx"
};
```

Закоммить это изменение — и админка на `https://bullbike.ru/admin/` заработает.

## Проверка

Открой URL функции с телом `{"action":"ping"}` (через curl/Postman) — должен вернуться
`{"ok":true,...}`.

```bash
curl -X POST "https://functions.yandexcloud.net/xxxxxxxx" -H 'Content-Type: application/json' -d '{"action":"ping"}'
```

## Безопасность

- Токен GitHub виден только функции, не в браузере.
- Пароль хранится как SHA-256 хеш.
- Сессия (JWT) живёт 12 часов, потом нужен повторный вход.
- Рекомендуется указать конкретный `ALLOW_ORIGIN` (адрес сайта), а не `*`.
