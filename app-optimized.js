// Оптимизированное приложение Stats Tracker v2.0
// Полностью переписанная система с фокусом на стабильность и производительность

class OptimizedStatsTracker {
    constructor() {
        // Инициализация данных
        this.players = [];
        this.recentActions = []; // История последних действий
        this.currentBackground = 'https://i.postimg.cc/XJkg1VB3/a-gift-for-you-bocchi-the-rock-thumb.jpg';
        this.resizeMode = false;
        this.containerSizes = {};
        this.tempContainerSizes = {}; // Временное хранение изменений размеров
        this.currentEditingPlayer = null;
        
        // Системные переменные
        this.saveTimeout = null;
        this.isResizing = false;
        this.hasUnsavedResizeChanges = false; // Флаг несохраненных изменений
        
        // Полноэкранный режим
        this.fullscreenEnabled = false;
        this.autoFullscreen = false;
        this.isFullscreen = false;
        
        // Флаг инициализации
        this.initialized = false;
        
        // Наблюдатели для устойчивости фона
        this.backgroundObserver = null;
        this.backgroundCheck = null;
        
        // Доступные фоны
        this.backgrounds = [
            'https://i.postimg.cc/XJkg1VB3/a-gift-for-you-bocchi-the-rock-thumb.jpg',
            'https://i.postimg.cc/pdNMQZt8/korus-beachside-cafe-thumb.jpg',
            'https://i.postimg.cc/YSV8Zp3m/field-of-daisies-thumb.jpg',
            'https://i.postimg.cc/dVVB07Ny/luffy-clouds-one-piece-thumb.jpg',
            'https://i.postimg.cc/g0fq4gzV/black-cat-sakura-thumb.jpg',
            'https://i.postimg.cc/Yqgg3str/fishing-adventure-time-thumb.jpg',
            'https://i.postimg.cc/ZKDjjtTv/mila-looking-at-you-miside-thumb.jpg',
            'https://i.postimg.cc/sXN1qc1m/gojo-cursed-technique-lapse-blue-jujutsu-kaisen-thumb.jpg',
            'https://i.postimg.cc/0jN5kJKQ/lofi-pink-town-thumb.jpg',
            'https://i.postimg.cc/mkcxp3FQ/abandoned-house-lake-thumb.jpg',
            'https://i.postimg.cc/zDWLyc7N/moonlight-drive-thumb.jpg'
        ];
        
        // Инициализация приложения
        this.init();
    }

    init() {
        console.log('🚀 Initializing Optimized Stats Tracker...');
        
        // Предотвращаем множественную инициализацию
        if (this.initialized) {
            console.log('⚠️ App already initialized, skipping...');
            return;
        }
        this.initialized = true;
        
        // Проверяем правильность URL при запуске PWA
        this.checkAndFixStartURL();
        
        // Загрузка данных
        this.loadAllData();
        
        // Привязка событий
        this.bindEvents();
        
        // Применение фона
        this.applyBackground();
        
        // Рендеринг интерфейса
        this.renderAll();
        
        // Применяем сохраненные размеры контейнеров
        setTimeout(() => {
            this.applyContainerSizes(this.containerSizes);
        }, 500);
        
        // Настройка PWA titlebar
        this.setupPWATitlebar();
        
        // Автосохранение каждые 30 секунд
        setInterval(() => this.saveAllData(), 30000);
        
        console.log('✅ App initialized successfully');
        
        // Очищаем флаги перезагрузки при успешной инициализации
        sessionStorage.removeItem('reloadAttempted');
        sessionStorage.removeItem('checkAttempted');
        
        // Очищаем флаг автоматического полноэкранного режима через некоторое время
        setTimeout(() => {
            sessionStorage.removeItem('fullscreenAutoAttempted');
        }, 10000); // Через 10 секунд
        
        // Дополнительная проверка для PWA - убеждаемся что все элементы видны
        setTimeout(() => {
            this.ensureAppVisibility();
        }, 1000);
    }

    // === ИСПРАВЛЕНИЕ ПРОБЛЕМЫ С START URL ===
    checkAndFixStartURL() {
        // Проверяем, если мы находимся в directory listing
        if (window.location.pathname.endsWith('/') && 
            !window.location.pathname.endsWith('/index.html')) {
            
            // Проверяем наличие элементов приложения
            const appContainer = document.querySelector('.app-container');
            if (!appContainer) {
                console.log('🔄 Redirecting to index.html...');
                window.location.href = window.location.origin + window.location.pathname + 'index.html';
                return;
            }
        }
        
        // Для PWA - убеждаемся что мы на правильной странице
        const isPWA = window.matchMedia('(display-mode: standalone)').matches;
        if (isPWA && !document.querySelector('.app-container')) {
            console.log('🔄 PWA redirect to index.html...');
            window.location.replace('./index.html');
        }
    }

    // === НАСТРОЙКА PWA TITLEBAR ===
    setupPWATitlebar() {
        // Проверяем, запущено ли приложение как PWA
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone === true ||
                      document.referrer.includes('android-app://');
        
        // Проверяем поддержку window-controls-overlay
        const supportsWindowControlsOverlay = 'windowControlsOverlay' in navigator;
        
        if (isPWA && supportsWindowControlsOverlay) {
            console.log('🖼️ PWA window-controls-overlay detected');
            
            // Показываем drag region
            const dragRegion = document.getElementById('titlebar-drag-region');
            if (dragRegion) {
                dragRegion.style.display = 'block';
            }
            
            // Обновляем layout при изменении геометрии
            if (navigator.windowControlsOverlay) {
                navigator.windowControlsOverlay.addEventListener('geometrychange', () => {
                    this.updateTitlebarLayout();
                });
                
                // Первоначальная настройка
                this.updateTitlebarLayout();
            }
        } else {
            console.log('ℹ️ Standard browser mode');
        }
    }

    updateTitlebarLayout() {
        const { x, y, width, height } = navigator.windowControlsOverlay.getTitlebarAreaRect();
        
        // Обновляем CSS переменные для точного позиционирования
        document.documentElement.style.setProperty('--titlebar-area-x', `${x}px`);
        document.documentElement.style.setProperty('--titlebar-area-y', `${y}px`);
        document.documentElement.style.setProperty('--titlebar-area-width', `${width}px`);
        document.documentElement.style.setProperty('--titlebar-area-height', `${height}px`);
        
        console.log(`🖼️ Titlebar geometry: ${width}x${height} at (${x}, ${y})`);
    }

    // === СИСТЕМА СОХРАНЕНИЯ/ЗАГРУЗКИ ===
    saveAllData() {
        try {
            const data = {
                players: this.players,
                background: this.currentBackground,
                containerSizes: this.containerSizes,
                fullscreenSettings: {
                    autoFullscreen: this.autoFullscreen
                },
                timestamp: Date.now()
            };
            
            const dataString = JSON.stringify(data);
            
            // Основное сохранение
            localStorage.setItem('stats-tracker-v2', dataString);
            
            // Резервная копия
            localStorage.setItem('stats-tracker-backup', dataString);
            
            console.log('✅ Data saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Save failed:', error);
            return false;
        }
    }

