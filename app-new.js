// Новая стабильная система Stats Tracker - Полная переработка
// Оптимизированная для максимальной надежности и производительности

class StatsTrackerNew {
    constructor() {
        // Инициализация базовых свойств
        this.players = [];
        this.activityLog = [];
        this.settings = {
            currentBackground: 'https://i.postimg.cc/XJkg1VB3/a-gift-for-you-bocchi-the-rock-thumb.jpg',
            resizeMode: false,
            containerSizes: {}
        };
        
        // Доступные фоны
        this.backgrounds = [
            {
                url: 'https://i.postimg.cc/XJkg1VB3/a-gift-for-you-bocchi-the-rock-thumb.jpg',
                name: 'Bocchi the Rock'
            },
            {
                url: 'https://i.postimg.cc/pdNMQZt8/korus-beachside-cafe-thumb.jpg',
                name: 'Beach Cafe'
            },
            {
                url: 'https://i.postimg.cc/YSV8Zp3m/field-of-daisies-thumb.jpg',
                name: 'Поле ромашек'
            },
            {
                url: 'https://i.postimg.cc/dVVB07Ny/luffy-clouds-one-piece-thumb.jpg',
                name: 'One Piece'
            },
            {
                url: 'https://i.postimg.cc/g0fq4gzV/black-cat-sakura-thumb.jpg',
                name: 'Кот сакура'
            }
        ];
        
        // Состояние приложения
        this.isInitialized = false;
        this.saveInProgress = false;
        
        console.log('🚀 Инициализация новой системы Stats Tracker...');
        this.init();
    }
    
    async init() {
        try {
            // 1. Загрузка данных
            await this.loadAllData();
            
            // 2. Инициализация UI
            this.initializeUI();
            
            // 3. Настройка событий
            this.setupEventListeners();
            
            // 4. Применение настроек
            this.applySettings();
            
            // 5. Первичная отрисовка
            this.renderAll();
            
            this.isInitialized = true;
            console.log('✅ Новая система успешно инициализирована');
            this.addActivity('Приложение запущено (новая система)');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            this.showError('Ошибка запуска приложения');
        }
    }
    
    // === СИСТЕМА СОХРАНЕНИЯ/ЗАГРУЗКИ ===
    
