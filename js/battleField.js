// Battlefield Manager class
window.BattlefieldManager = class BattlefieldManager {
    constructor(app, battlefieldLayer) {
        this.app = app;
        this.container = battlefieldLayer || new PIXI.Container();
        this.characters = [];
        this.playerCharacters = [];
        this.enemyCharacters = [];
        this.battlefieldCreated = false;
    }
    
    // Create the battlefield
    createBattlefield() {
        // Создаем поле боя только если оно еще не создано
        if (!this.battlefieldCreated) {
            // Вычисляем радиус поля боя в зависимости от размера экрана
            const isMobile = window.isMobile || window.innerWidth < 768;
            const screenSize = Math.min(GAME_WIDTH, GAME_HEIGHT);
            
            // Для мобильных устройств используем меньший радиус
            window.BATTLEFIELD_RADIUS = isMobile ? screenSize * 0.35 : screenSize * 0.45;
            
            // Создаем круглое поле боя
            const battlefield = new PIXI.Graphics();
            battlefield.lineStyle(3, 0xffffff);
            battlefield.beginFill(0x333333);
            battlefield.drawCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, BATTLEFIELD_RADIUS);
            battlefield.endFill();
            
            this.container.addChild(battlefield);
            this.battlefield = battlefield;
            
            // Делаем поле боя интерактивным для размещения персонажей
            battlefield.interactive = true;
            battlefield.hitArea = new PIXI.Circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, BATTLEFIELD_RADIUS);
            
            // Добавляем обработчики событий с поддержкой касаний
            if (isMobile) {
                battlefield.on('touchstart', this.onBattlefieldTouch.bind(this));
            } else {
                battlefield.on('pointerdown', this.onBattlefieldClick.bind(this));
            }
            
            this.battlefieldCreated = true;
        }
        this.characters.forEach(character => {
            if (character && character.container) {
                character.container.interactive = true;
                character.container.buttonMode = true;
                character.container.on('pointerdown', this.onCharacterClick.bind(this, character));
            }
        });
    }
    
    onCharacterClick(character, event) {
        // Проверяем, находимся ли мы в режиме боя И режиме использования заклинания
    if (game.state === GAME_STATES.BATTLE && game.isSpellCastingMode && game.selectedSpellToCast) {
        console.log("Клик по персонажу в режиме заклинания:", character.type, character.team);
        
        const spellType = game.selectedSpellToCast;
        const spellInfo = SPELL_INFO[spellType];
        
        // Проверяем, подходит ли персонаж в качестве цели для заклинания
        if (game.ui.isValidTargetForSpell(spellType, character)) {
            console.log("Персонаж является допустимой целью для заклинания:", spellType);
            
            // Применяем заклинание к персонажу
            game.ui.castSpell(spellType, { character: character });
            
            // Останавливаем распространение события
            event.stopPropagation();
        } else {
            console.log("Персонаж не является допустимой целью для заклинания.");
        }
    }
        // Если мы в режиме использования заклинания
        if (game.isSpellCastingMode && game.selectedSpellToCast) {
            console.log("Клик по персонажу в режиме заклинания:", character.type, character.team);
            
            const spellType = game.selectedSpellToCast;
            const spellInfo = SPELL_INFO[spellType];
            
            // Проверяем, подходит ли персонаж в качестве цели для заклинания
            if (game.ui.isValidTargetForSpell(spellType, character)) {
                console.log("Персонаж является допустимой целью для заклинания:", spellType);
                
                // Применяем заклинание к персонажу
                game.ui.castSpell(spellType, { character: character });
                
                // Останавливаем распространение события
                event.stopPropagation();
            } else {
                console.log("Персонаж не является допустимой целью для заклинания.");
            }
        }
    }

    // Исправленный метод обработки касания
    onBattlefieldTouch(event) {
        // Преобразуем касание в клик для существующей логики
        const touchPosition = event.data.global;
        // Учитываем масштаб
        const adjustedPosition = {
            data: {
                global: {
                    x: touchPosition.x,
                    y: touchPosition.y
                }
            }
        };
        this.onBattlefieldClick(adjustedPosition);
    }
    
    // Исправленный метод обработки клика
    onBattlefieldClick(event) {
        if (game.state === GAME_STATES.PLACEMENT || game.state === GAME_STATES.REINFORCEMENT) {
            if (game.ui.selectedSlotIndex !== -1 && game.ui.selectedCharacterType) {
                // Получаем координаты клика
                const rawPosition = event.data.global;
                
                // Преобразуем координаты с учетом масштаба сцены
                const position = {
                    x: rawPosition.x / game.scale,
                    y: rawPosition.y / game.scale
                };
                
                // Check if position is within battlefield
                const centerX = GAME_WIDTH / 2;
                const centerY = GAME_HEIGHT / 2;
                const dx = position.x - centerX;
                const dy = position.y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= BATTLEFIELD_RADIUS - 20) {
                    this.placeCharacter(game.ui.selectedCharacterType, position.x, position.y);
                    
                    // Mark slot as used and visually clear it
                    const slotIndex = game.ui.selectedSlotIndex;
                    game.ui.markSlotAsUsed(slotIndex);
                    
                    // Visually clear the slot by making it semi-transparent
                    if (game.ui.characterSlots[slotIndex].placementGraphics) {
                        const slotGraphics = game.ui.characterSlots[slotIndex].placementGraphics;
                        slotGraphics.alpha = 0.3; // Make it semi-transparent
                        
                        // Add a visual indicator that the slot is used
                        const usedIndicator = new PIXI.Text('✓', {
                            fontFamily: 'Arial',
                            fontSize: 24,
                            fill: 0x00ff00
                        });
                        usedIndicator.anchor.set(0.5);
                        usedIndicator.position.set(0, 0);
                        slotGraphics.addChild(usedIndicator);
                        
                        // Add to the placed slots tracking
                        game.ui.placedSlots[slotIndex] = true;
                    }
                    
                    // Reset selection
                    game.ui.selectedSlotIndex = -1;
                    game.ui.selectedCharacterType = null;
                    game.ui.updateSlotSelection();
                    
                    // Check if enough characters are placed
                    if (game.state === GAME_STATES.PLACEMENT) {
                        game.ui.checkEnoughCharactersPlaced(this.playerCharacters.length);
                    } else if (game.state === GAME_STATES.REINFORCEMENT) {
                        // Resume battle after reinforcement
                        game.resumeBattle();
                    }
                }
            }
        }
    }
    
    // Обновление всех персонажей на поле боя
    update(delta) {
        // console.log(`[ПОЛЕ БОЯ] Обновление поля боя, количество персонажей: ${this.characters.length}, delta: ${delta}`);
        
        // Обновляем всех персонажей
        let aliveCount = 0;
        let deadCount = 0;
        for (let i = 0; i < this.characters.length; i++) {
            const character = this.characters[i];
            if (character) {
                if (character.isAlive) {
                    aliveCount++;
                    // console.log(`[ПОЛЕ БОЯ] Обновление живого персонажа ${character.type} (${character.team})`);
                    character.update(delta, this.characters);
                } else {
                    deadCount++;
                    // console.log(`[ПОЛЕ БОЯ] Обновление мертвого персонажа ${character.type} (${character.team})`);
                    // Обновляем только анимацию для мертвых персонажей
                    character.updateAnimation(delta);
                }
            }
        }
        
        // console.log(`[ПОЛЕ БОЯ] Живых персонажей: ${aliveCount}`);
        
        // Проверяем условия победы/поражения
        this.checkBattleStatus();
    }
    
    // Проверка статуса битвы
    checkBattleStatus() {
        // Проверяем, есть ли живые персонажи в каждой команде
        const playerAlive = this.playerCharacters.some(char => char.isAlive);
        const enemyAlive = this.enemyCharacters.some(char => char.isAlive);
        
        // Если все враги мертвы, игрок победил
        if (!enemyAlive && playerAlive && game.state === GAME_STATES.BATTLE) {
            // console.log('Игрок победил!');
            game.endBattle(true);
        }
        // Если все игроки мертвы, игрок проиграл
        else if (!playerAlive && enemyAlive && game.state === GAME_STATES.BATTLE) {
            // console.log('Игрок проиграл!');
            game.endBattle(false);
        }
    }
    
    // Place a character on the battlefield
    placeCharacter(type, x, y) {
        let character;
        
        // Создаем персонажа используя класс Character
        character = new Character(type, TEAMS.PLAYER, x, y);
        
        // Назначаем персонажу ссылку на поле боя
        character.battlefield = this;
        
        // Добавляем интерактивность персонажу для заклинаний
        character.container.interactive = true;
        character.container.buttonMode = true;
        character.container.on('pointerdown', this.onCharacterClick.bind(this, character));
        
        this.container.addChild(character.container);
        this.characters.push(character);
        this.playerCharacters.push(character);
        
        return character;
    }
    
    // Generate enemy characters
    generateEnemies() {
        // Clear any existing enemies
        this.enemyCharacters.forEach(enemy => {
            this.container.removeChild(enemy.container);
            const index = this.characters.indexOf(enemy);
            if (index !== -1) {
                this.characters.splice(index, 1);
            }
        });
        this.enemyCharacters = [];
        
        // Генерируем случайный тип персонажа с учетом новых классов
        const randomType = () => {
            const rand = Math.random();
            if (rand < 0.25) {
                return CHARACTER_TYPES.WARRIOR;
            } else if (rand < 0.5) {
                return CHARACTER_TYPES.ARCHER;
            } else if (rand < 0.75) {
                return CHARACTER_TYPES.ASSASSIN;
            } else {
                return CHARACTER_TYPES.FIREMAGE;
            }
        };
        
        // Определяем количество врагов на основе выбранной сложности
        const difficulty = game.selectedDifficulty || DIFFICULTY.EASY;
        const enemyCount = ENEMIES_BY_DIFFICULTY[difficulty];
        
        // console.log(`Generating ${enemyCount} enemies for difficulty: ${difficulty}`);
        
        // Generate the specified number of random enemies
        for (let i = 0; i < enemyCount; i++) {
            // Random position within battlefield
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * (BATTLEFIELD_RADIUS - 50);
            const x = GAME_WIDTH / 2 + Math.cos(angle) * distance;
            const y = GAME_HEIGHT / 2 + Math.sin(angle) * distance;
            
            // Используем новый метод для выбора случайного типа
            const type = randomType();
            
            // Создаем врага используя класс Character
            const enemy = new Character(type, TEAMS.ENEMY, x, y);
            
            // Назначаем врагу ссылку на поле боя
            enemy.battlefield = this;
            
            this.container.addChild(enemy.container);
            this.characters.push(enemy);
            this.enemyCharacters.push(enemy);
        }
        this.enemyCharacters.forEach(enemy => {
            enemy.container.interactive = true;
            enemy.container.buttonMode = true;
            enemy.container.on('pointerdown', this.onCharacterClick.bind(this, enemy));
        });
    }
    
    // Check if battle is over
    checkBattleStatus() {
        if (game.state !== GAME_STATES.BATTLE) return;
        
        // Check if all player characters are dead
        let allPlayerDead = true;
        for (let i = 0; i < this.playerCharacters.length; i++) {
            if (this.playerCharacters[i].isAlive) {
                allPlayerDead = false;
                break;
            }
        }
        
        // Check if all enemy characters are dead
        let allEnemiesDead = true;
        for (let i = 0; i < this.enemyCharacters.length; i++) {
            if (this.enemyCharacters[i].isAlive) {
                allEnemiesDead = false;
                break;
            }
        }
        
        // Check for player defeat
        if (allPlayerDead) {
            game.gameOver(false);
            return;
        }
        
        // Check for player victory
        if (allEnemiesDead) {
            game.gameOver(true);
            return;
        }
        
        // Check if any player character died and player has reinforcements
        if (game.state === GAME_STATES.BATTLE) {
            for (let i = 0; i < this.playerCharacters.length; i++) {
                if (!this.playerCharacters[i].isAlive && !this.playerCharacters[i].reinforcementProcessed) {
                    this.playerCharacters[i].reinforcementProcessed = true;
                    
                    // Check if player has unused characters
                    if (game.ui.hasUnusedCharacters()) {
                        game.startReinforcement();
                        return;
                    }
                }
            }
        }
    }
    
    // Reset battlefield
    reset() {
        // Remove all characters
        this.characters.forEach(character => {
            this.container.removeChild(character.container);
        });
        
        this.characters = [];
        this.playerCharacters = [];
        this.enemyCharacters = [];
    }
}

// Экспортируем класс BattlefieldManager в глобальную область видимости
window.BattlefieldManager = BattlefieldManager;