    loadAllData() {
        try {
            // Попытка загрузки основных данных
            let dataString = localStorage.getItem('stats-tracker-v2');
            
            // Если не найдены, пробуем резервную копию
            if (!dataString) {
                dataString = localStorage.getItem('stats-tracker-backup');
            }
            
            if (dataString) {
                const data = JSON.parse(dataString);
                this.players = data.players || [];
                this.currentBackground = data.background || this.backgrounds[0];
                this.containerSizes = data.containerSizes || {};
                
                // Загружаем настройки полноэкранного режима
                if (data.fullscreenSettings) {
                    this.autoFullscreen = data.fullscreenSettings.autoFullscreen || false;
                }
                
                // Инициализируем полноэкранный режим если включен автоматический
                this.initializeFullscreenSettings();
                
                console.log('✅ Data loaded successfully');
            } else {
                console.log('ℹ️ No saved data found, using defaults');
                this.initializeFullscreenSettings();
            }
        } catch (error) {
            console.error('❌ Load failed:', error);
            this.players = [];
            this.currentBackground = this.backgrounds[0];
            this.containerSizes = {};
            this.autoFullscreen = false;
            this.initializeFullscreenSettings();
        }
    }

    clearAllData() {
        if (confirm('⚠️ Удалить все данные?\n\nЭто действие нельзя отменить!')) {
            localStorage.removeItem('stats-tracker-v2');
            localStorage.removeItem('stats-tracker-backup');
            
            this.players = [];
            this.currentBackground = this.backgrounds[0];
            this.containerSizes = {};
            
            this.applyBackground();
            this.renderAll();
            
            alert('✅ Все данные удалены!');
        }
    }

    exportData() {
        const data = {
            players: this.players,
            background: this.currentBackground,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stats-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // === СИСТЕМА УПРАВЛЕНИЯ ИГРОКАМИ ===
    addPlayer(nickname, kills = 0, deaths = 0, time = 0) {
        if (!nickname || nickname.trim() === '') {
            alert('Введите никнейм игрока');
            return false;
        }

        // Проверка на дубликаты
        if (this.players.find(p => p.nickname.toLowerCase() === nickname.toLowerCase())) {
            alert(`Игрок "${nickname}" уже существует!`);
            return false;
        }

        const player = {
            id: Date.now(),
            nickname: nickname.trim(),
            kills: parseInt(kills) || 0,
            deaths: parseInt(deaths) || 0,
            time: parseFloat(time) || 0,
            screenshot: null,
            created: Date.now(),
            updated: Date.now()
        };

        this.players.push(player);
        this.saveAllData();
        this.renderPlayers();
        this.updateOverview();
        
        // Добавляем действие в историю
        this.addRecentAction('add', `Добавлен игрок ${nickname}`, `${kills} убийств • ${deaths} смертей`);
        
        console.log('✅ Player added:', player);
        return true;
    }

    deletePlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return false;

        if (confirm(`Удалить игрока "${player.nickname}"?`)) {
            this.players = this.players.filter(p => p.id !== playerId);
            this.saveAllData();
            this.renderPlayers();
            this.updateOverview();
            
            // Добавляем действие в историю
            this.addRecentAction('delete', `Удален игрок ${player.nickname}`, 'Игрок удален из системы');
            
            return true;
        }
        return false;
    }

    updatePlayer(playerId, data) {
        const index = this.players.findIndex(p => p.id === playerId);
        if (index === -1) return false;
        
        const oldPlayer = { ...this.players[index] };

        this.players[index] = {
            ...this.players[index],
            ...data,
            updated: Date.now()
        };

        this.saveAllData();
        this.renderPlayers();
        this.updateOverview();
        
        // Добавляем действие в историю
        if (oldPlayer.nickname !== data.nickname) {
            this.addRecentAction('edit', `Изменен игрок ${data.nickname}`, 'Обновлены данные игрока');
        } else {
            this.addRecentAction('edit', `Обновлен ${data.nickname}`, `${data.kills} убийств • ${data.deaths} смертей`);
        }
        
        return true;
    }

    // === СИСТЕМА ФОНОВ ===
    setBackground(backgroundUrl) {
        if (!this.backgrounds.includes(backgroundUrl)) {
            console.warn('Unknown background URL:', backgroundUrl);
            return false;
        }

        this.currentBackground = backgroundUrl;
        this.applyBackground();
        this.updateBackgroundSelection();
        this.saveAllData();
        
        // Добавляем действие в историю
        this.addRecentAction('background', 'Изменен фон приложения', 'Обновлен дизайн интерфейса');
        
        console.log('✅ Background changed to:', backgroundUrl);
        return true;
    }

    applyBackground() {
        // Принудительно сохраняем фон при любых изменениях DOM
        this.forceBackgroundPersistence();
        
        // Убеждаемся что у body есть базовый цвет фона
        document.body.style.backgroundColor = '#1a1a1a !important';
        document.documentElement.style.backgroundColor = '#1a1a1a !important';
        
        // Предзагружаем изображение для избежания белого экрана
        const img = new Image();
        img.onload = () => {
            // Применяем фон с !important для предотвращения перезаписи
            const backgroundStyle = `#1a1a1a url('${this.currentBackground}') center/cover no-repeat fixed`;
            
            document.body.style.background = backgroundStyle;
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.backgroundPosition = 'center top';
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundRepeat = 'no-repeat';
            
            // Применяем тот же фон к html для покрытия titlebar
            document.documentElement.style.background = backgroundStyle;
            document.documentElement.style.backgroundAttachment = 'fixed';
            document.documentElement.style.backgroundPosition = 'center top';
            document.documentElement.style.backgroundSize = 'cover';
            document.documentElement.style.backgroundRepeat = 'no-repeat';
            
            // Обновляем CSS переменную для псевдо-элемента
            document.documentElement.style.setProperty('--current-background', `url('${this.currentBackground}')`);
            
            // Добавляем inline стили которые сложнее удалить
            this.addPersistentBackgroundStyles();
            
            console.log('✅ Background image loaded and applied with persistence');
        };
        
        img.onerror = () => {
            console.warn('⚠️ Failed to load background image, using default color');
            // Оставляем только цветной фон при ошибке загрузки изображения
            document.body.style.background = '#1a1a1a !important';
            document.documentElement.style.background = '#1a1a1a !important';
            this.addPersistentBackgroundStyles();
        };
        
        // Начинаем загрузку изображения
        img.src = this.currentBackground;
        
        // Обновляем theme-color для лучшей интеграции с системой
        this.updateThemeColor();
        
        console.log('🎨 Background applied to both html and body for titlebar integration');
    }

    updateThemeColor() {
        // Определяем доминирующий цвет в зависимости от фона
        const backgroundColors = {
            'https://i.postimg.cc/XJkg1VB3/a-gift-for-you-bocchi-the-rock-thumb.jpg': '#2c1810', // теплый темно-коричневый
            'https://i.postimg.cc/pdNMQZt8/korus-beachside-cafe-thumb.jpg': '#1a2332', // холодный темно-синий
            'https://i.postimg.cc/YSV8Zp3m/field-of-daisies-thumb.jpg': '#1c2b1c', // темно-зеленый
            'https://i.postimg.cc/dVVB07Ny/luffy-clouds-one-piece-thumb.jpg': '#1a1e2b', // темно-синий
            'https://i.postimg.cc/g0fq4gzV/black-cat-sakura-thumb.jpg': '#2b1a2b'  // темно-фиолетовый
        };
        
        const themeColor = backgroundColors[this.currentBackground] || '#0d1117';
        
        // Обновляем theme-color meta tag
        let themeColorMeta = document.querySelector('meta[name="theme-color"]:not([media])');
        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', themeColor);
        }
        
        // Обновляем msapplication-TileColor для Windows
        let tileMeta = document.querySelector('meta[name="msapplication-TileColor"]');
        if (tileMeta) {
            tileMeta.setAttribute('content', themeColor);
        }
        
        // Обновляем msapplication-navbutton-color для Windows
        let navMeta = document.querySelector('meta[name="msapplication-navbutton-color"]');
        if (navMeta) {
            navMeta.setAttribute('content', themeColor);
        }
        
        console.log(`🎨 Theme color updated to: ${themeColor}`);
    }

