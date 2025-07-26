// Community Tab Full-Screen Functionality
(function() {
    let communitySystem = {
        isFullscreen: false,
        currentTab: 'chat',
        
        init() {
            this.setupEventListeners();
            this.setupTabSwitching();
            this.createChatInterface(); // Создаем интерфейс чата
            this.setupChatFunctionality();
        },
        
        setupEventListeners() {
            // Community tab click - enter fullscreen
            const communityNavItem = document.querySelector('[data-tab="community"]');
            if (communityNavItem) {
                communityNavItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.enterFullscreen();
                });
            }
            
            // Back button - exit fullscreen
            const backBtn = document.getElementById('community-back-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.exitFullscreen();
                });
            }
            
            // ESC key to exit fullscreen
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isFullscreen) {
                    this.exitFullscreen();
                }
            });
        },
        
        setupTabSwitching() {
            const tabs = document.querySelectorAll('.community-tab');
            const tabContents = document.querySelectorAll('.community-tab-content');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetTab = tab.dataset.communityTab;
                    
                    // Remove active class from all tabs and contents
                    tabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    tab.classList.add('active');
                    
                    // Show corresponding content with animation
                    const targetContent = document.getElementById(`community-${targetTab}-content`);
                    if (targetContent) {
                        setTimeout(() => {
                            targetContent.classList.add('active');
                        }, 100);
                    }
                    
                    this.currentTab = targetTab;
                });
            });
        },
        
        createChatInterface() {
            const chatContent = document.getElementById('community-chat-content');
            if (!chatContent) return;
            
            // РАБОТАЕМ С ПРОСТЫМ ЧАТОМ - проверяем, что элементы существуют
            const simpleMessages = document.getElementById('simple-messages');
            const simpleChatInput = document.getElementById('simple-chat-input');
            
            if (simpleMessages && simpleChatInput) {
                console.log('Simple chat interface found, using existing structure');
                
                // Просто убеждаемся, что все работает
                if (typeof sendSimpleMessage === 'function') {
                    console.log('Simple chat functions ready');
                } else {
                    console.log('Simple chat functions not loaded yet');
                }
                
                return; // НЕ СОЗДАЁМ НИЧЕГО НОВОГО - используем простой чат
            }
            
            // Если простого чата нет, создаём базовую структуру
            console.log('Chat interface not found, creating simple structure');
            this.createNewChatStructure(chatContent);
        },
        },
        
        createNewChatStructure(chatContent) {
            // Создаем полную структуру чата только если её нет
            chatContent.innerHTML = `
                <div class="community-chat-container">
                    <!-- Chat Header -->
                    <div class="community-chat-header">
                        <div class="community-chat-avatar">
                            <svg style="width:20px;height:20px;fill:white;" viewBox="0 0 24 24">
                                <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"/>
                            </svg>
                        </div>
                        <div class="community-chat-info">
                            <h3>Общий чат</h3>
                            <p>Онлайн: 47 игроков</p>
                        </div>
                    </div>
                    
                    <!-- Messages Area -->
                    <div class="community-messages-area" id="community-messages-area">
                        <!-- Приветственное сообщение -->
                        <div class="community-message system">
                            <div class="community-message-avatar">
                                <svg style="width:16px;height:16px;fill:white;" viewBox="0 0 24 24">
                                    <path d="M12,2A2,2 0 0,1 14,4V8A2,2 0 0,1 12,10A2,2 0 0,1 10,8V4A2,2 0 0,1 12,2M21,10V12A2,2 0 0,1 19,14H12A2,2 0 0,1 10,12V10A2,2 0 0,1 12,8H19A2,2 0 0,1 21,10M12,14V20A2,2 0 0,1 10,22A2,2 0 0,1 8,20V14A2,2 0 0,1 10,12A2,2 0 0,1 12,14Z"/>
                                </svg>
                            </div>
                            <div class="community-message-content">
                                <div class="community-message-header">
                                    <span class="community-message-username">Система</span>
                                    <span class="community-message-time">${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div class="community-message-text">Добро пожаловать в общий чат! Здесь вы можете общаться с другими игроками и обсуждать стратегии.</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Input Area -->
                    <div class="community-input-area">
                        <textarea 
                            class="community-message-input" 
                            id="community-chat-input" 
                            placeholder="Напишите сообщение..." 
                            rows="1"
                        ></textarea>
                        <button class="community-send-btn" id="community-send-btn">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;">
                                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            
            // Добавим анимацию загрузки для сообщений
            setTimeout(() => {
                const messages = chatContent.querySelectorAll('.community-message');
                messages.forEach((msg, index) => {
                    setTimeout(() => {
                        msg.classList.add('loaded');
                    }, index * 100);
                });
            }, 500);
        },
        
        setupChatFunctionality() {
            const chatInput = document.getElementById('community-chat-input');
            const sendBtn = document.getElementById('community-send-btn');
            const messagesArea = document.getElementById('community-messages-area');
            
            // Отмечаем существующие сообщения как загруженные
            if (messagesArea) {
                const existingMessages = messagesArea.querySelectorAll('.community-message');
                existingMessages.forEach(msg => {
                    msg.classList.add('loaded');
                });
            }
            
            const sendMessage = () => {
                const text = chatInput.value.trim();
                if (!text) return;
                
                // Create new message
                const messageElement = this.createMessageElement({
                    text: text,
                    username: 'Вы',
                    time: new Date().toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }),
                    isOwn: true
                });
                
                // Add to chat
                messagesArea.appendChild(messageElement);
                
                // Clear input сразу
                chatInput.value = '';
                chatInput.style.height = 'auto';
                
                // Принудительная прокрутка в самый низ
                const scrollToBottom = () => {
                    messagesArea.scrollTop = messagesArea.scrollHeight;
                };
                
                // Анимация появления с правильной прокруткой
                requestAnimationFrame(() => {
                    messageElement.classList.add('loaded');
                    scrollToBottom();
                    
                    // Дополнительная прокрутка после анимации
                    setTimeout(scrollToBottom, 150);
                    setTimeout(scrollToBottom, 300);
                });
            };
            
            if (sendBtn) {
                sendBtn.addEventListener('click', sendMessage);
            }
            
            if (chatInput) {
                // Auto-resize textarea
                chatInput.addEventListener('input', () => {
                    chatInput.style.height = 'auto';
                    chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
                });
                
                // Send on Enter (Shift+Enter for new line)
                chatInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                });
            }
        },
        
        createMessageElement(messageData) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `community-message ${messageData.isOwn ? 'own' : ''}`;
            
            messageDiv.innerHTML = `
                <div class="community-message-avatar">
                    <svg style="width:16px;height:16px;fill:white;" viewBox="0 0 24 24">
                        <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                    </svg>
                </div>
                <div class="community-message-content">
                    <div class="community-message-header">
                        <span class="community-message-username">${messageData.username}</span>
                        <span class="community-message-time">${messageData.time}</span>
                    </div>
                    <div class="community-message-text">${messageData.text}</div>
                </div>
            `;
            
            return messageDiv;
        },
        
        enterFullscreen() {
            const communityTab = document.getElementById('community');
            const appContainer = document.querySelector('.app-container');
            const sidebar = document.querySelector('.glass-nav');
            const mobileNav = document.querySelector('.mobile-bottom-nav');
            const systemStatus = document.querySelector('.system-status-indicator');
            
            if (communityTab) {
                // Add fullscreen class with animation
                communityTab.classList.add('community-fullscreen');
                
                // Hide other UI elements
                if (sidebar) {
                    sidebar.style.opacity = '0';
                    sidebar.style.pointerEvents = 'none';
                }
                
                if (mobileNav) {
                    mobileNav.style.opacity = '0';
                    mobileNav.style.pointerEvents = 'none';
                }
                
                // Hide system status indicator
                if (systemStatus) {
                    systemStatus.style.opacity = '0';
                    systemStatus.style.pointerEvents = 'none';
                    systemStatus.style.transform = 'translateY(100px)';
                }
                
                // Make community tab active and visible
                communityTab.classList.add('active');
                
                // Hide other tabs
                const otherTabs = document.querySelectorAll('.tab-content:not(#community)');
                otherTabs.forEach(tab => {
                    tab.classList.remove('active');
                });
                
                this.isFullscreen = true;
                
                // Animate navigation collapse
                const navItems = document.querySelectorAll('.nav-item');
                navItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.transform = 'scale(0.8)';
                        item.style.opacity = '0.5';
                    }, index * 50);
                });
            }
        },
        
        exitFullscreen() {
            const communityTab = document.getElementById('community');
            const sidebar = document.querySelector('.glass-nav');
            const mobileNav = document.querySelector('.mobile-bottom-nav');
            const systemStatus = document.querySelector('.system-status-indicator');
            
            if (communityTab) {
                // Remove fullscreen class
                communityTab.classList.remove('community-fullscreen');
                
                // Show other UI elements
                setTimeout(() => {
                    if (sidebar) {
                        sidebar.style.opacity = '1';
                        sidebar.style.pointerEvents = 'auto';
                    }
                    
                    if (mobileNav) {
                        mobileNav.style.opacity = '1';
                        mobileNav.style.pointerEvents = 'auto';
                    }
                    
                    // Show system status indicator
                    if (systemStatus) {
                        systemStatus.style.opacity = '1';
                        systemStatus.style.pointerEvents = 'auto';
                        systemStatus.style.transform = 'translateY(0)';
                    }
                }, 200);
                
                this.isFullscreen = false;
                
                // Animate navigation expand
                const navItems = document.querySelectorAll('.nav-item');
                navItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.transform = 'scale(1)';
                        item.style.opacity = '1';
                    }, index * 50);
                });
                
                // Return to previous tab or home
                setTimeout(() => {
                    communityTab.classList.remove('active');
                    const homeTab = document.getElementById('home');
                    if (homeTab) {
                        homeTab.classList.add('active');
                        const homeNavItem = document.querySelector('[data-tab="home"]');
                        if (homeNavItem) {
                            document.querySelectorAll('.nav-item').forEach(item => 
                                item.classList.remove('active'));
                            homeNavItem.classList.add('active');
                        }
                    }
                }, 300);
            }
        },
        
        // Simulate receiving messages
        simulateActivity() {
            const activities = [
                {
                    username: 'КорольИгры999',
                    text: 'Установил новый рекорд по убийствам! 🎯',
                    time: this.getCurrentTime()
                },
                {
                    username: 'НовичокПро123',
                    text: 'Присоединился к турниру "Быстрые убийства"',
                    time: this.getCurrentTime()
                },
                {
                    username: 'ЛегендаИгр456',
                    text: 'Кто готов к командной игре? 🎮',
                    time: this.getCurrentTime()
                }
            ];
            
            setInterval(() => {
                if (this.isFullscreen && this.currentTab === 'chat') {
                    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
                    const messagesArea = document.getElementById('community-messages-area');
                    
                    if (messagesArea && Math.random() < 0.3) { // 30% chance
                        const messageElement = this.createMessageElement({
                            ...randomActivity,
                            time: this.getCurrentTime(),
                            isOwn: false
                        });
                        
                        messagesArea.appendChild(messageElement);
                        
                        // Анимация появления
                        setTimeout(() => {
                            messageElement.classList.add('loaded');
                        }, 50);
                        
                        // Плавный скролл вниз
                        setTimeout(() => {
                            messagesArea.scrollTop = messagesArea.scrollHeight;
                        }, 100);
                    }
                }
            }, 15000); // Every 15 seconds
        },
        
        getCurrentTime() {
            return new Date().toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => communitySystem.init(), 1000);
        });
    } else {
        setTimeout(() => communitySystem.init(), 1000);
    }
    
    // Start activity simulation
    setTimeout(() => {
        communitySystem.simulateActivity();
    }, 3000);
    
    // Make available globally
    window.communitySystem = communitySystem;
    
})();
