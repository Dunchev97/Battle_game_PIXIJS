// Используем глобальные константы анимаций
// Константы уже определены в constants.js
if (typeof window.isLandscape === 'undefined') {
    window.isLandscape = window.innerWidth > window.innerHeight;
    
    // Отслеживаем изменение ориентации
    window.addEventListener('resize', function() {
        window.isLandscape = window.innerWidth > window.innerHeight;
    });
}
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
    updateForResolution() {
        // Пересоздаем текущий UI в зависимости от текущего состояния игры
        if (game.state === GAME_STATES.SELECTION) {
            this.createSelectionUI();
        } else if (game.state === GAME_STATES.PLACEMENT) {
            this.createPlacementUI();
        } else if (game.state === GAME_STATES.BATTLE) {
            this.createBattleUI();
        } else if (game.state === GAME_STATES.REINFORCEMENT) {
            this.createReinforcementUI();
        } else if (game.state === GAME_STATES.GAME_OVER) {
            this.createGameOverUI();
        }
    }
    // Create UI for character selection screen
    // Исправленный метод createSelectionUI
createSelectionUI() {
    // Определяем ориентацию устройства
    const isLandscape = window.innerWidth > window.innerHeight;
    const isMobile = window.isMobile || window.innerWidth < 768;
    
    const titleContainer = new PIXI.Container();
    titleContainer.position.set(GAME_WIDTH / 2, isMobile ? 60 : 120);

    const titleText = new PIXI.Text('Выберите персонажей', {
        fontFamily: 'Arial',
        fontSize: isMobile ? 36 : 48,
        fill: 0xffffff,
        align: 'center'
    });
    titleText.anchor.set(0.5);

    // Создаём тёмный фон
    const titleBg = new PIXI.Graphics();
    titleBg.beginFill(0x000000, 0.7);  // Чёрный цвет с 70% непрозрачностью
    // Делаем фон немного больше текста
    titleBg.drawRoundedRect(
        -titleText.width/2 - 20, 
        -titleText.height/2 - 10, 
        titleText.width + 40, 
        titleText.height + 20,
        10  // Закругление углов
    );
    titleBg.endFill();

    titleContainer.addChild(titleBg);
    titleContainer.addChild(titleText);
    this.container.addChild(titleContainer);
            
    // Кнопки выбора персонажей - расположение зависит от устройства и ориентации
    let buttonSpacing, startX, startY;
            
    if (isMobile) {
        if (isLandscape) {
            // Горизонтальная ориентация - кнопки в ряд
            buttonSpacing = Math.min(800, GAME_WIDTH / 6);
            startX = GAME_WIDTH / 2 - buttonSpacing * 1.6;
            startY = GAME_HEIGHT / 4;
        } else {
            // Вертикальная ориентация - кнопки в колонку
            buttonSpacing = Math.min(120, GAME_HEIGHT / 12);
            startX = GAME_WIDTH / 2;
            startY = 150;
        }
    } else {
        // Десктоп - стандартное расположение
        buttonSpacing = 350;
        startX = GAME_WIDTH / 2 - buttonSpacing * 1.6;
        startY = 230;
    }
        
    // Создаем кнопки в соответствии с ориентацией
    if (isMobile && !isLandscape) {
        // Вертикальная ориентация - кнопки в колонку
        const warriorButton = this.createButton('Воин', startX, startY, () => {
            this.selectedCharacterType = CHARACTER_TYPES.WARRIOR;
            this.updateCharacterTypeButtons();
        });
            
        const archerButton = this.createButton('Лучник', startX, startY + buttonSpacing, () => {
            this.selectedCharacterType = CHARACTER_TYPES.ARCHER;
            this.updateCharacterTypeButtons();
        });
            
        const assassinButton = this.createButton('Ассасин', startX, startY + buttonSpacing * 2, () => {
            this.selectedCharacterType = CHARACTER_TYPES.ASSASSIN;
            this.updateCharacterTypeButtons();
        });
            
        const firemageButton = this.createButton('Маг Огня', startX, startY + buttonSpacing * 3, () => {
            this.selectedCharacterType = CHARACTER_TYPES.FIREMAGE;
            this.updateCharacterTypeButtons();
        });
            
        this.buttons.warrior = warriorButton;
        this.buttons.archer = archerButton;
        this.buttons.assassin = assassinButton;
        this.buttons.firemage = firemageButton;
    } else {
        // Горизонтальная ориентация или десктоп - кнопки в ряд
        const warriorButton = this.createButton('Воин', startX, startY, () => {
            this.selectedCharacterType = CHARACTER_TYPES.WARRIOR;
            this.updateCharacterTypeButtons();
        });
            
        const archerButton = this.createButton('Лучник', startX + buttonSpacing, startY, () => {
            this.selectedCharacterType = CHARACTER_TYPES.ARCHER;
            this.updateCharacterTypeButtons();
        });
            
        const assassinButton = this.createButton('Ассасин', startX + buttonSpacing * 2, startY, () => {
            this.selectedCharacterType = CHARACTER_TYPES.ASSASSIN;
            this.updateCharacterTypeButtons();
        });
            
        const firemageButton = this.createButton('Маг Огня', startX + buttonSpacing * 3, startY, () => {
            this.selectedCharacterType = CHARACTER_TYPES.FIREMAGE;
            this.updateCharacterTypeButtons();
        });
            
        this.buttons.warrior = warriorButton;
        this.buttons.archer = archerButton;
        this.buttons.assassin = assassinButton;
        this.buttons.firemage = firemageButton;
    }
        
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
            
        slot.position.set(startSlotX + (slotSize + slotSpacing) * i, 390);
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
    const difficultyTitleContainer = new PIXI.Container();
    difficultyTitleContainer.position.set(GAME_WIDTH / 2, 500);

    const difficultyTitle = new PIXI.Text('Выберите сложность боя:', {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0xffffff,
        align: 'center'
    });
    difficultyTitle.anchor.set(0.5, -0.2);

    // Создаём тёмный фон
    const difficultyTitleBg = new PIXI.Graphics();
    difficultyTitleBg.beginFill(0x000000, 0.7);
    difficultyTitleBg.drawRoundedRect(
        -difficultyTitle.width/2 - 20, 
        0, 
        difficultyTitle.width + 40, 
        difficultyTitle.height + 20,
        10
    );
    difficultyTitleBg.endFill();

    difficultyTitleContainer.addChild(difficultyTitleBg);
    difficultyTitleContainer.addChild(difficultyTitle);
    difficultyButtonsContainer.addChild(difficultyTitleContainer);
    
    const buttonWidth = 400; // Задаем ширину больше, чем стандартные 300
    const buttonHeight = 80; // Можно оставить такую же высоту или изменить

    // Создаем кнопки сложности
    const easyButton = this.createButton('Легкий бой (6 врагов)', GAME_WIDTH / 2, 610, () => {
        game.selectedDifficulty = DIFFICULTY.EASY;
        game.startSpellSelection();
    }, DIFFICULTY_COLORS[DIFFICULTY.EASY], buttonWidth, buttonHeight);
    
    const hardButton = this.createButton('Сложный бой (7 врагов)', GAME_WIDTH / 2, 710, () => {
        game.selectedDifficulty = DIFFICULTY.HARD;
        game.startSpellSelection();
    }, DIFFICULTY_COLORS[DIFFICULTY.HARD], buttonWidth, buttonHeight);
    
    const unfairButton = this.createButton('Нечестный бой (8 врагов)', GAME_WIDTH / 2, 810, () => {
        game.selectedDifficulty = DIFFICULTY.UNFAIR;
        game.startSpellSelection();
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
        const startX = 100; // Начальная позиция по горизонтали (слева)
        const startY = 100; // Начальная позиция по вертикали
        
        // Title text - размещаем по центру канваса вверху
        const titleContainer = new PIXI.Container();
titleContainer.position.set(GAME_WIDTH / 2, 20);

const titleText = new PIXI.Text('Разместите 3 персонажей на поле боя', {
    fontFamily: 'Arial',
    fontSize: 36,
    fill: 0xffffff,
    align: 'center',
    fontWeight: 'bold'
});
titleText.anchor.set(0.5, 0);

// Создаём тёмный фон
const titleBg = new PIXI.Graphics();
titleBg.beginFill(0x000000, 0.7);
titleBg.drawRoundedRect(
    -titleText.width/2 - 20, 
    0, 
    titleText.width + 40, 
    titleText.height + 20,
    10
);
titleBg.endFill();

titleContainer.addChild(titleBg);
titleContainer.addChild(titleText);
this.container.addChild(titleContainer);
        
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
    
// Метод для создания UI выбора заклинаний
createSpellSelectionUI() {
    this.clearUI();
    
    // Заголовок
    const titleContainer = new PIXI.Container();
    titleContainer.position.set(GAME_WIDTH / 2, 20);

    const titleText = new PIXI.Text('Выберите заклинания', {
        fontFamily: 'Arial',
        fontSize: 36,
        fill: 0xffffff,
        align: 'center',
        fontWeight: 'bold'
    });
    titleText.anchor.set(0.5, -0.2);

    // Создаём тёмный фон
    const titleBg = new PIXI.Graphics();
    titleBg.beginFill(0x000000, 0.7);
    titleBg.drawRoundedRect(
        -titleText.width/2 - 20, 
        0, 
        titleText.width + 40, 
        titleText.height + 20,
        10
    );
    titleBg.endFill();

    titleContainer.addChild(titleBg);
    titleContainer.addChild(titleText);
    this.container.addChild(titleContainer);
    
    // Создаем 4 пустых слота для заклинаний
    const slotSize = 100;
    const slotSpacing = 20;
    const slotsStartX = GAME_WIDTH / 2 - ((slotSize + slotSpacing) * 4 - slotSpacing) / 2 + slotSize/2;
    const slotsY = 150;
    
    this.spellSlots = [];
    
    for (let i = 0; i < 4; i++) {
        const slot = new PIXI.Graphics();
        slot.beginFill(0x555555);
        slot.drawRect(-slotSize / 2, -slotSize / 2, slotSize, slotSize);
        slot.endFill();
        
        slot.position.set(slotsStartX + (slotSize + slotSpacing) * i, slotsY);
        slot.interactive = true;
        slot.buttonMode = true;
        
        // Данные слота
        slot.index = i;
        slot.spell = null;
        
        // Обработчик клика на слот
        slot.on('pointerdown', () => {
            if (this.selectedSpellType) {
                this.assignSpellToSlot(i, this.selectedSpellType);
            }
        });
        
        this.container.addChild(slot);
        this.spellSlots.push({
            graphics: slot,
            spell: null
        });
    }
    
    // Создаем сетку заклинаний (4 ряда по 3 заклинания)
    const spellButtonSize = 150;
    const spellButtonSpacing = 20;
    const spellsStartX = GAME_WIDTH / 2 - ((spellButtonSize + spellButtonSpacing) * 3 - spellButtonSpacing) / 2 + spellButtonSize/2;
    const spellsStartY = 300;
    
    // Получаем массив типов заклинаний
    const spellTypes = Object.values(SPELL_TYPES);
    
    // Создаем кнопки для каждого заклинания
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
            const index = row * 3 + col;
            if (index >= spellTypes.length) break;
            
            const spellType = spellTypes[index];
            const spellInfo = SPELL_INFO[spellType];
            
            // Создаем контейнер для заклинания
            const spellContainer = new PIXI.Container();
            spellContainer.position.set(
                spellsStartX + (spellButtonSize + spellButtonSpacing) * col,
                spellsStartY + (spellButtonSize + spellButtonSpacing + 30) * row
            );
            spellContainer.interactive = true;
            spellContainer.buttonMode = true;
            
            // Фон кнопки
            const background = new PIXI.Graphics();
            background.beginFill(0x333333);
            background.drawRoundedRect(-spellButtonSize/2, -spellButtonSize/2, spellButtonSize, spellButtonSize, 5);
            background.endFill();
            
            // Данные заклинания
            spellContainer.spellType = spellType;
            
            // Загружаем иконку заклинания
            const spellIcon = PIXI.Sprite.from(spellInfo.image);
            spellIcon.width = spellButtonSize - 20;
            spellIcon.height = spellButtonSize - 20;
            spellIcon.anchor.set(0.5);
            
            // Текст с названием заклинания
            const nameText = new PIXI.Text(spellInfo.name, {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0xffffff,
                align: 'center'
            });
            nameText.anchor.set(0.5, 0);
            nameText.position.set(0, spellButtonSize/2 + 5);
            
            // Добавляем элементы в контейнер
            spellContainer.addChild(background);
            spellContainer.addChild(spellIcon);
            spellContainer.addChild(nameText);
            
            // Обработчик клика
            spellContainer.on('pointerdown', () => {
                this.selectSpell(spellType);
            });
            
            this.container.addChild(spellContainer);
        }
    }
    
    // Кнопка "Готово" (изначально скрыта)
    const readyButton = this.createButton('Готово', GAME_WIDTH / 2, GAME_HEIGHT - 100, () => {
        // Сохраняем выбранные заклинания в игре
        game.selectedSpells = this.spellSlots.map(slot => slot.spell);
        game.startPlacement();
    }, 0x4CAF50, 300, 80);
    readyButton.visible = false;
    this.buttons.ready = readyButton;
    
    // Инициализация
    this.selectedSpellType = null;
}

// Метод для выбора заклинания
selectSpell(spellType) {
    this.selectedSpellType = spellType;
    
    // Сбрасываем выделение со всех кнопок заклинаний
    this.container.children.forEach(child => {
        if (child instanceof PIXI.Container && child.spellType) {
            child.children[0].tint = 0xffffff; // Сбрасываем цвет фона
        }
    });
    
    // Выделяем выбранное заклинание
    this.container.children.forEach(child => {
        if (child instanceof PIXI.Container && child.spellType === spellType) {
            child.children[0].tint = 0x2196F3; // Подсвечиваем синим
        }
    });
}

// Метод для назначения заклинания в слот
assignSpellToSlot(slotIndex, spellType) {
    // Получаем информацию о заклинании
    const spellInfo = SPELL_INFO[spellType];
    
    // Очищаем слот от предыдущего заклинания
    if (this.spellSlots[slotIndex].graphics.children.length > 0) {
        this.spellSlots[slotIndex].graphics.removeChildren();
    }
    
    // Создаем иконку заклинания
    const spellIcon = PIXI.Sprite.from(spellInfo.image);
    spellIcon.width = this.spellSlots[slotIndex].graphics.width - 10;
    spellIcon.height = this.spellSlots[slotIndex].graphics.height - 10;
    spellIcon.anchor.set(0.5);
    
    // Добавляем иконку в слот
    this.spellSlots[slotIndex].graphics.addChild(spellIcon);
    
    // Обновляем данные слота
    this.spellSlots[slotIndex].spell = spellType;
    
    // Проверяем, все ли слоты заполнены
    this.checkAllSpellSlotsFilled();
}

// Метод для проверки, все ли слоты заклинаний заполнены
checkAllSpellSlotsFilled() {
    let allFilled = true;
    
    for (let i = 0; i < 4; i++) {
        if (!this.spellSlots[i].spell) {
            allFilled = false;
            break;
        }
    }
    
    // Показываем кнопку "Готово", если все слоты заполнены
    if (allFilled) {
        this.buttons.ready.visible = true;
    } else {
        this.buttons.ready.visible = false;
    }
}

    // Create UI for battle screen
    createBattleUI() {
        this.clearUI();
        
        // Создаем контейнер для шкалы маны
        const manaBarContainer = new PIXI.Container();
        manaBarContainer.position.set(GAME_WIDTH - 120, GAME_HEIGHT / 1.3);
        this.container.addChild(manaBarContainer);
        
        // Создаем фон шкалы маны (10 сегментов)
        const manaBarBg = new PIXI.Graphics();
        manaBarBg.lineStyle(3, 0xFFFFFF);
        
        const segmentHeight = 60;
        const segmentWidth = 60;
        const segmentSpacing = 10;
        
        // Рисуем 10 сегментов шкалы маны (сверху вниз)
        for (let i = 0; i < 10; i++) {
            manaBarBg.beginFill(0x333333, 0.5);
            manaBarBg.drawRect(-segmentWidth/2, -((i+1) * (segmentHeight + segmentSpacing)), segmentWidth, segmentHeight);
            manaBarBg.endFill();
        }
        
        manaBarContainer.addChild(manaBarBg);
        
        // Создаем шкалу маны (заполнение)
        const manaBarFill = new PIXI.Graphics();
        manaBarContainer.addChild(manaBarFill);
        
        // Добавляем текст значения маны
        const manaText = new PIXI.Text("0", {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0x00FFFF,
            align: 'center',
            fontWeight: 'bold'
        });
        manaText.anchor.set(0.5, 0);
        manaText.position.set(0, 20);
        manaBarContainer.addChild(manaText);
        
        // Сохраняем ссылки на элементы шкалы маны
        this.manaBarContainer = manaBarContainer;
        this.manaBarFill = manaBarFill;
        this.manaText = manaText;
        
        // Создаем слоты для заклинаний
        const spellSlotContainer = new PIXI.Container();
        spellSlotContainer.position.set(GAME_WIDTH - 280, GAME_HEIGHT / 1.3);
        this.container.addChild(spellSlotContainer);
        
        this.spellSlotIcons = [];
        
        // Создаем 4 слота для заклинаний
        const slotSize = 120;
        const slotSpacing = 10;
        
        for (let i = 0; i < 4; i++) {
            const slotContainer = new PIXI.Container();
            slotContainer.position.set(0, -((i+1) * (slotSize + slotSpacing)));
            spellSlotContainer.addChild(slotContainer);
            
            // Фон слота
            const slotBg = new PIXI.Graphics();
            slotBg.beginFill(0x555555);
            slotBg.drawRoundedRect(-slotSize/2, -slotSize/2, slotSize, slotSize, 5);
            slotBg.endFill();
            slotContainer.addChild(slotBg);
            
            // Если у игрока есть заклинание для этого слота, показываем его
            if (game.selectedSpells && game.selectedSpells[i]) {
                const spellType = game.selectedSpells[i];
                const spellInfo = SPELL_INFO[spellType];
                
                // Создаем иконку заклинания
                const spellIcon = PIXI.Sprite.from(spellInfo.image);
                spellIcon.width = slotSize - 10;
                spellIcon.height = slotSize - 10;
                spellIcon.anchor.set(0.5);
                slotContainer.addChild(spellIcon);
                
                // Текст стоимости маны
                const costText = new PIXI.Text(`${spellInfo.manaCost}`, {
                    fontFamily: 'Arial',
                    fontSize: 16,
                    fill: 0x00FFFF,
                    align: 'center',
                    fontWeight: 'bold'
                });
                costText.anchor.set(1, 1);
                costText.position.set(slotSize/2 - 5, slotSize/2 - 5);
                slotContainer.addChild(costText);
                
                // Сохраняем данные заклинания
                slotContainer.spellType = spellType;
                slotContainer.manaCost = spellInfo.manaCost;
                
                // Добавляем интерактивность
                slotContainer.interactive = true;
                slotContainer.buttonMode = true;
                
                // Обработчик клика для активации заклинания
                slotContainer.on('pointerdown', () => {
                    this.onSpellSlotClick(i, spellType);
                });
                
                // Добавляем эффект при наведении
                slotContainer.on('pointerover', () => {
                    slotBg.tint = 0xDDDDDD;
                });
                
                slotContainer.on('pointerout', () => {
                    slotBg.tint = 0xFFFFFF;
                });
                
                // Начально все заклинания "серые" (недоступны)
                spellIcon.tint = 0x777777;
                
                // Сохраняем ссылки на элементы слота
                this.spellSlotIcons.push({
                    container: slotContainer,
                    icon: spellIcon,
                    background: slotBg,
                    costText: costText,
                    index: i,
                    spellType: spellType,
                    manaCost: spellInfo.manaCost
                });
            }
        }
    }

    // Метод для обновления UI шкалы маны
updateManaUI(currentMana, maxMana) {
    if (!this.manaBarFill || !this.manaText) return;
    
    // Обновляем текст маны
    this.manaText.text = Math.floor(currentMana);
    
    // Очищаем шкалу маны
    this.manaBarFill.clear();
    
    // Определяем параметры сегментов
    const segmentHeight = 60;
    const segmentWidth = 60;
    const segmentSpacing = 10;
    
    // Рисуем заполненные сегменты
    const filledSegments = Math.floor(currentMana);
    
    for (let i = 0; i < filledSegments; i++) {
        this.manaBarFill.beginFill(0x00FFFF);
        this.manaBarFill.drawRect(-segmentWidth/2, -((i+1) * (segmentHeight + segmentSpacing)), segmentWidth, segmentHeight);
        this.manaBarFill.endFill();
    }
    
    // Если есть частично заполненный сегмент
    const partialFill = currentMana - filledSegments;
    if (partialFill > 0 && filledSegments < maxMana) {
        this.manaBarFill.beginFill(0x00FFFF);
        this.manaBarFill.drawRect(
            -segmentWidth/2, 
            -((filledSegments+1) * (segmentHeight + segmentSpacing)), 
            segmentWidth, 
            segmentHeight * partialFill
        );
        this.manaBarFill.endFill();
    }
    
    // Обновляем доступность заклинаний
    this.updateSpellAvailability(currentMana);
}

// Метод для обновления доступности заклинаний
updateSpellAvailability(currentMana) {
    if (!this.spellSlotIcons) return;
    
    this.spellSlotIcons.forEach(slot => {
        // Если маны достаточно для заклинания, делаем его доступным
        if (currentMana >= slot.manaCost) {
            slot.icon.tint = 0xFFFFFF; // Отображаем иконку в полном цвете
            slot.container.interactive = true; // Делаем слот интерактивным
            slot.container.buttonMode = true;
        } else {
            slot.icon.tint = 0x777777; // Затемняем иконку
            slot.container.interactive = false; // Отключаем интерактивность
            slot.container.buttonMode = false;
        }
    });
}

// Обработчик нажатия на слот заклинания
onSpellSlotClick(slotIndex, spellType) {
    const spellInfo = SPELL_INFO[spellType];
    
    // Проверяем, достаточно ли маны
    if (game.mana < spellInfo.manaCost) {
        return; // Недостаточно маны
    }
    
    // Проверяем, не в режиме ли мы уже использования заклинания
    if (game.isSpellCastingMode) {
        // Если нажали на тот же слот, отменяем режим применения заклинания
        if (game.selectedSpellToCast === spellType) {
            this.cancelSpellCasting();
        }
        return;
    }
    
    // Активируем режим использования заклинания
    game.isSpellCastingMode = true;
    game.selectedSpellToCast = spellType;
    
    // Подсвечиваем выбранное заклинание
    this.spellSlotIcons[slotIndex].background.tint = 0x00FF00;
    
    // Создаем подсказку в зависимости от типа заклинания
    let instructionText = "";
    
    switch (spellInfo.targetType) {
        case 'ally':
            instructionText = "Выберите союзника для применения";
            break;
        case 'enemy':
            instructionText = "Выберите врага для применения";
            break;
        case 'point':
            instructionText = "Выберите точку на поле боя";
            break;
        case 'vector':
            instructionText = "Выберите начальную точку вектора";
            break;
        case 'area':
            instructionText = "Выберите центр области действия";
            break;
        case 'random':
            // Для случайных заклинаний подтверждаем применение
            instructionText = "Нажмите на поле боя для применения";
            break;
    }
    
    // Создаем текст с инструкцией
    const instructionContainer = new PIXI.Container();
    instructionContainer.position.set(GAME_WIDTH / 2, 50);
    
    const instructions = new PIXI.Text(instructionText, {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xFFFFFF,
        align: 'center'
    });
    instructions.anchor.set(0.5);
    
    // Создаем фон для текста
    const textBg = new PIXI.Graphics();
    textBg.beginFill(0x000000, 0.7);
    textBg.drawRoundedRect(
        -instructions.width/2 - 20,
        -instructions.height/2 - 10,
        instructions.width + 40,
        instructions.height + 20,
        10
    );
    textBg.endFill();
    
    instructionContainer.addChild(textBg);
    instructionContainer.addChild(instructions);
    
    this.container.addChild(instructionContainer);
    this.spellInstructionContainer = instructionContainer;
    
    // ИСПРАВЛЕНИЕ: Создаем привязанную функцию onBattlefieldClickForSpell
    // и сохраняем ссылку на нее, чтобы можно было удалить
    if (['point', 'area', 'vector', 'random'].includes(spellInfo.targetType)) {
        // Удаляем предыдущий обработчик если он был
        if (this._boundOnBattlefieldClickForSpell) {
            if (game.battlefield && game.battlefield.battlefield) {
                game.battlefield.battlefield.off('pointerdown', this._boundOnBattlefieldClickForSpell);
            }
            this._boundOnBattlefieldClickForSpell = null;
        }
        
        // Создаем новую привязанную функцию
        this._boundOnBattlefieldClickForSpell = this.onBattlefieldClickForSpell.bind(this);
        
        // Делаем поле боя интерактивным для выбора точки
        if (game.battlefield && game.battlefield.battlefield) {
            game.battlefield.battlefield.on('pointerdown', this._boundOnBattlefieldClickForSpell);
        }
    }
}

// Отмена использования заклинания
cancelSpellCasting() {
    console.log("Отмена режима заклинания");
    
    if (!game) {
        console.error("game объект не существует");
        return;
    }
    
    game.isSpellCastingMode = false;
    game.selectedSpellToCast = null;
    
    // ИСПРАВЛЕНИЕ: Обновляем время восстановления маны
    game.lastManaUpdateTime = performance.now() / 1000;
    
    // Возвращаем цвет всех слотов заклинаний
    if (this.spellSlotIcons) {
        this.spellSlotIcons.forEach(slot => {
            if (slot && slot.background) {
                slot.background.tint = 0xFFFFFF;
            }
        });
    }
    
    // Удаляем инструкцию
    if (this.spellInstructionContainer) {
        this.container.removeChild(this.spellInstructionContainer);
        this.spellInstructionContainer = null;
    }
    
    // ИСПРАВЛЕНИЕ: Явно отключаем обработчик поля боя для заклинаний
    // Удаляем временные обработчики
    if (game.battlefield && game.battlefield.battlefield) {
        game.battlefield.battlefield.off('pointerdown', this.onBattlefieldClickForSpell);
        
        // НОВОЕ: Также удаляем любые другие обработчики, которые могли быть добавлены
        if (this._boundOnBattlefieldClickForSpell) {
            game.battlefield.battlefield.off('pointerdown', this._boundOnBattlefieldClickForSpell);
            this._boundOnBattlefieldClickForSpell = null;
        }
    }
    
    // Удаляем индикатор начальной точки вектора, если он существует
    if (this.vectorStartIndicator) {
        this.container.removeChild(this.vectorStartIndicator);
        this.vectorStartIndicator = null;
    }
    
    // Сбрасываем начальную точку вектора
    this.vectorStartPoint = null;
    
    console.log("Режим заклинания отменен успешно");
}

// Обработчик клика по полю боя для использования заклинания
onBattlefieldClickForSpell(event) {
    if (!game.isSpellCastingMode || !game.selectedSpellToCast) {
        return;
    }
    
    const spellType = game.selectedSpellToCast;
    const spellInfo = SPELL_INFO[spellType];
    
    // Проверяем, что event.data существует
    if (!event || !event.data || !event.data.global) {
        console.error("Неверные данные события при клике по полю боя");
        return;
    }
    
    // Получаем координаты клика на поле боя
    const position = event.data.global;
    const x = position.x / game.scale;
    const y = position.y / game.scale;
    
    console.log(`Клик по полю боя: x=${x}, y=${y}, тип заклинания: ${spellType}`);
    
    // Проверка типа заклинания по targetType
    const isArenaSpell = ['point', 'area', 'vector', 'random'].includes(spellInfo.targetType);
    
    if (!isArenaSpell) {
        return; // Если это не заклинание для арены, просто выходим
    }
    
    // Останавливаем распространение события в любом случае, если это заклинание арены
    event.stopPropagation && event.stopPropagation();
    
    // Логика для разных типов заклинаний
    if (spellInfo.targetType === 'point' || spellInfo.targetType === 'area' || spellInfo.targetType === 'random') {
        // Применяем заклинание по координатам
        this.castSpell(spellType, {x, y});
        
        // Отменяем режим заклинания после применения
        this.cancelSpellCasting();
    } else if (spellInfo.targetType === 'vector') {
        // Для векторных заклинаний нужно две точки
        if (!this.vectorStartPoint) {
            console.log(`Установлена начальная точка вектора: x=${x}, y=${y}`);
            
            // Сохраняем начальную точку вектора
            this.vectorStartPoint = {x, y};
            
            // Обновляем инструкцию, безопасно проверив контейнер
            if (this.spellInstructionContainer) {
                const instructionsText = this.spellInstructionContainer.children.find(
                    child => child instanceof PIXI.Text
                );
                
                if (instructionsText) {
                    instructionsText.text = "Выберите конечную точку вектора";
                }
            }
            
            // Создаем визуальный индикатор начальной точки
            const pointIndicator = new PIXI.Graphics();
            pointIndicator.beginFill(0x00FF00, 0.5);
            pointIndicator.drawCircle(0, 0, 10);
            pointIndicator.endFill();
            pointIndicator.position.set(x, y);
            
            this.container.addChild(pointIndicator);
            this.vectorStartIndicator = pointIndicator;
        } else {
            // Проверяем, что конечная точка отличается от начальной
            const startX = this.vectorStartPoint.x;
            const startY = this.vectorStartPoint.y;
            
            // Проверяем минимальное расстояние между точками
            const dx = x - startX;
            const dy = y - startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 20) {  // Минимальное расстояние 20 пикселей
                console.log("Конечная точка слишком близко к начальной, выберите другую точку");
                return;
            }
            
            console.log(`Установлена конечная точка вектора: x=${x}, y=${y}, расстояние: ${distance}`);
            
            // Применяем заклинание с вектором
            this.castSpell(spellType, {
                startX: startX,
                startY: startY,
                endX: x,
                endY: y
            });
            
            // Очищаем данные о векторе
            this.vectorStartPoint = null;
            
            // Удаляем индикатор начальной точки
            if (this.vectorStartIndicator) {
                this.container.removeChild(this.vectorStartIndicator);
                this.vectorStartIndicator = null;
            }
            
            // Отменяем режим заклинания после применения
            this.cancelSpellCasting();
        }
    }
}