    updateBackgroundSelection() {
        document.querySelectorAll('.bg-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.bg === this.currentBackground) {
                option.classList.add('active');
            }
        });
    }

    // === УСТОЙЧИВОСТЬ ФОНА ===
    forceBackgroundPersistence() {
        // Наблюдатель за изменениями стилей body и html
        if (!this.backgroundObserver) {
            this.backgroundObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const target = mutation.target;
                        if ((target === document.body || target === document.documentElement) && 
                            !target.style.background.includes(this.currentBackground)) {
                            
                            console.log('🔄 Background was removed, reapplying...');
                            this.reapplyBackgroundSilently();
                        }
                    }
                });
            });

            this.backgroundObserver.observe(document.body, { 
                attributes: true, 
                attributeFilter: ['style'] 
            });
            
            this.backgroundObserver.observe(document.documentElement, { 
                attributes: true, 
                attributeFilter: ['style'] 
            });
        }

        // Периодическая проверка фона каждые 2 секунды
        if (!this.backgroundCheck) {
            this.backgroundCheck = setInterval(() => {
                if (!document.body.style.background.includes(this.currentBackground)) {
                    console.log('🔄 Periodic background check: reapplying...');
                    this.reapplyBackgroundSilently();
                }
            }, 2000);
        }
    }

    reapplyBackgroundSilently() {
        // Быстрое переприменение фона без перезагрузки изображения
        const backgroundStyle = `#1a1a1a url('${this.currentBackground}') center/cover no-repeat fixed`;
        
        document.body.style.background = backgroundStyle;
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundPosition = 'center top';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
        
        document.documentElement.style.background = backgroundStyle;
        document.documentElement.style.backgroundAttachment = 'fixed';
        document.documentElement.style.backgroundPosition = 'center top';
        document.documentElement.style.backgroundSize = 'cover';
        document.documentElement.style.backgroundRepeat = 'no-repeat';
        
        document.documentElement.style.setProperty('--current-background', `url('${this.currentBackground}')`);
    }

    addPersistentBackgroundStyles() {
        // Добавляем встроенные стили в head которые сложнее удалить
        let persistentStyle = document.getElementById('persistent-background-style');
        if (!persistentStyle) {
            persistentStyle = document.createElement('style');
            persistentStyle.id = 'persistent-background-style';
            document.head.appendChild(persistentStyle);
        }

        persistentStyle.textContent = `
            html, body {
                background: #1a1a1a url('${this.currentBackground}') center/cover no-repeat fixed !important;
                background-attachment: fixed !important;
                background-position: center top !important;
                background-size: cover !important;
                background-repeat: no-repeat !important;
            }
            
            /* Предотвращаем белый экран */
            html::before, body::before {
                content: "";
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #1a1a1a url('${this.currentBackground}') center/cover no-repeat fixed;
                z-index: -9999;
                pointer-events: none;
            }
        `;
    }

    // === СИСТЕМА ИЗМЕНЕНИЯ РАЗМЕРОВ ===
    toggleResizeMode() {
        this.resizeMode = !this.resizeMode;
        const button = document.getElementById('toggle-resize-mode');
        const saveButton = document.getElementById('save-resize-changes');
        const hint = document.querySelector('.resize-hint');
        
        if (this.resizeMode) {
            document.body.classList.add('resize-mode');
            button.innerHTML = `
                <svg viewBox="0 0 24 24" class="button-icon">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
                Выйти из режима изменения
            `;
            button.classList.add('active');
            if (saveButton) saveButton.style.display = 'inline-flex';
            if (hint) hint.style.display = 'block';
            
            // Копируем текущие размеры во временное хранилище
            this.tempContainerSizes = JSON.parse(JSON.stringify(this.containerSizes));
            this.hasUnsavedResizeChanges = false;
            this.updateSaveButtonState();
            
            this.addResizeHandles();
        } else {
            document.body.classList.remove('resize-mode');
            button.innerHTML = `
                <svg viewBox="0 0 24 24" class="button-icon">
                    <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7.27C13.4,7.61 14.26,8.15 14.26,8.15C14.79,8.68 15.58,8.68 16.11,8.15C16.64,7.62 16.64,6.83 16.11,6.3L15.27,5.46C15.61,5.06 16.74,4 16.74,4C17.27,3.47 18.06,3.47 18.59,4C19.12,4.53 19.12,5.32 18.59,5.85L17.73,6.69C18.07,7.03 19.15,8.15 19.15,8.15C19.68,8.68 19.68,9.47 19.15,10C18.62,10.53 17.83,10.53 17.3,10L16.46,9.16C16.1,9.5 15,10.63 15,10.63C14.47,11.16 13.68,11.16 13.15,10.63C12.62,10.1 12.62,9.31 13.15,8.78L14,7.92C13.74,7.58 13,6.84 13,6.84V18.16C13,18.16 13.74,17.42 14,17.08L13.15,16.22C12.62,15.69 12.62,14.9 13.15,14.37C13.68,13.84 14.47,13.84 15,14.37C15,14.37 16.1,15.5 16.46,15.84L17.3,15C17.83,14.47 18.62,14.47 19.15,15C19.68,15.53 19.68,16.32 19.15,16.85C19.15,16.85 18.07,17.97 17.73,18.31L18.59,19.15C19.12,19.68 19.12,20.47 18.59,21C18.06,21.53 17.27,21.53 16.74,21C16.74,21 15.61,19.94 15.27,19.54L16.11,18.7C16.64,18.17 16.64,17.38 16.11,16.85C15.58,16.32 14.79,16.32 14.26,16.85C14.26,16.85 13.4,17.39 13,17.73V19.27C13.6,19.61 14,20.26 14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21C10,20.26 10.4,19.61 11,19.27V17.73C10.6,17.39 9.74,16.85 9.74,16.85C9.21,16.32 8.42,16.32 7.89,16.85C7.36,17.38 7.36,18.17 7.89,18.7L8.73,19.54C8.39,19.94 7.26,21 7.26,21C6.73,21.53 5.94,21.53 5.41,21C4.88,20.47 4.88,19.68 5.41,19.15L6.27,18.31C5.93,17.97 4.85,16.85 4.85,16.85C4.32,16.32 4.32,15.53 4.85,15C5.38,14.47 6.17,14.47 6.7,15L7.54,15.84C7.9,15.5 9,14.37 9,14.37C9.53,13.84 10.32,13.84 10.85,14.37C11.38,14.9 11.38,15.69 10.85,16.22L10,17.08C10.26,17.42 11,18.16 11,18.16V6.84C11,6.84 10.26,7.58 10,7.92L10.85,8.78C11.38,9.31 11.38,10.1 10.85,10.63C10.32,11.16 9.53,11.16 9,10.63C9,10.63 7.9,9.5 7.54,9.16L6.7,10C6.17,10.53 5.38,10.53 4.85,10C4.32,9.47 4.32,8.68 4.85,8.15C4.85,8.15 5.93,7.03 6.27,6.69L5.41,5.85C4.88,5.32 4.88,4.53 5.41,4C5.94,3.47 6.73,3.47 7.26,4C7.26,4 8.39,5.06 8.73,5.46L7.89,6.3C7.36,6.83 7.36,7.62 7.89,8.15C8.42,8.68 9.21,8.68 9.74,8.15C9.74,8.15 10.6,7.61 11,7.27V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
                </svg>
                Режим изменения размеров
            `;
            button.classList.remove('active');
            if (saveButton) saveButton.style.display = 'none';
            if (hint) hint.style.display = 'none';
            
            // Если есть несохраненные изменения, спрашиваем пользователя
            if (this.hasUnsavedResizeChanges) {
                if (confirm('❓ У вас есть несохраненные изменения размеров контейнеров.\n\nСохранить изменения?')) {
                    this.saveResizeChanges();
                } else {
                    // Отменяем изменения
                    this.applyContainerSizes(this.containerSizes);
                    this.tempContainerSizes = {};
                    this.hasUnsavedResizeChanges = false;
                }
            }
            
            this.removeResizeHandles();
        }
    }

    addResizeHandles() {
        // Удаляем старые handles если есть
        this.removeResizeHandles();
        
        // Находим все изменяемые контейнеры на всех вкладках
        const containers = document.querySelectorAll('.glass-card:not(.modal):not(.detailed-stats-modal)');
        
        containers.forEach(container => {
            // Пропускаем контейнеры, которые нельзя изменять (например, модальные окна)
            if (container.closest('.modal') || container.classList.contains('modal')) {
                return;
            }
            
            // Добавляем класс для идентификации
            container.classList.add('resizable-container');
            
            // События для показа/скрытия handles
            container.addEventListener('mouseenter', () => this.showHandles(container));
            container.addEventListener('mouseleave', () => this.hideHandles(container));
            
            // Создаем handles для каждого контейнера
            const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'bottom', 'left', 'right'];
            handles.forEach(position => {
                const handle = document.createElement('div');
                handle.className = `resize-handle ${position}`;
                handle.dataset.position = position;
                
                // Добавляем обработчики
                handle.addEventListener('mousedown', (e) => this.startResize(e, container, position));
                
                container.appendChild(handle);
            });
        });
        
        console.log(`✅ Resize handles added to ${containers.length} containers`);
    }

    removeResizeHandles() {
        // Удаляем все handles
        document.querySelectorAll('.resize-handle').forEach(handle => {
            handle.remove();
        });
        
        // Убираем класс resizable-container
        document.querySelectorAll('.resizable-container').forEach(container => {
            container.classList.remove('resizable-container');
        });
    }

    showHandles(container) {
        if (!this.resizeMode || this.isResizing) return;
        container.querySelectorAll('.resize-handle').forEach(handle => {
            handle.classList.add('visible');
        });
    }

    hideHandles(container) {
        if (this.isResizing) return;
        container.querySelectorAll('.resize-handle').forEach(handle => {
            handle.classList.remove('visible');
        });
    }

    startResize(e, container, position) {
        e.preventDefault();
        e.stopPropagation();
        
        this.isResizing = true;
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = container.offsetWidth;
        const startHeight = container.offsetHeight;
        const rect = container.getBoundingClientRect();
        
        const onMouseMove = (e) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newWidth = startWidth;
            let newHeight = startHeight;
            
            // Рассчитываем новые размеры в зависимости от позиции handle
            if (position.includes('right')) newWidth = startWidth + deltaX;
            if (position.includes('left')) newWidth = startWidth - deltaX;
            if (position.includes('bottom')) newHeight = startHeight + deltaY;
            if (position.includes('top')) newHeight = startHeight - deltaY;
            
            // Минимальные размеры
            newWidth = Math.max(200, newWidth);
            newHeight = Math.max(100, newHeight);
            
            // Применяем новые размеры
            container.style.width = newWidth + 'px';
            container.style.height = newHeight + 'px';
        };
        
        const onMouseUp = () => {
            this.isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            // Сохраняем размеры во временное хранилище
            const containerId = this.getContainerId(container);
            this.tempContainerSizes[containerId] = {
                width: container.style.width,
                height: container.style.height
            };
            
            // Отмечаем, что есть несохраненные изменения
            this.hasUnsavedResizeChanges = true;
            this.updateSaveButtonState();
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    // === УПРАВЛЕНИЕ СОХРАНЕНИЕМ ИЗМЕНЕНИЙ ===
    saveResizeChanges() {
        // Копируем временные изменения в основное хранилище
        this.containerSizes = JSON.parse(JSON.stringify(this.tempContainerSizes));
        
        // Сохраняем в localStorage
        this.saveAllData();
        
        // Сбрасываем флаг изменений
        this.hasUnsavedResizeChanges = false;
        this.updateSaveButtonState();
        
        // Показываем уведомление
        this.showNotification('✅ Размеры контейнеров сохранены!', 'success');
        
        console.log('✅ Resize changes saved');
    }

    updateSaveButtonState() {
        const saveButton = document.getElementById('save-resize-changes');
        if (saveButton) {
            if (this.hasUnsavedResizeChanges) {
                saveButton.classList.add('has-changes');
                saveButton.innerHTML = `
                    <svg viewBox="0 0 24 24" class="button-icon">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                    </svg>
                    Сохранить изменения *
                `;
            } else {
                saveButton.classList.remove('has-changes');
                saveButton.innerHTML = `
                    <svg viewBox="0 0 24 24" class="button-icon">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                    </svg>
                    Изменения сохранены
                `;
            }
        }
    }

    getContainerId(container) {
        // Генерируем уникальный ID для контейнера на основе его положения и содержимого
        const parent = container.closest('.tab-content');
        const tabId = parent ? parent.id : 'unknown';
        const index = Array.from(parent.querySelectorAll('.glass-card')).indexOf(container);
        return `${tabId}-${index}`;
    }

    applyContainerSizes(sizes) {
        // Применяем размеры ко всем контейнерам
        document.querySelectorAll('.glass-card:not(.modal):not(.detailed-stats-modal)').forEach((container, globalIndex) => {
            const containerId = this.getContainerId(container);
            if (sizes[containerId]) {
                container.style.width = sizes[containerId].width;
                container.style.height = sizes[containerId].height;
            }
        });
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10001;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.background = 'rgba(0, 128, 0, 0.8)';
        }
        
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // === ПРИВЯЗКА СОБЫТИЙ ===
    bindEvents() {
        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => this.switchTab(item.dataset.tab));
        });

        // Быстрое добавление игрока
        const quickAddBtn = document.getElementById('quick-add-btn');
        const quickInput = document.getElementById('quick-nickname');
        
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => this.quickAddPlayer());
        }
        
        if (quickInput) {
            quickInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.quickAddPlayer();
            });
        }

        // Кнопка добавления игрока
        const addPlayerBtn = document.getElementById('add-player-btn');
        if (addPlayerBtn) {
            console.log('✅ Add player button found, attaching event listener');
            addPlayerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔧 Add player button clicked');
                this.openPlayerModal();
            });
        } else {
            console.warn('❌ Add player button not found');
        }

        // Модальное окно
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-button');
        const form = document.getElementById('player-form');
        
        if (closeBtn) closeBtn.addEventListener('click', () => this.closePlayerModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closePlayerModal());
        if (form) form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Фоны
        document.addEventListener('click', (e) => {
            const bgOption = e.target.closest('.bg-option');
            if (bgOption && bgOption.dataset.bg) {
                this.setBackground(bgOption.dataset.bg);
            }
        });

        // Изменение размеров
        const resizeBtn = document.getElementById('toggle-resize-mode');
        const saveResizeBtn = document.getElementById('save-resize-changes');
        
        if (resizeBtn) {
            resizeBtn.addEventListener('click', () => this.toggleResizeMode());
        }
        
        if (saveResizeBtn) {
            saveResizeBtn.addEventListener('click', () => this.saveResizeChanges());
        }

        // Фильтры игроков
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('players-filter-btn')) {
                this.handlePlayerFilter(e.target);
            }
            if (e.target.classList.contains('filter-btn')) {
                this.handleStatsFilter(e.target);
            }
        });

        // Сохранение при закрытии
        window.addEventListener('beforeunload', () => this.saveAllData());
        
        // Полноэкранный режим
        this.bindFullscreenEvents();
        
        console.log('✅ Events bound successfully');
    }

    // === ОБРАБОТЧИКИ СОБЫТИЙ ===
    quickAddPlayer() {
        const input = document.getElementById('quick-nickname');
        if (!input) return;

        const nickname = input.value.trim();
        if (this.addPlayer(nickname)) {
            input.value = '';
        }
    }

    switchTab(tabName) {
        // Обновляем навигацию
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabName);
        });

        // Обновляем контент
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });

        // Специальная логика для вкладок
        if (tabName === 'players') {
            this.renderPlayers();
            this.updateOverview();
        } else if (tabName === 'stats') {
            this.renderStats();
        } else if (tabName === 'settings') {
            this.updateBackgroundSelection();
        }

        // Обновляем resize handles для новой вкладки если режим включен
        if (this.resizeMode) {
            // Небольшая задержка чтобы DOM успел обновиться
            setTimeout(() => {
                this.addResizeHandles();
            }, 100);
        }
    }

    editPlayerById(playerId) {
        console.log('🔧 Edit player by ID:', playerId);
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            console.log('✅ Player found:', player);
            this.openPlayerModal(player);
        } else {
            console.error('❌ Player not found with ID:', playerId);
        }
    }

    openPlayerModal(player = null) {
        console.log('🔧 Opening player modal, player:', player);
        this.currentEditingPlayer = player;
        const modal = document.getElementById('player-modal');
        const form = document.getElementById('player-form');
        const title = document.getElementById('modal-title');
        
        if (!modal) {
            console.error('❌ Modal element not found');
            return;
        }
        
        if (!form) {
            console.error('❌ Form element not found');
            return;
        }
        
        if (player) {
            title.textContent = 'Редактировать игрока';
            form['player-nickname'].value = player.nickname;
            form['player-kills'].value = player.kills;
            form['player-deaths'].value = player.deaths;
            form['player-time'].value = player.time;
        } else {
            title.textContent = 'Добавить игрока';
            form.reset();
        }
        
        console.log('🔧 Adding active class to modal');
        modal.classList.add('active');
        form['player-nickname'].focus();
        console.log('✅ Modal should be visible now');
    }

    closePlayerModal() {
        console.log('🔧 Closing player modal');
        const modal = document.getElementById('player-modal');
        const form = document.getElementById('player-form');
        
        modal.classList.remove('active');
        form.reset();
        this.currentEditingPlayer = null;
        console.log('✅ Modal closed');
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const data = {
            nickname: form['player-nickname'].value.trim(),
            kills: parseInt(form['player-kills'].value) || 0,
            deaths: parseInt(form['player-deaths'].value) || 0,
            time: parseFloat(form['player-time'].value) || 0
        };

        if (this.currentEditingPlayer) {
            this.updatePlayer(this.currentEditingPlayer.id, data);
        } else {
            this.addPlayer(data.nickname, data.kills, data.deaths, data.time);
        }

        this.closePlayerModal();
    }

    handlePlayerFilter(button) {
        document.querySelectorAll('.players-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        const sortType = button.dataset.sort;
        this.renderPlayers(sortType);
    }

    handleStatsFilter(button) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        const filterType = button.dataset.filter;
        this.renderStats(filterType);
    }

    openShareModal(playerData) {
        console.log('📤 Opening share modal for player:', playerData);
        
        // Открываем модальное окно для экспорта
        const modal = document.getElementById('player-share-modal');
        if (!modal) {
            console.error('❌ Share modal not found');
            return;
        }

        // Отображаем информацию об игроке
        const playerInfoElement = document.getElementById('share-player-info');
        if (playerInfoElement) {
            const kd = playerData.deaths > 0 ? (playerData.kills / playerData.deaths).toFixed(2) : playerData.kills.toFixed(2);
            playerInfoElement.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #4CAF50, #2196F3); 
                                border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                                color: white; font-weight: bold; font-size: 18px;">
                        ${playerData.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${playerData.nickname}</div>
                        <div style="display: flex; gap: 20px; font-size: 13px; opacity: 0.8;">
                            <span>Убийств: <strong>${playerData.kills}</strong></span>
                            <span>Смертей: <strong>${playerData.deaths}</strong></span>
                            <span>K/D: <strong>${kd}</strong></span>
                            <span>Времени: <strong>${playerData.time}ч</strong></span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Генерируем код игрока
        const shareCode = this.generatePlayerShareCode(playerData);
        const shareCodeElement = document.getElementById('player-share-code');
        if (shareCodeElement) {
            shareCodeElement.value = shareCode;
        }

        // Показываем модальное окно
        modal.style.display = 'flex';
    }

    generatePlayerShareCode(playerData) {
        try {
            // Создаем объект для экспорта (без внутренних ID)
            const exportData = {
                nickname: playerData.nickname,
                kills: playerData.kills,
                deaths: playerData.deaths,
                time: playerData.time,
                created: playerData.created || Date.now(),
                exported: Date.now()
            };

            console.log('🔧 Генерируем код для игрока:', exportData);

            // Кодируем в Base64
            const jsonString = JSON.stringify(exportData);
            const base64Code = btoa(unescape(encodeURIComponent(jsonString)));
            
            // Добавляем префикс для идентификации
            const fullCode = `GFRJRF://${base64Code}`;
            
            console.log('✅ Сгенерирован код:', fullCode);
            console.log('📝 JSON строка:', jsonString);
            
            return fullCode;
            
        } catch (error) {
            console.error('❌ Error generating share code:', error);
            return 'Ошибка создания кода';
        }
    }

    // === РЕНДЕРИНГ ИНТЕРФЕЙСА ===
    renderAll() {
        this.renderPlayers();
        this.renderStats();
        this.updateOverview();
        this.updateBackgroundSelection();
    }

    renderPlayers(sortType = 'name') {
        const container = document.getElementById('players-cards-grid');
        if (!container) return;

        if (this.players.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2>🎮 Нет игроков</h2>
                    <p>Добавьте игроков для начала работы</p>
                    <button class="glass-button primary" onclick="if(window.appNew) window.appNew.openPlayerModal(); else console.error('App not found');">
                        Добавить первого игрока
                    </button>
                </div>
            `;
            return;
        }

        // Сортировка игроков
        const sortedPlayers = [...this.players].sort((a, b) => {
            switch (sortType) {
                case 'kills': return b.kills - a.kills;
                case 'deaths': return b.deaths - a.deaths;
                case 'time': return b.time - a.time;
                case 'date': return b.created - a.created;
                default: return a.nickname.localeCompare(b.nickname);
            }
        });

        container.innerHTML = sortedPlayers.map((player, index) => {
            const kd = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2);
            
            return `
                <div class="player-management-card glass-card ${index < 3 ? 'top-player' : ''}">
                    <div class="player-card-header-new">
                        <div class="player-avatar-new">
                            ${player.nickname.charAt(0).toUpperCase()}
                        </div>
                        <div class="player-info-new">
                            <div class="player-name-new">${player.nickname}</div>
                            <div class="player-date-new">
                                Добавлен: ${new Date(player.created).toLocaleDateString('ru-RU')}
                            </div>
                        </div>
                        <div class="player-actions-new">
                            <button class="action-btn share" onclick="appNew.openShareModal(${JSON.stringify(player).replace(/"/g, '&quot;')})" title="Поделиться">
                                <svg style="width:16px;height:16px;fill:currentColor;" viewBox="0 0 24 24">
                                    <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.6 20.92,19A2.92,2.92 0 0,0 18,16.08Z"/>
                                </svg>
                            </button>
                            <button class="action-btn edit" onclick="appNew.editPlayerById(${player.id})" title="Редактировать">
                                <svg style="width:16px;height:16px;fill:currentColor;" viewBox="0 0 24 24">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                </svg>
                            </button>
                            <button class="action-btn delete" onclick="appNew.deletePlayer(${player.id})" title="Удалить">
                                <svg style="width:16px;height:16px;fill:currentColor;" viewBox="0 0 24 24">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="player-stats-new">
                        <div class="stat-item-new">
                            <div class="stat-value-new">${player.kills}</div>
                            <div class="stat-label-new">Убийств</div>
                        </div>
                        <div class="stat-item-new">
                            <div class="stat-value-new">${player.deaths}</div>
                            <div class="stat-label-new">Смертей</div>
                        </div>
                        <div class="stat-item-new">
                            <div class="stat-value-new">${player.time}ч</div>
                            <div class="stat-label-new">Времени</div>
                        </div>
                        <div class="stat-item-new">
                            <div class="stat-value-new">${(player.kills / Math.max(player.time, 1)).toFixed(1)}</div>
                            <div class="stat-label-new">У/час</div>
                        </div>
                    </div>

                    <div class="player-kd-new">
                        <div class="kd-value-new">${kd}</div>
                        <div class="kd-label-new">K/D Соотношение</div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Если режим изменения размеров включен, добавляем handles к новым элементам
        if (this.resizeMode) {
            setTimeout(() => {
                this.addResizeHandles();
            }, 100);
        }
    }

    renderStats(filterType = 'kills') {
        if (this.players.length === 0) return;

        // Топ-5 игроков
        const top5Container = document.getElementById('top-5-list');
        const featuredContainer = document.getElementById('featured-players-grid');

        // Сортировка для топ-5
        const sortedPlayers = [...this.players].sort((a, b) => {
            switch (filterType) {
                case 'deaths': return b.deaths - a.deaths;
                case 'time': return b.time - a.time;
                case 'kd': 
                    const kdA = a.deaths > 0 ? a.kills / a.deaths : a.kills;
                    const kdB = b.deaths > 0 ? b.kills / b.deaths : b.kills;
                    return kdB - kdA;
                default: return b.kills - a.kills;
            }
        });

        const top5 = sortedPlayers.slice(0, 5);

        if (top5Container) {
            top5Container.innerHTML = top5.map((player, index) => {
                const kd = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2);
                
                return `
                    <div class="top-5-item">
                        <div class="top-5-rank rank-${index + 1}">${index + 1}</div>
                        <div class="top-5-info">
                            <div class="top-5-name">${player.nickname}</div>
                            <div class="top-5-stats">
                                K/D: <span class="top-5-value">${kd}</span> | 
                                Убийств: <span class="top-5-value">${player.kills}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (featuredContainer) {
            const featured = sortedPlayers.slice(0, 3);
            featuredContainer.innerHTML = featured.map(player => {
                const kd = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2);
                
                return `
                    <div class="featured-player-card glass-card">
                        <div class="featured-player-header">
                            <div class="featured-player-avatar">
                                ${player.nickname.charAt(0).toUpperCase()}
                            </div>
                            <div class="featured-player-info">
                                <h3>${player.nickname}</h3>
                                <div class="featured-player-date">
                                    Добавлен: ${new Date(player.created).toLocaleDateString('ru-RU')}
                                </div>
                            </div>
                        </div>
                        <div class="featured-player-stats">
                            <div class="featured-stat">
                                <div class="featured-stat-value">${kd}</div>
                                <div class="featured-stat-label">K/D</div>
                            </div>
                            <div class="featured-stat">
                                <div class="featured-stat-value">${player.kills}</div>
                                <div class="featured-stat-label">Убийств</div>
                            </div>
                            <div class="featured-stat">
                                <div class="featured-stat-value">${player.deaths}</div>
                                <div class="featured-stat-label">Смертей</div>
                            </div>
                            <div class="featured-stat">
                                <div class="featured-stat-value">${player.time}ч</div>
                                <div class="featured-stat-label">Времени</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Общая статистика
        const totalPlayers = this.players.length;
        const totalKills = this.players.reduce((sum, p) => sum + p.kills, 0);
        const totalDeaths = this.players.reduce((sum, p) => sum + p.deaths, 0);
        const totalTime = this.players.reduce((sum, p) => sum + p.time, 0);

        const statsElements = {
            'total-players-stat': totalPlayers,
            'total-kills-stat': totalKills,
            'total-deaths-stat': totalDeaths,
            'total-time-stat': totalTime.toFixed(1) + 'ч'
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
        
        // Если режим изменения размеров включен, добавляем handles к новым элементам
        if (this.resizeMode) {
            setTimeout(() => {
                this.addResizeHandles();
            }, 100);
        }
    }

    updateOverview() {
        const totalPlayers = this.players.length;
        const totalKills = this.players.reduce((sum, p) => sum + p.kills, 0);
        const totalDeaths = this.players.reduce((sum, p) => sum + p.deaths, 0);
        const totalTime = this.players.reduce((sum, p) => sum + p.time, 0);

        const elements = {
            'total-players': totalPlayers,
            'total-kills': totalKills,
            'total-deaths': totalDeaths,
            'total-time': totalTime.toFixed(1)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
        
        // Обновляем мини-топ игроков для мобильных
        this.updateTopPlayersMini();
    }
    
    updateTopPlayersMini() {
        const container = document.getElementById('top-players-mini-list');
        if (!container) return;
        
        if (this.players.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <p>Пока нет игроков</p>
                    <p class="empty-hint">Добавьте первого игрока чтобы увидеть статистику</p>
                </div>
            `;
            return;
        }
        
        // Сортируем игроков по убийствам (топ 3)
        const topPlayers = [...this.players]
            .sort((a, b) => b.kills - a.kills)
            .slice(0, 3);
            
        const html = topPlayers.map((player, index) => {
            const rank = index + 1;
            const kd = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2);
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
            
            return `
                <div class="mini-top-player" onclick="appNew.editPlayerById('${player.id}')">
                    <div class="mini-player-rank">${medal}</div>
                    <div class="mini-player-info">
                        <div class="mini-player-name">${player.nickname}</div>
                        <div class="mini-player-stats">${player.kills} убийств • K/D ${kd}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    }
    
    // === ПОСЛЕДНИЕ ДЕЙСТВИЯ ===
    addRecentAction(type, title, subtitle = '') {
        const action = {
            id: Date.now(),
            type,
            title,
            subtitle,
            timestamp: new Date(),
            time: this.formatTime(new Date())
        };
        
        this.recentActions.unshift(action);
        
        // Оставляем только последние 5 действий
        if (this.recentActions.length > 5) {
            this.recentActions = this.recentActions.slice(0, 5);
        }
        
        this.updateRecentActions();
    }
    
    updateRecentActions() {
        const container = document.getElementById('recent-actions-list');
        if (!container) return;
        
        if (this.recentActions.length === 0) {
            container.innerHTML = `
                <div class="recent-action-item">
                    <div class="action-icon">👤</div>
                    <div class="action-text">
                        <div class="action-title">Добро пожаловать!</div>
                        <div class="action-subtitle">Начните добавлять игроков</div>
                    </div>
                    <div class="action-time">сейчас</div>
                </div>
            `;
            return;
        }
        
        const html = this.recentActions.map(action => {
            const icon = this.getActionIcon(action.type);
            return `
                <div class="recent-action-item">
                    <div class="action-icon">${icon}</div>
                    <div class="action-text">
                        <div class="action-title">${action.title}</div>
                        <div class="action-subtitle">${action.subtitle}</div>
                    </div>
                    <div class="action-time">${action.time}</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    }
    
    getActionIcon(type) {
        const icons = {
            'add': '➕',
            'edit': '✏️',
            'delete': '🗑️',
            'stats': '📊',
            'background': '🎨'
        };
        return icons[type] || '📝';
    }
    
    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'сейчас';
        if (minutes < 60) return `${minutes} мин назад`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} ч назад`;
        
        return date.toLocaleDateString('ru-RU');
    }

    // === ПОЛНОЭКРАННЫЙ РЕЖИМ ===

    bindFullscreenEvents() {
        // Переключатель автоматического полноэкранного режима
        const autoToggle = document.getElementById('fullscreen-auto-toggle');
        if (autoToggle) {
            autoToggle.addEventListener('change', (e) => {
                this.autoFullscreen = e.target.checked;
                this.updateFullscreenStatus();
                this.saveAllData();
                console.log('Auto fullscreen changed:', this.autoFullscreen);
            });
        }

        // Кнопка мгновенного переключения полноэкранного режима
        const toggleBtn = document.getElementById('toggle-fullscreen-now');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                console.log('Fullscreen toggle button clicked');
                this.toggleFullscreen();
            });
        }

        // Обработка клавиши F11 (только если пользователь в фокусе приложения)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F11' && !e.defaultPrevented) {
                e.preventDefault();
                console.log('F11 pressed, toggling fullscreen');
                this.toggleFullscreen();
            }
        });

        // Обработка событий полноэкранного режима браузера
        const fullscreenChangeEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
        
        fullscreenChangeEvents.forEach(eventName => {
            document.addEventListener(eventName, () => {
                const isInFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
                this.isFullscreen = isInFullscreen;
                this.updateFullscreenButtonText();
                console.log('Fullscreen state changed:', isInFullscreen);
            });
        });

        // Инициализация при загрузке если включен автоматический режим (с задержкой и проверкой)
        if (this.autoFullscreen && !sessionStorage.getItem('fullscreenAutoAttempted')) {
            sessionStorage.setItem('fullscreenAutoAttempted', 'true');
            setTimeout(() => {
                console.log('Auto fullscreen enabled, entering fullscreen...');
                this.enterFullscreen();
            }, 3000); // Увеличиваем задержку до 3 секунд
        }

        console.log('✅ Fullscreen events bound successfully');
    }

    initializeFullscreenSettings() {
        // Обновляем UI элементы в соответствии с сохраненными настройками
        const autoToggle = document.getElementById('fullscreen-auto-toggle');
        const statusElement = document.getElementById('fullscreen-status');

        if (autoToggle) {
            autoToggle.checked = this.autoFullscreen;
        }

        this.updateFullscreenStatus();
        this.updateFullscreenButtonText();
    }

    updateFullscreenStatus() {
        const statusElement = document.getElementById('fullscreen-status');
        if (statusElement) {
            statusElement.textContent = this.autoFullscreen ? 'Включено' : 'Выключено';
            statusElement.style.color = this.autoFullscreen ? 'var(--accent-color)' : 'var(--text-secondary)';
        }
    }

    updateFullscreenButtonText() {
        const buttonText = document.getElementById('fullscreen-button-text');
        const button = document.getElementById('toggle-fullscreen-now');
        
        if (buttonText && button) {
            if (this.isFullscreen) {
                buttonText.textContent = 'Выйти из полного экрана';
                button.querySelector('.button-icon path').setAttribute('d', 'M14,14H19V16H16V19H14V14M5,14H10V19H8V16H5V14M8,5H10V10H5V8H8V5M19,8V10H14V5H16V8H19Z');
            } else {
                buttonText.textContent = 'Включить полный экран';
                button.querySelector('.button-icon path').setAttribute('d', 'M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z');
            }
        }
    }

    async toggleFullscreen() {
        try {
            // Добавляем индикатор загрузки
            const button = document.getElementById('toggle-fullscreen-now');
            if (button) {
                button.disabled = true;
                button.style.opacity = '0.7';
            }

            if (this.isFullscreen) {
                await this.exitFullscreen();
            } else {
                await this.enterFullscreen();
            }
            
            // Убираем индикатор загрузки
            if (button) {
                button.disabled = false;
                button.style.opacity = '1';
            }
            
        } catch (error) {
            console.log('⚠️ Fullscreen toggle failed, using fallback:', error);
            
            // Убираем индикатор загрузки при ошибке
            const button = document.getElementById('toggle-fullscreen-now');
            if (button) {
                button.disabled = false;
                button.style.opacity = '1';
            }
            
            // Fallback для старых браузеров
            this.toggleFullscreenFallback();
        }
    }

    async enterFullscreen() {
        try {
            // Проверяем поддержку Fullscreen API
            if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled && !document.msFullscreenEnabled) {
                console.log('Fullscreen API not supported, using fallback');
                this.enableFullscreenFallback();
                return;
            }

            // Пытаемся войти в полноэкранный режим
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                await document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                await document.documentElement.msRequestFullscreen();
            } else {
                // Fallback если API не поддерживается
                console.log('No fullscreen method available, using CSS fallback');
                this.enableFullscreenFallback();
                return;
            }
            
            this.isFullscreen = true;
            this.updateFullscreenButtonText();
            
            console.log('✅ Entered fullscreen mode successfully');
        } catch (error) {
            console.log('⚠️ Fullscreen API failed, using fallback:', error.message);
            this.enableFullscreenFallback();
        }
    }

    async exitFullscreen() {
        try {
            // Проверяем, находимся ли мы в полноэкранном режиме
            if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    await document.msExitFullscreen();
                } else {
                    this.disableFullscreenFallback();
                }
            } else {
                // Если мы не в полноэкранном режиме API, используем fallback
                this.disableFullscreenFallback();
            }
            
            this.isFullscreen = false;
            this.updateFullscreenButtonText();
            
            console.log('✅ Exited fullscreen mode successfully');
        } catch (error) {
            console.log('⚠️ Exit fullscreen failed, using fallback:', error.message);
            this.disableFullscreenFallback();
        }
    }

    enableFullscreenFallback() {
        // CSS-based fullscreen для старых браузеров
        document.body.classList.add('fullscreen-mode');
        document.documentElement.classList.add('fullscreen-mode');
        
        // Скрываем системные элементы
        if (window.chrome && window.chrome.webstore) {
            // Chrome-specific
            document.body.style.margin = '0';
            document.body.style.padding = '0';
            document.body.style.overflow = 'hidden';
        }
        
        this.isFullscreen = true;
        this.updateFullscreenButtonText();
        
        console.log('✅ Fullscreen fallback enabled');
    }

    disableFullscreenFallback() {
        // Отключение CSS-based fullscreen
        document.body.classList.remove('fullscreen-mode');
        document.documentElement.classList.remove('fullscreen-mode');
        
        // Восстанавливаем стили
        document.body.style.margin = '';
        document.body.style.padding = '';
        document.body.style.overflow = '';
        
        this.isFullscreen = false;
        this.updateFullscreenButtonText();
        
        console.log('✅ Fullscreen fallback disabled');
    }

    toggleFullscreenFallback() {
        if (this.isFullscreen) {
            this.disableFullscreenFallback();
        } else {
            this.enableFullscreenFallback();
        }
    }

    // === ОБЕСПЕЧЕНИЕ ВИДИМОСТИ ПРИЛОЖЕНИЯ ===
    ensureAppVisibility() {
        const appContainer = document.querySelector('.app-container');
        const mainContent = document.querySelector('.main-content');
        const nav = document.querySelector('.glass-nav');
        
        if (!appContainer || !mainContent || !nav) {
            console.warn('⚠️ Some app elements are missing, attempting to reload...');
            
            // Пытаемся перезагрузить только один раз
            if (!window.hasReloaded) {
                window.hasReloaded = true;
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
            return;
        }
        
        // Убеждаемся что все элементы видны
        appContainer.style.opacity = '1';
        appContainer.style.visibility = 'visible';
        mainContent.style.opacity = '1';
        mainContent.style.visibility = 'visible';
        nav.style.opacity = '1';
        nav.style.visibility = 'visible';
        
        // Убеждаемся что body имеет правильный фон
        const body = document.body;
        if (window.getComputedStyle(body).backgroundColor === 'rgba(0, 0, 0, 0)' || 
            window.getComputedStyle(body).backgroundColor === 'transparent') {
            body.style.backgroundColor = '#1a1a1a';
        }
        
        console.log('✅ App visibility ensured');
    }
}

