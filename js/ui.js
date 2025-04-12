// Используем глобальные константы анимаций
// Константы уже определены в constants.js

// UI Manager class
window.UIManager = class UIManager {
    constructor(app, uiLayer) {
        this.app = app;
        this.container = uiLayer || new PIXI.Container();
        this.buttons = {};
        this.characterSlots = [];
        this.selectedCharacterType = null;
        this.selectedSlotIndex = -1;
    }
    
    // Create UI for character selection screen
    createSelectionUI() {
        this.clearUI();
        
        // Title text
        const titleText = new PIXI.Text('Выберите персонажей', {
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xffffff,
            align: 'center'
        });
        titleText.anchor.set(0.5);
        titleText.position.set(GAME_WIDTH / 2, 120);
        this.container.addChild(titleText);
        
        // Character type selection buttons - расширяем для 4 кнопок
        const buttonSpacing = 350; // Уменьшаем расстояние между кнопками
        const startX = GAME_WIDTH / 2 - buttonSpacing * 1.5; // Центрируем 4 кнопки
        
        // Воин (крайний слева)
        const warriorButton = this.createButton('Воин', startX, 200, () => {
            this.selectedCharacterType = CHARACTER_TYPES.WARRIOR;
            this.updateCharacterTypeButtons();
        });
        
        // Лучник (слева от центра)
        const archerButton = this.createButton('Лучник', startX + buttonSpacing, 200, () => {
            this.selectedCharacterType = CHARACTER_TYPES.ARCHER;
            this.updateCharacterTypeButtons();
        });
        
        // Ассасин (справа от центра)
        const assassinButton = this.createButton('Ассасин', startX + buttonSpacing * 2, 200, () => {
            this.selectedCharacterType = CHARACTER_TYPES.ASSASSIN;
            this.updateCharacterTypeButtons();
        });
        
        // Маг Огня (крайний справа)
        const firemageButton = this.createButton('Маг Огня', startX + buttonSpacing * 3, 200, () => {
            this.selectedCharacterType = CHARACTER_TYPES.FIREMAGE;
            this.updateCharacterTypeButtons();
        });
        
        this.buttons.warrior = warriorButton;
        this.buttons.archer = archerButton;
        this.buttons.assassin = assassinButton;
        this.buttons.firemage = firemageButton;
        
        // Create character slots
        this.characterSlots = [];
        const slotSize = 160;
        const slotSpacing = 80;
        const startSlotX = (GAME_WIDTH - (slotSize + slotSpacing) * 6) / 2 + slotSize / 2;
        
        for (let i = 0; i < TOTAL_SLOTS; i++) {
            const slot = new PIXI.Graphics();
            slot.beginFill(0x555555);
            slot.drawRect(-slotSize / 2, -slotSize / 2, slotSize, slotSize);
            slot.endFill();
            
            slot.position.set(startSlotX + (slotSize + slotSpacing) * i, 350);
            slot.interactive = true;
            slot.buttonMode = true;
            
            // Slot data
            slot.characterType = null;
            slot.index = i;
            
            // Click event
            slot.on('pointerdown', () => {
                if (this.selectedCharacterType) {
                    this.assignCharacterToSlot(i, this.selectedCharacterType);
                }
            });
            
            this.container.addChild(slot);
            this.characterSlots.push({
                graphics: slot,
                characterType: null,
                characterSprite: null
            });
        }
        
         // Кнопки выбора сложности (изначально скрыты)
    const difficultyButtonsContainer = new PIXI.Container();
    difficultyButtonsContainer.visible = false;
    this.container.addChild(difficultyButtonsContainer);
    
    // Заголовок для выбора сложности
    const difficultyTitle = new PIXI.Text('Выберите сложность боя:', {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0xffffff,
        align: 'center'
    });
    difficultyTitle.anchor.set(0.5, 0);
    difficultyTitle.position.set(GAME_WIDTH / 2, 500);
    difficultyButtonsContainer.addChild(difficultyTitle);
    
    const buttonWidth = 400; // Задаем ширину больше, чем стандартные 300
    const buttonHeight = 80; // Можно оставить такую же высоту или изменить

    // Создаем кнопки сложности
    const easyButton = this.createButton('Легкий бой (6 врагов)', GAME_WIDTH / 2, 610, () => {
        game.selectedDifficulty = DIFFICULTY.EASY;
        game.startPlacement();
    }, DIFFICULTY_COLORS[DIFFICULTY.EASY], buttonWidth, buttonHeight);
    
    const hardButton = this.createButton('Сложный бой (7 врагов)', GAME_WIDTH / 2, 710, () => {
        game.selectedDifficulty = DIFFICULTY.HARD;
        game.startPlacement();
    }, DIFFICULTY_COLORS[DIFFICULTY.HARD], buttonWidth, buttonHeight);
    
    const unfairButton = this.createButton('Нечестный бой (8 врагов)', GAME_WIDTH / 2, 810, () => {
        game.selectedDifficulty = DIFFICULTY.UNFAIR;
        game.startPlacement();
    }, DIFFICULTY_COLORS[DIFFICULTY.UNFAIR], buttonWidth, buttonHeight);
    
    // Добавляем кнопки в контейнер сложности
    difficultyButtonsContainer.addChild(easyButton);
    difficultyButtonsContainer.addChild(hardButton);
    difficultyButtonsContainer.addChild(unfairButton);
    
    // Сохраняем контейнер с кнопками
    this.buttons.difficultyContainer = difficultyButtonsContainer;
    
    this.updateCharacterTypeButtons();
    }
    
    // Create UI for character placement screen
    createPlacementUI() {
        this.clearUI();
        
        // Слоты персонажей для выбора
        const slotSize = 140; // Размер слота
        const startX = 50; // Начальная позиция по горизонтали (слева)
        const startY = 100; // Начальная позиция по вертикали
        
        // Title text - размещаем по центру канваса вверху
        const titleText = new PIXI.Text('Разместите 3 персонажей на поле боя', {
            fontFamily: 'Arial',
            fontSize: 36, // Увеличиваем размер шрифта
            fill: 0xffffff,
            align: 'center', // Центрируем текст
            fontWeight: 'bold' // Делаем текст жирным
        });
        titleText.anchor.set(0.5, 0); // Привязка к центру по горизонтали и верху по вертикали
        titleText.position.set(GAME_WIDTH / 2, 20); // Позиция в центре вверху канваса
        this.container.addChild(titleText);
        
        // Create a map to track which slots have been placed
        this.placedSlots = {};
        
        for (let i = 0; i < TOTAL_SLOTS; i++) {
            if (this.characterSlots[i].characterType) {
                const slot = new PIXI.Graphics();
                slot.beginFill(0x555555);
                slot.drawRect(-slotSize / 2, -slotSize / 2, slotSize, slotSize);
                slot.endFill();
                
                slot.position.set(startX, startY + (slotSize + 40) * i); // Размещаем слоты слева вверху
                slot.interactive = true;
                slot.buttonMode = true;
                
                // Slot data
                slot.characterType = this.characterSlots[i].characterType;
                slot.index = i;
                slot.originalPosition = { x: slot.position.x, y: slot.position.y };
                
                // Click event
                slot.on('pointerdown', () => {
                    if (!this.placedSlots[i]) { // Only allow selection if not already placed
                        this.selectedSlotIndex = i;
                        this.selectedCharacterType = slot.characterType;
                        this.updateSlotSelection();
                    }
                });
                
                this.container.addChild(slot);
                
                // Add character icon
                const characterIcon = this.createCharacterIcon(slot.characterType);
                characterIcon.position.set(0, 0);
                slot.addChild(characterIcon);
                
                // Store reference to the slot graphics
                this.characterSlots[i].placementGraphics = slot;
            }
        }
        
        // Start battle button
        const startBattleButton = this.createButton('Начать бой', GAME_WIDTH / 2, GAME_HEIGHT / 2, () => { // Размещение кнопки по центру канваса
            game.startBattle();
        });
        startBattleButton.visible = false;
        this.buttons.startBattle = startBattleButton;
    }
    
    // Create UI for battle screen
    createBattleUI() {
        // No specific UI needed during battle, just clear previous UI
        this.clearUI();
    }
    
    // Проверяем, достаточно ли персонажей размещено на поле боя
    checkEnoughCharactersPlaced(placedCount) {
        // console.log(`[ИНТЕРФЕЙС] Проверка количества размещенных персонажей: ${placedCount}/${BATTLEFIELD_CHARACTERS}`);
        
        // Если размещено достаточно персонажей, показываем кнопку "Начать бой"
        if (placedCount >= BATTLEFIELD_CHARACTERS) {
            this.buttons.startBattle.visible = true;
        } else {
            this.buttons.startBattle.visible = false;
        }
    }
    
    // Create UI for reinforcement screen
    createReinforcementUI() {
        this.clearUI();
        
        // Доступные персонажи для подкрепления
        const slotSize = 160; // Размер слота
        const slotSpacing = 40; // Уменьшаем отступ между слотами
        const startX = 50; // Начальная позиция по горизонтали (слева)
        
        // Title text - размещаем по центру вверху
        const titleText = new PIXI.Text('Выберите подкрепление', {
            fontFamily: 'Arial',
            fontSize: 36, // Увеличиваем размер шрифта
            fill: 0xffffff,
            align: 'center',
            fontWeight: 'bold' // Делаем текст жирным
        });
        titleText.anchor.set(0.5, 0); // Привязка к центру по горизонтали и верху по вертикали
        titleText.position.set(GAME_WIDTH / 2, 20); // Позиция в центре вверху канваса
        this.container.addChild(titleText);
        let availableSlotCount = 0;
        
        for (let i = 0; i < TOTAL_SLOTS; i++) {
            if (this.characterSlots[i].characterType && !this.characterSlots[i].used) {
                const slot = new PIXI.Graphics();
                slot.beginFill(0x555555);
                slot.drawRect(-slotSize / 2, -slotSize / 2, slotSize, slotSize);
                slot.endFill();
                
                slot.position.set(startX, 100 + (slotSize + slotSpacing) * availableSlotCount); // Размещаем слоты слева вверху
                slot.interactive = true;
                slot.buttonMode = true;
                
                // Slot data
                slot.characterType = this.characterSlots[i].characterType;
                slot.index = i;
                
                // Click event
                slot.on('pointerdown', () => {
                    this.selectedSlotIndex = i;
                    this.selectedCharacterType = slot.characterType;
                    this.updateSlotSelection();
                });
                
                this.container.addChild(slot);
                
                // Add character icon
                const characterIcon = this.createCharacterIcon(slot.characterType);
                characterIcon.position.set(0, 0);
                slot.addChild(characterIcon);
                
                availableSlotCount++;
            }
        }
    }
    
    // Create UI for game over screen
    createGameOverUI(isVictory) {
        this.clearUI();
        
        // Result text
        const resultText = new PIXI.Text(isVictory ? 'Победа!' : 'Поражение', {
            fontFamily: 'Arial',
            fontSize: 48,
            fill: isVictory ? 0x00ff00 : 0xff0000,
            align: 'center'
        });
        resultText.anchor.set(0.5);
        resultText.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100); // Увеличено в 2 раза с 50 до 100
        this.container.addChild(resultText);
        
        // Restart button
        const restartButton = this.createButton('Заново', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, () => { // Увеличено в 2 раза с 50 до 100
            game.restart();
        });
        this.buttons.restart = restartButton;
    }
    
    // Helper method to create a button
    createButton(text, x, y, onClick, buttonColor = 0x4CAF50, buttonWidth = 300, buttonHeight = 80) {
        const button = new PIXI.Container();
        button.position.set(x, y);
        button.interactive = true;
        button.buttonMode = true;
        
        const background = new PIXI.Graphics();
        background.beginFill(buttonColor);
        // Используем переданные параметры ширины и высоты вместо жестко заданных значений
        // Делим на 2, потому что начальная точка находится в центре кнопки
        background.drawRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
        background.endFill();
        
        const buttonText = new PIXI.Text(text, {
            fontFamily: 'Arial',
            fontSize: 32,
            fill: 0xffffff
        });
        buttonText.anchor.set(0.5);
        
        button.addChild(background);
        button.addChild(buttonText);
        
        button.on('pointerdown', onClick);
        button.on('pointerover', () => {
            background.tint = 0xdddddd;
        });
        button.on('pointerout', () => {
            background.tint = 0xffffff;
        });
        
        this.container.addChild(button);
        return button;
    }
    
    // Создаем иконку персонажа с анимацией idle
    createCharacterIcon(type) {
    const container = new PIXI.Container();
    
    try {
        // Создаем спрайт для иконки персонажа
        const characterSprite = new PIXI.Sprite();
        characterSprite.anchor.set(0.5);
        characterSprite.scale.set(2.5, 2.5);
        container.addChild(characterSprite);
        
        // Загружаем иконку в зависимости от типа персонажа
        if (type === CHARACTER_TYPES.WARRIOR) {
            characterSprite.texture = PIXI.Texture.from('images/warrior_icon.png');
        } else if (type === CHARACTER_TYPES.ARCHER) {
            characterSprite.texture = PIXI.Texture.from('images/archer_icon.png');
        } else if (type === CHARACTER_TYPES.ASSASSIN) {
            characterSprite.texture = PIXI.Texture.from('images/ASSASIN_ICON.png');
        } else if (type === CHARACTER_TYPES.FIREMAGE) {
            characterSprite.texture = PIXI.Texture.from('images/FIRE_MAGE_ICON.png');
        }
        
        // Добавляем анимацию пульсации
        let scale = 1.0;
        let growing = true;
        
        const pulseAnimation = () => {
            if (growing) {
                scale += 0.01;
                if (scale >= 1.1) growing = false;
            } else {
                scale -= 0.01;
                if (scale <= 0.9) growing = true;
            }
            
            characterSprite.scale.set(scale, scale);
        };
        
        // Запускаем анимацию пульсации
        const animationInterval = setInterval(pulseAnimation, 50);
        container.animationInterval = animationInterval;
        
    } catch (error) {
        console.error(`[СПРАЙТЫ] Ошибка при создании иконки: ${error.message}`);
        
        // Создаем запасной вариант - цветной круг
        const graphics = new PIXI.Graphics();
        
        if (type === CHARACTER_TYPES.WARRIOR) {
            graphics.beginFill(0xFF0000); // Красный для воина
        } else if (type === CHARACTER_TYPES.ARCHER) {
            graphics.beginFill(0x0000FF); // Синий для лучника
        } else if (type === CHARACTER_TYPES.ASSASSIN) {
            graphics.beginFill(0xFF00FF); // Фиолетовый для ассасина
        } else if (type === CHARACTER_TYPES.FIREMAGE) {
            graphics.beginFill(0xFF6600); // Оранжевый для мага огня
        } else {
            graphics.beginFill(0xCCCCCC); // Серый для неизвестного типа
        }
        
        graphics.drawCircle(0, 0, 20);
        graphics.endFill();
        
        container.addChild(graphics);
    }
    
    return container;
}
    
    // Update character type selection buttons
    updateCharacterTypeButtons() {
        // Сбрасываем все кнопки
        if (this.buttons.warrior) this.buttons.warrior.children[0].tint = 0xffffff;
        if (this.buttons.archer) this.buttons.archer.children[0].tint = 0xffffff;
        if (this.buttons.assassin) this.buttons.assassin.children[0].tint = 0xffffff;
        if (this.buttons.firemage) this.buttons.firemage.children[0].tint = 0xffffff;
        
        // Подсвечиваем выбранную кнопку
        if (this.selectedCharacterType === CHARACTER_TYPES.WARRIOR && this.buttons.warrior) {
            this.buttons.warrior.children[0].tint = 0x2196F3;
        } else if (this.selectedCharacterType === CHARACTER_TYPES.ARCHER && this.buttons.archer) {
            this.buttons.archer.children[0].tint = 0x2196F3;
        } else if (this.selectedCharacterType === CHARACTER_TYPES.ASSASSIN && this.buttons.assassin) {
            this.buttons.assassin.children[0].tint = 0x2196F3;
        } else if (this.selectedCharacterType === CHARACTER_TYPES.FIREMAGE && this.buttons.firemage) {
            this.buttons.firemage.children[0].tint = 0x2196F3;
        }
    }

    
    // Update slot selection
    updateSlotSelection() {
        // Reset all slots
        this.container.children.forEach(child => {
            if (child instanceof PIXI.Graphics && child.index !== undefined) {
                child.tint = 0xffffff;
            }
        });
        
        // Highlight selected slot
        this.container.children.forEach(child => {
            if (child instanceof PIXI.Graphics && child.index === this.selectedSlotIndex) {
                child.tint = 0x2196F3;
            }
        });
    }
    
    // Assign character to slot
    assignCharacterToSlot(slotIndex, characterType) {
        // Remove previous character if exists
        if (this.characterSlots[slotIndex].characterSprite) {
            this.characterSlots[slotIndex].graphics.removeChild(this.characterSlots[slotIndex].characterSprite);
        }
        
        // Create character icon
        const characterIcon = this.createCharacterIcon(characterType);
        this.characterSlots[slotIndex].graphics.addChild(characterIcon);
        
        // Update slot data
        this.characterSlots[slotIndex].characterType = characterType;
        this.characterSlots[slotIndex].characterSprite = characterIcon;
        this.characterSlots[slotIndex].used = false;
        
        // Check if all slots are filled
        this.checkAllSlotsFilled();
    }
    
    // Check if all slots are filled
    checkAllSlotsFilled() {
        let allFilled = true;
        
        for (let i = 0; i < TOTAL_SLOTS; i++) {
            if (!this.characterSlots[i].characterType) {
                allFilled = false;
                break;
            }
        }
        
        // Показываем кнопки выбора сложности, если все слоты заполнены
        if (allFilled) {
            this.buttons.difficultyContainer.visible = true;
        } else {
            this.buttons.difficultyContainer.visible = false;
        }
    }
    
    // Check if enough characters are placed on battlefield
    checkEnoughCharactersPlaced(count) {
        if (count >= BATTLEFIELD_CHARACTERS) {
            this.buttons.startBattle.visible = true;
        } else {
            this.buttons.startBattle.visible = false;
        }
    }
    
    // Mark a slot as used (for reinforcement)
    markSlotAsUsed(slotIndex) {
        if (this.characterSlots[slotIndex]) {
            this.characterSlots[slotIndex].used = true;
        }
    }
    
    // Check if there are any unused characters left
    hasUnusedCharacters() {
        for (let i = 0; i < TOTAL_SLOTS; i++) {
            if (this.characterSlots[i].characterType && !this.characterSlots[i].used) {
                return true;
            }
        }
        return false;
    }
    
    // Clear all UI elements
    clearUI() {
        while (this.container.children.length > 0) {
            this.container.removeChildAt(0);
        }
        this.buttons = {};
    }
}
