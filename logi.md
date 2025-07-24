Логи браузера 

The Cross-Origin-Opener-Policy header has been ignored, because the URL's origin was untrustworthy. It was defined either in the final response or a redirect. Please deliver the response using the HTTPS protocol. You can also use the 'localhost' origin instead. See https://www.w3.org/TR/powerful-features/#potentially-trustworthy-origin and https://html.spec.whatwg.org/#the-cross-origin-opener-policy-header.
45.12.238.107/:1 The page requested an origin-keyed agent cluster using the Origin-Agent-Cluster header, but could not be origin-keyed since the origin 'http://45.12.238.107' had previously been placed in a site-keyed agent cluster. Update your headers to uniformly request origin-keying for all pages on the origin.
index-CAdt3OAK.css:1 
            
            
           Failed to load resource: net::ERR_CONNECTION_CLOSED
index-DHTOhyEH.js:1 
            
            
           Failed to load resource: net::ERR_CONNECTION_CLOSED
vendor-BWwvOZYK.js:1 
            
            
           Failed to load resource: net::ERR_CONNECTION_CLOSED
ui-CrPmkFGx.js:1 
            
            
           Failed to load resource: net::ERR_CONNECTION_CLOSED
router-DzG84LNN.js:1 
            
            
           Failed to load resource: net::ERR_CONNECTION_CLOSED
/favicon.ico:1 
            
            
           Failed to load resource: net::ERR_CONNECTION_CLOSED


jaguar@oaapkeufpx:/opt/jaguar-app$ curl -I http://localhost:3001/assets/index-DHTOhyEH.js
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9334
Date: Wed, 23 Jul 2025 14:52:04 GMT
X-RateLimit-Reset: 1753353002
Vary: Origin
Access-Control-Allow-Credentials: true
Accept-Ranges: bytes
Cache-Control: public, max-age=0
Last-Modified: Wed, 23 Jul 2025 09:40:30 GMT
ETag: W/"38c1b-19836a7e6b0"
Content-Type: application/javascript; charset=UTF-8
Content-Length: 232475
Connection: keep-alive
Keep-Alive: timeout=5

jaguar@oaapkeufpx:/opt/jaguar-app$ curl -I http://45.12.238.107/assets/index-DHTOhyEH.js
HTTP/1.1 200 OK
Server: nginx/1.18.0 (Ubuntu)
Date: Wed, 23 Jul 2025 14:52:32 GMT
Content-Type: application/javascript; charset=UTF-8
Content-Length: 232475
Connection: keep-alive
Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9333
X-RateLimit-Reset: 1753353002
Vary: Origin
Access-Control-Allow-Credentials: true
Accept-Ranges: bytes
Cache-Control: max-age=31536000
Last-Modified: Wed, 23 Jul 2025 09:40:30 GMT
ETag: W/"38c1b-19836a7e6b0"
Expires: Thu, 23 Jul 2026 14:52:32 GMT
Cache-Control: public, immutable

jaguar@oaapkeufpx:/opt/jaguar-app$ curl -I http://beauty-bot-ai-bot-n8n.ru/assets/index-DHTOhyEH.js
HTTP/1.1 200 OK
Server: nginx/1.18.0 (Ubuntu)
Date: Wed, 23 Jul 2025 14:52:41 GMT
Content-Type: application/javascript; charset=UTF-8
Content-Length: 232475
Connection: keep-alive
Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9332
X-RateLimit-Reset: 1753353002
Vary: Origin
Access-Control-Allow-Credentials: true
Accept-Ranges: bytes
Cache-Control: max-age=31536000
Last-Modified: Wed, 23 Jul 2025 09:40:30 GMT
ETag: W/"38c1b-19836a7e6b0"
Expires: Thu, 23 Jul 2026 14:52:41 GMT
Cache-Control: public, immutable

