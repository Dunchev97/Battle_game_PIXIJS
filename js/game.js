// Исправленный файл game.js
class Game {
    constructor() {
        // Определяем базовое разрешение для игры
        this.baseWidth = 1920;
        this.baseHeight = 1080;
        
        // Массив для хранения выбранных заклинаний
this.selectedSpells = [null, null, null, null]; // 4 слота для заклинаний

// Текущий уровень маны
this.mana = 0;
// Максимальный уровень маны
this.maxMana = 10;
// Время последнего обновления маны
this.lastManaUpdateTime = 0;
// Флаг, указывающий активен ли сейчас режим использования заклинания
this.isSpellCastingMode = false;
// Выбранное для использования заклинание
this.selectedSpellToCast = null;

// ИСПРАВЛЕНИЕ: Инициализируем lastManaUpdateTime в конструкторе
this.lastManaUpdateTime = performance.now() / 1000;

this.spellManager = new SpellManager(this);

        // Создаем PIXI приложение с автоматическим масштабированием
        this.app = new PIXI.Application({
            backgroundColor: 0x333333,
            view: document.getElementById('gameCanvas'),
            resolution: window.devicePixelRatio || 1,
            autoDensity: true, // Для корректного отображения на Retina дисплеях
        });

        // Создаем отдельные контейнеры для разных слоев игры
        this.uiLayer = new PIXI.Container();
        this.battlefieldLayer = new PIXI.Container();
        
        // Добавляем слои на сцену в правильном порядке (поле боя за UI)
        this.app.stage.addChild(this.battlefieldLayer);
        this.app.stage.addChild(this.uiLayer);
        
        // Скрываем слой поля боя изначально
        this.battlefieldLayer.visible = false;
        
        // Устанавливаем начальное состояние игры
        this.state = GAME_STATES.SELECTION;
        
        // Сложность по умолчанию - легкая
        this.selectedDifficulty = DIFFICULTY.EASY;
        
        // Инициализируем систему адаптивного разрешения
        this.initializeResponsiveCanvas();
        
        // Инициализируем менеджеры с соответствующими слоями
        this.ui = new UIManager(this.app, this.uiLayer);
        this.battlefield = new BattlefieldManager(this.app, this.battlefieldLayer);
        
        // Запускаем игровой цикл
        this.app.ticker.add(this.update.bind(this));
        
        // Добавляем обработчик изменения размера окна
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        
        // Запускаем игру
        this.startSelection();
    }

    // Инициализация адаптивного канваса
    initializeResponsiveCanvas() {
        // Устанавливаем размер канваса
        this.resizeCanvas();
        
        // Настраиваем масштабирование сцены
        this.app.stage.scale.set(this.scale);
    }

    // Метод для изменения размера канваса при изменении размера окна
    resizeCanvas() {
        // Получаем текущий размер окна
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Вычисляем масштабный коэффициент
        const scaleX = windowWidth / this.baseWidth;
        const scaleY = windowHeight / this.baseHeight;
        this.scale = Math.min(scaleX, scaleY);
        
        // Вычисляем фактический размер канваса
        const canvasWidth = Math.round(this.baseWidth * this.scale);
        const canvasHeight = Math.round(this.baseHeight * this.scale);
        
        // Устанавливаем размер канваса
        this.app.renderer.resize(canvasWidth, canvasHeight);
        
        // Обновляем размеры игрового контейнера
        document.getElementById('gameContainer').style.width = `${canvasWidth}px`;
        document.getElementById('gameContainer').style.height = `${canvasHeight}px`;
        
        // Обновляем масштаб сцены
        this.app.stage.scale.set(this.scale);
        
        // Корректируем константы для правильной работы игровой логики
        window.GAME_WIDTH = this.baseWidth;
        window.GAME_HEIGHT = this.baseHeight;
        
        // Обновляем UI для нового разрешения, если UI инициализирован
        if (this.ui && typeof this.ui.updateForResolution === 'function') {
            this.ui.updateForResolution();
        }
    }
    

    // Обновление игры
    update(delta) {
        // Scale delta to be in seconds
        delta = delta / 60;
        
        // Обновляем ману
        this.updateMana(delta);
        
        // Если мы в режиме битвы, обновляем персонажей
        if (this.state === GAME_STATES.BATTLE) {
            this.battlefield.update(delta);
        }
    }
    
    // Start character selection phase
    startSelection() {
        this.state = GAME_STATES.SELECTION;
        this.ui.createSelectionUI();
        this.battlefieldLayer.visible = false;
    }
    
    startSpellSelection() {
        this.state = GAME_STATES.SPELL_SELECTION;
        this.ui.createSpellSelectionUI();
        this.battlefieldLayer.visible = false;
    }
    // Start character placement phase
    startPlacement() {
        this.state = GAME_STATES.PLACEMENT;
    this.ui.createPlacementUI();
    
    // Create battlefield, show it, and generate enemies
    this.battlefield.createBattlefield();
    this.battlefieldLayer.visible = true;
    this.battlefield.generateEnemies();
    }
    