    async loadAllData() {
        console.log('📂 Загрузка всех данных...');
        
        try {
            // Загрузка игроков
            const playersData = this.loadFromStorage('players');
            this.players = Array.isArray(playersData) ? playersData : [];
            console.log(`✅ Загружено игроков: ${this.players.length}`);
            
            // Загрузка активности
            const activityData = this.loadFromStorage('activity');
            this.activityLog = Array.isArray(activityData) ? activityData : [];
            console.log(`✅ Загружено записей активности: ${this.activityLog.length}`);
            
            // Загрузка настроек
            const settingsData = this.loadFromStorage('settings');
            if (settingsData && typeof settingsData === 'object') {
                this.settings = { ...this.settings, ...settingsData };
            }
            console.log('✅ Настройки загружены');
            
        } catch (error) {
            console.error('❌ Ошибка загрузки данных:', error);
        }
    }
    
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(`stats-new-${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`❌ Ошибка загрузки ${key}:`, error);
            return null;
        }
    }
    
    async saveAllData() {
        if (this.saveInProgress) {
            console.log('⏳ Сохранение уже выполняется...');
            return;
        }
        
        this.saveInProgress = true;
        console.log('💾 Сохранение всех данных...');
        
        try {
            // Сохранение с проверкой
            const success = 
                this.saveToStorage('players', this.players) &&
                this.saveToStorage('activity', this.activityLog) &&
                this.saveToStorage('settings', this.settings);
                
            if (success) {
                console.log('✅ Все данные успешно сохранены');
            } else {
                throw new Error('Сохранение частично не удалось');
            }
            
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            this.showError('Ошибка сохранения данных');
        } finally {
            this.saveInProgress = false;
        }
    }
    
    saveToStorage(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(`stats-new-${key}`, jsonData);
            
            // Проверка сохранения
            const verification = localStorage.getItem(`stats-new-${key}`);
            const isValid = verification === jsonData;
            
            if (isValid) {
                console.log(`✅ ${key} сохранен успешно (${jsonData.length} символов)`);
            } else {
                console.error(`❌ Проверка сохранения ${key} не прошла`);
            }
            
            return isValid;
        } catch (error) {
            console.error(`❌ Ошибка сохранения ${key}:`, error);
            return false;
        }
    }
    
    // === СИСТЕМА УПРАВЛЕНИЯ ФОНАМИ ===
    
    initBackgroundSystem() {
        console.log('🎨 Инициализация системы фонов...');
        
        // Создаем контейнер для опций фонов, если его нет
        const backgroundOptions = document.querySelector('.background-options');
        if (!backgroundOptions) {
            console.error('❌ Контейнер background-options не найден');
            return;
        }
        
        // Очищаем контейнер
        backgroundOptions.innerHTML = '';
        
        // Создаем опции фонов
        this.backgrounds.forEach((bg, index) => {
            const option = document.createElement('div');
            option.className = 'bg-option';
            option.dataset.bg = bg.url;
            option.dataset.index = index;
            
            const isActive = bg.url === this.settings.currentBackground;
            if (isActive) {
                option.classList.add('active');
            }
            
            option.innerHTML = `
                <img src="${bg.url}" alt="${bg.name}" loading="lazy">
                <span>${bg.name}</span>
            `;
            
            // Добавляем обработчик клика
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.changeBackground(bg.url);
            });
            
            backgroundOptions.appendChild(option);
        });
        
        console.log('✅ Система фонов инициализирована');
    }
    
    changeBackground(newUrl) {
        console.log('🎨 Смена фона на:', newUrl);
        
        try {
            // Обновляем настройки
            this.settings.currentBackground = newUrl;
            
            // Применяем фон
            document.body.style.background = `url('${newUrl}') center/cover no-repeat fixed`;
            
            // Обновляем активный элемент
            document.querySelectorAll('.bg-option').forEach(option => {
                option.classList.remove('active');
                if (option.dataset.bg === newUrl) {
                    option.classList.add('active');
                }
            });
            
            // Сохраняем изменения
            this.saveAllData();
            this.addActivity(`Фон изменен: ${this.getBackgroundName(newUrl)}`);
            
            console.log('✅ Фон успешно изменен');
            
        } catch (error) {
            console.error('❌ Ошибка смены фона:', error);
            this.showError('Ошибка изменения фона');
        }
    }
    
    getBackgroundName(url) {
        const bg = this.backgrounds.find(b => b.url === url);
        return bg ? bg.name : 'Неизвестный фон';
    }
    
    applyCurrentBackground() {
        try {
            const url = this.settings.currentBackground;
            document.body.style.background = `url('${url}') center/cover no-repeat fixed`;
            console.log('✅ Текущий фон применен:', url);
        } catch (error) {
            console.error('❌ Ошибка применения фона:', error);
        }
    }
    
    // === СИСТЕМА УПРАВЛЕНИЯ ИГРОКАМИ ===
    
    addPlayer(playerData) {
        console.log('👤 Добавление игрока:', playerData.nickname);
        
        try {
            // Проверка на дублирование
            const exists = this.players.find(p => 
                p.nickname.toLowerCase() === playerData.nickname.toLowerCase()
            );
            
            if (exists) {
                this.showError(`Игрок "${playerData.nickname}" уже существует`);
                return false;
            }
            
            // Создание объекта игрока
            const newPlayer = {
                id: Date.now() + Math.random(),
                nickname: playerData.nickname.trim(),
                kills: parseInt(playerData.kills) || 0,
                deaths: parseInt(playerData.deaths) || 0,
                time: parseFloat(playerData.time) || 0,
                screenshot: playerData.screenshot || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Добавление в массив
            this.players.push(newPlayer);
            
            // Сохранение и обновление UI
            this.saveAllData();
            this.renderPlayers();
            this.updateOverview();
            this.addActivity(`Добавлен игрок: ${newPlayer.nickname}`);
            
            console.log('✅ Игрок добавлен успешно');
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка добавления игрока:', error);
            this.showError('Ошибка добавления игрока');
            return false;
        }
    }
    
    updatePlayer(playerId, playerData) {
        console.log('📝 Обновление игрока:', playerId);
        
        try {
            const index = this.players.findIndex(p => p.id === playerId);
            if (index === -1) {
                this.showError('Игрок не найден');
                return false;
            }
            
            // Обновление данных
            this.players[index] = {
                ...this.players[index],
                ...playerData,
                updatedAt: new Date().toISOString()
            };
            
            // Сохранение и обновление UI
            this.saveAllData();
            this.renderPlayers();
            this.updateOverview();
            this.addActivity(`Обновлен игрок: ${this.players[index].nickname}`);
            
            console.log('✅ Игрок обновлен успешно');
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка обновления игрока:', error);
            this.showError('Ошибка обновления игрока');
            return false;
        }
    }
    
    deletePlayer(playerId) {
        console.log('🗑️ Удаление игрока:', playerId);
        
        try {
            const player = this.players.find(p => p.id === playerId);
            if (!player) {
                this.showError('Игрок не найден');
                return false;
            }
            
            if (!confirm(`Удалить игрока "${player.nickname}"?`)) {
                return false;
            }
            
            // Удаление из массива
            this.players = this.players.filter(p => p.id !== playerId);
            
            // Сохранение и обновление UI
            this.saveAllData();
            this.renderPlayers();
            this.updateOverview();
            this.addActivity(`Удален игрок: ${player.nickname}`);
            
            console.log('✅ Игрок удален успешно');
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка удаления игрока:', error);
            this.showError('Ошибка удаления игрока');
            return false;
        }
    }
    
    // === СИСТЕМА ИЗМЕНЕНИЯ РАЗМЕРОВ ===
    
    toggleResizeMode() {
        console.log('🔧 Переключение режима изменения размеров');
        
        try {
            this.settings.resizeMode = !this.settings.resizeMode;
            const button = document.getElementById('toggle-resize-mode');
            
            if (this.settings.resizeMode) {
                // Включение режима
                document.body.classList.add('resize-mode');
                button.innerHTML = `
                    <svg viewBox="0 0 24 24" class="button-icon">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                    Выйти из режима изменения
                `;
                button.classList.add('active');
                this.enableResizeHandles();
                this.addActivity('Режим изменения размеров включен');
                
            } else {
                // Выключение режима
                document.body.classList.remove('resize-mode');
                button.innerHTML = `
                    <svg viewBox="0 0 24 24" class="button-icon">
                        <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7.27C13.4,7.61 14.26,8.15 14.26,8.15C14.79,8.68 15.58,8.68 16.11,8.15C16.64,7.62 16.64,6.83 16.11,6.3L15.27,5.46C15.61,5.06 16.74,4 16.74,4C17.27,3.47 18.06,3.47 18.59,4C19.12,4.53 19.12,5.32 18.59,5.85L17.73,6.69C18.07,7.03 19.15,8.15 19.15,8.15C19.68,8.68 19.68,9.47 19.15,10C18.62,10.53 17.83,10.53 17.3,10L16.46,9.16C16.1,9.5 15,10.63 15,10.63C14.47,11.16 13.68,11.16 13.15,10.63C12.62,10.1 12.62,9.31 13.15,8.78L14,7.92C13.74,7.58 13,6.84 13,6.84V18.16C13,18.16 13.74,17.42 14,17.08L13.15,16.22C12.62,15.69 12.62,14.9 13.15,14.37C13.68,13.84 14.47,13.84 15,14.37C15,14.37 16.1,15.5 16.46,15.84L17.3,15C17.83,14.47 18.62,14.47 19.15,15C19.68,15.53 19.68,16.32 19.15,16.85C19.15,16.85 18.07,17.97 17.73,18.31L18.59,19.15C19.12,19.68 19.12,20.47 18.59,21C18.06,21.53 17.27,21.53 16.74,21C16.74,21 15.61,19.94 15.27,19.54L16.11,18.7C16.64,18.17 16.64,17.38 16.11,16.85C15.58,16.32 14.79,16.32 14.26,16.85C14.26,16.85 13.4,17.39 13,17.73V19.27C13.6,19.61 14,20.26 14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21C10,20.26 10.4,19.61 11,19.27V17.73C10.6,17.39 9.74,16.85 9.74,16.85C9.21,16.32 8.42,16.32 7.89,16.85C7.36,17.38 7.36,18.17 7.89,18.7L8.73,19.54C8.39,19.94 7.26,21 7.26,21C6.73,21.53 5.94,21.53 5.41,21C4.88,20.47 4.88,19.68 5.41,19.15L6.27,18.31C5.93,17.97 4.85,16.85 4.85,16.85C4.32,16.32 4.32,15.53 4.85,15C5.38,14.47 6.17,14.47 6.7,15L7.54,15.84C7.9,15.5 9,14.37 9,14.37C9.53,13.84 10.32,13.84 10.85,14.37C11.38,14.9 11.38,15.69 10.85,16.22L10,17.08C10.26,17.42 11,18.16 11,18.16V6.84C11,6.84 10.26,7.58 10,7.92L10.85,8.78C11.38,9.31 11.38,10.1 10.85,10.63C10.32,11.16 9.53,11.16 9,10.63C9,10.63 7.9,9.5 7.54,9.16L6.7,10C6.17,10.53 5.38,10.53 4.85,10C4.32,9.47 4.32,8.68 4.85,8.15C4.85,8.15 5.93,7.03 6.27,6.69L5.41,5.85C4.88,5.32 4.88,4.53 5.41,4C5.94,3.47 6.73,3.47 7.26,4C7.26,4 8.39,5.06 8.73,5.46L7.89,6.3C7.36,6.83 7.36,7.62 7.89,8.15C8.42,8.68 9.21,8.68 9.74,8.15C9.74,8.15 10.6,7.61 11,7.27V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
                    </svg>
                    Режим изменения размеров
                `;
                button.classList.remove('active');
                this.disableResizeHandles();
                this.addActivity('Режим изменения размеров выключен');
            }
            
            // Сохранение настроек
            this.saveAllData();
            console.log('✅ Режим изменения размеров переключен');
            
        } catch (error) {
            console.error('❌ Ошибка переключения режима изменения размеров:', error);
            this.showError('Ошибка переключения режима');
        }
    }
    
    enableResizeHandles() {
        // Простая реализация - добавляем класс для всех контейнеров
        document.querySelectorAll('.glass-card').forEach(card => {
            card.classList.add('resizable');
        });
        
        // Показываем подсказку
        const hint = document.querySelector('.resize-hint');
        if (hint) {
            hint.style.display = 'block';
            hint.textContent = 'Режим изменения размеров активен. Настройка размеров доступна.';
        }
    }
    
    disableResizeHandles() {
        document.querySelectorAll('.glass-card').forEach(card => {
            card.classList.remove('resizable');
        });
        
        const hint = document.querySelector('.resize-hint');
        if (hint) {
            hint.style.display = 'none';
        }
    }
    
    // === UI КОМПОНЕНТЫ ===
    
    initializeUI() {
        console.log('🎨 Инициализация UI...');
        
        // Инициализация системы фонов
        this.initBackgroundSystem();
        
        console.log('✅ UI инициализирован');
    }
    
    setupEventListeners() {
        console.log('🔗 Настройка обработчиков событий...');
        
        // Навигация по вкладкам
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.switchTab(item.dataset.tab);
            });
        });
        
        // Быстрое добавление игрока
        const quickAddBtn = document.getElementById('quick-add-btn');
        const quickInput = document.getElementById('quick-nickname');
        
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => this.handleQuickAdd());
        }
        
        if (quickInput) {
            quickInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleQuickAdd();
                }
            });
        }
        
        // Кнопка добавления игрока
        const addPlayerBtn = document.getElementById('add-player-btn');
        if (addPlayerBtn) {
            addPlayerBtn.addEventListener('click', () => this.openPlayerModal());
        }
        
        // Модальное окно игрока
        const playerForm = document.getElementById('player-form');
        if (playerForm) {
            playerForm.addEventListener('submit', (e) => this.handlePlayerSubmit(e));
        }
        
        const closeModal = document.getElementById('close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closePlayerModal());
        }
        
        const cancelButton = document.getElementById('cancel-button');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => this.closePlayerModal());
        }
        
        // Кнопка изменения размеров
        const resizeButton = document.getElementById('toggle-resize-mode');
        if (resizeButton) {
            resizeButton.addEventListener('click', () => this.toggleResizeMode());
        }
        
        // Автосохранение при видимости страницы
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveAllData();
            }
        });
        
        // Сохранение перед закрытием
        window.addEventListener('beforeunload', () => {
            this.saveAllData();
        });
        
        console.log('✅ Обработчики событий настроены');
    }
    
    switchTab(tabName) {
        // Обновление навигации
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        
        // Обновление контента
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName)?.classList.add('active');
        
        // Специфичная логика для вкладок
        switch (tabName) {
            case 'players':
                this.renderPlayers();
                break;
            case 'stats':
                this.renderStats();
                break;
            case 'settings':
                this.renderActivity();
                break;
        }
        
        console.log(`📋 Переключение на вкладку: ${tabName}`);
    }
    
    handleQuickAdd() {
        const input = document.getElementById('quick-nickname');
        if (!input) return;
        
        const nickname = input.value.trim();
        if (!nickname) {
            this.showError('Введите никнейм игрока');
            return;
        }
        
        const success = this.addPlayer({
            nickname: nickname,
            kills: 0,
            deaths: 0,
            time: 0
        });
        
        if (success) {
            input.value = '';
            this.showSuccess(`Игрок "${nickname}" добавлен!`);
        }
    }
    
    openPlayerModal(player = null) {
        const modal = document.getElementById('player-modal');
        const form = document.getElementById('player-form');
        const title = document.getElementById('modal-title');
        
        if (!modal || !form || !title) return;
        
        this.currentEditingPlayer = player;
        
        if (player) {
            title.textContent = 'Редактировать игрока';
            form.elements['player-nickname'].value = player.nickname;
            form.elements['player-kills'].value = player.kills;
            form.elements['player-deaths'].value = player.deaths;
            form.elements['player-time'].value = player.time;
        } else {
            title.textContent = 'Добавить игрока';
            form.reset();
        }
        
        modal.classList.add('active');
        form.elements['player-nickname'].focus();
    }
    
    closePlayerModal() {
        const modal = document.getElementById('player-modal');
        const form = document.getElementById('player-form');
        
        if (modal) modal.classList.remove('active');
        if (form) form.reset();
        
        this.currentEditingPlayer = null;
    }
    
    handlePlayerSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const playerData = {
            nickname: form.elements['player-nickname'].value.trim(),
            kills: parseInt(form.elements['player-kills'].value) || 0,
            deaths: parseInt(form.elements['player-deaths'].value) || 0,
            time: parseFloat(form.elements['player-time'].value) || 0
        };
        
        if (!playerData.nickname) {
            this.showError('Введите никнейм игрока');
            return;
        }
        
        let success = false;
        
        if (this.currentEditingPlayer) {
            success = this.updatePlayer(this.currentEditingPlayer.id, playerData);
        } else {
            success = this.addPlayer(playerData);
        }
        
        if (success) {
            this.closePlayerModal();
            this.showSuccess('Игрок сохранен!');
        }
    }
    
    // === ОТРИСОВКА ===
    
    renderAll() {
        this.renderPlayers();
        this.renderStats();
        this.renderActivity();
        this.updateOverview();
    }
    
    renderPlayers() {
        const container = document.getElementById('players-cards-grid');
        if (!container) return;
        
        if (this.players.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2>🎮 Нет игроков</h2>
                    <p>Добавьте игроков для начала работы</p>
                    <button class="glass-button primary" onclick="appNew.openPlayerModal()">
                        Добавить первого игрока
                    </button>
                </div>
            `;
            return;
        }
        
