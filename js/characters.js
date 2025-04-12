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
        this.facingDirection = 1; // 1 — вправо, -1 — влево
        
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
        if (this.team === 'enemy') {
            const outlineThickness = 2;
            const outlineColor = 0xFF0000;
        
            // Получаем размеры спрайта
            const width = this.radius * 0.6;
            const height = this.radius * 0.6;
        
            this.outline.lineStyle(outlineThickness, outlineColor);
            this.outline.drawRect(-width / 2, -height / 2, width, height);
        }
        
        // Загружаем спрайт-лист в зависимости от типа персонажа
        let spriteSheetPath = '';
        
        // Используем новые спрайты вместо старых
        if (this.type === CHARACTER_TYPES.WARRIOR) {
            spriteSheetPath = 'images/Knight_1_Spritesheet1.png';
            this.animations = NEW_WARRIOR_ANIMATIONS;
        } else if (this.type === CHARACTER_TYPES.ARCHER) {
            spriteSheetPath = 'images/Samurai_Archer_SpriteSheet.png';
            this.animations = NEW_ARCHER_ANIMATIONS;
        } else if (this.type === CHARACTER_TYPES.ASSASSIN) {
            spriteSheetPath = 'images/Assassin_SpriteSheet.png';
            this.animations = NEW_ASSASSIN_ANIMATIONS;
        } else if (this.type === CHARACTER_TYPES.FIREMAGE) {
            spriteSheetPath = 'images/fire_mage_spritesheet.png';
            this.animations = NEW_FIREMAGE_ANIMATIONS;
        }
        
        
        // Загружаем базовую текстуру спрайт-листа
        this.baseTexture = PIXI.BaseTexture.from(spriteSheetPath);
        
        // Проверяем, что текстура загружена корректно
        this.baseTexture.on('loaded', () => {
            // console.log(`Spritesheet loaded: ${spriteSheetPath}, size: ${this.baseTexture.width}x${this.baseTexture.height}`);
        });
        
        this.baseTexture.on('error', (error) => {
            console.error(`Error loading spritesheet: ${spriteSheetPath}`, error);
        });
        
        // Получаем координаты первого кадра анимации IDLE (используем новую функцию)
        const idleAnim = this.animations[ANIMATION_STATES.IDLE];
        const frame = getNewFrameCoordinates(idleAnim.frames, 0);
        // console.log(`[СПРАЙТЫ] Начальный кадр для ${this.type}: x=${frame.x}, y=${frame.y}, w=${frame.width}, h=${frame.height}`);
        
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
        // console.log(`[ИНИЦИАЛИЗАЦИЯ HP] Создание полосы здоровья для ${this.type} (${this.team})`);
        this.healthBar.beginFill(0x666666);
        this.healthBar.drawRect(-this.radius, -this.radius - 15, this.radius * 2, 8);
        this.healthBar.endFill();
        
        // Health bar foreground (green)
        this.healthBar.beginFill(0x00ff00);
        this.healthBar.drawRect(-this.radius, -this.radius - 15, this.radius * 2, 8);
        this.healthBar.endFill();
        
        // Задаем имя для полосы здоровья, чтобы можно было найти ее позже
        this.healthBar.name = 'healthBar';
        
        this.container.addChild(this.outline);
        this.container.addChild(this.sprite);
        this.container.addChild(this.healthBar);
        this.container.addChild(this.attackEffects);
        
        this.container.position.set(this.x, this.y);
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
            // console.log(`[АНИМАЦИЯ] Анимация не найдена: ${this.currentAnimation}, переключаемся на IDLE`);
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
                // console.log(`[АНИМАЦИЯ ХОДЬБЫ] ${this.type} (${this.team}): кадр ${this.frameIndex}/${framesCount-1}, координаты (${this.x.toFixed(2)}, ${this.y.toFixed(2)})`); 
            } else if (this.currentAnimation === ANIMATION_STATES.DEATH) {
                // console.log(`[АНИМАЦИЯ СМЕРТИ] ${this.type} (${this.team}): кадр ${this.frameIndex}/${framesCount-1}, статус: ${this.isAlive ? 'жив' : 'мертв'}`); 
            } else {
                // console.log(`[АНИМАЦИЯ] Смена кадра для ${this.type} (${this.team}): кадр ${this.frameIndex}, анимация ${this.currentAnimation}`); 
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
                            // console.log(`[АНИМАЦИЯ СМЕРТИ] Дополнительно удалена полоса здоровья для ${this.type} (${this.team})`);
                        }
                        this.healthBar = null;
                    }
                    
                    // Проверяем, существует ли еще обводка для врагов
                    if (this.team === TEAMS.ENEMY && this.outline) {
                        const outlineIndex = this.container.children.indexOf(this.outline);
                        if (outlineIndex !== -1) {
                            this.container.removeChildAt(outlineIndex);
                            // console.log(`[АНИМАЦИЯ СМЕРТИ] Дополнительно удалена обводка для врага ${this.type}`);
                        }
                        this.outline = null;
                    }
                    
                    // console.log(`[АНИМАЦИЯ СМЕРТИ ЗАВЕРШЕНА] ${this.type} (${this.team}): остановка на последнем кадре ${this.frameIndex}`);
                } else {
                    // Если анимация зацикленная, начинаем сначала
                    if (currentAnim.loop) {
                        this.frameIndex = 0;
                        // console.log(`[АНИМАЦИЯ] Зацикливаем анимацию ${this.currentAnimation} для ${this.type} (${this.team})`);
                    } else {
                        // Сбрасываем флаг атаки если это была анимация атаки
                        if (this.currentAnimation === ANIMATION_STATES.ATTACK) {
                            this.isAttacking = false;
                        }
                        
                        // Для других анимаций возвращаемся к IDLE
                        // console.log(`[АНИМАЦИЯ] Завершена анимация ${this.currentAnimation} для ${this.type} (${this.team}), переход к IDLE`);
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
        
        // Используем функцию getNewFrameCoordinates вместо getFrameCoordinates
        const frame = getNewFrameCoordinates(currentAnim.frames, frameIndex);
        
        // Создаем новую текстуру для кадра
        const texture = new PIXI.Texture(
            this.baseTexture,
            new PIXI.Rectangle(frame.x, frame.y, frame.width, frame.height)
        );
        
        // Обновляем текстуру спрайта
        this.characterSprite.texture = texture;
        
        // console.log(`[АНИМАЦИЯ] Обновлена текстура для ${this.type} (${this.team}): кадр ${frameIndex}, анимация ${this.currentAnimation}`);
        // console.log(`  - Координаты кадра: x=${frame.x}, y=${frame.y}, w=${frame.width}, h=${frame.height}`);
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
    // console.log(`[СПРАЙТЫ] Проверка видимости спрайта для ${this.type} (${this.team}):`);
    // console.log(`  - Видимость: ${this.characterSprite.visible}`);
    // console.log(`  - Альфа: ${this.characterSprite.alpha}`);
    // console.log(`  - Масштаб: ${this.characterSprite.scale.x}x${this.characterSprite.scale.y}`);
    // console.log(`  - Позиция контейнера: x=${this.container.position.x}, y=${this.container.position.y}`);
    
    // Убеждаемся, что спрайт видимый
    this.characterSprite.visible = true;
    this.characterSprite.alpha = 1;
    
    // Проверяем существование this.sprite перед доступом к его свойствам
    if (this.sprite) {
        // Проверяем, что спрайт находится в контейнере
        if (!this.sprite.children.includes(this.characterSprite)) {
            this.sprite.addChild(this.characterSprite);
            // console.log(`[СПРАЙТЫ] Добавляем спрайт в контейнер для ${this.type} (${this.team})`);
        }
        
        // Проверяем, что контейнер спрайта находится в основном контейнере
        if (this.container && !this.container.children.includes(this.sprite)) {
            this.container.addChild(this.sprite);
            // console.log(`[СПРАЙТЫ] Добавляем контейнер спрайта в основной контейнер для ${this.type} (${this.team})`);
        }
    }
}
    
    // Метод для обновления персонажа
    update(delta, characters) {
        // Если персонаж мертв, но все еще проигрывает анимацию смерти
        if (!this.isAlive) {
            if (this.currentAnimation === ANIMATION_STATES.DEATH) {
                // Продолжаем обновлять анимацию смерти
                this.updateAnimation(delta);
                // console.log(`[ОБНОВЛЕНИЕ СМЕРТИ] ${this.type} (${this.team}) обновляет анимацию смерти, кадр ${this.frameIndex}`);
            } else {
                // console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) не обновляется, так как мертв`);
            }
            return;
        }
        
        // console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) обновляется, delta: ${delta}`);
        
        // Если переданы персонажи, используем их вместо поиска через battlefield
        if (characters && characters.length > 0) {
            this.characters = characters;
            // console.log(`[ОБНОВЛЕНИЕ] Установлены персонажи, количество: ${characters.length}`);
        }
        
        // Обновляем позицию контейнера персонажа
        this.container.position.set(this.x, this.y);
        
        // Если мы в процессе атаки или получения урона, только обновляем анимацию и не делаем ничего больше
        if (this.isAttacking || this.currentAnimation === ANIMATION_STATES.HURT) {
            // console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) в процессе атаки или получения урона, только обновляем анимацию`);
            this.updateAnimation(delta);
            return;
        }
        // Для лучника: дополнительная проверка на близость врагов
    if (this.type === CHARACTER_TYPES.ARCHER && this.isAlive) {
        const safeDistance = CHARACTER_STATS[CHARACTER_TYPES.ARCHER].safeDistance;
        let tooCloseEnemy = false;
        
        for (const char of characters) {
            if (char.team !== this.team && char.isAlive) {
                const dist = this.distanceTo(char);
                if (dist < safeDistance) {
                    tooCloseEnemy = true;
                    this.target = char; // Убегаем от ближайшего врага
                    break;
                }
            }
        }
        
        if (tooCloseEnemy) {
            this.moveAwayFromTarget(delta);
            return;
        }
    }
        // Всегда проверяем ближайшего врага, чтобы цель могла смениться
this.updateTarget();

        
        // Если у нас есть цель
        if (this.target && this.target.isAlive) {
            const distance = this.distanceTo(this.target);
            // console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) расстояние до цели ${this.target.type} (${this.target.team}): ${distance}, дальность атаки: ${this.attackRange}`);
            
            // Если мы в зоне атаки, атакуем
            if (distance <= this.attackRange) {
                // Проверяем, прошло ли достаточно времени с последней атаки
                if (this.attackCooldown <= 0) {
                    // console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) готов атаковать, кулдаун: ${this.attackCooldown}`);
                    // Вызываем метод атаки
                    this.performAttack();
                    
                    this.attackCooldown = this.attackCooldownReset;
                } else {
                    this.attackCooldown -= delta;
                    // console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) ожидает перезарядки атаки, кулдаун: ${this.attackCooldown}`);
                    
                    // Если мы не в режиме ожидания и не в режиме ходьбы, устанавливаем ожидание
                    if (this.currentAnimation !== ANIMATION_STATES.IDLE && 
                        this.currentAnimation !== ANIMATION_STATES.WALK && 
                        this.currentAnimation !== ANIMATION_STATES.ATTACK && 
                        this.currentAnimation !== ANIMATION_STATES.DEATH) {
                        // console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) устанавливает анимацию ожидания во время кулдауна`);
                        this.currentAnimation = this.isMoving ? ANIMATION_STATES.WALK : ANIMATION_STATES.IDLE;
                        this.frameIndex = 0;
                        this.updateSpriteFrame();
                    }
                }
            } else {
                // Если мы не в зоне атаки, двигаемся к цели
                // console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) вне зоны атаки, двигается к цели`);
                this.moveTowardsTarget(delta);
            }
        } else {
            // Если у нас нет цели, устанавливаем анимацию ожидания
            // console.log(`[ОБНОВЛЕНИЕ] ${this.type} (${this.team}) нет цели, устанавливаем анимацию ожидания`);
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
        // console.log(`[ЦЕЛЬ] Поиск цели для ${this.type} (${this.team})`);
        
        let charactersToSearch = null;
        
        // Используем либо персонажей с поля боя, либо сохраненных персонажей
        if (this.battlefield && this.battlefield.characters && this.battlefield.characters.length > 0) {
            // console.log(`[ЦЕЛЬ] Используем персонажей с поля боя, количество: ${this.battlefield.characters.length}`);
            charactersToSearch = this.battlefield.characters;
        } else if (this.characters && this.characters.length > 0) {
            // console.log(`[ЦЕЛЬ] Используем сохраненных персонажей, количество: ${this.characters.length}`);
            charactersToSearch = this.characters;
        } else {
            // console.log(`[ЦЕЛЬ] Не удалось найти персонажей для поиска цели для ${this.type} (${this.team})`);
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
            // console.log(`[ЦЕЛЬ] Нет живых врагов для ${this.type} (${this.team})`);
            return;
        }
        
        // Ищем ближайшую цель только если есть персонажи для поиска
        this.target = this.findClosestTarget(charactersToSearch);
        if (!this.target) {
            // console.log(`[ЦЕЛЬ] ${this.type} (${this.team}) не смог найти цель среди ${charactersToSearch.length} персонажей`);
        } else {
            // console.log(`[ЦЕЛЬ] ${this.type} (${this.team}) нашел цель: ${this.target.type} (${this.target.team})`);
        }
    }
    updateTarget() {
        const candidates = this.characters || (this.battlefield?.characters || []);
        if (!candidates || candidates.length === 0) return;
        
        // Если это ассасин, то используем специальную логику
        if (this.type === CHARACTER_TYPES.ASSASSIN) {
            // Сначала найдем ближайшую цель
            const closest = this.findClosestTarget(candidates);
            
            // Затем найдем цель с наименьшим здоровьем
            const weakest = this.findTargetWithLowestHealth(candidates);
            
            // Если нет ни одной цели
            if (!closest && !weakest) return;
            
            // Если нет текущей цели или она мертва
            if (!this.target || !this.target.isAlive) {
                // Если есть цель с наименьшим здоровьем, выбираем ее
                if (weakest) {
                    this.target = weakest;
                } else {
                    // Иначе берем ближайшую
                    this.target = closest;
                }
                return;
            }
            
            // Если текущая цель хороша, держимся за нее
            if (this.target && this.target.isAlive) {
                const currentDistance = this.distanceTo(this.target);
                
                // Если текущая цель далеко, ищем ближайшую
                if (currentDistance > this.attackRange * 5) {
                    if (closest && this.distanceTo(closest) < currentDistance * 0.7) {
                        this.target = closest;
                        return;
                    }
                }
                
                // Если есть более слабая цель и она не слишком далеко
                if (weakest && weakest !== this.target && 
                    weakest.health < this.target.health * 0.7 && 
                    this.distanceTo(weakest) < this.attackRange * 10) {
                    this.target = weakest;
                    return;
                }
            }
        } else {
            // Стандартная логика для других типов персонажей
            const closest = this.findClosestTarget(candidates);
            if (!closest) return;
            
            // Если цели нет — просто устанавливаем ближайшую
            if (!this.target || !this.target.isAlive) {
                this.target = closest;
                return;
            }
            
            const currentDistance = this.distanceTo(this.target);
            const newDistance = this.distanceTo(closest);
            
            // Если новая цель ближе на 10% или больше — меняем
            if (newDistance < currentDistance * 0.9) {
                this.target = closest;
            }
        }
    }
    
    
    // Метод для поиска ближайшей цели
    findClosestTarget(characters) {
        // console.log(`[ЦЕЛЬ] Поиск ближайшей цели для ${this.type} (${this.team}), доступно персонажей: ${characters.length}`);
        
        let closestTarget = null;
        let closestDistance = Infinity;
        let enemiesFound = 0;
        
        // Проверяем, что массив персонажей существует
        if (!characters || characters.length === 0) {
            // console.log(`[ЦЕЛЬ] Нет персонажей для поиска цели`);
            return null;
        }
        
        // Дебаг информация о командах
        // console.log(`[ЦЕЛЬ] Моя команда: ${this.team}`);
        const teamCounts = { player: 0, enemy: 0 };
        characters.forEach(c => {
            if (c && c.team) {
                teamCounts[c.team.toLowerCase()]++;
            }
        });
        // console.log(`[ЦЕЛЬ] Количество персонажей по командам: player=${teamCounts.player}, enemy=${teamCounts.enemy}`);
        
        // Проверяем всех персонажей в массиве
        // console.log(`[ЦЕЛЬ] Проверка всех персонажей:`);
        for (let i = 0; i < characters.length; i++) {
            const character = characters[i];
            if (character) {
                // console.log(`[ЦЕЛЬ] Персонаж ${i}: ${character.type || 'нет типа'} (${character.team || 'нет команды'}), жив: ${character.isAlive ? 'да' : 'нет'}`);
            } else {
                // console.log(`[ЦЕЛЬ] Персонаж ${i}: null`);
            }
        }
        
        // Проверяем свои свойства
        // console.log(`[ЦЕЛЬ] Мои свойства: тип=${this.type}, команда=${this.team}, жив=${this.isAlive}`);
        
        for (let i = 0; i < characters.length; i++) {
            const character = characters[i];
            
            // Проверяем, что персонаж существует и имеет команду
            if (!character || !character.team) {
                // console.log(`[ЦЕЛЬ] Пропускаем недействительного персонажа ${i}`);
                continue;
            }
            
            // Проверяем команду персонажа
            // console.log(`[ЦЕЛЬ] Проверка команды: моя=${this.team}, персонажа=${character.team}, совпадает=${character.team.toLowerCase() === this.team.toLowerCase()}`);
            
            // Пропускаем персонажей из нашей команды и мертвых персонажей
            if (character.team.toLowerCase() === this.team.toLowerCase()) {
                // console.log(`[ЦЕЛЬ] Пропускаем персонажа из нашей команды: ${character.type} (${character.team})`);
                continue;
            }
            
            if (!character.isAlive) {
                // console.log(`[ЦЕЛЬ] Пропускаем мертвого персонажа: ${character.type} (${character.team})`);
                continue;
            }
            
            // Пропускаем самих себя
            if (character === this) {
                // console.log(`[ЦЕЛЬ] Пропускаем самого себя`);
                continue;
            }
            
            // Нашли врага!
            // console.log(`[ЦЕЛЬ] Найден враг: ${character.type} (${character.team})`);
            enemiesFound++;
            const distance = this.distanceTo(character);
            // console.log(`[ЦЕЛЬ] Расстояние до ${character.type} (${character.team}): ${distance}`);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestTarget = character;
                // console.log(`[ЦЕЛЬ] Новая ближайшая цель: ${character.type} (${character.team}), расстояние: ${distance}`);
            }
        }
        
        // console.log(`[ЦЕЛЬ] Найдено врагов: ${enemiesFound}`);
        
        if (closestTarget) {
            // console.log(`[ЦЕЛЬ] ${this.type} (${this.team}) нашел цель: ${closestTarget.type} (${closestTarget.team}), расстояние: ${closestDistance}`);
        } else {
            // console.log(`[ЦЕЛЬ] ${this.type} (${this.team}) не нашел цели`);
        }
        
        return closestTarget;
    }
    
// Добавляем новый метод для Ассасина, чтобы выбирать цель с наименьшим здоровьем
findTargetWithLowestHealth(characters) {
    if (!characters || characters.length === 0) return null;
    
    let lowestHealthTarget = null;
    let lowestHealth = Infinity;
    
    for (let i = 0; i < characters.length; i++) {
        const character = characters[i];
        
        // Пропускаем персонажей из нашей команды, мертвых и самих себя
        if (!character || !character.team || 
            character.team.toLowerCase() === this.team.toLowerCase() || 
            !character.isAlive || character === this) {
            continue;
        }
        
        // Если это ассасин и цель имеет меньше здоровья, чем предыдущая найденная
        if (character.health < lowestHealth) {
            lowestHealth = character.health;
            lowestHealthTarget = character;
        }
    }
    
    return lowestHealthTarget;
}

    // Метод для вычисления расстояния до другого персонажа
    distanceTo(character) {
        if (!character) return Infinity;
    
    const dx = character.x - this.x;
    const dy = character.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Возвращаем расстояние между краями персонажей
    return distance - this.radius - character.radius;
    }
    
    moveTowardsTarget(delta) {
        if (!this.target || !this.target.isAlive) {
            this.findTarget();
            return;
        }
    
        const distance = this.distanceTo(this.target);
    
        // Для лучника и мага огня: отдельная логика движения
        if (this.type === CHARACTER_TYPES.ARCHER || this.type === CHARACTER_TYPES.FIREMAGE) {
            const safeDistance = CHARACTER_STATS[this.type].safeDistance;
    
            // Если слишком близко - отступаем
            const actualDistance = distance - this.radius - this.target.radius;
            if (actualDistance < safeDistance) {
                this.moveAwayFromTarget(delta);
                return;
            }
            // Если слишком далеко - приближаемся
            else if (distance > this.attackRange) {
                this.moveCloserToTarget(delta);
                return;
            }
            // В оптимальной зоне - стоим на месте
            else {
                if (this.currentAnimation === ANIMATION_STATES.WALK) {
                    this.currentAnimation = ANIMATION_STATES.IDLE;
                    this.frameIndex = 0;
                    this.updateSpriteFrame();
                    this.isMoving = false;
                }
                return;
            }
        }
    
        // Для воина: стандартная логика
        if (distance > this.attackRange) {
            // Двигаемся к цели
            const moveAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            const moveSpeed = this.speed * delta;
            
            // Получаем силу избегания
            const avoidance = this.calculateAvoidanceForce(this.characters || []);
            const targetWeight = 0.7;
const avoidWeight = 0.3;

const combinedX = Math.cos(moveAngle) * targetWeight + avoidance.x * avoidWeight;
const combinedY = Math.sin(moveAngle) * targetWeight + avoidance.y * avoidWeight;


// Нормализуем итоговое направление
const length = Math.sqrt(combinedX * combinedX + combinedY * combinedY);
if (length > 0) {
    this.x += (combinedX / length) * moveSpeed;
    this.y += (combinedY / length) * moveSpeed;
}

            
            this.stayWithinBattlefield();
            
            if (this.currentAnimation !== ANIMATION_STATES.WALK) {
                this.currentAnimation = ANIMATION_STATES.WALK;
                this.frameIndex = 0;
                this.updateSpriteFrame();
            }
            
            // Отзеркаливание спрайта
            this.updateFacingDirection(moveAngle);
        } else {
            // Останавливаемся
            if (this.currentAnimation === ANIMATION_STATES.WALK) {
                this.currentAnimation = ANIMATION_STATES.IDLE;
                this.frameIndex = 0;
                this.updateSpriteFrame();
                this.isMoving = false;
            }
        }
    }
    
    updateFacingDirection(angle) {
        const newDirection = Math.cos(angle) > 0 ? 1 : -1;
        if (newDirection !== this.facingDirection) {
            this.facingDirection = newDirection;
            this.characterSprite.scale.x = newDirection;
        }
    }

    // Добавляем новый метод для приближения к цели (для лучника)
    moveCloserToTarget(delta) {
        if (!this.target) return;
        
        const moveAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
const moveSpeed = this.speed * delta;

// Получаем силу избегания
const avoidance = this.calculateAvoidanceForce(this.characters || []);
const targetWeight = 0.7;
const avoidWeight = 0.3;

const combinedX = Math.cos(moveAngle) * targetWeight + avoidance.x * avoidWeight;
const combinedY = Math.sin(moveAngle) * targetWeight + avoidance.y * avoidWeight;


// Нормализуем итоговое направление
const length = Math.sqrt(combinedX * combinedX + combinedY * combinedY);
if (length > 0) {
    this.x += (combinedX / length) * moveSpeed;
    this.y += (combinedY / length) * moveSpeed;
}

        
        this.stayWithinBattlefield();
        
        if (this.currentAnimation !== ANIMATION_STATES.WALK) {
            this.currentAnimation = ANIMATION_STATES.WALK;
            this.frameIndex = 0;
            this.updateSpriteFrame();
            this.isMoving = true;
        }
        
        // Добавляем поворот спрайта лучника
        this.updateFacingDirection(moveAngle);
    }

    
    // Метод для получения урона
    takeDamage(damage, attacker) {
        if (!this.isAlive) {
            // console.log(`[УРОН] ${this.type} (${this.team}) не может получить урон, так как уже мертв`);
            return;
        }
        
        // console.log(`[УРОН] ${this.type} (${this.team}) получает урон ${damage} от ${attacker.type} (${attacker.team}), текущее здоровье: ${this.health}`);
        
        // Уменьшаем здоровье
        this.health -= damage;
        
        // Проверяем, жив ли персонаж
        if (this.health <= 0) {
            this.health = 0; // Устанавливаем здоровье в 0
            // console.log(`[УРОН] ${this.type} (${this.team}) умирает от полученного урона`);
            
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
            
            // console.log(`[УРОН] ${this.type} (${this.team}) получил урон ${damage} от ${attacker.type} (${attacker.team}), осталось здоровья: ${this.health}`);
            
            // Возвращаемся к обычной анимации после анимации получения урона
            const hurtFrames = this.animations[ANIMATION_STATES.HURT].frames.length;
            const frameDuration = 100; // мс на кадр
            const animationDuration = hurtFrames * frameDuration;
            
            setTimeout(() => {
                if (this.isAlive && this.currentAnimation === ANIMATION_STATES.HURT) {
                    // Проверяем, находится ли персонаж в движении
                    // (если есть цель и персонаж вне зоны атаки)
                    if (this.target && this.target.isAlive && this.distanceTo(this.target) > this.attackRange) {
                        this.currentAnimation = ANIMATION_STATES.WALK;
                        this.isMoving = true; // Устанавливаем флаг движения
                    } else {
                        this.currentAnimation = ANIMATION_STATES.IDLE;
                        this.isMoving = false; // Сбрасываем флаг движения
                    }
                    this.frameIndex = 0;
                }
            }, animationDuration);
        }
    }
    
    die() {
        if (!this.isAlive) {
            // console.log(`[СМЕРТЬ] ${this.type} (${this.team}) уже мертв`);
            return;
        }
        
        this.isAlive = false;
        this.health = 0;
        
        // console.log(`[СМЕРТЬ] ${this.type} (${this.team}) начинает анимацию смерти`);
        
        // Сохраняем только текстуру и позицию
        const texture = this.characterSprite.texture;
        const posX = this.x;
        const posY = this.y;
        
        // Получаем родительский контейнер
        const parent = this.container.parent;
        const index = parent ? parent.children.indexOf(this.container) : -1;
        
        // Полностью удаляем весь контейнер со всем содержимым из родителя
        if (parent && index !== -1) {
            parent.removeChildAt(index);
        }
        
        // Уничтожаем все предыдущие объекты
        if (this.healthBar) {
            this.healthBar.clear();
            this.healthBar.destroy(true);
        }
        
        if (this.outline) {
            this.outline.clear();
            this.outline.destroy(true);
        }
        
        if (this.attackEffects) {
            this.attackEffects.removeChildren();
            this.attackEffects.destroy(true);
        }
        
        if (this.sprite) {
            this.sprite.removeChildren();
            this.sprite.destroy(true);
        }
        
        if (this.container) {
            this.container.removeChildren();
            this.container.destroy(true);
        }
        
        // Создаем полностью новый набор объектов
        this.container = new PIXI.Container();
        this.container.position.set(posX, posY);
        
        // Создаем только спрайт персонажа для анимации смерти
        this.characterSprite = new PIXI.Sprite(texture);
        this.characterSprite.anchor.set(0.5);
        this.characterSprite.width = this.radius * 2.5;
        this.characterSprite.height = this.radius * 2.5;
        
        // Добавляем спрайт в контейнер
        this.container.addChild(this.characterSprite);
        
        // Добавляем новый контейнер в родителя
        if (parent && index !== -1) {
            parent.addChildAt(this.container, index);
        } else if (parent) {
            parent.addChild(this.container);
        }
        
        // Явно обнуляем ссылки на удаленные объекты
        this.healthBar = null;
        this.outline = null;
        this.attackEffects = null;
        this.sprite = null;
        
        // Устанавливаем анимацию смерти
        this.currentAnimation = ANIMATION_STATES.DEATH;
        this.frameIndex = 0;
        
      
    }
    
    // Метод для обновления полосы здоровья
    updateHealthBar() {

// Самая первая проверка - если персонаж мертв, принудительно скрываем полосу здоровья
if (!this.isAlive) {
    if (this.healthBar) {
        this.healthBar.visible = false;
        this.healthBar.alpha = 0;
        
        if (this.container && this.container.children.includes(this.healthBar)) {
            const index = this.container.children.indexOf(this.healthBar);
            if (index !== -1) {
                this.container.removeChildAt(index);
            }
        }
    }
    
    // Для врагов также скрываем обводку
    if (this.team === TEAMS.ENEMY && this.outline) {
        this.outline.visible = false;
        this.outline.alpha = 0;
        
        if (this.container && this.container.children.includes(this.outline)) {
            const index = this.container.children.indexOf(this.outline);
            if (index !== -1) {
                this.container.removeChildAt(index);
            }
        }
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
        if (!this.target) return;
        
        const endX = (this.target.x - this.x);
        const endY = (this.target.y - this.y);
        
        // Создаем линию пути
        const line = new PIXI.Graphics();
        line.lineStyle(1, 0xFFFFFF, 0.8);
        line.moveTo(0, 0);
        line.lineTo(endX, endY);
        
        // Добавляем линию в контейнер
        this.attackEffects.addChild(line);
        
        // Анимируем исчезновение линии
        gsap.to(line, {
            alpha: 0,
            duration: 0.3,
            onComplete: () => {
                // Проверяем существование контейнера перед удалением
                if (this.attackEffects && !this.attackEffects.destroyed && 
                    this.attackEffects.children.includes(line)) {
                    // Удаляем линию после исчезновения
                    this.attackEffects.removeChild(line);
                    
                    // Создаем небольшой эффект попадания
                    const impact = new PIXI.Graphics();
                    impact.beginFill(0xFFFFFF, 0.7);
                    impact.drawCircle(endX, endY, 3);
                    impact.endFill();
                    
                    // Проверяем, существует ли еще контейнер эффектов
                    if (this.attackEffects && !this.attackEffects.destroyed) {
                        this.attackEffects.addChild(impact);
                        
                        // Анимируем исчезновение эффекта попадания
                        gsap.to(impact, {
                            alpha: 0,
                            duration: 0.1,
                            onComplete: () => {
                                // Проверяем существование контейнера перед удалением
                                if (this.attackEffects && !this.attackEffects.destroyed && 
                                    this.attackEffects.children.includes(impact)) {
                                    this.attackEffects.removeChild(impact);
                                }
                            }
                        });
                    }
                }
            }
        });
    }
    
    // Метод для создания эффекта огненного шара для Мага Огня
createFireballEffect() {
    if (!this.target) return;
    
    // Создаем огненный шар (круг)
    const fireball = new PIXI.Graphics();
    fireball.beginFill(0xFF5500); // Ярко-оранжевый цвет
    fireball.drawCircle(0, 0, 8); // Размер огненного шара
    fireball.endFill();
    
    // Добавляем свечение вокруг шара
    fireball.beginFill(0xFF9900, 0.5);
    fireball.drawCircle(0, 0, 12);
    fireball.endFill();
    
    // Добавляем огненный шар в контейнер эффектов
    this.attackEffects.addChild(fireball);
    
    // Определяем начальную и конечную позиции
    const startX = 0;
    const startY = 0;
    const endX = this.target.x - this.x;
    const endY = this.target.y - this.y;
    
    // Устанавливаем начальную позицию
    fireball.position.set(startX, startY);
    
    // Задаем длительность полета
    const duration = 0.4;
    
    // Анимируем полет огненного шара
    gsap.to(fireball.position, {
        x: endX,
        y: endY,
        duration: duration,
        ease: "none", // Линейное движение
        onComplete: () => {
            // Удаляем огненный шар после достижения цели
            if (this.attackEffects && !this.attackEffects.destroyed && 
                this.attackEffects.children.includes(fireball)) {
                this.attackEffects.removeChild(fireball);
            }
            
            // Создаем эффект взрыва
            this.createExplosionEffect(endX, endY);
            
            // Наносим урон всем врагам в радиусе взрыва
            this.dealSplashDamage(endX, endY);
        }
    });
    
    // Анимируем пульсацию огненного шара во время полета
    gsap.to(fireball.scale, {
        x: 1.3,
        y: 1.3,
        duration: duration / 4,
        repeat: 3,
        yoyo: true
    });
}

// Метод для создания эффекта взрыва
createExplosionEffect(x, y) {
    // Получаем радиус сплеш-урона
    const explosionRadius = CHARACTER_STATS[CHARACTER_TYPES.FIREMAGE].splashRadius;
    
    // Создаем эффект взрыва (большой круг)
    const explosion = new PIXI.Graphics();
    explosion.beginFill(0xFF3300, 0.8); // Красно-оранжевый цвет
    explosion.drawCircle(x, y, explosionRadius / 2); // Размер взрыва
    explosion.endFill();
    
    // Добавляем свечение вокруг взрыва
    explosion.beginFill(0xFF9900, 0.4);
    explosion.drawCircle(x, y, explosionRadius);
    explosion.endFill();
    
    // Добавляем эффект взрыва в контейнер
    this.attackEffects.addChild(explosion);
    
    // Анимируем исчезновение взрыва
    gsap.to(explosion, {
        alpha: 0,
        duration: 0.1,
        onComplete: () => {
            // Удаляем взрыв после исчезновения
            if (this.attackEffects && !this.attackEffects.destroyed && 
                this.attackEffects.children.includes(explosion)) {
                this.attackEffects.removeChild(explosion);
            }
        }
    });
    
    // Анимируем увеличение взрыва
    gsap.to(explosion.scale, {
        x: 1.5,
        y: 1.5,
        duration: 0.3,
        ease: "power1.out"
    });
}

// Метод для нанесения сплеш-урона всем врагам в радиусе взрыва
dealSplashDamage(explosionX, explosionY) {
    if (!this.characters || !this.characters.length) return;
    
    // Получаем радиус сплеш-урона
    const splashRadius = CHARACTER_STATS[CHARACTER_TYPES.FIREMAGE].splashRadius;
    
    // Проходим по всем персонажам и проверяем, находятся ли они в радиусе взрыва
    this.characters.forEach(character => {
        // Пропускаем персонажей из нашей команды и мертвых персонажей
        if (character.team.toLowerCase() === this.team.toLowerCase() || 
            !character.isAlive || character === this.target) {
            return;
        }
        
        // Вычисляем расстояние от взрыва до персонажа
        const dx = (this.x + explosionX) - character.x;
        const dy = (this.y + explosionY) - character.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Если персонаж находится в радиусе взрыва
        if (distance <= splashRadius + character.radius) {
            // Наносим сплеш-урон (половина от основного урона)
            const splashDamage = Math.floor(this.attackPower / 2);
            character.takeDamage(splashDamage, this);
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

    // Вычисление силы избегания для обхода других персонажей
    calculateAvoidanceForce(characters) {
        const avoidanceForce = { x: 0, y: 0 };
        const avoidanceRadius = this.radius * 1.5;
    
        let totalWeight = 0;
    
        characters.forEach(character => {
            if (character === this || !character.isAlive || character.team !== this.team) return;
    
            const dx = this.x - character.x;
            const dy = this.y - character.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            if (distance < avoidanceRadius && distance > 0.01) {
                const weight = (avoidanceRadius - distance) / avoidanceRadius;
    
                // Нормализованный вектор от союзника к текущему персонажу
                const nx = dx / distance;
                const ny = dy / distance;
    
                // Основной отталкивающий вектор
                avoidanceForce.x += nx * weight;
                avoidanceForce.y += ny * weight;
    
                // Это заставляет персонажа уходить вбок, а не прямо назад
                const sideX = -ny; // Перпендикуляр к (nx, ny)
                const sideY = nx;
                avoidanceForce.x += sideX * weight * 0.3; // боковой вес
                avoidanceForce.y += sideY * weight * 0.3;
    
                totalWeight += weight;
            }
        });
    
        if (totalWeight > 0) {
            avoidanceForce.x /= totalWeight;
            avoidanceForce.y /= totalWeight;
        }
    
        const magnitude = Math.sqrt(avoidanceForce.x ** 2 + avoidanceForce.y ** 2);
        if (magnitude > 0) {
            avoidanceForce.x /= magnitude;
            avoidanceForce.y /= magnitude;
        }
    
        return avoidanceForce;
    }
    
    
    

moveAwayFromTarget(delta) {
    if (!this.target) return;
    
    // console.log(`[ОТСТУПЛЕНИЕ] ${this.type} (${this.team}) отступает от ${this.target.type}`);
    
    // Вычисляем направление ОТ цели
    const angle = Math.atan2(this.y - this.target.y, this.x - this.target.x);
    const moveSpeed = this.speed * delta * 1.2; // На 20% быстрее при отступлении
    
    this.x += Math.cos(angle) * moveSpeed;
    this.y += Math.sin(angle) * moveSpeed;
    
    this.stayWithinBattlefield();
    
    if (this.currentAnimation !== ANIMATION_STATES.WALK) {
        this.currentAnimation = ANIMATION_STATES.WALK;
        this.frameIndex = 0;
        this.updateSpriteFrame();
        this.isMoving = true;
    }
    
    // Отзеркаливание при отступлении
    this.updateFacingDirection(angle);
    
    // Добавляем обновление анимации каждый раз при отступлении
    this.updateAnimation(delta);
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
                // console.log(`${this.type} starting attack animation`);
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
            return;
        }
        
        // Устанавливаем флаг атаки
        this.isAttacking = true;
        
        // Устанавливаем анимацию атаки
        this.currentAnimation = ANIMATION_STATES.ATTACK;
        this.frameIndex = 0;
        this.updateSpriteFrame();
        
        // Определяем направление к цели
        const angleToTarget = Math.atan2(
            this.target.y - this.y,
            this.target.x - this.x
        );
        
        // Фиксируем направление атаки
        this.updateFacingDirection(angleToTarget);
        
        // Получаем длительность анимации атаки
        const animDuration = this.animations[ANIMATION_STATES.ATTACK].duration;
        
        // Создаем таймер, который выполнит атаку после завершения анимации
        setTimeout(() => {
            // Наносим урон цели
            if (this.target && this.target.isAlive) {
                this.target.takeDamage(this.attackPower, this);
                
                // Создаем эффект атаки в зависимости от типа персонажа
                if (this.type === CHARACTER_TYPES.ARCHER) {
                    this.createArrowEffect();
                } else if (this.type === CHARACTER_TYPES.FIREMAGE) {
                    this.createFireballEffect();
                } else {
                    this.createMeleeEffect();
                }
            }
        }, animDuration * 0.6 * 1000);
        
        // Сбрасываем флаг атаки после завершения анимации
        setTimeout(() => {
            this.isAttacking = false;
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
                // Проверяем существование контейнера перед удалением
                if (this.attackEffects && !this.attackEffects.destroyed && 
                    this.attackEffects.children.includes(attackEffect)) {
                    this.attackEffects.removeChild(attackEffect);
                }
            }
        });
        
        // Анимируем вспышку
        gsap.to(impact, {
            alpha: 0,
            scale: 1.5,
            duration: 0.3,
            onComplete: () => {
                // Проверяем существование контейнера перед удалением
                if (this.attackEffects && !this.attackEffects.destroyed && 
                    this.attackEffects.children.includes(impact)) {
                    this.attackEffects.removeChild(impact);
                }
            }
        });
    }
    
    // Старый метод для совместимости
    createWarriorAttackEffect(target) {
        this.createMeleeEffect();
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

// Assassin class
class Assassin extends Character {
    constructor(team, x, y) {
        super(CHARACTER_TYPES.ASSASSIN, team, x, y);
    }
}

// FireMage class
class FireMage extends Character {
    constructor(team, x, y) {
        super(CHARACTER_TYPES.FIREMAGE, team, x, y);
    }
}

// Экспортируем классы в глобальную область видимости
window.Character = Character;
window.Warrior = Warrior;
window.Archer = Archer;
window.Assassin = Assassin;
window.FireMage = FireMage;