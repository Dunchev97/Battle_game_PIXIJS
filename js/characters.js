// Base Character class
window.Character = class Character {
    constructor(type, team, x, y) {
        this.type = type;
        this.team = team;
        this.x = x;
        this.y = y;
        
        // Get stats from constants
        const stats = CHARACTER_STATS[type];
        this.maxHealth = stats.health;
        this.health = stats.health;
        this.attackPower = stats.attack; // Переименовываем в attackPower
        this.speed = stats.speed;
        this.attackRange = stats.attackRange;
        this.attackCooldown = stats.attackCooldown;
        this.attackCooldownReset = stats.attackCooldown; // Добавляем для сброса кулдауна
        this.color = stats.color;
        this.radius = stats.radius;
        
        // Battle properties
        this.target = null;
        this.lastAttackTime = 0;
        this.isAlive = true;
        this.isMoving = false;
        this.isAttacking = false;
        
        // Анимации
        this.currentAnimation = ANIMATION_STATES.IDLE;
        this.frameIndex = 0;
        this.animationSpeed = 0.1;
        this.animationCounter = 0;
        
        // Graphics
        this.container = new PIXI.Container();
        this.sprite = new PIXI.Container();
        this.healthBar = new PIXI.Graphics();
        this.outline = new PIXI.Graphics();
        this.attackEffects = new PIXI.Container();
        
        this.initGraphics();
    }
    
    initGraphics() {
        // Создаем основной графический элемент для персонажа
        // Добавляем красную обводку для врагов
        if (this.team === 'enemy') {
            this.outline.lineStyle(2, 0xFF0000);
            this.outline.drawCircle(0, 0, this.radius);
        }
        
        // Загружаем спрайт-лист в зависимости от типа персонажа
        let spriteSheetPath = '';
        
        if (this.type === CHARACTER_TYPES.WARRIOR) {
            spriteSheetPath = 'images/warrior_spritesheet.png';
            this.animations = WARRIOR_ANIMATIONS;
            console.log(`[СПРАЙТЫ] Загрузка спрайтшита воина: ${spriteSheetPath}`);
        } else {
            spriteSheetPath = 'images/archer_spritesheet.png';
            this.animations = ARCHER_ANIMATIONS;
            console.log(`[СПРАЙТЫ] Загрузка спрайтшита лучника: ${spriteSheetPath}`);
        }
        
        // Загружаем базовую текстуру спрайт-листа
        this.baseTexture = PIXI.BaseTexture.from(spriteSheetPath);
        
        // Проверяем, что текстура загружена корректно
        this.baseTexture.on('loaded', () => {
            console.log(`Spritesheet loaded: ${spriteSheetPath}, size: ${this.baseTexture.width}x${this.baseTexture.height}`);
        });
        
        this.baseTexture.on('error', (error) => {
            console.error(`Error loading spritesheet: ${spriteSheetPath}`, error);
        });
        
        // Получаем координаты первого кадра анимации IDLE
        const idleAnim = this.animations[ANIMATION_STATES.IDLE];
        const frame = getFrameCoordinates(idleAnim.frames, 0);
        console.log(`[СПРАЙТЫ] Начальный кадр для ${this.type}: x=${frame.x}, y=${frame.y}, w=${frame.width}, h=${frame.height}`);
        
        // Создаем текстуру для первого кадра
        const texture = new PIXI.Texture(
            this.baseTexture,
            new PIXI.Rectangle(frame.x, frame.y, frame.width, frame.height)
        );
        
        // Создаем контейнер для персонажа
        this.container = new PIXI.Container();
        this.container.position.set(this.x, this.y);
        
        // Создаем спрайт с текстурой
        this.characterSprite = new PIXI.Sprite(texture);
        this.characterSprite.anchor.set(0.5);
        this.container.addChild(this.characterSprite);
        
        // Создаем контейнер для эффектов атаки
        this.attackEffects = new PIXI.Container();
        this.container.addChild(this.attackEffects);
        
        // Устанавливаем увеличенный размер спрайта
        this.characterSprite.width = this.radius * 2.5;
        this.characterSprite.height = this.radius * 2.5;
        
        // Делаем спрайт видимым
        this.characterSprite.visible = true;
        
        // Добавляем спрайт в контейнер
        this.sprite.addChild(this.characterSprite);
        
        // Health bar background
        console.log(`[ИНИЦИАЛИЗАЦИЯ HP] Создание полосы здоровья для ${this.type} (${this.team})`);
        this.healthBar.beginFill(0x666666);
        this.healthBar.drawRect(-this.radius, -this.radius - 15, this.radius * 2, 8);
        this.healthBar.endFill();
        
        // Health bar foreground (green)
        this.healthBar.beginFill(0x00ff00);
        this.healthBar.drawRect(-this.radius, -this.radius - 15, this.radius * 2, 8);
        this.healthBar.endFill();
        
        // Задаем имя для полосы здоровья, чтобы можно было найти ее позже
        this.healthBar.name = 'healthBar';
        
        // Outline for enemy team (red)
        if (this.team === TEAMS.ENEMY) {
            console.log(`[ИНИЦИАЛИЗАЦИЯ ОБВОДКА] Создание красной обводки для врага ${this.type}`);
            this.outline.lineStyle(3, 0xff0000);
            this.outline.drawCircle(0, 0, this.radius + 3);
            // Задаем имя для обводки, чтобы можно было найти ее позже
            this.outline.name = 'outline';
        }
        
        this.container.addChild(this.outline);
        this.container.addChild(this.sprite);
        this.container.addChild(this.healthBar);
        this.container.addChild(this.attackEffects);
        
        this.container.position.set(this.x, this.y);
    }
    
    // Метод для обновления кадра анимации
    updateSpriteFrame() {
        if (!this.characterSprite || !this.animations || !this.baseTexture) {
            console.log('[СПРАЙТЫ] Отсутствуют компоненты спрайта:', { 
                hasSprite: !!this.characterSprite, 
                hasAnimations: !!this.animations, 
                hasBaseTexture: !!this.baseTexture,
                type: this.type,
                team: this.team
            });
            return;
        }
        
        try {
            // Проверяем, что текущая анимация существует
            if (!this.animations[this.currentAnimation]) {
                console.log('[АНИМАЦИЯ] Анимация не найдена:', this.currentAnimation, 'переключаемся на IDLE');
                this.currentAnimation = ANIMATION_STATES.IDLE;
            }
            
            // Получаем текущую анимацию
            const currentAnim = this.animations[this.currentAnimation];
            
            // Проверяем, что индекс кадра в пределах допустимых значений
            const maxFrames = currentAnim.frames.length;
            if (this.frameIndex >= maxFrames) {
                this.frameIndex = 0;
            }
            
            // Получаем координаты кадра
            const frame = getFrameCoordinates(currentAnim.frames, this.frameIndex);
            
            // Отладочная информация о кадре
            console.log(`[АНИМАЦИЯ] Кадр для ${this.type} (${this.team}): x=${frame.x}, y=${frame.y}, w=${frame.width}, h=${frame.height}, кадр=${this.frameIndex+1}/${maxFrames}, анимация=${this.currentAnimation}`);
            
            // Создаем новую текстуру с нужным кадром
            const newTexture = new PIXI.Texture(
                this.baseTexture,
                new PIXI.Rectangle(frame.x, frame.y, frame.width, frame.height)
            );
            
            // Обновляем текстуру спрайта
            this.characterSprite.texture = newTexture;
            
            // Делаем спрайт видимым
            this.characterSprite.visible = true;
            
            // Проверяем, что спрайт добавлен в контейнер
            if (!this.sprite.children.includes(this.characterSprite)) {
                this.sprite.addChild(this.characterSprite);
                console.log(`[АНИМАЦИЯ] Добавляем спрайт в контейнер для ${this.type} (${this.team})`);
            }
            
            // Убеждаемся, что спрайт находится в контейнере персонажа
            if (!this.container.children.includes(this.sprite)) {
                this.container.addChild(this.sprite);
            }
        } catch (error) {
            console.error('Error updating sprite frame:', error, {
                type: this.type,
                animation: this.currentAnimation,
                frameIndex: this.frameIndex,
                hasAnimations: !!this.animations,
                animationKeys: this.animations ? Object.keys(this.animations) : []
            });
        }
    }
    
    // Метод для обновления анимации
    updateAnimation(delta) {
        // Если персонаж мертв и анимация смерти завершена, не обновляем анимацию
        if (!this.isAlive && this.currentAnimation === ANIMATION_STATES.DEATH && 
            this.animations && this.animations[ANIMATION_STATES.DEATH] && 
            this.frameIndex === this.animations[ANIMATION_STATES.DEATH].frames.length - 1) {
            // Персонаж мертв и находится на последнем кадре анимации смерти
            return;
        }
        
        if (!this.animations || !this.animations[this.currentAnimation]) {
            console.log(`[АНИМАЦИЯ] Анимация не найдена: ${this.currentAnimation}, переключаемся на IDLE`);
            this.currentAnimation = ANIMATION_STATES.IDLE;
            this.frameIndex = 0;
            return;
        }
        
        // Получаем текущую анимацию
        const currentAnim = this.animations[this.currentAnimation];
        
        // Вычисляем время на один кадр
        const framesCount = currentAnim.frames.length;
        const frameDuration = currentAnim.duration / framesCount;
        
        // Увеличиваем счетчик времени
        this.animationCounter = (this.animationCounter || 0) + delta;
        
        // Если прошло достаточно времени, обновляем кадр анимации
        if (this.animationCounter >= frameDuration) {
            this.animationCounter = 0;
            this.frameIndex++;
            
            // Отладочное сообщение о смене кадра
            if (this.currentAnimation === ANIMATION_STATES.WALK) {
                console.log(`[АНИМАЦИЯ ХОДЬБЫ] ${this.type} (${this.team}): кадр ${this.frameIndex}/${framesCount-1}, координаты (${this.x.toFixed(2)}, ${this.y.toFixed(2)})`); 
            } else if (this.currentAnimation === ANIMATION_STATES.DEATH) {
                console.log(`[АНИМАЦИЯ СМЕРТИ] ${this.type} (${this.team}): кадр ${this.frameIndex}/${framesCount-1}, статус: ${this.isAlive ? 'жив' : 'мертв'}`); 
            } else {
                console.log(`[АНИМАЦИЯ] Смена кадра для ${this.type} (${this.team}): кадр ${this.frameIndex}, анимация ${this.currentAnimation}`); 
            }
            
            // Проверяем, нужно ли сбросить анимацию
            const maxFrames = currentAnim.frames.length;
            
            if (this.frameIndex >= maxFrames) {
                // Проверяем тип анимации
                if (this.currentAnimation === ANIMATION_STATES.DEATH) {
                    // Для анимации смерти останавливаемся на последнем кадре
                    this.frameIndex = maxFrames - 1;
                    
                    // Убедимся, что спрайт и контейнер видимы
                    this.characterSprite.visible = true;
                    this.container.visible = true;
                    
                    // Дополнительная проверка на случай, если полоса здоровья или обводка еще не были удалены
                    // Обычно это уже должно быть сделано в методе die()
                    if (this.healthBar) {
                        const healthBarIndex = this.container.children.indexOf(this.healthBar);
                        if (healthBarIndex !== -1) {
                            this.container.removeChildAt(healthBarIndex);
                            console.log(`[АНИМАЦИЯ СМЕРТИ] Дополнительно удалена полоса здоровья для ${this.type} (${this.team})`);
                        }
                        this.healthBar = null;
                    }
                    
                    // Проверяем, существует ли еще обводка для врагов
                    if (this.team === TEAMS.ENEMY && this.outline) {
                        const outlineIndex = this.container.children.indexOf(this.outline);
                        if (outlineIndex !== -1) {
                            this.container.removeChildAt(outlineIndex);
                            console.log(`[АНИМАЦИЯ СМЕРТИ] Дополнительно удалена обводка для врага ${this.type}`);
                        }
                        this.outline = null;
                    }
                    
                    console.log(`[АНИМАЦИЯ СМЕРТИ ЗАВЕРШЕНА] ${this.type} (${this.team}): остановка на последнем кадре ${this.frameIndex}`);
                } else {
                    // Если анимация зацикленная, начинаем сначала
                    if (currentAnim.loop) {
                        this.frameIndex = 0;
                        console.log(`[АНИМАЦИЯ] Зацикливаем анимацию ${this.currentAnimation} для ${this.type} (${this.team})`);
                    } else {
                        // Сбрасываем флаг атаки если это была анимация атаки
                        if (this.currentAnimation === ANIMATION_STATES.ATTACK) {
                            this.isAttacking = false;
                        }
                        
                        // Для других анимаций возвращаемся к IDLE
                        console.log(`[АНИМАЦИЯ] Завершена анимация ${this.currentAnimation} для ${this.type} (${this.team}), переход к IDLE`);
                        this.currentAnimation = ANIMATION_STATES.IDLE;
                        this.frameIndex = 0;
                    }
                }
            }
            
            // Обновляем кадр спрайта
            this.updateSpriteFrame();
            
            // Проверяем видимость спрайта после обновления
            this.checkSpriteVisibility();
        }
    }
    
    // Метод для обновления кадра спрайта
    updateSpriteFrame() {
        try {
            if (!this.animations || !this.animations[this.currentAnimation]) {
                console.error(`[АНИМАЦИЯ] Не найдена анимация ${this.currentAnimation} для ${this.type}`);
                return;
            }
            
            // Получаем текущую анимацию и кадр
            const currentAnim = this.animations[this.currentAnimation];
            const frameIndex = Math.min(this.frameIndex, currentAnim.frames.length - 1);
            const frame = getFrameCoordinates(currentAnim.frames, frameIndex);
            
            // Создаем новую текстуру для кадра
            const texture = new PIXI.Texture(
                this.baseTexture,
                new PIXI.Rectangle(frame.x, frame.y, frame.width, frame.height)
            );
            
            // Обновляем текстуру спрайта
            this.characterSprite.texture = texture;
            
            console.log(`[АНИМАЦИЯ] Обновлена текстура для ${this.type} (${this.team}): кадр ${frameIndex}, анимация ${this.currentAnimation}`);
            console.log(`  - Координаты кадра: x=${frame.x}, y=${frame.y}, w=${frame.width}, h=${frame.height}`);
        } catch (error) {
            console.error('Error updating sprite frame:', error, {
                type: this.type,
                animation: this.currentAnimation,
                frameIndex: this.frameIndex,
                hasAnimations: !!this.animations,
                animationKeys: this.animations ? Object.keys(this.animations) : []
            });
        }
    }
    
    // Метод для проверки видимости спрайта
    checkSpriteVisibility() {
        if (!this.characterSprite) return;
        
        // Проверяем видимость спрайта
        console.log(`[СПРАЙТЫ] Проверка видимости спрайта для ${this.type} (${this.team}):`);
        console.log(`  - Видимость: ${this.characterSprite.visible}`);
        console.log(`  - Альфа: ${this.characterSprite.alpha}`);
        console.log(`  - Масштаб: ${this.characterSprite.scale.x}x${this.characterSprite.scale.y}`);
        console.log(`  - Позиция контейнера: x=${this.container.position.x}, y=${this.container.position.y}`);
        
        // Убеждаемся, что спрайт видимый
        this.characterSprite.visible = true;
        this.characterSprite.alpha = 1;
        
        // Проверяем, что спрайт находится в контейнере
        if (!this.sprite.children.includes(this.characterSprite)) {
            this.sprite.addChild(this.characterSprite);
            console.log(`[СПРАЙТЫ] Добавляем спрайт в контейнер для ${this.type} (${this.team})`);
        }
        
        // Проверяем, что контейнер спрайта находится в основном контейнере
        if (!this.container.children.includes(this.sprite)) {
            this.container.addChild(this.sprite);
            console.log(`[СПРАЙТЫ] Добавляем контейнер спрайта в основной контейнер для ${this.type} (${this.team})`);
        }
    }
    
    // Метод для обновления персонажа
    update(delta, characters) {
        // Если персонаж мертв, но все еще проигрывает анимацию смерти
        if (!this.isAlive) {
            if (this.currentAnimation === ANIMATION_STATES.DEATH) {
                // Продолжаем обновлять анимацию смерти
                this.updateAnimation(delta);
                console.log(`[ОБНОВЛЕНИЕ СМЕРТИ] ${this.type} (${this.team}) обновляет анимацию смерти, кадр ${this.frameIndex}`);
            } else {
                console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) не обновляется, так как мертв`);
            }
            return;
        }
        
        console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) обновляется, delta: ${delta}`);
        
        // Если переданы персонажи, используем их вместо поиска через battlefield
        if (characters && characters.length > 0) {
            this.characters = characters;
            console.log(`[ОБНОВЛЕНИЕ] Установлены персонажи, количество: ${characters.length}`);
        }
        
        // Обновляем позицию контейнера персонажа
        this.container.position.set(this.x, this.y);
        
        // Если мы в процессе атаки или получения урона, только обновляем анимацию и не делаем ничего больше
        if (this.isAttacking || this.currentAnimation === ANIMATION_STATES.HURT) {
            console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) в процессе атаки или получения урона, только обновляем анимацию`);
            this.updateAnimation(delta);
            return;
        }
        
        // Если у нас нет цели или цель мертва, ищем новую цель
        if (!this.target || !this.target.isAlive) {
            console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) ищет новую цель`);
            this.findTarget();
        }
        
        // Если у нас есть цель
        if (this.target && this.target.isAlive) {
            const distance = this.distanceTo(this.target);
            console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) расстояние до цели ${this.target.type} (${this.target.team}): ${distance}, дальность атаки: ${this.attackRange}`);
            
            // Если мы в зоне атаки, атакуем
            if (distance <= this.attackRange) {
                // Проверяем, прошло ли достаточно времени с последней атаки
                if (this.attackCooldown <= 0) {
                    console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) готов атаковать, кулдаун: ${this.attackCooldown}`);
                    // Вызываем метод атаки
                    this.performAttack();
                    
                    this.attackCooldown = this.attackCooldownReset;
                } else {
                    this.attackCooldown -= delta;
                    console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) ожидает перезарядки атаки, кулдаун: ${this.attackCooldown}`);
                    
                    // Если мы не в режиме ожидания и не в режиме ходьбы, устанавливаем ожидание
                    if (this.currentAnimation !== ANIMATION_STATES.IDLE && 
                        this.currentAnimation !== ANIMATION_STATES.WALK && 
                        this.currentAnimation !== ANIMATION_STATES.ATTACK && 
                        this.currentAnimation !== ANIMATION_STATES.DEATH) {
                        console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) устанавливает анимацию ожидания во время кулдауна`);
                        this.currentAnimation = ANIMATION_STATES.IDLE;
                        this.frameIndex = 0;
                        this.updateSpriteFrame();
                    }
                }
            } else {
                // Если мы не в зоне атаки, двигаемся к цели
                console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) вне зоны атаки, двигается к цели`);
                this.moveTowardsTarget(delta);
            }
        } else {
            // Если у нас нет цели, устанавливаем анимацию ожидания
            console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) нет цели, устанавливаем анимацию ожидания`);
            if (this.currentAnimation !== ANIMATION_STATES.IDLE && 
                this.currentAnimation !== ANIMATION_STATES.DEATH) {
                this.currentAnimation = ANIMATION_STATES.IDLE;
                this.frameIndex = 0;
                this.updateSpriteFrame();
            }
        }
        
        // Обновляем анимацию только один раз в конце метода
        this.updateAnimation(delta);
        
        // Проверяем видимость спрайта
        this.checkSpriteVisibility();
    }
    
    // Метод для поиска цели
    findTarget() {
        console.log(`[ЦЕЛЬ] Поиск цели для ${this.type} (${this.team})`);
        
        let charactersToSearch = null;
        
        // Используем либо персонажей с поля боя, либо сохраненных персонажей
        if (this.battlefield && this.battlefield.characters && this.battlefield.characters.length > 0) {
            console.log(`[ЦЕЛЬ] Используем персонажей с поля боя, количество: ${this.battlefield.characters.length}`);
            charactersToSearch = this.battlefield.characters;
        } else if (this.characters && this.characters.length > 0) {
            console.log(`[ЦЕЛЬ] Используем сохраненных персонажей, количество: ${this.characters.length}`);
            charactersToSearch = this.characters;
        } else {
            console.log(`[ЦЕЛЬ] Не удалось найти персонажей для поиска цели для ${this.type} (${this.team})`);
            return; // Выходим из метода, если нет персонажей для поиска
        }
        
        // Проверяем наличие врагов в списке персонажей
        let hasEnemies = false;
        for (let i = 0; i < charactersToSearch.length; i++) {
            const character = charactersToSearch[i];
            if (character && character.team && character.team.toLowerCase() !== this.team.toLowerCase() && character.isAlive) {
                hasEnemies = true;
                break;
            }
        }
        
        if (!hasEnemies) {
            console.log(`[ЦЕЛЬ] Нет живых врагов для ${this.type} (${this.team})`);
            return;
        }
        
        // Ищем ближайшую цель только если есть персонажи для поиска
        this.target = this.findClosestTarget(charactersToSearch);
        if (!this.target) {
            console.log(`[ЦЕЛЬ] ${this.type} (${this.team}) не смог найти цель среди ${charactersToSearch.length} персонажей`);
        } else {
            console.log(`[ЦЕЛЬ] ${this.type} (${this.team}) нашел цель: ${this.target.type} (${this.target.team})`);
        }
    }
    
    // Метод для поиска ближайшей цели
    findClosestTarget(characters) {
        console.log(`[ЦЕЛЬ] Поиск ближайшей цели для ${this.type} (${this.team}), доступно персонажей: ${characters.length}`);
        
        let closestTarget = null;
        let closestDistance = Infinity;
        let enemiesFound = 0;
        
        // Проверяем, что массив персонажей существует
        if (!characters || characters.length === 0) {
            console.log(`[ЦЕЛЬ] Нет персонажей для поиска цели`);
            return null;
        }
        
        // Дебаг информация о командах
        console.log(`[ЦЕЛЬ] Моя команда: ${this.team}`);
        const teamCounts = { player: 0, enemy: 0 };
        characters.forEach(c => {
            if (c && c.team) {
                teamCounts[c.team.toLowerCase()]++;
            }
        });
        console.log(`[ЦЕЛЬ] Количество персонажей по командам: player=${teamCounts.player}, enemy=${teamCounts.enemy}`);
        
        // Проверяем всех персонажей в массиве
        console.log(`[ЦЕЛЬ] Проверка всех персонажей:`);
        for (let i = 0; i < characters.length; i++) {
            const character = characters[i];
            if (character) {
                console.log(`[ЦЕЛЬ] Персонаж ${i}: ${character.type || 'нет типа'} (${character.team || 'нет команды'}), жив: ${character.isAlive ? 'да' : 'нет'}`);
            } else {
                console.log(`[ЦЕЛЬ] Персонаж ${i}: null`);
            }
        }
        
        // Проверяем свои свойства
        console.log(`[ЦЕЛЬ] Мои свойства: тип=${this.type}, команда=${this.team}, жив=${this.isAlive}`);
        
        for (let i = 0; i < characters.length; i++) {
            const character = characters[i];
            
            // Проверяем, что персонаж существует и имеет команду
            if (!character || !character.team) {
                console.log(`[ЦЕЛЬ] Пропускаем недействительного персонажа ${i}`);
                continue;
            }
            
            // Проверяем команду персонажа
            console.log(`[ЦЕЛЬ] Проверка команды: моя=${this.team}, персонажа=${character.team}, совпадает=${character.team.toLowerCase() === this.team.toLowerCase()}`);
            
            // Пропускаем персонажей из нашей команды и мертвых персонажей
            if (character.team.toLowerCase() === this.team.toLowerCase()) {
                console.log(`[ЦЕЛЬ] Пропускаем персонажа из нашей команды: ${character.type} (${character.team})`);
                continue;
            }
            
            if (!character.isAlive) {
                console.log(`[ЦЕЛЬ] Пропускаем мертвого персонажа: ${character.type} (${character.team})`);
                continue;
            }
            
            // Пропускаем самих себя
            if (character === this) {
                console.log(`[ЦЕЛЬ] Пропускаем самого себя`);
                continue;
            }
            
            // Нашли врага!
            console.log(`[ЦЕЛЬ] Найден враг: ${character.type} (${character.team})`);
            enemiesFound++;
            const distance = this.distanceTo(character);
            console.log(`[ЦЕЛЬ] Расстояние до ${character.type} (${character.team}): ${distance}`);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestTarget = character;
                console.log(`[ЦЕЛЬ] Новая ближайшая цель: ${character.type} (${character.team}), расстояние: ${distance}`);
            }
        }
        
        console.log(`[ЦЕЛЬ] Найдено врагов: ${enemiesFound}`);
        
        if (closestTarget) {
            console.log(`[ЦЕЛЬ] ${this.type} (${this.team}) нашел цель: ${closestTarget.type} (${closestTarget.team}), расстояние: ${closestDistance}`);
        } else {
            console.log(`[ЦЕЛЬ] ${this.type} (${this.team}) не нашел цели`);
        }
        
        return closestTarget;
    }
    
    // Метод для вычисления расстояния до другого персонажа
    distanceTo(character) {
        if (!character) return Infinity;
        
        const dx = character.x - this.x;
        const dy = character.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Метод для движения к цели
    moveTowardsTarget(delta) {
        if (!this.target || !this.target.isAlive) {
            console.log(`[ДВИЖЕНИЕ] ${this.type} (${this.team}) не может двигаться: цель отсутствует или мертва`);
            // Если у нас нет цели, пытаемся найти новую
            this.findTarget();
            return;
        }
        
        const distance = this.distanceTo(this.target);
        console.log(`[ДВИЖЕНИЕ] ${this.type} (${this.team}) расстояние до цели ${this.target.type} (${this.target.team}): ${distance}, дальность атаки: ${this.attackRange}`);
        
        // Если мы лучник и слишком близко к цели, отходим
        if (this.type === CHARACTER_TYPES.ARCHER && 
            distance < CHARACTER_STATS[CHARACTER_TYPES.ARCHER].safeDistance) {
            console.log(`[ДВИЖЕНИЕ] ${this.type} (${this.team}) отходит от цели, так как слишком близко`);
            this.moveAwayFromTarget(delta);
            return;
        }
        
        // Если мы вне зоны атаки, двигаемся к цели
        if (distance > this.attackRange) {
            console.log(`[ДВИЖЕНИЕ] ${this.type} (${this.team}) двигается к цели ${this.target.type} (${this.target.team})`);
            
            // Вычисляем направление движения
            let moveAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            
            // Вычисляем скорость движения
            const moveSpeed = this.speed * delta;
            console.log(`[ДВИЖЕНИЕ] ${this.type} (${this.team}) скорость движения: ${moveSpeed}, угол: ${moveAngle}`);
            
            // Сохраняем текущие координаты
            const oldX = this.x;
            const oldY = this.y;
            
            // Двигаемся в направлении цели
            this.x += Math.cos(moveAngle) * moveSpeed;
            this.y += Math.sin(moveAngle) * moveSpeed;
            
            console.log(`[ДВИЖЕНИЕ] ${this.type} (${this.team}) перемещение с (${oldX.toFixed(2)}, ${oldY.toFixed(2)}) на (${this.x.toFixed(2)}, ${this.y.toFixed(2)})`);
            
            // Ограничиваем движение полем боя
            this.stayWithinBattlefield();
            
            // Устанавливаем анимацию движения, если она еще не установлена
            console.log(`[ДВИЖЕНИЕ ПРОВЕРКА] ${this.type} (${this.team}) текущая анимация: ${this.currentAnimation}`);
            if (this.currentAnimation !== ANIMATION_STATES.WALK) {
                console.log(`[ДВИЖЕНИЕ УСТАНОВКА] ${this.type} (${this.team}) устанавливает анимацию ходьбы`);
                this.currentAnimation = ANIMATION_STATES.WALK;
                this.frameIndex = 0;
                this.updateSpriteFrame(); // Немедленно обновляем кадр
            }
        } else {
            console.log(`[ДВИЖЕНИЕ] ${this.type} (${this.team}) в зоне атаки, не двигается`);
            
            // Если мы в зоне атаки и не в режиме ходьбы, устанавливаем анимацию ожидания
            if (this.currentAnimation === ANIMATION_STATES.WALK) {
                console.log(`[ДВИЖЕНИЕ] ${this.type} (${this.team}) устанавливает анимацию ожидания после движения`);
                this.currentAnimation = ANIMATION_STATES.IDLE;
                this.frameIndex = 0;
                this.updateSpriteFrame();
            }
        }
    }
    
    // Метод для отхода от цели (для лучников)
    moveAwayFromTarget(delta) {
        if (!this.target) return;
        
        // Вычисляем направление от цели
        let moveAngle = Math.atan2(this.y - this.target.y, this.x - this.target.x);
        
        // Вычисляем скорость движения
        const moveSpeed = this.speed * delta;
        
        // Двигаемся в направлении от цели
        this.x += Math.cos(moveAngle) * moveSpeed;
        this.y += Math.sin(moveAngle) * moveSpeed;
        
        // Ограничиваем движение полем боя
        this.stayWithinBattlefield();
        
        // Устанавливаем анимацию движения
        if (this.currentAnimation !== ANIMATION_STATES.WALK) {
            this.currentAnimation = ANIMATION_STATES.WALK;
            this.frameIndex = 0;
            this.updateSpriteFrame(); // Немедленно обновляем кадр
        }
    }

    
    // Метод для получения урона
    takeDamage(damage, attacker) {
        if (!this.isAlive) {
            console.log(`[УРОН] ${this.type} (${this.team}) не может получить урон, так как уже мертв`);
            return;
        }
        
        console.log(`[УРОН] ${this.type} (${this.team}) получает урон ${damage} от ${attacker.type} (${attacker.team}), текущее здоровье: ${this.health}`);
        
        // Уменьшаем здоровье
        this.health -= damage;
        
        // Проверяем, жив ли персонаж
        if (this.health <= 0) {
            this.health = 0; // Устанавливаем здоровье в 0
            console.log(`[УРОН] ${this.type} (${this.team}) умирает от полученного урона`);
            
            // Сначала показываем анимацию получения урона, затем смерти
            this.currentAnimation = ANIMATION_STATES.HURT;
            this.frameIndex = 0;
            this.updateSpriteFrame(); // Немедленно обновляем кадр
            
            const hurtFrames = this.animations[ANIMATION_STATES.HURT].frames.length;
            const frameDuration = 100; // мс на кадр
            const animationDuration = hurtFrames * frameDuration;
            
            // Запускаем анимацию смерти после завершения анимации получения урона
            setTimeout(() => {
                this.die();
            }, animationDuration);
        } else {
            // Если персонаж выжил, показываем анимацию получения урона
            this.currentAnimation = ANIMATION_STATES.HURT;
            this.frameIndex = 0;
            this.updateSpriteFrame(); // Немедленно обновляем кадр
            
            // Обновляем полосу здоровья
            this.updateHealthBar();
            
            console.log(`[УРОН] ${this.type} (${this.team}) получил урон ${damage} от ${attacker.type} (${attacker.team}), осталось здоровья: ${this.health}`);
            
            // Возвращаемся к обычной анимации после анимации получения урона
            const hurtFrames = this.animations[ANIMATION_STATES.HURT].frames.length;
            const frameDuration = 100; // мс на кадр
            const animationDuration = hurtFrames * frameDuration;
            
            setTimeout(() => {
                if (this.isAlive && this.currentAnimation === ANIMATION_STATES.HURT) {
                    // Если персонаж двигается, устанавливаем анимацию ходьбы
                    if (this.isMoving) {
                        this.currentAnimation = ANIMATION_STATES.WALK;
                    } else {
                        this.currentAnimation = ANIMATION_STATES.IDLE;
                    }
                    this.frameIndex = 0;
                }
            }, animationDuration);
        }
    }
    
    // Метод для смерти персонажа
die() {
    if (!this.isAlive) {
        console.log(`[СМЕРТЬ] ${this.type} (${this.team}) уже мертв`);
        return;
    }
    
    this.isAlive = false;
    this.health = 0;
    
    console.log(`[СМЕРТЬ] ${this.type} (${this.team}) начинает анимацию смерти`);
    
    // Сохраняем спрайт персонажа
    const characterSprite = this.characterSprite;
    
    // Создаем новый контейнер только со спрайтом
    const newContainer = new PIXI.Container();
    newContainer.position.set(this.x, this.y);
    newContainer.addChild(characterSprite);
    
    // Заменяем старый контейнер новым
    const parent = this.container.parent;
    if (parent) {
        const index = parent.children.indexOf(this.container);
        if (index !== -1) {
            parent.removeChildAt(index);
            parent.addChildAt(newContainer, index);
        }
    }
    
    // Обнуляем ссылки на старые объекты
    this.container = newContainer;
    this.healthBar = null;
    this.outline = null;
    
    // Устанавливаем анимацию смерти
    this.currentAnimation = ANIMATION_STATES.DEATH;
    this.frameIndex = 0;
    this.updateSpriteFrame();
}
    
    // Метод для обновления полосы здоровья
    updateHealthBar() {
        // Если персонаж мертв, удаляем полосу здоровья из контейнера
        if (!this.isAlive) {
            // Если HP бар еще в контейнере, удаляем его
            if (this.container && this.container.children && this.container.children.includes(this.healthBar)) {
                this.container.removeChild(this.healthBar);
                console.log(`[ЗДОРОВЬЕ] Удалена полоса здоровья для мертвого персонажа ${this.type}`);
            }
            return;
        }
        
        // Проверяем, что HP бар добавлен в контейнер
        if (this.container && !this.container.children.includes(this.healthBar)) {
            this.container.addChild(this.healthBar);
        }
        
        // Очищаем полосу здоровья
        this.healthBar.clear();
        
        // Убедимся, что полоса здоровья видима для живых персонажей
        this.healthBar.visible = true;
        
        // Рисуем фон полосы здоровья
        this.healthBar.beginFill(0x666666);
        this.healthBar.drawRect(-this.radius, -this.radius - 10, this.radius * 2, 5);
        this.healthBar.endFill();
        
        // Рисуем текущее здоровье
        const healthPercent = Math.max(0, this.health / this.maxHealth);
        this.healthBar.beginFill(0x00ff00);
        this.healthBar.drawRect(-this.radius, -this.radius - 10, this.radius * 2 * healthPercent, 5);
        this.healthBar.endFill();
    }
    
    // Метод для создания эффекта стрелы
    createArrowEffect() {
        // Вычисляем конечную точку для линии пути
        const endX = (this.target.x - this.x);
        const endY = (this.target.y - this.y);
        
        // Создаем линию пути
        const line = new PIXI.Graphics();
        line.lineStyle(1, 0xFFFFFF, 0.8);
        line.moveTo(0, 0);
        line.lineTo(endX, endY);
        
        // Добавляем линию в контейнер эффектов
        this.attackEffects.addChild(line);
        
        // Анимируем исчезновение линии
        gsap.to(line, {
            alpha: 0,
            duration: 0.3,
            onComplete: () => {
                // Удаляем линию после исчезновения
                this.attackEffects.removeChild(line);
                
                // Создаем небольшой эффект попадания
                const impact = new PIXI.Graphics();
                impact.beginFill(0xFFFFFF, 0.7);
                impact.drawCircle(endX, endY, 3);
                impact.endFill();
                this.attackEffects.addChild(impact);
                
                // Анимируем исчезновение эффекта попадания
                gsap.to(impact, {
                    alpha: 0,
                    duration: 0.1,
                    onComplete: () => {
                        this.attackEffects.removeChild(impact);
                    }
                });
            }
        });
    }
    
    // Метод для создания эффекта ближней атаки
    createMeleeEffect() {
        // Создаем графику для эффекта удара
        const slash = new PIXI.Graphics();
        slash.lineStyle(3, 0xFFFFFF);
        slash.moveTo(-15, -15);
        slash.lineTo(15, 15);
        slash.moveTo(-15, 15);
        slash.lineTo(15, -15);
        
        // Добавляем эффект в контейнер эффектов
        this.attackEffects.addChild(slash);
        
        // Вычисляем позицию эффекта (между персонажем и целью)
        const targetVector = {
            x: this.target.x - this.x,
            y: this.target.y - this.y
        };
        const distance = Math.sqrt(targetVector.x * targetVector.x + targetVector.y * targetVector.y);
        const normalizedVector = {
            x: targetVector.x / distance,
            y: targetVector.y / distance
        };
        
        // Устанавливаем позицию эффекта
        slash.x = normalizedVector.x * this.radius;
        slash.y = normalizedVector.y * this.radius;
        
        // Анимируем эффект
        gsap.to(slash, {
            alpha: 0,
            rotation: Math.PI,
            scale: { x: 1.5, y: 1.5 },
            duration: 0.3,
            onComplete: () => {
                // Удаляем эффект после завершения
                this.attackEffects.removeChild(slash);
            }
        });
    }
    
    // Метод для ограничения движения полем боя
    stayWithinBattlefield() {
        // Центр поля боя
        const centerX = GAME_WIDTH / 2;
        const centerY = GAME_HEIGHT / 2;
        
        // Расстояние от центра
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Если персонаж выходит за пределы поля боя
        if (distance > BATTLEFIELD_RADIUS - this.radius) {
            // Нормализуем вектор направления
            const normDx = dx / distance;
            const normDy = dy / distance;
            
            // Устанавливаем позицию на границе поля боя
            this.x = centerX + normDx * (BATTLEFIELD_RADIUS - this.radius);
            this.y = centerY + normDy * (BATTLEFIELD_RADIUS - this.radius);
        }
    }
    
    // Метод для отхода от цели
    moveAwayFromTarget(delta) {
        if (!this.target) return;
        
        // Вычисляем направление от цели
        const dx = this.x - this.target.x;
        const dy = this.y - this.target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Нормализуем вектор
        let normDx = 0;
        let normDy = 0;
        
        if (distance > 0) {
            normDx = dx / distance;
            normDy = dy / distance;
        }
        
        // Вычисляем скорость движения
        const moveSpeed = this.speed * delta;
        
        // Двигаемся в направлении от цели
        this.x += normDx * moveSpeed;
        this.y += normDy * moveSpeed;
        
        // Ограничиваем движение полем боя
        this.stayWithinBattlefield();
    }
    
    findNearestEnemy(characters) {
        let closest = null;
        let closestDistance = Infinity;
        
        for (let i = 0; i < characters.length; i++) {
            const character = characters[i];
            
            // Skip if same team or dead
            if (character.team.toLowerCase() === this.team.toLowerCase() || !character.isAlive) {
                continue;
            }
            
            const distance = this.distanceTo(character);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = character;
            }
        }
        
        // Если нашли врага ближе, чем текущая цель, меняем цель
        if (closestEnemy) {
            // Если у нас уже есть цель, проверяем расстояние до нее
            if (this.target && this.target.isAlive) {
                const currentTargetDistance = this.distanceTo(this.target);
                
                // Если новая цель ближе на 20% или больше, меняем цель
                // Это предотвращает слишком частое переключение целей
                if (closestDistance < currentTargetDistance * 0.8) {
                    this.target = closestEnemy;
                }
            } else {
                this.target = closestEnemy;
            }
        }
    }
    
    moveTowardsTarget(delta) {
        if (!this.target) return;
        
        const distance = this.distanceTo(this.target);
        
        // If we're an archer and too close to the target, move away
        if (this.type === CHARACTER_TYPES.ARCHER && 
            distance < CHARACTER_STATS[CHARACTER_TYPES.ARCHER].safeDistance) {
            this.moveAwayFromTarget(delta);
            return;
        }
        
        // If we're outside attack range, move towards target
        if (distance > this.attackRange) {
            // Вычисляем направление движения
            let moveAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            
            // Вычисляем скорость движения
            const moveSpeed = this.speed * delta;
            
            // Двигаемся в направлении цели
            this.x += Math.cos(moveAngle) * moveSpeed;
            this.y += Math.sin(moveAngle) * moveSpeed;
            
            // Ограничиваем движение полем боя
            this.stayWithinBattlefield();
        }
    }

    // Вычисление силы избегания для обхода других персонажей
    calculateAvoidanceForce(characters) {
        const avoidanceForce = { x: 0, y: 0 };
        const avoidanceRadius = this.radius * 3; // Радиус обнаружения других персонажей
        
        characters.forEach(character => {
            // Пропускаем себя, мертвых персонажей и врагов
            if (character === this || !character.isAlive || character.team !== this.team) {
                return;
            }
            
            const dx = this.x - character.x;
            const dy = this.y - character.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Если персонаж слишком близко, вычисляем силу отталкивания
            if (distance < avoidanceRadius) {
                // Чем ближе, тем сильнее отталкивание
                const force = (avoidanceRadius - distance) / avoidanceRadius;
                
                // Нормализуем вектор направления
                if (distance > 0) {
                    avoidanceForce.x += (dx / distance) * force;
                    avoidanceForce.y += (dy / distance) * force;
                } else {
                    // Если персонажи в одной точке, добавляем случайное направление
                    const randomAngle = Math.random() * Math.PI * 2;
                    avoidanceForce.x += Math.cos(randomAngle);
                    avoidanceForce.y += Math.sin(randomAngle);
                }
            }
        });
        
        // Нормализуем результирующую силу
        const magnitude = Math.sqrt(avoidanceForce.x * avoidanceForce.x + avoidanceForce.y * avoidanceForce.y);
        if (magnitude > 0) {
            avoidanceForce.x /= magnitude;
            avoidanceForce.y /= magnitude;
        }
        
        return avoidanceForce;
    }
    
    moveAwayFromTarget(delta) {
        // Если нет цели, ничего не делаем
        if (!this.target) return;
        
        // Вычисляем вектор направления от цели к персонажу
        const dx = this.x - this.target.x;
        const dy = this.y - this.target.y;
        
        // Нормализуем вектор
        const length = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / length;
        const ny = dy / length;
        
        // Вычисляем скорость движения
        const moveSpeed = this.speed * delta;
        
        // Двигаемся в направлении от цели
        this.x += nx * moveSpeed;
        this.y += ny * moveSpeed;
        
        // Ограничиваем движение полем боя
        this.stayWithinBattlefield();
    }
    
    tryAttack() {
        const now = Date.now() / 1000; // Current time in seconds
        const distance = this.distanceTo(this.target);
        
        // Check if we can attack
        if (distance <= this.attackRange && 
            now - this.lastAttackTime >= this.attackCooldown) {
            
            // For archers, they need to be stationary and at safe distance
            if (this.type === CHARACTER_TYPES.ARCHER) {
                const safeDistance = CHARACTER_STATS[CHARACTER_TYPES.ARCHER].safeDistance;
                if (distance < safeDistance) {
                    return; // Too close to attack
                }
                
                // Additional check for archers - no enemies nearby
                const characters = game.battlefield.characters;
                for (let i = 0; i < characters.length; i++) {
                    const enemy = characters[i];
                    if (enemy.team !== this.team && enemy.isAlive) {
                        const enemyDistance = this.distanceTo(enemy);
                        if (enemyDistance < safeDistance) {
                            return; // Enemy nearby, don't attack
                        }
                    }
                }
            }
            
            // Call attack method
            this.performAttack(this.target);
            this.lastAttackTime = now;
            this.isAttacking = true;
            
            // Set attack animation only if it's not already set
            if (this.currentAnimation !== ANIMATION_STATES.ATTACK) {
                console.log(`${this.type} starting attack animation`);
                this.currentAnimation = ANIMATION_STATES.ATTACK;
                this.frameIndex = 0;
            }
            return true; // Attack successful
        }
        return false; // Attack not performed
    }
    
    // Метод для выполнения атаки и нанесения урона
    performAttack() {
        if (!this.target || !this.target.isAlive) {
            console.log(`[АТАКА] ${this.type} (${this.team}) не может атаковать: цель отсутствует или мертва`);
            return;
        }
        
        // Устанавливаем флаг атаки
        this.isAttacking = true;
        
        // Устанавливаем анимацию атаки
        this.currentAnimation = ANIMATION_STATES.ATTACK;
        this.frameIndex = 0;
        this.updateSpriteFrame(); // Немедленно обновляем кадр
        
        console.log(`[АТАКА] ${this.type} (${this.team}) начинает анимацию атаки на ${this.target.type} (${this.target.team})`);
        
        // Получаем длительность анимации атаки
        const animDuration = this.animations[ANIMATION_STATES.ATTACK].duration;
        
        // Создаем таймер, который выполнит атаку после завершения анимации
        // Используем 80% длительности анимации, чтобы урон наносился в момент удара
        setTimeout(() => {
            // Наносим урон цели
            if (this.target && this.target.isAlive) {
                console.log(`[АТАКА] ${this.type} (${this.team}) наносит урон ${this.target.type} (${this.target.team}), урон: ${this.attackPower}`);
                this.target.takeDamage(this.attackPower, this);
                
                // Создаем эффект атаки в зависимости от типа персонажа
                if (this.type === CHARACTER_TYPES.ARCHER) {
                    this.createArrowEffect();
                } else {
                    this.createMeleeEffect();
                }
            } else {
                console.log(`[АТАКА] ${this.type} (${this.team}) не может нанести урон: цель пропала или умерла`);
            }
        }, animDuration * 0.6 * 1000); // Наносим урон на 60% времени анимации
        
        // Сбрасываем флаг атаки после завершения анимации
        setTimeout(() => {
            this.isAttacking = false;
            console.log(`[АТАКА] ${this.type} (${this.team}) завершил анимацию атаки`);
        }, animDuration * 1000);
    }
    
    // Метод для создания эффекта удара в ближнем бою
    createMeleeEffect() {
        if (!this.target) return;
        
        // Создаем эффект удара (прямая линия)
        const attackEffect = new PIXI.Graphics();
        attackEffect.lineStyle(4, 0xFFFFFF);
        
        // Вычисляем направление к цели
        const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        
        // Рисуем линию удара
        attackEffect.moveTo(0, 0);
        
        // Длина удара - расстояние до цели
        const distance = this.distanceTo(this.target);
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        attackEffect.lineTo(endX, endY);
        
        // Добавляем эффект в контейнер
        this.attackEffects.addChild(attackEffect);
        
        // Создаем эффект вспышки в месте удара
        const impact = new PIXI.Graphics();
        impact.beginFill(0xFFFFFF, 0.7);
        impact.drawCircle(endX, endY, 10);
        impact.endFill();
        this.attackEffects.addChild(impact);
        
        // Анимируем исчезновение эффекта
        gsap.to(attackEffect, {
            alpha: 0,
            duration: 0.2,
            onComplete: () => {
                this.attackEffects.removeChild(attackEffect);
            }
        });
        
        // Анимируем вспышку
        gsap.to(impact, {
            alpha: 0,
            scale: 1.5,
            duration: 0.3,
            onComplete: () => {
                this.attackEffects.removeChild(impact);
            }
        });
    }
    
    // Старый метод для совместимости
    createWarriorAttackEffect(target) {
        this.createMeleeEffect();
    }
    
    // Create visual effect for archer attack
    createArcherAttackEffect(target) {
        // Create arrow effect
        const arrow = new PIXI.Graphics();
        arrow.lineStyle(2, 0x996633);
        
        // Initial arrow position (relative to archer)
        const startX = this.x;
        const startY = this.y;
        
        // Final arrow position (relative to target)
        const endX = target.x;
        const endY = target.y;
        
        // Calculate direction
        const dx = endX - startX;
        const dy = endY - startY;
        const angle = Math.atan2(dy, dx);
        
        // Draw arrow
        arrow.moveTo(0, 0);
        arrow.lineTo(20, 0);
        
        // Arrowhead
        arrow.beginFill(0x996633);
        arrow.drawPolygon([20, -3, 25, 0, 20, 3]);
        arrow.endFill();
        
        // Rotate arrow in direction of target
        arrow.rotation = angle;
        
        // Set initial position
        arrow.position.set(startX, startY);
        
        // Add arrow to scene
        game.app.stage.addChild(arrow);
        
        // Animate arrow flight
        this.animateArrow(arrow, startX, startY, endX, endY, target);
    }
    
    animateArrow(arrow, startX, startY, endX, endY, target) {
        // Animation parameters
        const duration = 0.3; // seconds
        const fps = 60;
        const totalFrames = duration * fps;
        let currentFrame = 0;
        
        // Animation function
        const animate = () => {
            currentFrame++;
            const progress = currentFrame / totalFrames;
            
            if (progress >= 1) {
                // End of animation
                game.app.stage.removeChild(arrow);
                
                // Deal damage to target
                target.takeDamage(this.attack);
            } else {
                // Update arrow position
                const x = startX + (endX - startX) * progress;
                const y = startY + (endY - startY) * progress;
                arrow.position.set(x, y);
                
                // Continue animation
                requestAnimationFrame(animate);
            }
        };
        
        // Start animation
        animate();
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // Don't show hurt animation if already showing death animation
        if (this.currentAnimation !== ANIMATION_STATES.DEATH) {
            // Show hurt animation
            this.currentAnimation = ANIMATION_STATES.HURT;
            this.frameIndex = 0;
            
            // Get hurt animation duration
            const hurtFrames = this.animations[ANIMATION_STATES.HURT].frames.length;
            const frameDuration = 100; // ms per frame
            const animationDuration = hurtFrames * frameDuration;
            
            // Check if character is still alive
            if (this.health <= 0) {
                this.health = 0;
                
                // Start death animation after hurt animation
                setTimeout(() => {
                    this.die();
                }, animationDuration);
            } else {
                // Return to normal animation after hurt animation
                setTimeout(() => {
                    if (this.isAlive && this.currentAnimation === ANIMATION_STATES.HURT) {
                        // If character is moving, set walk animation
                        if (this.isMoving) {
                            this.currentAnimation = ANIMATION_STATES.WALK;
                        } else {
                            this.currentAnimation = ANIMATION_STATES.IDLE;
                        }
                        this.frameIndex = 0;
                    }
                }, animationDuration);
            }
        }
        
        // Update health bar
        this.updateHealthBar();
    }
    
    die() {
        console.log(`[СМЕРТЬ] ${this.type} (${this.team}) умирает`);
        
        // Set death flag
        this.isAlive = false;
        this.health = 0;
        this.updateHealthBar();
        
        // Set death animation
        console.log(`${this.type} playing death animation`);
        this.currentAnimation = ANIMATION_STATES.DEATH;
        this.frameIndex = 0;
        
        // Убедимся, что спрайт видим
        this.characterSprite.visible = true;
        this.container.visible = true;
        
        // Оставляем персонажа на поле боя, но отключаем его из игровой логики
        this.target = null;
        
        console.log(`[СМЕРТЬ] ${this.type} (${this.team}) умер, спрайт видим: ${this.characterSprite.visible}, контейнер видим: ${this.container.visible}`);
    }
    
    updateHealthBar() {
        // Update health bar width based on current health percentage
        const healthPercentage = this.health / this.maxHealth;
        
        this.healthBar.clear();
        
        // Health bar background
        this.healthBar.beginFill(0x666666);
        this.healthBar.drawRect(-this.radius, -this.radius - 10, this.radius * 2, 5);
        this.healthBar.endFill();
        
        // Health bar foreground (green)
        this.healthBar.beginFill(0x00ff00);
        this.healthBar.drawRect(-this.radius, -this.radius - 10, this.radius * 2 * healthPercentage, 5);
        this.healthBar.endFill();
    }
    
    distanceTo(character) {
        const dx = character.x - this.x;
        const dy = character.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// Warrior class
class Warrior extends Character {
    constructor(team, x, y) {
        super(CHARACTER_TYPES.WARRIOR, team, x, y);
    }
}

// Archer class
class Archer extends Character {
    constructor(team, x, y) {
        super(CHARACTER_TYPES.ARCHER, team, x, y);
    }
}

// Экспортируем классы в глобальную область видимости
window.Character = Character;
window.Warrior = Warrior;
window.Archer = Archer;