// Добавим метод для проверки, является ли кликнутый объект допустимой целью для заклинания
isValidTargetForSpell(spellType, character) {
    if (!character) return false;
    
    const spellInfo = SPELL_INFO[spellType];
    
    // Для заклинаний, требующих союзной цели
    if (spellInfo.targetType === 'ally') {
        return character.team === TEAMS.PLAYER && character.isAlive;
    }
    
    // Для заклинаний, требующих вражеской цели
    if (spellInfo.targetType === 'enemy') {
        return character.team === TEAMS.ENEMY && character.isAlive;
    }
    
    return false;
}


// Применение заклинания
castSpell(spellType, targetData) {
    // Проверяем, что игра в режиме боя
    if (game.state !== GAME_STATES.BATTLE) {
        this.cancelSpellCasting();
        return;
    }
    
    const spellInfo = SPELL_INFO[spellType];
    
    // Проверяем, достаточно ли маны
    if (game.mana < spellInfo.manaCost) {
        this.cancelSpellCasting();
        return; // Недостаточно маны
    }
    
    console.log("Применение заклинания:", spellType, "Данные:", targetData);
    
    // Расходуем ману, но обеспечиваем что она не станет отрицательной
    game.mana = Math.max(0, game.mana - spellInfo.manaCost);
    this.updateManaUI(game.mana, game.maxMana);
    
    // ВАЖНО: Обновляем время последнего обновления маны
    // для обеспечения корректного восстановления маны после использования заклинания
    game.lastManaUpdateTime = performance.now() / 1000;
    
    // Вызываем соответствующий метод из SpellManager на основе типа заклинания и цели
    switch (spellType) {
        case SPELL_TYPES.HEALING:
            if (targetData.character) {
                game.spellManager.castSpellOnCharacter(spellType, targetData.character);
            }
            break;
        case SPELL_TYPES.STORM:
            game.spellManager.createStormEffect(targetData.x, targetData.y);
            break;
        case SPELL_TYPES.WIND_ARROW:
            if (targetData.startX !== undefined && targetData.endX !== undefined) {
                console.log("Запуск стрелы ветра от", targetData.startX, targetData.startY, "к", targetData.endX, targetData.endY);
                game.spellManager.createWindArrowEffect(
                    targetData.startX, 
                    targetData.startY, 
                    targetData.endX, 
                    targetData.endY
                );
            }
            break;
        case SPELL_TYPES.SUBORDINATION:
            if (targetData.character) {
                game.spellManager.castSpellOnCharacter(spellType, targetData.character);
            }
            break;
        case SPELL_TYPES.MINES:
            game.spellManager.createMinesEffect();
            break;
        case SPELL_TYPES.DECOMPOSITION:
            if (targetData.character) {
                game.spellManager.castSpellOnCharacter(spellType, targetData.character);
            }
            break;
        case SPELL_TYPES.ARMAGEDDON:
            game.spellManager.createArmageddonEffect();
            break;
        case SPELL_TYPES.WALL_OF_FIRE:
            if (targetData.startX !== undefined && targetData.endX !== undefined) {
                console.log("Создание стены огня от", targetData.startX, targetData.startY, "к", targetData.endX, targetData.endY);
                game.spellManager.createWallOfFireEffect(
                    targetData.startX, 
                    targetData.startY, 
                    targetData.endX, 
                    targetData.endY
                );
            }
            break;
        case SPELL_TYPES.ERUPTION:
            game.spellManager.createEruptionEffect(targetData.x, targetData.y);
            break;
        case SPELL_TYPES.ICE_AREA:
            game.spellManager.createIceAreaEffect(targetData.x, targetData.y);
            break;
        case SPELL_TYPES.ICE_WALL:
            if (targetData.startX !== undefined && targetData.endX !== undefined) {
                console.log("Создание стены льда от", targetData.startX, targetData.startY, "к", targetData.endX, targetData.endY);
                game.spellManager.createIceWallEffect(
                    targetData.startX, 
                    targetData.startY, 
                    targetData.endX, 
                    targetData.endY
                );
            }
            break;
        case SPELL_TYPES.FREEZING:
            if (targetData.character) {
                game.spellManager.castSpellOnCharacter(spellType, targetData.character);
            }
            break;
    }
}
    
    // Create UI for reinforcement screen
    createReinforcementUI() {
        this.clearUI();
        
        // Доступные персонажи для подкрепления
        const slotSize = 160; // Размер слота
        const slotSpacing = 40; // Уменьшаем отступ между слотами
        const startX = 100; // Начальная позиция по горизонтали (слева)
        
        const titleContainer = new PIXI.Container();
titleContainer.position.set(GAME_WIDTH / 2, 20);

const titleText = new PIXI.Text('Выберите подкрепление', {
    fontFamily: 'Arial',
    fontSize: 36,
    fill: 0xffffff,
    align: 'center',
    fontWeight: 'bold'
});
titleText.anchor.set(0.5, 0);

// Создаём тёмный фон
const titleBg = new PIXI.Graphics();
titleBg.beginFill(0x000000, 0.7);
titleBg.drawRoundedRect(
    -titleText.width/2 - 20, 
    0, 
    titleText.width + 40, 
    titleText.height + 20,
    10
);
titleBg.endFill();

titleContainer.addChild(titleBg);
titleContainer.addChild(titleText);
this.container.addChild(titleContainer);
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
        // Дополнительно очищаем переменные для заклинаний
    this.vectorStartPoint = null;
    
    if (this.vectorStartIndicator) {
        this.container.removeChild(this.vectorStartIndicator);
        this.vectorStartIndicator = null;
    }
    
    // Отключаем режим использования заклинания глобально при очистке UI
    if (game && game.isSpellCastingMode) {
        game.isSpellCastingMode = false;
        game.selectedSpellToCast = null;
    }
    }
    
    // Create UI for game over screen
    createGameOverUI(isVictory = false) {
        this.clearUI();
        
        // Result text
        const resultContainer = new PIXI.Container();
        resultContainer.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100);
    
        const resultText = new PIXI.Text(isVictory ? 'Победа!' : 'Поражение', {
            fontFamily: 'Arial',
            fontSize: 48,
            fill: isVictory ? 0x00ff00 : 0xff0000,
            align: 'center'
        });
        resultText.anchor.set(0.5);
    
        // Создаём тёмный фон
        const resultBg = new PIXI.Graphics();
        resultBg.beginFill(0x000000, 0.7);
        resultBg.drawRoundedRect(
            -resultText.width/2 - 30, 
            -resultText.height/2 - 20, 
            resultText.width + 60, 
            resultText.height + 40,
            15
        );
        resultBg.endFill();
    
        resultContainer.addChild(resultBg);
        resultContainer.addChild(resultText);
        this.container.addChild(resultContainer);
        
        // Restart button
        const restartButton = this.createButton('Заново', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, () => {
            // Сначала полностью очищаем UI
            this.clearUI();
            // Затем перезапускаем игру
            game.restart();
        });
        this.buttons.restart = restartButton;
    }
    
    // Helper method to create a button
    createButton(text, x, y, onClick, buttonColor = 0x4CAF50, buttonWidth = 300, buttonHeight = 80) {
        // Определяем, находимся ли мы на мобильном устройстве
        const isMobile = window.isMobile || window.innerWidth < 768;
        
        // Корректируем размеры для мобильных устройств
        if (isMobile) {
            buttonWidth = Math.min(buttonWidth, window.innerWidth * 0.8);
            buttonHeight = Math.min(buttonHeight, 60); // Уменьшаем высоту кнопки
        }
        
        const button = new PIXI.Container();
        button.position.set(x, y);
        button.interactive = true;
        button.buttonMode = true;
        
        const background = new PIXI.Graphics();
        background.beginFill(buttonColor);
        background.drawRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
        background.endFill();
        
        // Корректируем размер шрифта для мобильных устройств
        const fontSize = isMobile ? 24 : 32;
        
        const buttonText = new PIXI.Text(text, {
            fontFamily: 'Arial',
            fontSize: fontSize,
            fill: 0xffffff
        });
        buttonText.anchor.set(0.5);
        
        button.addChild(background);
        button.addChild(buttonText);
        
        // Настройка обработчиков событий для поддержки касаний
        if (isMobile) {
            button.on('touchstart', onClick);
            button.on('touchstart', () => {
                background.tint = 0xdddddd;
            });
            button.on('touchend', () => {
                background.tint = 0xffffff;
            });
        } else {
            button.on('pointerdown', onClick);
            button.on('pointerover', () => {
                background.tint = 0xdddddd;
            });
            button.on('pointerout', () => {
                background.tint = 0xffffff;
            });
        }
        
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
        // НОВОЕ: Отменяем режим заклинания, если он активен
        if (game && game.isSpellCastingMode) {
            this.cancelSpellCasting();
        }
        
        // Сначала удаляем все интервалы анимаций от иконок персонажей
        this.container.children.forEach(child => {
            // Проверяем, есть ли у контейнера или его дочерних элементов animationInterval
            if (child.animationInterval) {
                clearInterval(child.animationInterval);
            }
            
            // Ищем также animationInterval в дочерних элементах
            if (child.children) {
                child.children.forEach(subChild => {
                    if (subChild.animationInterval) {
                        clearInterval(subChild.animationInterval);
                    }
                });
            }
        });
        
        // Очищаем все существующие UI элементы из контейнера
        while (this.container.children.length > 0) {
            const child = this.container.removeChildAt(0);
            
            // Удаляем события и ссылки для предотвращения утечек памяти
            if (child.destroy) {
                child.destroy({children: true, texture: false, baseTexture: false});
            }
        }
        
        // Сбрасываем ссылки на кнопки
        this.buttons = {};
        
        // Сбрасываем выбранные значения
        this.selectedCharacterType = null;
        this.selectedSlotIndex = -1;
        
        // НОВОЕ: Сбрасываем все связанное с заклинаниями
        this.vectorStartPoint = null;
        this.vectorStartIndicator = null;
        
        // НОВОЕ: Если есть привязанная функция обработчика, удаляем ссылку на нее
        if (this._boundOnBattlefieldClickForSpell) {
            this._boundOnBattlefieldClickForSpell = null;
        }
    }
}