jaguar@oaapkeufpx:/opt/jaguar-app$ sudo tail -f /var/log/nginx/error.log
[sudo] password for jaguar:
2025/07/23 05:18:29 [notice] 10091#10091: using inherited sockets from "6;7;"
2025/07/23 10:10:30 [notice] 28844#28844: signal process started
2025/07/23 10:26:19 [notice] 29605#29605: signal process started
2025/07/23 10:34:37 [notice] 30255#30255: signal process started

 🧪 Тестирование: http://localhost:3001/test/API_TESTING_FULL.md
app_1  | 2025-07-23T09:48:08.093Z - GET /api/test
app_1  | 2025-07-23T09:48:38.268Z - GET /api/test
app_1  | 2025-07-23T09:49:08.421Z - GET /api/test
app_1  | 2025-07-23T09:49:38.553Z - GET /api/test
app_1  | 2025-07-23T09:50:08.691Z - GET /api/test
app_1  | 2025-07-23T09:50:38.820Z - GET /api/test
app_1  | 2025-07-23T09:51:08.970Z - GET /api/test
app_1  | 2025-07-23T09:51:39.080Z - GET /api/test
app_1  | 2025-07-23T09:52:09.214Z - GET /api/test
app_1  | 2025-07-23T09:52:39.362Z - GET /api/test
app_1  | 2025-07-23T09:53:09.474Z - GET /api/test
app_1  | 2025-07-23T09:53:39.601Z - GET /api/test
app_1  | 2025-07-23T09:54:09.743Z - GET /api/test
app_1  | 2025-07-23T09:54:39.861Z - GET /api/test
app_1  | 2025-07-23T09:55:10.062Z - GET /api/test
app_1  | 2025-07-23T09:55:40.193Z - GET /api/test
app_1  | 2025-07-23T09:56:10.319Z - GET /api/test
app_1  | 2025-07-23T09:56:40.491Z - GET /api/test
app_1  | 2025-07-23T09:57:10.636Z - GET /api/test
app_1  | 2025-07-23T09:57:40.752Z - GET /api/test
app_1  | 2025-07-23T09:58:10.904Z - GET /api/test
app_1  | 2025-07-23T09:58:41.007Z - GET /api/test
app_1  | 2025-07-23T09:59:11.153Z - GET /api/test
app_1  | 2025-07-23T09:59:41.279Z - GET /api/test
app_1  | 2025-07-23T10:00:11.403Z - GET /api/test
app_1  | 2025-07-23T10:00:41.557Z - GET /api/test
app_1  | 2025-07-23T10:01:11.684Z - GET /api/test
app_1  | 2025-07-23T10:01:41.800Z - GET /api/test
app_1  | 2025-07-23T10:02:11.935Z - GET /api/test
app_1  | 2025-07-23T10:02:42.062Z - GET /api/test
app_1  | 2025-07-23T10:02:54.751Z - GET /api/test
app_1  | 2025-07-23T10:03:12.200Z - GET /api/test
app_1  | 2025-07-23T10:03:42.337Z - GET /api/test
app_1  | 2025-07-23T10:04:12.469Z - GET /api/test
app_1  | 2025-07-23T10:04:42.588Z - GET /api/test
app_1  | 2025-07-23T10:05:12.691Z - GET /api/test
app_1  | 2025-07-23T10:05:42.807Z - GET /api/test
app_1  | 2025-07-23T10:06:12.928Z - GET /api/test
app_1  | 2025-07-23T10:06:43.099Z - GET /api/test
app_1  | 2025-07-23T10:07:13.255Z - GET /api/test
app_1  | 2025-07-23T10:07:43.383Z - GET /api/test
app_1  | 2025-07-23T10:08:13.499Z - GET /api/test
app_1  | 2025-07-23T10:08:43.633Z - GET /api/test
app_1  | 2025-07-23T10:09:13.775Z - GET /api/test
app_1  | 2025-07-23T10:09:43.897Z - GET /api/test
app_1  | 2025-07-23T10:10:14.025Z - GET /api/test
app_1  | 2025-07-23T10:10:35.646Z - GET /api/test
app_1  | 2025-07-23T10:10:44.151Z - GET /api/test
app_1  | 2025-07-23T10:11:14.281Z - GET /api/test
app_1  | 2025-07-23T10:11:44.387Z - GET /api/test
app_1  | 2025-07-23T10:11:54.558Z - GET /
app_1  | 2025-07-23T10:12:07.785Z - GET /
app_1  | 2025-07-23T10:12:14.501Z - GET /api/test
app_1  | 2025-07-23T10:12:44.627Z - GET /api/test
app_1  | 2025-07-23T10:13:14.764Z - GET /api/test
app_1  | 2025-07-23T10:13:44.889Z - GET /api/test
app_1  | 2025-07-23T10:14:15.012Z - GET /api/test
app_1  | 2025-07-23T10:14:40.839Z - HEAD /assets/index-DHTOhyEH.js
app_1  | 2025-07-23T10:14:45.111Z - GET /api/test
app_1  | 2025-07-23T10:14:53.713Z - GET /wp-admin/setup-config.php
app_1  | 2025-07-23T10:14:53.793Z - HEAD /assets/index-DHTOhyEH.js
app_1  | 2025-07-23T10:14:59.192Z - HEAD /assets/index-CAdt3OAK.css
app_1  | 2025-07-23T10:15:15.230Z - GET /api/test
app_1  | 2025-07-23T10:15:45.347Z - GET /api/test
app_1  | 2025-07-23T10:16:15.498Z - GET /api/test
app_1  | 2025-07-23T10:16:45.618Z - GET /api/test
app_1  | 2025-07-23T10:16:51.767Z - GET /wordpress/wp-admin/setup-config.php
app_1  | 2025-07-23T10:17:15.757Z - GET /api/test
app_1  | 2025-07-23T10:17:45.951Z - GET /api/test
app_1  | 2025-07-23T10:18:16.089Z - GET /api/test
app_1  | 2025-07-23T10:18:46.209Z - GET /api/test
app_1  | 2025-07-23T10:19:16.315Z - GET /api/test
app_1  | 2025-07-23T10:19:46.440Z - GET /api/test
app_1  | 2025-07-23T10:20:16.567Z - GET /api/test
app_1  | 2025-07-23T10:20:46.688Z - GET /api/test
app_1  | 2025-07-23T10:21:16.829Z - GET /api/test
app_1  | 2025-07-23T10:21:46.950Z - GET /api/test
app_1  | 2025-07-23T10:22:17.075Z - GET /api/test
app_1  | 2025-07-23T10:22:47.193Z - GET /api/test
app_1  | 2025-07-23T10:23:12.281Z - GET /
app_1  | 2025-07-23T10:23:17.303Z - GET /api/test
app_1  | 2025-07-23T10:23:47.431Z - GET /api/test
app_1  | 2025-07-23T10:24:17.576Z - GET /api/test
app_1  | 2025-07-23T10:24:47.705Z - GET /api/test
app_1  | 2025-07-23T10:25:17.825Z - GET /api/test
app_1  | 2025-07-23T10:25:47.964Z - GET /api/test
app_1  | 2025-07-23T10:26:18.090Z - GET /api/test
app_1  | 2025-07-23T10:26:30.067Z - GET /
app_1  | 2025-07-23T10:26:48.196Z - GET /api/test
app_1  | 2025-07-23T10:27:18.296Z - GET /api/test
app_1  | 2025-07-23T10:27:48.398Z - GET /api/test
app_1  | 2025-07-23T10:28:18.526Z - GET /api/test
app_1  | 2025-07-23T10:28:32.383Z - GET /api/test
app_1  | 2025-07-23T10:28:40.087Z - GET /
app_1  | 2025-07-23T10:28:48.659Z - GET /api/test
app_1  | 2025-07-23T10:28:55.153Z - GET /
app_1  | 2025-07-23T10:29:18.771Z - GET /api/test
app_1  | 2025-07-23T10:29:48.882Z - GET /api/test
app_1  |
app_1  | 🚫 Получен сигнал SIGTERM...
app_1  | 🌐 Остановка HTTP сервера...
app_1  | 🤖 Остановка Telegram Bot...
app_1  | 🛑 Telegram Bot остановлен
app_1  | ✅ HTTP сервер остановлен
app_1  | 📴 Соединение с БД закрыто
app_1  | 👋 Сервер остановлен
app_1  | 🚀 Запуск JAGUAR FIGHT CLUB API...
app_1  | ✅ Порт 3001 доступен
app_1  | ✅ Подключение к SQLite БД успешно
app_1  | ✅ Все таблицы БД созданы успешно
app_1  | 🔄 Проверка необходимости миграций...
app_1  | ✅ Миграции выполнены
app_1  | 🤖 Инициализация Telegram Bot...
app_1  | ✅ Команды бота настроены
app_1  | 🤖 Jaguar Telegram Bot инициализирован
app_1  | ✅ Telegram Bot инициализирован: @Jaguar_fight_club_bot (Jaguar_bot)
app_1  | ✅ Webhook настроен: https://beauty-bot-ai-bot-n8n.ru/webhook/telegram
app_1  | 🔗 Webhook настроен: https://beauty-bot-ai-bot-n8n.ru/webhook/telegram
app_1  | 🚀 JAGUAR FIGHT CLUB API запущен на порту 3001
app_1  | 🌐 Доступен по адресу: http://0.0.0.0:3001
app_1  | 🎯 Окружение: production
app_1  | 📊 API Endpoints:
app_1  |    ✨ Аутентификация:
app_1  |    - POST /api/auth/login - Вход
app_1  |    - POST /api/auth/register - Регистрация
app_1  |    - GET /api/auth/profile - Профиль
app_1  |    📋 Анкеты "Точка А":
app_1  |    - POST /api/point-a - Сохранение анкеты
app_1  |    - GET /api/point-a - Получение анкеты
app_1  |    💬 Комментарии:
app_1  |    - POST /api/comments - Добавление (тренер)
app_1  |    - GET /api/comments - Получение комментариев
app_1  |    👥 Пользователи:
app_1  |    - GET /api/users - Список клиентов (тренер)
app_1  |    - GET /api/users/:id - Информация о пользователе
app_1  |
app_1  | 🧪 Тестирование: http://localhost:3001/test/API_TESTING_FULL.md
app_1  | 2025-07-23T10:30:05.792Z - GET /api/test
app_1  | 2025-07-23T10:30:35.900Z - GET /api/test
app_1  | 2025-07-23T10:31:06.019Z - GET /api/test
app_1  | 2025-07-23T10:31:36.148Z - GET /api/test
app_1  | 2025-07-23T10:32:06.250Z - GET /api/test
app_1  | 2025-07-23T10:32:36.373Z - GET /api/test
app_1  | 2025-07-23T10:33:06.496Z - GET /api/test
app_1  | 2025-07-23T10:33:36.609Z - GET /api/test
app_1  | 2025-07-23T10:34:06.733Z - GET /api/test
app_1  | 2025-07-23T10:34:36.849Z - GET /api/test
app_1  | 2025-07-23T10:34:46.900Z - GET /
app_1  | 2025-07-23T10:34:53.082Z - GET /
app_1  | 2025-07-23T10:35:06.956Z - GET /api/test
app_1  | 2025-07-23T10:35:37.076Z - GET /api/test
app_1  | 2025-07-23T10:35:39.796Z - GET /
app_1  | 2025-07-23T10:36:07.194Z - GET /api/test
app_1  | 2025-07-23T10:36:37.322Z - GET /api/test
app_1  | 2025-07-23T10:36:44.200Z - GET /wp-admin/setup-config.php
app_1  | 2025-07-23T10:36:51.905Z - GET /