    // Start battle phase
    startBattle() {
        this.state = GAME_STATES.BATTLE;
        this.ui.createBattleUI();
        
        // Делаем поле боя интерактивным для заклинаний
        if (this.battlefield && this.battlefield.battlefield) {
            this.battlefield.battlefield.interactive = true;
            this.battlefield.battlefield.buttonMode = true;
        }
        
        // Сбрасываем значения маны при начале боя
        this.mana = 0;
        this.lastManaUpdateTime = performance.now() / 1000;
        
        // Обновляем UI маны
        if (this.ui && typeof this.ui.updateManaUI === 'function') {
            this.ui.updateManaUI(this.mana, this.maxMana);
        }
    }
    
    updateMana(delta) {
        // Обновляем ману только в режиме боя и если не в режиме выбора подкрепления
        if (this.state === GAME_STATES.BATTLE && !this.isSpellCastingMode) {
            // Увеличиваем ману на 1 каждую секунду, до максимума
            const currentTime = performance.now() / 1000;
            
            // Убедимся, что lastManaUpdateTime инициализирован
            if (!this.lastManaUpdateTime) {
                this.lastManaUpdateTime = currentTime;
            }
            
            // Проверяем, прошла ли 1 секунда с последнего обновления
            if (currentTime - this.lastManaUpdateTime >= 1) {
                if (this.mana < this.maxMana) {
                    this.mana += 1;
                    // Обновляем UI маны
                    if (this.ui && typeof this.ui.updateManaUI === 'function') {
                        this.ui.updateManaUI(this.mana, this.maxMana);
                    }
                }
                this.lastManaUpdateTime = currentTime;
                
                // Отладочная информация
                console.log("Мана обновлена:", this.mana);
            }
        }
    }

    // Start reinforcement phase
    startReinforcement() {
        // Первым делом отменяем все активные заклинания перед сменой состояния
        if (this.isSpellCastingMode && this.ui) {
            this.isSpellCastingMode = false;
            this.selectedSpellToCast = null;
            
            // Если UI содержит метод отмены использования заклинания, вызываем его
            if (typeof this.ui.cancelSpellCasting === 'function') {
                this.ui.cancelSpellCasting();
            }
        }
        
        this.state = GAME_STATES.REINFORCEMENT;
        this.ui.createReinforcementUI();
    }
    
    // Resume battle after reinforcement
    resumeBattle() {
        this.state = GAME_STATES.BATTLE;
        this.ui.createBattleUI();
    }
    
    // Game over
    gameOver(isVictory) {
        this.state = GAME_STATES.GAME_OVER;
        this.ui.createGameOverUI(isVictory);
    }
    
    // Метод для окончания боя
    endBattle(isVictory) {
        this.state = GAME_STATES.GAME_OVER;
        this.ui.createGameOverUI(isVictory);
    }
    
    // Restart game
    restart() {
        // НОВОЕ: Отменяем режим использования заклинания, если он активен
        if (this.isSpellCastingMode && this.ui) {
            this.ui.cancelSpellCasting();
        }
        
        // Удаляем все мины и другие эффекты с поля боя более тщательно
        if (this.battlefield && this.battlefield.container) {
            // Вместо сложной фильтрации найдем и удалим все подозрительные контейнеры
            const childrenToRemove = [];
            
            this.battlefield.container.children.forEach(child => {
                // Если это не основная арена и не персонаж - считаем эффектом и удаляем
                if (child instanceof PIXI.Container && 
                    !this.battlefield.characters.some(char => char.container === child) &&
                    child !== this.battlefield.battlefield) {
                    childrenToRemove.push(child);
                }
            });
            
            // Удаляем найденные контейнеры
            childrenToRemove.forEach(container => {
                if (container.parent) {
                    container.parent.removeChild(container);
                }
            });
        }
        
        // Очищаем все интервалы и таймауты
        const highestTimeoutId = setTimeout(() => {}, 0);
        for (let i = 0; i < highestTimeoutId; i++) {
            clearTimeout(i);
            clearInterval(i);
        }
        
        // НОВОЕ: Явно отключаем все обработчики событий поля боя
        if (this.battlefield && this.battlefield.battlefield) {
            // Удаляем все обработчики с поля боя
            this.battlefield.battlefield.removeAllListeners();
            
            // Восстанавливаем базовую интерактивность
            this.battlefield.battlefield.interactive = true;
            this.battlefield.battlefield.buttonMode = true;
            
            // Восстанавливаем базовый обработчик клика для размещения персонажей
            if (typeof this.battlefield.onBattlefieldClick === 'function') {
                if (this.isMobile) {
                    this.battlefield.battlefield.on('touchstart', this.battlefield.onBattlefieldTouch.bind(this.battlefield));
                } else {
                    this.battlefield.battlefield.on('pointerdown', this.battlefield.onBattlefieldClick.bind(this.battlefield));
                }
            }
        }
        
        // Сбрасываем флаги режима заклинаний
        this.isSpellCastingMode = false;
        this.selectedSpellToCast = null;
        
        // Сбрасываем ману
        this.mana = 0;
        
        // Существующий код reset
        this.battlefield.reset();
        this.startSelection();
    }
}

// Initialize game when window loads
window.onload = function() {
    // Create global game instance
    window.game = new Game();
};