        // Сортировка по K/D
        const sortedPlayers = [...this.players].sort((a, b) => {
            const kdA = a.deaths > 0 ? a.kills / a.deaths : a.kills;
            const kdB = b.deaths > 0 ? b.kills / b.deaths : b.kills;
            return kdB - kdA;
        });
        
        container.innerHTML = sortedPlayers.map((player, index) => {
            const kd = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills;
            const isTop = index < 3;
            
            return `
                <div class="player-card ${isTop ? 'top-player' : ''}">
                    <div class="player-header">
                        <div class="player-avatar">
                            ${player.nickname.charAt(0).toUpperCase()}
                        </div>
                        <div class="player-info">
                            <div class="player-name">${player.nickname}</div>
                            <div class="player-date">
                                ${new Date(player.createdAt).toLocaleDateString('ru-RU')}
                            </div>
                        </div>
                        <div class="player-actions">
                            <button class="action-btn edit" onclick="appNew.openPlayerModal(${JSON.stringify(player).replace(/"/g, '&quot;')})" title="Редактировать">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                                </svg>
                            </button>
                            <button class="action-btn delete" onclick="appNew.deletePlayer(${player.id})" title="Удалить">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="player-stats">
                        <div class="stat-item">
                            <div class="stat-value">${player.kills}</div>
                            <div class="stat-label">Убийств</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${player.deaths}</div>
                            <div class="stat-label">Смертей</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${player.time}ч</div>
                            <div class="stat-label">Времени</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${kd}</div>
                            <div class="stat-label">K/D</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderStats() {
        // Простая реализация статистики
        console.log('📊 Отрисовка статистики...');
    }
    
    renderActivity() {
        const container = document.getElementById('settings-activity-list');
        if (!container) return;
        
        if (this.activityLog.length === 0) {
            container.innerHTML = `
                <div class="activity-item">
                    <div class="activity-text">Добро пожаловать в новую систему!</div>
                    <div class="activity-time">Сейчас</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.activityLog.slice(-5).map(activity => {
            const timeAgo = this.getTimeAgo(new Date(activity.timestamp));
            return `
                <div class="activity-item">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            `;
        }).join('');
    }
    
    updateOverview() {
        const totalPlayers = this.players.length;
        const totalKills = this.players.reduce((sum, player) => sum + player.kills, 0);
        const totalDeaths = this.players.reduce((sum, player) => sum + player.deaths, 0);
        const totalTime = this.players.reduce((sum, player) => sum + player.time, 0);
        
        const elements = {
            'total-players': totalPlayers,
            'total-kills': totalKills,
            'total-deaths': totalDeaths,
            'total-time': totalTime.toFixed(1)
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    // === УТИЛИТЫ ===
    
    applySettings() {
        // Применение фона
        this.applyCurrentBackground();
        
        // Применение режима изменения размеров
        if (this.settings.resizeMode) {
            this.enableResizeHandles();
        }
    }
    
    addActivity(text) {
        const activity = {
            id: Date.now() + Math.random(),
            text: text,
            timestamp: new Date().toISOString()
        };
        
        this.activityLog.unshift(activity);
        
        // Ограничиваем до 20 записей
        if (this.activityLog.length > 20) {
            this.activityLog = this.activityLog.slice(0, 20);
        }
        
        this.renderActivity();
        
        // Автосохранение активности
        this.saveToStorage('activity', this.activityLog);
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Только что';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`;
        
        return date.toLocaleDateString('ru-RU');
    }
    
    showError(message) {
        console.error('❌', message);
        alert('❌ ' + message);
    }
    
    showSuccess(message) {
        console.log('✅', message);
        // Можно добавить toast-уведомления
    }
    
    // === МЕТОДЫ ДЛЯ ОТЛАДКИ ===
    
    exportData() {
        const data = {
            players: this.players,
            activity: this.activityLog,
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stats-backup-new-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.addActivity('Данные экспортированы (новая система)');
    }
    
    clearAllData() {
        if (confirm('⚠️ Удалить ВСЕ данные новой системы?\n\nЭто действие нельзя отменить!')) {
            this.players = [];
            this.activityLog = [];
            this.settings = {
                currentBackground: 'https://i.postimg.cc/XJkg1VB3/a-gift-for-you-bocchi-the-rock-thumb.jpg',
                resizeMode: false,
                containerSizes: {}
            };
            
            // Очистка localStorage
            localStorage.removeItem('stats-new-players');
            localStorage.removeItem('stats-new-activity');
            localStorage.removeItem('stats-new-settings');
            
            this.renderAll();
            this.applySettings();
            
            alert('✅ Все данные новой системы очищены!');
            this.addActivity('Данные новой системы очищены');
        }
    }
}

// Инициализация новой системы
let appNew;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Загрузка новой системы Stats Tracker...');
    
    try {
        appNew = new StatsTrackerNew();
        window.appNew = appNew; // Глобальный доступ
        console.log('✅ Новая система успешно загружена');
    } catch (error) {
        console.error('❌ Ошибка загрузки новой системы:', error);
        alert('Ошибка загрузки приложения');
    }
});