// Инициализация приложения
let appNew;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing optimized app...');
    try {
        appNew = new OptimizedStatsTracker();
        window.appNew = appNew; // Глобальный доступ
        
        // Инициализация мобильной навигации
        initMobileNavigation();
        
        console.log('✅ Optimized app initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing optimized app:', error);
    }
});

// Обеспечиваем доступность приложения
window.addEventListener('load', () => {
    if (appNew) {
        window.appNew = appNew;
        console.log('✅ Optimized app made globally available');
    }
});

// ========================================
// МОБИЛЬНАЯ НАВИГАЦИЯ
// ========================================

function initMobileNavigation() {
    console.log('📱 Initializing mobile navigation...');
    
    // Проверяем, что мы на мобильном устройстве
    if (!isMobileDevice()) {
        console.log('🖥️ Desktop device detected, mobile nav not needed');
        return;
    }
    
    // Добавляем обработчики для мобильной навигации
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    mobileNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.getAttribute('data-tab');
            
            // Убираем активный класс со всех элементов
            mobileNavItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Убираем активный класс со всех элементов десктопной навигации
            const desktopNavItems = document.querySelectorAll('.nav-item');
            desktopNavItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Добавляем активный класс к выбранному элементу
            item.classList.add('active');
            
            // Переключаем вкладки
            switchToTab(targetTab);
        });
    });
    
    // Синхронизируем с существующей навигацией
    synchronizeNavigation();
    
    console.log('✅ Mobile navigation initialized');
}

