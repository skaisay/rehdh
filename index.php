<?php
// Проверяем User-Agent для детекции PWA
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$isPWA = strpos($userAgent, 'StatsTracker') !== false;

// Устанавливаем правильные заголовки
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Если это PWA, включаем основной контент
if ($isPWA || isset($_GET['app'])) {
    include 'index.html';
    exit;
}

// Иначе показываем страницу с кнопкой запуска
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stats Tracker - Запуск</title>
    <link rel="manifest" href="manifest.json">
    <style>
        body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: white;
        }
        .launch-container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 400px;
            width: 90%;
        }
        .app-icon {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            margin: 0 auto 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
        }
        h1 {
            margin: 0 0 0.5rem;
            font-size: 1.8rem;
            font-weight: 600;
        }
        .subtitle {
            margin: 0 0 2rem;
            opacity: 0.8;
            font-size: 1rem;
        }
        .launch-btn {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }
        .launch-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
        }
        .install-hint {
            margin-top: 1.5rem;
            font-size: 0.9rem;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="launch-container">
        <div class="app-icon">📊</div>
        <h1>Stats Tracker</h1>
        <p class="subtitle">Персональный трекер статистики игроков</p>
        <a href="?app=1" class="launch-btn">Запустить приложение</a>
        <p class="install-hint">Для установки PWA нажмите "Установить" в браузере</p>
    </div>
    
    <script>
        // Автоматическое перенаправление для PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            window.location.href = '?app=1';
        }
        
        // Регистрация service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').then(function(registration) {
                console.log('SW registered');
            }).catch(function(error) {
                console.log('SW registration failed');
            });
        }
    </script>
</body>
</html>
