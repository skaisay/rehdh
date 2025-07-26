// Stats Tracker - Main Application JavaScript

class StatsTracker {
    constructor() {
        this.players = [];
        this.currentEditingPlayer = null;
        this.activityLog = [];
        this.currentBackground = 'https://i.postimg.cc/XJkg1VB3/a-gift-for-you-bocchi-the-rock-thumb.jpg';
        this.resizeMode = false;
        this.resizeTimeout = null;
        this.isResizing = false;
        this.containerSizes = {};
        this.deferredPrompt = null;
        this.autoSaveInterval = null;
        
        this.initializeApp();
        this.loadData();
        this.bindEvents();
        this.renderPlayers(); // Add explicit call to render players
        this.showLeaderboard(); // Add explicit call to render stats
        this.updateOverview();
        this.startAutoSave();
        
        // Add startup activity after everything is loaded
        setTimeout(() => {
            this.addActivity('Приложение запущено');
        }, 100);
    }

    startAutoSave() {
        // Auto-save every 30 seconds as backup
        this.autoSaveInterval = setInterval(() => {
            console.log('Auto-saving data...');
            this.saveData();
        }, 30000);
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    initializeApp() {
        // Check localStorage availability
        if (!this.checkLocalStorageAvailability()) {
            alert('LocalStorage недоступен. Данные не будут сохраняться между сессиями.');
            return;
        }
        
        // Register Service Worker for PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => console.log('SW registered:', registration))
                .catch(error => console.log('SW registration failed:', error));
        }

        // PWA Install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            document.getElementById('install-app').style.display = 'block';
        });

        // Check if app is already installed
        window.addEventListener('appinstalled', () => {
            document.getElementById('install-app').style.display = 'none';
            document.getElementById('app-status').textContent = 'Приложение установлено';
        });

        // Run full diagnostics after initialization
        setTimeout(() => {
            this.runDiagnostics();
        }, 1000);
    }

    checkLocalStorageAvailability() {
        try {
            const test = 'localStorage-test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            console.log('LocalStorage is available');
            return true;
        } catch (e) {
            console.error('LocalStorage is not available:', e);
            return false;
        }
    }

    // Функция для тестирования всей функциональности
    runDiagnostics() {
        console.log('\n🔧 === FULL FUNCTIONALITY DIAGNOSTICS ===');
        
        // 1. Test localStorage
        console.log('1. Testing localStorage...');
        const localStorageWorks = this.checkLocalStorageAvailability();
        console.log(`LocalStorage: ${localStorageWorks ? '✅' : '❌'}`);
        
        // 2. Test DOM elements
        console.log('2. Testing DOM elements...');
        const domTests = {
            'playersGrid': document.getElementById('playersGrid'),
            'backgroundOptions': document.getElementById('backgroundOptions'),
            'addPlayerBtn': document.getElementById('addPlayerBtn'),
            'activitySelect': document.getElementById('activitySelect'),
            'playerNameInput': document.getElementById('playerNameInput')
        };
        
        for (const [name, element] of Object.entries(domTests)) {
            console.log(`DOM ${name}: ${element ? '✅' : '❌'}`);
        }
        
        // 3. Test data integrity
        console.log('3. Testing data integrity...');
        console.log(`Players count: ${this.players.length}`);
        console.log(`Current background: ${this.currentBackground}`);
        console.log(`Activities count: ${this.activities.length}`);
        
        // 4. Test event handlers
        console.log('4. Testing event handlers...');
        const addPlayerBtn = document.getElementById('addPlayerBtn');
        const hasEventListener = addPlayerBtn && addPlayerBtn.onclick !== null;
        console.log(`Add player button handler: ${hasEventListener ? '✅' : '❌'}`);
        
        console.log('=== DIAGNOSTICS COMPLETE ===\n');
        
        return {
            localStorage: localStorageWorks,
            domElements: Object.values(domTests).every(el => el !== null),
            dataIntegrity: this.players.length >= 0,
            eventHandlers: hasEventListener
        };
    }

    loadData() {
        try {
            console.log('=== LOADING DATA FROM LOCALSTORAGE ===');
            
            // Enhanced load with multiple fallback sources
            const loadWithFallbacks = (key, emergencyKey, backupPrefix) => {
                let data = localStorage.getItem(key);
                if (!data || data === 'null' || data === 'undefined') {
                    console.log(`🔄 Trying emergency backup for ${key}...`);
                    data = localStorage.getItem(emergencyKey);
                }
                
                if (!data || data === 'null' || data === 'undefined') {
                    console.log(`🔄 Trying timestamped backups for ${key}...`);
                    // Try to find the most recent backup
                    const backupKeys = Object.keys(localStorage)
                        .filter(k => k.startsWith(backupPrefix))
                        .sort((a, b) => {
                            const timestampA = parseInt(a.split('-').pop());
                            const timestampB = parseInt(b.split('-').pop());
                            return timestampB - timestampA; // Most recent first
                        });
                    
                    if (backupKeys.length > 0) {
                        data = localStorage.getItem(backupKeys[0]);
                        console.log(`🔄 Using backup: ${backupKeys[0]}`);
                    }
                }
                
                return data;
            };
            
            // Load players with enhanced fallback
            const savedPlayers = loadWithFallbacks('stats-players', 'emergency-players', 'backup-players-');
            console.log('Raw saved players:', savedPlayers);
            if (savedPlayers && savedPlayers !== 'null' && savedPlayers !== 'undefined') {
                const parsedPlayers = JSON.parse(savedPlayers);
                this.players = Array.isArray(parsedPlayers) ? parsedPlayers : [];
                console.log('✅ Loaded players:', this.players.length, this.players);
            } else {
                this.players = [];
                console.log('⚠️ No saved players found, using empty array');
            }
            
            // Load activity log with enhanced fallback
            const savedActivity = loadWithFallbacks('stats-activity', 'emergency-activity', 'backup-activity-');
            console.log('Raw saved activity:', savedActivity);
            if (savedActivity && savedActivity !== 'null' && savedActivity !== 'undefined') {
                const parsedActivity = JSON.parse(savedActivity);
                this.activityLog = Array.isArray(parsedActivity) ? parsedActivity : [];
                console.log('✅ Loaded activities:', this.activityLog.length, this.activityLog);
            } else {
                this.activityLog = [];
                console.log('⚠️ No saved activity found, using empty array');
            }
            
            // Load background with enhanced fallback
            const savedBackground = loadWithFallbacks('stats-background', 'emergency-background', 'backup-background-');
            console.log('Raw saved background:', savedBackground);
            if (savedBackground && savedBackground !== 'null' && savedBackground !== 'undefined') {
                this.currentBackground = savedBackground;
                console.log('✅ Loaded background:', this.currentBackground);
                // Apply background immediately
                this.applyBackgroundSilently();
            } else {
                console.log('⚠️ Using default background');
                // Apply default background
                this.applyBackgroundSilently();
            }
            
            // Load container sizes
            this.loadContainerSizes();
            
            // Render all components immediately after loading
            setTimeout(() => {
                this.renderPlayers();
                this.updatePlayerSelect();
                this.renderActivity();
                this.updateBackgroundSelection();
                this.updateOverview();
                this.showLeaderboard();
                
                // Setup background options after rendering
                if (this.setupBackgroundOptions) {
                    this.setupBackgroundOptions();
                }
            }, 100);
            
            console.log('✅ Data loading completed successfully');
            console.log('Final state - Players:', this.players.length, 'Activities:', this.activityLog.length);
            
        } catch (error) {
            console.error('❌ Ошибка загрузки данных:', error);
            this.players = [];
            this.activityLog = [];
            // Add error to activity log after initializing empty arrays
            setTimeout(() => {
                this.addActivity('Ошибка загрузки данных');
            }, 100);
        }
    }
    
    // Helper method to apply background without triggering save
    applyBackgroundSilently() {
        try {
            if (this.currentBackground.startsWith('linear-gradient')) {
                document.body.style.background = this.currentBackground;
            } else {
                document.body.style.background = `url('${this.currentBackground}') center/cover no-repeat fixed`;
            }
            console.log('✅ Background applied silently');
        } catch (error) {
            console.error('❌ Error applying background:', error);
        }
    }

    saveData() {
        try {
            console.log('=== SAVING DATA TO LOCALSTORAGE ===');
            console.log('Saving - Players:', this.players.length, 'Activities:', this.activityLog.length);
            console.log('Background:', this.currentBackground);
            
            // Clean old backups first to free space
            this.cleanOldBackups();
            
            // Convert data to JSON strings
            const playersJson = JSON.stringify(this.players);
            const activityJson = JSON.stringify(this.activityLog);
            
            // Save players data with multiple backups
            localStorage.setItem('stats-players', playersJson);
            localStorage.setItem('emergency-players', playersJson);
            localStorage.setItem('backup-players-' + Date.now(), playersJson);
            console.log('✅ Players saved with backups, size:', playersJson.length, 'characters');
            
            // Save activity log with backups
            localStorage.setItem('stats-activity', activityJson);
            localStorage.setItem('emergency-activity', activityJson);
            console.log('✅ Activity saved with backup, size:', activityJson.length, 'characters');
            
            // Save background with backups
            localStorage.setItem('stats-background', this.currentBackground);
            localStorage.setItem('emergency-background', this.currentBackground);
            console.log('✅ Background saved with backup:', this.currentBackground);
            
            // Save container sizes if available
            if (Object.keys(this.containerSizes).length > 0) {
                const sizesJson = JSON.stringify(this.containerSizes);
                localStorage.setItem('container-sizes', sizesJson);
                localStorage.setItem('emergency-container-sizes', sizesJson);
                console.log('✅ Container sizes saved with backup');
            }
            
            // Save timestamp of last save
            localStorage.setItem('last-save-timestamp', new Date().toISOString());
            
            // Verify save operation with retry mechanism
            setTimeout(() => {
                let retryCount = 0;
                const maxRetries = 3;
                
                const verifySave = () => {
                    try {
                        const verifyPlayers = localStorage.getItem('stats-players');
                        const verifyActivity = localStorage.getItem('stats-activity');
                        const verifyBackground = localStorage.getItem('stats-background');
                        
                        const verification = {
                            players: verifyPlayers ? JSON.parse(verifyPlayers).length : 0,
                            activities: verifyActivity ? JSON.parse(verifyActivity).length : 0,
                            background: !!verifyBackground,
                            playersMatch: verifyPlayers === playersJson,
                            activitiesMatch: verifyActivity === activityJson,
                            backgroundMatch: verifyBackground === this.currentBackground
                        };
                        
                        if (verification.playersMatch && verification.activitiesMatch && verification.backgroundMatch) {
                            console.log('✅ Save verification successful:', verification);
                        } else {
                            console.warn('⚠️ Save verification failed, attempting retry...', verification);
                            retryCount++;
                            
                            if (retryCount < maxRetries) {
                                // Retry save
                                localStorage.setItem('stats-players', playersJson);
                                localStorage.setItem('stats-activity', activityJson);
                                localStorage.setItem('stats-background', this.currentBackground);
                                setTimeout(verifySave, 200);
                            } else {
                                console.error('❌ Save failed after maximum retries');
                            }
                        }
                    } catch (verifyError) {
                        console.error('❌ Save verification error:', verifyError);
                    }
                };
                
                verifySave();
            }, 100);
            
            // Update leaderboard if stats tab is active
            const statsTab = document.getElementById('stats');
            if (statsTab && statsTab.classList.contains('active')) {
                setTimeout(() => {
                    this.showLeaderboard();
                }, 50);
            }
            
            console.log('=== SAVE COMPLETED ===');
        } catch (error) {
            console.error('❌ Ошибка сохранения данных:', error);
            
            // Try emergency save method
            try {
                console.log('🚨 Attempting emergency save...');
                const emergencyData = {
                    players: this.players,
                    activity: this.activityLog,
                    background: this.currentBackground,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('emergency-data', JSON.stringify(emergencyData));
                console.log('✅ Emergency save successful');
            } catch (emergencyError) {
                console.error('❌ Emergency save also failed:', emergencyError);
                alert('Критическая ошибка сохранения данных! Пожалуйста, экспортируйте данные вручную.');
            }
        }
    }
    
    // Clean old backup files to prevent localStorage overflow
    cleanOldBackups() {
        try {
            const backupKeys = Object.keys(localStorage)
                .filter(key => key.startsWith('backup-players-') || key.startsWith('backup-activity-'))
                .sort((a, b) => {
                    const timestampA = parseInt(a.split('-').pop());
                    const timestampB = parseInt(b.split('-').pop());
                    return timestampB - timestampA; // Newest first
                });
                
            // Keep only the 5 most recent backups
            const keysToDelete = backupKeys.slice(5);
            keysToDelete.forEach(key => {
                localStorage.removeItem(key);
            });
            
            if (keysToDelete.length > 0) {
                console.log(`🧹 Cleaned ${keysToDelete.length} old backup files`);
            }
        } catch (error) {
            console.error('❌ Error cleaning old backups:', error);
        }
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => this.switchTab(item.dataset.tab));
        });

        // Player management
        console.log('🔧 Binding player management events...');
        
        const addPlayerBtn = document.getElementById('add-player-btn');
        const quickAddBtn = document.getElementById('quick-add-btn');
        const quickNicknameInput = document.getElementById('quick-nickname');
        
        if (addPlayerBtn) {
            addPlayerBtn.addEventListener('click', () => this.openPlayerModal());
            console.log('✅ add-player-btn event bound');
        } else {
            console.error('❌ add-player-btn not found');
        }
        
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => {
                console.log('🎮 Quick add button clicked');
                this.quickAddPlayer();
            });
            console.log('✅ quick-add-btn event bound');
        } else {
            console.error('❌ quick-add-btn not found');
        }
        
        if (quickNicknameInput) {
            quickNicknameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('🎮 Enter pressed in quick nickname');
                    this.quickAddPlayer();
                }
            });
            console.log('✅ quick-nickname keypress event bound');
        } else {
            console.error('❌ quick-nickname input not found');
        }
        
        document.getElementById('close-modal').addEventListener('click', () => this.closePlayerModal());
        document.getElementById('cancel-button').addEventListener('click', () => this.closePlayerModal());
        document.getElementById('player-form').addEventListener('submit', (e) => this.handlePlayerSubmit(e));
        
        // Screenshot preview
        document.getElementById('player-screenshot').addEventListener('change', (e) => this.handleScreenshotUpload(e));
        
        // Player selection for stats
        document.getElementById('player-select').addEventListener('change', (e) => this.showPlayerStats(e.target.value));
        
        // Leaderboard sorting
        document.getElementById('sort-method').addEventListener('change', (e) => this.showLeaderboard(e.target.value));
        
        // Resize mode - Fixed event binding
        console.log('🔧 Setting up resize mode events...');
        const resizeButton = document.getElementById('toggle-resize-mode');
        if (resizeButton) {
            // Remove any existing listeners first
            resizeButton.removeEventListener('click', this.handleResizeToggle);
            
            // Create bound method for proper context
            this.handleResizeToggle = () => {
                console.log('🔄 Resize toggle clicked');
                this.toggleResizeMode();
            };
            
            resizeButton.addEventListener('click', this.handleResizeToggle);
            console.log('✅ Resize mode button event bound successfully');
        } else {
            console.error('❌ Toggle resize mode button not found');
        }
        
        const saveResizeButton = document.getElementById('save-resize');
        if (saveResizeButton) {
            // Remove any existing listeners first
            saveResizeButton.removeEventListener('click', this.handleResizeSave);
            
            // Create bound method for proper context
            this.handleResizeSave = () => {
                console.log('💾 Save resize clicked');
                this.saveContainerSizes();
            };
            
            saveResizeButton.addEventListener('click', this.handleResizeSave);
            console.log('✅ Save resize button event bound successfully');
        } else {
            console.error('❌ Save resize button not found');
        }
        
        // PWA Install
        document.getElementById('install-app').addEventListener('click', () => this.installApp());
        
        // Data management buttons
        document.getElementById('test-save-btn').addEventListener('click', () => this.testSaveFunction());
        document.getElementById('clear-data-btn').addEventListener('click', () => this.clearAllData());
        
        // Detailed stats modal
        document.getElementById('close-detailed-stats').addEventListener('click', () => this.closeDetailedStats());
        
        // Screenshot capture hotkey (Ctrl+Shift+1)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === '1') {
                e.preventDefault();
                this.captureScreenshot();
            }
        });
        
        // Background selection - Fixed event binding
        console.log('🔧 Setting up background selection events...');
        
        // Use event delegation on document for better reliability
        document.addEventListener('click', (e) => {
            console.log('🖱️ Click detected on:', e.target.tagName, e.target.className);
            
            // Check if click is on background option or its child
            const bgOption = e.target.closest('.bg-option');
            if (bgOption) {
                console.log('🎨 Background option detected:', bgOption);
                const newBg = bgOption.dataset.bg;
                console.log('🎨 Background URL from dataset:', newBg);
                
                if (newBg) {
                    this.setBackground(newBg);
                } else {
                    console.error('❌ No background URL found in dataset');
                }
                return;
            }
        });
        
        // Also add direct event listeners to all background options
        const setupBackgroundOptions = () => {
            document.querySelectorAll('.bg-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🎨 Direct background option clicked:', option);
                    const newBg = option.dataset.bg;
                    if (newBg) {
                        this.setBackground(newBg);
                    }
                });
            });
        };
        
        // Setup background options immediately and after any DOM changes
        setupBackgroundOptions();
        this.setupBackgroundOptions = setupBackgroundOptions;
        
        // Player filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.players-filter-btn')) {
                const filterBtn = e.target.closest('.players-filter-btn');
                const sortType = filterBtn.dataset.sort;
                
                console.log('Player filter clicked:', sortType);
                
                // Remove active class from all filter buttons
                document.querySelectorAll('.players-filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                filterBtn.classList.add('active');
                
                // Sort and re-render players
                this.sortPlayers(sortType);
            }
        });
        
        // Save data before page unload
        window.addEventListener('beforeunload', (e) => {
            console.log('🔄 Page unloading, saving data...');
            this.saveData();
            
            // Force immediate save with verification
            try {
                localStorage.setItem('stats-players', JSON.stringify(this.players));
                localStorage.setItem('stats-activity', JSON.stringify(this.activityLog));
                localStorage.setItem('stats-background', this.currentBackground);
                console.log('✅ Emergency save completed');
            } catch (error) {
                console.error('❌ Emergency save failed:', error);
            }
        });
        
        // Also save on page visibility change (when switching tabs)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('🔄 Page hidden, saving data...');
                this.saveData();
            }
        });
        
        // Auto-save every 5 seconds
        this.autoSaveInterval = setInterval(() => {
            console.log('⏰ Auto-save triggered');
            this.saveData();
        }, 5000);
        
        // Save on any interaction
        document.addEventListener('click', () => {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                this.saveData();
            }, 1000);
        });
        
        // Modal overlay click
        document.getElementById('player-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closePlayerModal();
            }
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        // Auto-load content for specific tabs
        if (tabName === 'players') {
            this.renderPlayers();
        } else if (tabName === 'stats') {
            this.showLeaderboard();
        } else if (tabName === 'settings') {
            this.renderActivity();
            // Setup background options when entering settings tab
            setTimeout(() => {
                this.updateBackgroundSelection();
                if (this.setupBackgroundOptions) {
                    this.setupBackgroundOptions();
                }
            }, 100);
        }
    }

    quickAddPlayer() {
        console.log('🎮 quickAddPlayer called');
        
        try {
            const nicknameInput = document.getElementById('quick-nickname');
            if (!nicknameInput) {
                console.error('❌ quick-nickname input not found');
                return;
            }
            
            const nickname = nicknameInput.value.trim();
            console.log('Nickname entered:', nickname);
            
            if (!nickname) {
                console.log('❌ Empty nickname');
                alert('Введите никнейм игрока');
                return;
            }

            // Check if player already exists
            const existingPlayer = this.players.find(p => p.nickname.toLowerCase() === nickname.toLowerCase());
            if (existingPlayer) {
                console.log('❌ Player already exists:', nickname);
                this.addActivity(`Игрок ${nickname} уже существует`);
                alert(`Игрок с никнеймом "${nickname}" уже существует!`);
                nicknameInput.value = '';
                return;
            }

            const playerData = {
                id: Date.now(),
                nickname: nickname,
                kills: 0,
                deaths: 0,
                time: 0,
                screenshot: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('✅ Adding new player:', playerData);
            this.players.push(playerData);
            
            // MULTIPLE IMMEDIATE SAVES - критически важно!
            console.log('💾 Starting multiple save procedures...');
            
            // Save 1: Standard save
            this.saveData();
            
            // Save 2: Emergency backup
            try {
                localStorage.setItem('emergency-players', JSON.stringify(this.players));
                localStorage.setItem('emergency-activity', JSON.stringify(this.activityLog));
                console.log('✅ Emergency backup created');
            } catch (e) {
                console.error('❌ Emergency backup failed:', e);
            }
            
            // Save 3: Timestamped backup
            try {
                const timestamp = Date.now();
                localStorage.setItem(`backup-players-${timestamp}`, JSON.stringify(this.players));
                localStorage.setItem(`backup-activity-${timestamp}`, JSON.stringify(this.activityLog));
                console.log('✅ Timestamped backup created');
            } catch (e) {
                console.error('❌ Timestamped backup failed:', e);
            }
            
            // Save 4: Verification save
            setTimeout(() => {
                try {
                    const verification = localStorage.getItem('stats-players');
                    if (verification) {
                        const parsed = JSON.parse(verification);
                        const foundPlayer = parsed.find(p => p.id === playerData.id);
                        if (foundPlayer) {
                            console.log('✅ Player save verified successfully');
                        } else {
                            console.error('❌ Player not found in verification, attempting re-save');
                            localStorage.setItem('stats-players', JSON.stringify(this.players));
                        }
                    }
                } catch (e) {
                    console.error('❌ Verification failed:', e);
                }
            }, 500);
            
            this.addActivity(`Добавлен новый игрок: ${nickname}`);
            
            // Update UI
            this.renderPlayers();
            this.updatePlayerSelect();
            this.updateOverview();
            
            nicknameInput.value = '';
            
            // Show success message
            alert(`✅ Игрок "${nickname}" успешно добавлен!`);
            console.log('✅ Player added successfully');
            
        } catch (error) {
            console.error('❌ Error in quickAddPlayer:', error);
            alert('Ошибка при добавлении игрока: ' + error.message);
        }
    }

    setBackground(backgroundUrl) {
        console.log('🎨 Setting background to:', backgroundUrl);
        
        // Remove active class from all options first
        document.querySelectorAll('.bg-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // Add active class to selected option
        const selectedOption = document.querySelector(`[data-bg="${backgroundUrl}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
            console.log('✅ Active class added to selected option');
        }
        
        this.currentBackground = backgroundUrl;
        
        try {
            // Apply background with better error handling
            if (backgroundUrl.startsWith('linear-gradient')) {
                document.body.style.background = backgroundUrl;
                console.log('✅ Applied gradient background');
            } else {
                // Apply image background with fallback
                const newBackground = `url('${backgroundUrl}') center/cover no-repeat fixed`;
                document.body.style.background = newBackground;
                console.log('✅ Applied image background:', newBackground);
                
                // Verify background was applied
                setTimeout(() => {
                    const appliedBg = window.getComputedStyle(document.body).background;
                    console.log('🔍 Verified applied background:', appliedBg);
                }, 100);
            }
            
            this.addActivity(`Фон изменён: ${backgroundUrl.split('/').pop() || 'новый фон'}`);
            
            // Force save background immediately with multiple methods
            try {
                localStorage.setItem('stats-background', this.currentBackground);
                localStorage.setItem('emergency-background', this.currentBackground);
                console.log('✅ Background saved to localStorage');
                
                // Verify the save with triple check
                setTimeout(() => {
                    const savedBg = localStorage.getItem('stats-background');
                    const emergencyBg = localStorage.getItem('emergency-background');
                    if (savedBg === this.currentBackground && emergencyBg === this.currentBackground) {
                        console.log('✅ Background save triple verified');
                    } else {
                        console.error('❌ Background save verification failed!');
                        // Try saving again
                        localStorage.setItem('stats-background', this.currentBackground);
                        localStorage.setItem('emergency-background', this.currentBackground);
                    }
                }, 100);
                
            } catch (saveError) {
                console.error('❌ Failed to save background:', saveError);
            }
            
            // Save all data
            this.saveData();
            
        } catch (error) {
            console.error('❌ Error setting background:', error);
            this.addActivity('❌ Ошибка изменения фона');
        }
    }

    updateBackgroundSelection() {
        console.log('🎨 Updating background selection, current:', this.currentBackground);
        
        // Remove active class from all options
        document.querySelectorAll('.bg-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // Find and activate the current background option
        const currentOption = document.querySelector(`[data-bg="${this.currentBackground}"]`);
        if (currentOption) {
            currentOption.classList.add('active');
            console.log('✅ Found and activated current background option');
        } else {
            console.warn('⚠️ Current background option not found in DOM');
            // Debug: list all available options
            const allOptions = document.querySelectorAll('.bg-option');
            console.log('Available background options:');
            allOptions.forEach((option, index) => {
                console.log(`${index}: ${option.dataset.bg}`);
            });
        }
    }

    openPlayerModal(player = null) {
        this.currentEditingPlayer = player;
        const modal = document.getElementById('player-modal');
        const form = document.getElementById('player-form');
        const title = document.getElementById('modal-title');
        
        if (player) {
            title.textContent = 'Редактировать игрока';
            form.elements['player-nickname'].value = player.nickname;
            form.elements['player-kills'].value = player.kills;
            form.elements['player-deaths'].value = player.deaths;
            form.elements['player-time'].value = player.time;
            
            if (player.screenshot) {
                this.showScreenshotPreview(player.screenshot);
            }
        } else {
            title.textContent = 'Добавить игрока';
            form.reset();
            this.hideScreenshotPreview();
        }
        
        modal.classList.add('active');
        form.elements['player-nickname'].focus();
    }

    closePlayerModal() {
        const modal = document.getElementById('player-modal');
        const form = document.getElementById('player-form');
        
        modal.classList.remove('active');
        form.reset();
        this.hideScreenshotPreview();
        this.currentEditingPlayer = null;
    }

    handlePlayerSubmit(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        const form = e.target;
        const playerData = {
            id: this.currentEditingPlayer ? this.currentEditingPlayer.id : Date.now(),
            nickname: form.elements['player-nickname'].value,
            kills: parseInt(form.elements['player-kills'].value) || 0,
            deaths: parseInt(form.elements['player-deaths'].value) || 0,
            time: parseFloat(form.elements['player-time'].value) || 0,
            screenshot: this.currentEditingPlayer ? this.currentEditingPlayer.screenshot : null,
            createdAt: this.currentEditingPlayer ? this.currentEditingPlayer.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log('Player data prepared:', playerData);

        // Handle screenshot
        const screenshotFile = document.getElementById('player-screenshot').files[0];
        if (screenshotFile) {
            console.log('Processing screenshot file:', screenshotFile.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                playerData.screenshot = e.target.result;
                console.log('Screenshot processed, saving player');
                this.savePlayer(playerData);
            };
            reader.onerror = (e) => {
                console.error('Error reading screenshot:', e);
                this.savePlayer(playerData);
            };
            reader.readAsDataURL(screenshotFile);
        } else {
            console.log('No screenshot file, saving player without image');
            this.savePlayer(playerData);
        }
    }

    savePlayer(playerData) {
        console.log('💾 Saving player:', playerData);
        
        if (this.currentEditingPlayer) {
            // Update existing player
            const index = this.players.findIndex(p => p.id === this.currentEditingPlayer.id);
            if (index !== -1) {
                this.players[index] = playerData;
                console.log('✅ Updated player at index:', index);
                this.addActivity(`Обновлен игрок: ${playerData.nickname}`);
            } else {
                console.error('❌ Player not found for update');
                return;
            }
        } else {
            // Add new player
            this.players.push(playerData);
            console.log('✅ Added new player, total players:', this.players.length);
            this.addActivity(`Добавлен новый игрок: ${playerData.nickname}`);
        }

        // MULTIPLE SAVE STRATEGY - Force save immediately and with verification
        console.log('🔄 Starting multi-save strategy...');
        
        try {
            // Save 1: Main storage
            const playersJson = JSON.stringify(this.players);
            localStorage.setItem('stats-players', playersJson);
            console.log('✅ Main save completed');
            
            // Save 2: Emergency backup
            localStorage.setItem('emergency-players', playersJson);
            console.log('✅ Emergency backup completed');
            
            // Save 3: Timestamped backup
            localStorage.setItem(`backup-players-${Date.now()}`, playersJson);
            console.log('✅ Timestamped backup completed');
            
            // Save 4: Activity log
            const activityJson = JSON.stringify(this.activityLog);
            localStorage.setItem('stats-activity', activityJson);
            localStorage.setItem('emergency-activity', activityJson);
            console.log('✅ Activity logs saved');
            
            // Save 5: Background
            localStorage.setItem('stats-background', this.currentBackground);
            localStorage.setItem('emergency-background', this.currentBackground);
            console.log('✅ Background saved');
            
            // Verification with retry
            setTimeout(() => {
                let retryCount = 0;
                const maxRetries = 3;
                
                const verifyAndRetry = () => {
                    try {
                        const verification = localStorage.getItem('stats-players');
                        if (verification) {
                            const parsedPlayers = JSON.parse(verification);
                            const found = parsedPlayers.find(p => p.id === playerData.id);
                            if (found) {
                                console.log('✅ Save verification successful');
                                alert(`✅ Игрок "${playerData.nickname}" успешно сохранен!`);
                            } else {
                                throw new Error('Player not found in verification');
                            }
                        } else {
                            throw new Error('No data found in localStorage');
                        }
                    } catch (error) {
                        console.error(`❌ Verification failed (attempt ${retryCount + 1}):`, error);
                        retryCount++;
                        
                        if (retryCount < maxRetries) {
                            // Retry save
                            localStorage.setItem('stats-players', playersJson);
                            setTimeout(verifyAndRetry, 200);
                        } else {
                            console.error('❌ Save failed after maximum retries');
                            alert('⚠️ Возможна проблема с сохранением данных. Рекомендуется экспортировать данные.');
                        }
                    }
                };
                
                verifyAndRetry();
            }, 300);
            
        } catch (error) {
            console.error('❌ Failed to save players:', error);
            alert('Ошибка сохранения: ' + error.message);
        }

        // Call main saveData method as backup
        this.saveData();
        
        // Update UI
        this.renderPlayers();
        this.updatePlayerSelect();
        this.updateOverview();
        this.closePlayerModal();
    }

    deletePlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player && confirm(`Удалить игрока ${player.nickname}?`)) {
            this.players = this.players.filter(p => p.id !== playerId);
            this.addActivity(`Удален игрок: ${player.nickname}`);
            this.saveData();
            this.renderPlayers();
            this.updatePlayerSelect();
            this.updateOverview();
        }
    }

    renderPlayers() {
        const container = document.getElementById('players-cards-grid');
        
        if (!container) {
            console.error('Players container not found');
            return;
        }

        if (this.players.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2><svg style="width:24px;height:24px;fill:currentColor;vertical-align:middle;" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg> Нет игроков</h2>
                    <p>Добавьте игроков для начала работы</p>
                    <button class="glass-button" onclick="app.openPlayerModal()">
                        Добавить первого игрока
                    </button>
                </div>
            `;
            return;
        }

        // Sort players by K/D by default
        const sortedPlayers = [...this.players].sort((a, b) => {
            const kdA = a.deaths > 0 ? a.kills / a.deaths : a.kills;
            const kdB = b.deaths > 0 ? b.kills / b.deaths : b.kills;
            return kdB - kdA;
        });

        // Use the new rendering function
        this.renderPlayersCards();
    }

    sortPlayers(sortType) {
        if (this.players.length === 0) return;
        
        // Don't modify the original array, just render with sorted data
        this.renderPlayersCards(sortType);
    }

    renderPlayersCards(sortType = 'kd') {
        const container = document.getElementById('players-cards-grid');
        
        if (!container) {
            console.error('Players container not found');
            return;
        }

        let sortedPlayers = [...this.players];
        
        switch (sortType) {
            case 'name':
                sortedPlayers.sort((a, b) => a.nickname.localeCompare(b.nickname));
                break;
            case 'kills':
                sortedPlayers.sort((a, b) => b.kills - a.kills);
                break;
            case 'deaths':
                sortedPlayers.sort((a, b) => b.deaths - a.deaths);
                break;
            case 'time':
                sortedPlayers.sort((a, b) => b.time - a.time);
                break;
            case 'date':
                sortedPlayers.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
            default:
                // Sort by K/D by default
                sortedPlayers.sort((a, b) => {
                    const kdA = a.deaths > 0 ? a.kills / a.deaths : a.kills;
                    const kdB = b.deaths > 0 ? b.kills / b.deaths : b.kills;
                    return kdB - kdA;
                });
                break;
        }

        container.innerHTML = sortedPlayers.map((player, index) => {
            const kd = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2);
            const isTopPlayer = index < 3;
            
            return `
                <div class="player-management-card ${isTopPlayer ? 'top-player' : ''}">
                    <div class="player-card-header-new">
                        <div class="player-avatar-new">
                            ${player.nickname.charAt(0).toUpperCase()}
                        </div>
                        <div class="player-info-new">
                            <div class="player-name-new">${player.nickname}</div>
                            <div class="player-date-new">
                                Добавлен: ${new Date(player.createdAt || Date.now()).toLocaleDateString('ru-RU')}
                            </div>
                        </div>
                        <div class="player-actions-new">
                            <button class="action-btn edit" onclick="app.openPlayerModal(${JSON.stringify(player).replace(/"/g, '&quot;')})" title="Редактировать">
                                <svg style="width:16px;height:16px;fill:currentColor;" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            </button>
                            <button class="action-btn delete" onclick="app.deletePlayer(${player.id})" title="Удалить">
                                <svg style="width:16px;height:16px;fill:currentColor;" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
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
    }

    setupPlayersFilters() {
        const filterButtons = document.querySelectorAll('.players-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                
                const filter = e.target.dataset.filter;
                this.filterPlayers(filter);
            });
        });
    }

    filterPlayers(filter) {
        const cards = document.querySelectorAll('.player-management-card');
        
        cards.forEach((card, index) => {
            let shouldShow = true;
            
            switch (filter) {
                case 'top':
                    shouldShow = index < 3; // Show only top 3 players
                    break;
                case 'recent':
                    // Show players added in last 7 days (for demo, show last 3 added)
                    shouldShow = index >= this.players.length - 3;
                    break;
                case 'all':
                default:
                    shouldShow = true;
                    break;
            }
            
            if (shouldShow) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    updatePlayerSelect() {
        const select = document.getElementById('player-select');
        select.innerHTML = '<option value="">Выберите игрока</option>' +
            this.players.map(player => 
                `<option value="${player.id}">${player.nickname}</option>`
            ).join('');
    }

    showPlayerStats(playerId) {
        const container = document.getElementById('player-stats');
        
        if (!playerId) {
            container.innerHTML = `
                <div class="no-player-selected">
                    Выберите игрока для просмотра статистики
                </div>
            `;
            return;
        }

        const player = this.players.find(p => p.id == playerId);
        if (!player) return;

        const kd = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills;
        const efficiency = player.time > 0 ? (player.kills / player.time).toFixed(2) : 0;

        container.innerHTML = `
            <div class="detailed-stats">
                <div class="stats-grid">
                    <div class="detailed-stat-item">
                        <div class="detailed-stat-value">${player.kills}</div>
                        <div class="detailed-stat-label">Убийств</div>
                    </div>
                    <div class="detailed-stat-item">
                        <div class="detailed-stat-value">${player.deaths}</div>
                        <div class="detailed-stat-label">Смертей</div>
                    </div>
                    <div class="detailed-stat-item">
                        <div class="detailed-stat-value">${kd}</div>
                        <div class="detailed-stat-label">K/D Ratio</div>
                    </div>
                    <div class="detailed-stat-item">
                        <div class="detailed-stat-value">${player.time}</div>
                        <div class="detailed-stat-label">Часов игры</div>
                    </div>
                    <div class="detailed-stat-item">
                        <div class="detailed-stat-value">${efficiency}</div>
                        <div class="detailed-stat-label">Убийств/час</div>
                    </div>
                    <div class="detailed-stat-item">
                        <div class="detailed-stat-value">${new Date(player.createdAt).toLocaleDateString()}</div>
                        <div class="detailed-stat-label">Дата создания</div>
                    </div>
                </div>
                
                ${player.screenshot ? `
                    <div class="player-screenshot">
                        <h3 style="margin-bottom: 12px;">Скриншот</h3>
                        <img src="${player.screenshot}" alt="Скриншот ${player.nickname}" loading="lazy">
                    </div>
                ` : ''}
            </div>
        `;
    }

    showLeaderboard(sortMethod = 'kd') {
        console.log('Rendering stats page with method:', sortMethod);
        
        if (!this.players || this.players.length === 0) {
            // Show empty state in top-5 list
            const top5List = document.getElementById('top-5-list');
            const featuredGrid = document.getElementById('featured-players-grid');
            
            if (top5List) {
                top5List.innerHTML = '<div class="empty-state">Нет игроков для отображения</div>';
            }
            if (featuredGrid) {
                featuredGrid.innerHTML = '<div class="empty-state">Нет игроков для отображения</div>';
            }
            return;
        }

        // Calculate overall statistics
        const totalPlayers = this.players.length;
        const totalKills = this.players.reduce((sum, player) => sum + player.kills, 0);
        const totalDeaths = this.players.reduce((sum, player) => sum + player.deaths, 0);
        const totalTime = this.players.reduce((sum, player) => sum + player.time, 0);

        // Update overall stats
        const totalPlayersEl = document.getElementById('total-players-stat');
        const totalKillsEl = document.getElementById('total-kills-stat');
        const totalDeathsEl = document.getElementById('total-deaths-stat');
        const totalTimeEl = document.getElementById('total-time-stat');

        if (totalPlayersEl) totalPlayersEl.textContent = totalPlayers;
        if (totalKillsEl) totalKillsEl.textContent = totalKills;
        if (totalDeathsEl) totalDeathsEl.textContent = totalDeaths;
        if (totalTimeEl) totalTimeEl.textContent = totalTime + 'ч';

        // Get player statistics
        const playerStats = this.players.map(player => {
            const kd = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2);
            
            return {
                ...player,
                kd: parseFloat(kd)
            };
        });

        // Sort players based on current filter
        let sortedPlayers = [...playerStats];
        switch (sortMethod) {
            case 'kills':
                sortedPlayers.sort((a, b) => b.kills - a.kills);
                break;
            case 'deaths':
                sortedPlayers.sort((a, b) => b.deaths - a.deaths);
                break;
            case 'time':
                sortedPlayers.sort((a, b) => b.time - a.time);
                break;
            case 'kd':
            default:
                sortedPlayers.sort((a, b) => b.kd - a.kd);
                break;
        }

        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === sortMethod) {
                btn.classList.add('active');
            }
        });

        const top5Players = sortedPlayers.slice(0, 5);
        const featuredPlayers = sortedPlayers.slice(0, 3);

        // Update Top-5 list
        const top5List = document.getElementById('top-5-list');
        if (top5List) {
            top5List.innerHTML = top5Players.map((player, index) => `
                <div class="top-5-item">
                    <div class="top-5-rank rank-${index + 1}">${index + 1}</div>
                    <div class="top-5-info">
                        <div class="top-5-name">${player.nickname}</div>
                        <div class="top-5-stats">
                            K/D: <span class="top-5-value">${player.kd}</span> | 
                            Убийств: <span class="top-5-value">${player.kills}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Update Featured players
        const featuredGrid = document.getElementById('featured-players-grid');
        if (featuredGrid) {
            featuredGrid.innerHTML = featuredPlayers.map(player => `
                <div class="featured-player-card" onclick="app.showDetailedStats(${player.id})">
                    <div class="featured-player-header">
                        <div class="featured-player-avatar">
                            ${player.nickname.charAt(0).toUpperCase()}
                        </div>
                        <div class="featured-player-info">
                            <h3>${player.nickname}</h3>
                            <div class="featured-player-date">
                                Добавлен: ${new Date(player.createdAt || Date.now()).toLocaleDateString('ru-RU')}
                            </div>
                        </div>
                    </div>
                    <div class="featured-player-stats">
                        <div class="featured-stat">
                            <div class="featured-stat-value">${player.kd}</div>
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
            `).join('');
        }

        // Setup filter button event handlers
        this.setupStatsFilters();
    }

    setupStatsFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            // Remove existing event listeners to avoid duplicates
            btn.removeEventListener('click', this.handleStatsFilter);
            // Add new event listener
            btn.addEventListener('click', (e) => {
                const filterType = e.target.dataset.filter;
                console.log('Stats filter clicked:', filterType);
                this.showLeaderboard(filterType);
            });
        });
    }

    showPlayersStatsGrid(sortMethod = 'kd') {
        const container = document.getElementById('players-stats-grid');
        
        if (this.players.length === 0) {
            container.innerHTML = `
                <div class="stats-empty-state">
                    <h3>🎮 Нет игроков</h3>
                    <p>Добавьте игроков, чтобы увидеть их статистику</p>
                </div>
            `;
            return;
        }

        // Sort players based on selected method
        const sortedPlayers = [...this.players].sort((a, b) => {
            switch (sortMethod) {
                case 'kills':
                    return b.kills - a.kills;
                case 'time':
                    return b.time - a.time;
                case 'kd':
                default:
                    const kdA = a.deaths > 0 ? a.kills / a.deaths : a.kills;
                    const kdB = b.deaths > 0 ? b.kills / b.deaths : b.kills;
                    if (kdA !== kdB) return kdB - kdA;
                    return b.kills - a.kills;
            }
        });

        container.innerHTML = sortedPlayers.map((player, index) => {
            const kd = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills;
            const efficiency = player.time > 0 ? (player.kills / player.time).toFixed(2) : '0';
            const rank = index + 1;
            
            // Determine rank class and title
            let rankClass = '';
            let playerTitle = '';
            if (rank === 1) {
                rankClass = 'rank-1';
                playerTitle = '👑 Лучший игрок';
            } else if (rank === 2) {
                rankClass = 'rank-2'; 
                playerTitle = '🥈 Второе место';
            } else if (rank === 3) {
                rankClass = 'rank-3';
                playerTitle = '🥉 Третье место';
            } else {
                playerTitle = `#${rank} в рейтинге`;
            }

            return `
                <div class="player-stats-card ${rankClass}" onclick="app.showDetailedStats(${player.id})">
                    <div class="player-card-header">
                        <div class="player-rank-badge ${rankClass}">
                            ${rank}
                        </div>
                        <div class="player-card-info">
                            <div class="player-card-name">${player.nickname}</div>
                            <div class="player-card-title">${playerTitle}</div>
                        </div>
                    </div>
                    
                    <div class="player-stats-grid-container">
                        <div class="mini-stat">
                            <div class="mini-stat-value">⚔️ ${player.kills}</div>
                            <div class="mini-stat-label">Убийств</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-value">💀 ${player.deaths}</div>
                            <div class="mini-stat-label">Смертей</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-value">⏱️ ${player.time}ч</div>
                            <div class="mini-stat-label">Время</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-value">📈 ${efficiency}</div>
                            <div class="mini-stat-label">У/час</div>
                        </div>
                    </div>
                    
                    <div class="player-card-kd">
                        <div class="kd-value">${kd}</div>
                        <div class="kd-label">K/D Соотношение</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    showDetailedStats(playerId) {
        const player = this.players.find(p => p.id == playerId);
        if (!player) return;

        const modal = document.getElementById('detailed-stats-modal');
        const playerName = document.getElementById('detailed-player-name');
        const content = document.getElementById('detailed-stats-content');

        const kd = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills;
        const efficiency = player.time > 0 ? (player.kills / player.time).toFixed(2) : '0';
        const winRate = player.kills > 0 ? ((player.kills / (player.kills + player.deaths)) * 100).toFixed(1) : '0';

        playerName.textContent = `📊 ${player.nickname}`;

        content.innerHTML = `
            <div class="detailed-stats">
                <div class="stats-grid">
                    <div class="detailed-stat-item">
                        <div class="detailed-stat-value">⚔️ ${player.kills}</div>
                        <div class="detailed-stat-label">Убийств</div>
                    </div>
                    <div class="detailed-stat-item">
                        <div class="detailed-stat-value">💀 ${player.deaths}</div>
                        <div class="detailed-stat-label">Смертей</div>
                    </div>
                    <div class="detailed-stat-item">
                        <div class="detailed-stat-value">🎯 ${kd}</div>
                        <div class="detailed-stat-label">K/D Ratio</div>
                    </div>
                    <div class="detailed-stat-item">
                        <div class="detailed-stat-value">⏱️ ${player.time}ч</div>
                        <div class="detailed-stat-label">Часов игры</div>
                    </div>
                    <div class="detailed-stat-item">
                        <div class="detailed-stat-value">📈 ${efficiency}</div>
                        <div class="detailed-stat-label">Убийств/час</div>
                    </div>
                    <div class="detailed-stat-item">
                        <div class="detailed-stat-value">🏆 ${winRate}%</div>
                        <div class="detailed-stat-label">Процент побед</div>
                    </div>
                    <div class="detailed-stat-item">
                        <div class="detailed-stat-value">📅 ${new Date(player.createdAt).toLocaleDateString()}</div>
                        <div class="detailed-stat-label">Дата создания</div>
                    </div>
                    <div class="detailed-stat-item">
                        <div class="detailed-stat-value">🔄 ${new Date(player.updatedAt).toLocaleDateString()}</div>
                        <div class="detailed-stat-label">Последнее обновление</div>
                    </div>
                </div>
                
                ${player.screenshot ? `
                    <div class="player-screenshot">
                        <h3 style="margin-bottom: 12px;">📸 Скриншот</h3>
                        <img src="${player.screenshot}" alt="Скриншот ${player.nickname}" loading="lazy" style="width: 100%; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
                    </div>
                ` : `
                    <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                        📷 Скриншот не загружен
                    </div>
                `}
            </div>
        `;

        modal.style.display = 'flex';
        
        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeDetailedStats();
            }
        });
    }

    closeDetailedStats() {
        const modal = document.getElementById('detailed-stats-modal');
        modal.style.display = 'none';
    }

    handleScreenshotUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.showScreenshotPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            this.hideScreenshotPreview();
        }
    }

    showScreenshotPreview(src) {
        const preview = document.getElementById('screenshot-preview');
        preview.innerHTML = `<img src="${src}" alt="Предпросмотр скриншота">`;
        preview.classList.add('active');
    }

    hideScreenshotPreview() {
        const preview = document.getElementById('screenshot-preview');
        preview.classList.remove('active');
        preview.innerHTML = '';
    }

    updateOverview() {
        const totalPlayers = this.players.length;
        const totalKills = this.players.reduce((sum, player) => sum + player.kills, 0);
        const totalDeaths = this.players.reduce((sum, player) => sum + player.deaths, 0);
        const totalTime = this.players.reduce((sum, player) => sum + player.time, 0);

        document.getElementById('total-players').textContent = totalPlayers;
        document.getElementById('total-kills').textContent = totalKills;
        document.getElementById('total-deaths').textContent = totalDeaths;
        document.getElementById('total-time').textContent = totalTime.toFixed(1);
    }

    addActivity(text) {
        const activity = {
            id: Date.now(),
            text,
            timestamp: new Date().toISOString()
        };
        
        this.activityLog.unshift(activity);
        
        // Keep only last 10 activities
        if (this.activityLog.length > 10) {
            this.activityLog = this.activityLog.slice(0, 10);
        }
        
        this.renderActivity();
        this.saveData();
        
        // Debug localStorage status
        this.logLocalStorageStatus();
    }

    logLocalStorageStatus() {
        try {
            const stats = {
                players: localStorage.getItem('stats-players') ? JSON.parse(localStorage.getItem('stats-players')).length : 0,
                activities: localStorage.getItem('stats-activity') ? JSON.parse(localStorage.getItem('stats-activity')).length : 0,
                background: !!localStorage.getItem('stats-background'),
                containerSizes: !!localStorage.getItem('container-sizes')
            };
            console.log('LocalStorage status:', stats);
        } catch (error) {
            console.error('Error checking localStorage status:', error);
        }
    }

    renderActivity() {
        const container = document.getElementById('settings-activity-list');
        
        if (!container) return;
        
        if (this.activityLog.length === 0) {
            container.innerHTML = `
                <div class="activity-item">
                    <div class="activity-text">Добро пожаловать! Добавьте первого игрока.</div>
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

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Только что';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} дн назад`;
        
        return date.toLocaleDateString();
    }

    // Export data for backup
    exportData() {
        const data = {
            players: this.players,
            activity: this.activityLog,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stats-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.addActivity('Данные экспортированы');
    }

    // Import data from backup
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.players && Array.isArray(data.players)) {
                    this.players = data.players;
                    if (data.activity && Array.isArray(data.activity)) {
                        this.activityLog = data.activity;
                    }
                    this.saveData();
                    this.renderPlayers();
                    this.updatePlayerSelect();
                    this.updateOverview();
                    this.renderActivity();
                    this.addActivity('Данные импортированы');
                } else {
                    throw new Error('Неверный формат файла');
                }
            } catch (error) {
                alert('Ошибка импорта данных: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Resize functionality - Fixed implementation
    toggleResizeMode() {
        console.log('🔄 Toggle resize mode called, current state:', this.resizeMode);
        
        this.resizeMode = !this.resizeMode;
        const button = document.getElementById('toggle-resize-mode');
        const hint = document.querySelector('.resize-hint');
        const saveButton = document.getElementById('save-resize');
        
        if (!button) {
            console.error('❌ Toggle resize button not found!');
            return;
        }
        
        if (this.resizeMode) {
            console.log('✅ Entering resize mode');
            document.body.classList.add('resize-mode');
            
            // Update button text and style
            button.innerHTML = `
                <svg viewBox="0 0 24 24" class="button-icon">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
                Выйти из режима изменения
            `;
            button.classList.add('active');
            
            if (hint) {
                hint.style.display = 'block';
                hint.textContent = 'Наведите курсор на края контейнеров для изменения размеров. Нажмите и перетаскивайте.';
            }
            
            if (saveButton) {
                saveButton.style.display = 'inline-flex';
            }
            
            this.addResizeHandles();
            this.addActivity('Режим изменения размеров включен');
            
        } else {
            console.log('✅ Exiting resize mode');
            document.body.classList.remove('resize-mode');
            
            // Restore button
            button.innerHTML = `
                <svg viewBox="0 0 24 24" class="button-icon">
                    <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7.27C13.4,7.61 14.26,8.15 14.26,8.15C14.79,8.68 15.58,8.68 16.11,8.15C16.64,7.62 16.64,6.83 16.11,6.3L15.27,5.46C15.61,5.06 16.74,4 16.74,4C17.27,3.47 18.06,3.47 18.59,4C19.12,4.53 19.12,5.32 18.59,5.85L17.73,6.69C18.07,7.03 19.15,8.15 19.15,8.15C19.68,8.68 19.68,9.47 19.15,10C18.62,10.53 17.83,10.53 17.3,10L16.46,9.16C16.1,9.5 15,10.63 15,10.63C14.47,11.16 13.68,11.16 13.15,10.63C12.62,10.1 12.62,9.31 13.15,8.78L14,7.92C13.74,7.58 13,6.84 13,6.84V18.16C13,18.16 13.74,17.42 14,17.08L13.15,16.22C12.62,15.69 12.62,14.9 13.15,14.37C13.68,13.84 14.47,13.84 15,14.37C15,14.37 16.1,15.5 16.46,15.84L17.3,15C17.83,14.47 18.62,14.47 19.15,15C19.68,15.53 19.68,16.32 19.15,16.85C19.15,16.85 18.07,17.97 17.73,18.31L18.59,19.15C19.12,19.68 19.12,20.47 18.59,21C18.06,21.53 17.27,21.53 16.74,21C16.74,21 15.61,19.94 15.27,19.54L16.11,18.7C16.64,18.17 16.64,17.38 16.11,16.85C15.58,16.32 14.79,16.32 14.26,16.85C14.26,16.85 13.4,17.39 13,17.73V19.27C13.6,19.61 14,20.26 14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21C10,20.26 10.4,19.61 11,19.27V17.73C10.6,17.39 9.74,16.85 9.74,16.85C9.21,16.32 8.42,16.32 7.89,16.85C7.36,17.38 7.36,18.17 7.89,18.7L8.73,19.54C8.39,19.94 7.26,21 7.26,21C6.73,21.53 5.94,21.53 5.41,21C4.88,20.47 4.88,19.68 5.41,19.15L6.27,18.31C5.93,17.97 4.85,16.85 4.85,16.85C4.32,16.32 4.32,15.53 4.85,15C5.38,14.47 6.17,14.47 6.7,15L7.54,15.84C7.9,15.5 9,14.37 9,14.37C9.53,13.84 10.32,13.84 10.85,14.37C11.38,14.9 11.38,15.69 10.85,16.22L10,17.08C10.26,17.42 11,18.16 11,18.16V6.84C11,6.84 10.26,7.58 10,7.92L10.85,8.78C11.38,9.31 11.38,10.1 10.85,10.63C10.32,11.16 9.53,11.16 9,10.63C9,10.63 7.9,9.5 7.54,9.16L6.7,10C6.17,10.53 5.38,10.53 4.85,10C4.32,9.47 4.32,8.68 4.85,8.15C4.85,8.15 5.93,7.03 6.27,6.69L5.41,5.85C4.88,5.32 4.88,4.53 5.41,4C5.94,3.47 6.73,3.47 7.26,4C7.26,4 8.39,5.06 8.73,5.46L7.89,6.3C7.36,6.83 7.36,7.62 7.89,8.15C8.42,8.68 9.21,8.68 9.74,8.15C9.74,8.15 10.6,7.61 11,7.27V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
                </svg>
                Режим изменения размеров
            `;
            button.classList.remove('active');
            
            if (hint) {
                hint.style.display = 'none';
            }
            
            this.removeResizeHandles();
            this.addActivity('Режим изменения размеров выключен');
        }
        
        console.log('✅ Resize mode toggled successfully to:', this.resizeMode);
    }

    addResizeHandles() {
        const containers = document.querySelectorAll('.glass-card');
        containers.forEach((container, index) => {
            container.dataset.containerId = index;
            
            container.addEventListener('mouseenter', () => this.showResizeHandles(container));
            container.addEventListener('mouseleave', () => this.hideResizeHandles(container));
            
            // Create resize handles
            const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'bottom', 'left', 'right'];
            handles.forEach(handle => {
                const handleEl = document.createElement('div');
                handleEl.className = `resize-handle ${handle}`;
                handleEl.addEventListener('mousedown', (e) => this.startResize(e, container, handle));
                container.appendChild(handleEl);
            });
        });
    }

    removeResizeHandles() {
        document.querySelectorAll('.resize-handle').forEach(handle => handle.remove());
    }

    showResizeHandles(container) {
        if (!this.resizeMode) return;
        container.querySelectorAll('.resize-handle').forEach(handle => {
            handle.classList.add('visible');
        });
    }

    hideResizeHandles(container) {
        if (this.isResizing) return;
        container.querySelectorAll('.resize-handle').forEach(handle => {
            handle.classList.remove('visible');
        });
    }

    startResize(e, container, handle) {
        e.preventDefault();
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
            
            if (handle.includes('right')) newWidth = startWidth + deltaX;
            if (handle.includes('left')) newWidth = startWidth - deltaX;
            if (handle.includes('bottom')) newHeight = startHeight + deltaY;
            if (handle.includes('top')) newHeight = startHeight - deltaY;
            
            // Minimum sizes
            newWidth = Math.max(200, newWidth);
            newHeight = Math.max(100, newHeight);
            
            container.style.width = newWidth + 'px';
            container.style.height = newHeight + 'px';
            
            this.showSaveButton();
        };
        
        const onMouseUp = () => {
            this.isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            this.startSaveTimer();
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    showSaveButton() {
        clearTimeout(this.resizeTimeout);
        const saveBtn = document.getElementById('save-resize');
        saveBtn.style.display = 'block';
    }

    startSaveTimer() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.showSaveButton();
        }, 2000);
    }

    saveContainerSizes() {
        const containers = document.querySelectorAll('.glass-card');
        containers.forEach((container, index) => {
            this.containerSizes[index] = {
                width: container.style.width || 'auto',
                height: container.style.height || 'auto'
            };
        });
        
        // Save to localStorage and call main saveData method
        this.saveData();
        document.getElementById('save-resize').style.display = 'none';
        this.addActivity('Размеры контейнеров сохранены');
    }

    loadContainerSizes() {
        try {
            const saved = localStorage.getItem('container-sizes');
            if (saved) {
                this.containerSizes = JSON.parse(saved);
                const containers = document.querySelectorAll('.glass-card');
                containers.forEach((container, index) => {
                    if (this.containerSizes[index]) {
                        container.style.width = this.containerSizes[index].width;
                        container.style.height = this.containerSizes[index].height;
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка загрузки размеров:', error);
        }
    }

    // Screenshot capture functionality
    async captureScreenshot() {
        try {
            // Check if the browser supports screen capture
            if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                this.addActivity('❌ Скриншоты не поддерживаются в этом браузере');
                return;
            }

            this.addActivity('📸 Создание скриншота...');

            // Request screen capture
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    mediaSource: 'screen',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            // Create video element to capture frame
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            video.addEventListener('loadedmetadata', () => {
                // Create canvas for screenshot
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);

                // Stop the stream
                stream.getTracks().forEach(track => track.stop());

                // Convert to blob and download
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `stats-app-screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    this.addActivity('✅ Скриншот сохранен');
                }, 'image/png');
            });

        } catch (error) {
            console.error('Ошибка создания скриншота:', error);
            this.addActivity('❌ Ошибка создания скриншота');
        }
    }

    // PWA Install
    async installApp() {
        if (!this.deferredPrompt) return;
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            document.getElementById('install-app').style.display = 'none';
            document.getElementById('app-status').textContent = 'Приложение устанавливается...';
        }
        
        this.deferredPrompt = null;
    }

    // Test save function
    testSaveFunction() {
        console.log('=== Testing Save Function ===');
        
        // Create test data
        const testPlayer = {
            id: Date.now(),
            nickname: 'TestPlayer_' + Math.random().toString(36).substr(2, 5),
            kills: Math.floor(Math.random() * 100),
            deaths: Math.floor(Math.random() * 50),
            time: Math.random() * 10,
            screenshot: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Add test player
        this.players.push(testPlayer);
        console.log('Added test player:', testPlayer);
        
        // Force save
        this.saveData();
        
        // Verify save
        setTimeout(() => {
            const saved = localStorage.getItem('stats-players');
            if (saved) {
                const players = JSON.parse(saved);
                const found = players.find(p => p.id === testPlayer.id);
                if (found) {
                    alert('✅ Тест сохранения прошел успешно! Данные сохраняются правильно.');
                    console.log('Test successful - player found in localStorage');
                    this.addActivity('Тест сохранения успешен');
                    
                    // Update status
                    document.getElementById('data-status').textContent = 'Статус сохранения: ✅ Работает';
                } else {
                    alert('❌ Ошибка: тестовый игрок не найден в localStorage');
                    console.error('Test failed - player not found in localStorage');
                    document.getElementById('data-status').textContent = 'Статус сохранения: ❌ Ошибка';
                }
            } else {
                alert('❌ Ошибка: данные не сохранились в localStorage');
                console.error('Test failed - no data in localStorage');
                document.getElementById('data-status').textContent = 'Статус сохранения: ❌ Не работает';
            }
            
            // Clean up - remove test player
            this.players = this.players.filter(p => p.id !== testPlayer.id);
            this.saveData();
            this.renderPlayers();
            this.updatePlayerSelect();
            this.updateOverview();
        }, 500);
    }

    // Clear all data
    clearAllData() {
        if (confirm('⚠️ Вы уверены, что хотите удалить ВСЕ данные?\n\nЭто действие нельзя отменить!\n\n- Все игроки будут удалены\n- История активности будет очищена\n- Настройки будут сброшены')) {
            try {
                // Clear localStorage
                localStorage.removeItem('stats-players');
                localStorage.removeItem('stats-activity');
                localStorage.removeItem('stats-background');
                localStorage.removeItem('container-sizes');
                
                // Clear app data
                this.players = [];
                this.activityLog = [];
                this.currentBackground = 'https://i.postimg.cc/XJkg1VB3/a-gift-for-you-bocchi-the-rock-thumb.jpg';
                this.containerSizes = {};
                
                // Reset UI
                this.renderPlayers();
                this.updatePlayerSelect();
                this.updateOverview();
                this.renderActivity();
                this.updateBackgroundSelection();
                
                // Reset background
                document.body.style.background = `url('${this.currentBackground}') center/cover no-repeat fixed`;
                
                // Update status
                document.getElementById('data-status').textContent = 'Статус сохранения: 🗑️ Данные очищены';
                
                console.log('All data cleared successfully');
                alert('✅ Все данные успешно удалены!');
                
                // Add activity (this will be the first entry)
                setTimeout(() => {
                    this.addActivity('Все данные очищены');
                }, 100);
                
            } catch (error) {
                console.error('Error clearing data:', error);
                alert('❌ Ошибка при очистке данных: ' + error.message);
            }
        }
    }
}

// Initialize app when DOM is loaded
let app;
let statsTracker; // Add reference for debugging

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing app...');
    try {
        app = new StatsTracker();
        statsTracker = app; // Keep reference for global access
        window.app = app; // Make immediately available
        window.statsTracker = app; // Alternative access
        console.log('✅ App initialized successfully');
        console.log('App instance:', app);
    } catch (error) {
        console.error('❌ Error initializing app:', error);
    }
});

// Ensure app is available globally
window.addEventListener('load', () => {
    if (app) {
        window.app = app;
        window.statsTracker = app;
        console.log('✅ App made globally available');
    } else {
        console.error('❌ App not initialized properly');
    }
});