function isMobileDevice() {
    return window.innerWidth <= 768;
}

function switchToTab(tabName) {
    console.log(`📱 Switching to tab: ${tabName}`);
    
    // Скрываем все вкладки
    const allTabs = document.querySelectorAll('.tab-content');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Показываем нужную вкладку
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
        
        // Прокручиваем наверх при переключении
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
        }
        
        // Обновляем данные если нужно
        if (appNew) {
            switch(tabName) {
                case 'players':
                    appNew.renderPlayers();
                    appNew.updateOverview();
                    break;
                case 'stats':
                    appNew.renderStats();
                    break;
                case 'settings':
                    appNew.updateBackgroundSelection();
                    break;
            }
        }
    }
}

function synchronizeNavigation() {
    // Синхронизируем состояние мобильной и десктопной навигации
    const desktopNavItems = document.querySelectorAll('.nav-item');
    
    desktopNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            
            // Обновляем мобильную навигацию
            const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
            mobileNavItems.forEach(mobileItem => {
                mobileItem.classList.remove('active');
                if (mobileItem.getAttribute('data-tab') === targetTab) {
                    mobileItem.classList.add('active');
                }
            });
        });
    });
}

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    // Небольшая задержка чтобы избежать множественных вызовов
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        if (isMobileDevice()) {
            // Если переключились на мобильный, инициализируем навигацию
            if (!document.querySelector('.mobile-nav-item[data-initialized="true"]')) {
                initMobileNavigation();
                // Помечаем как инициализированную
                document.querySelectorAll('.mobile-nav-item').forEach(item => {
                    item.setAttribute('data-initialized', 'true');
                });
            }
        }
    }, 250);
});

// Предотвращение конфликтов с touch событиями
document.addEventListener('touchstart', (e) => {
    // Разрешаем touch только для интерактивных элементов
    const target = e.target.closest('.mobile-nav-item, .glass-button, .glass-input, button, input, select, textarea');
    if (!target) {
        // Для остальных элементов предотвращаем нежелательные touch события
        return;
    }
}, { passive: true });

// Улучшенная обработка тач событий для навигации
document.addEventListener('touchend', (e) => {
    const mobileNavItem = e.target.closest('.mobile-nav-item');
    if (mobileNavItem) {
        // Добавляем тактильную обратную связь
        mobileNavItem.style.transform = 'scale(0.95)';
        setTimeout(() => {
            mobileNavItem.style.transform = '';
        }, 150);
    }
}, { passive: true });

console.log('📱 Mobile navigation module loaded');
