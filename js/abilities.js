// Исправление для всех мест использования ColorMatrixFilter
// В PixiJS 7.1+ ColorMatrixFilter переместился в ColorMatrixFilterDeprecated

// Функция для создания фильтра с совместимостью с разными версиями PixiJS
function createColorMatrix() {
    // Проверяем, есть ли в PIXI новая версия фильтра
    if (PIXI.ColorMatrixFilter) {
        return new PIXI.ColorMatrixFilter();
    } else if (PIXI.filters && PIXI.filters.ColorMatrixFilter) {
        return new PIXI.filters.ColorMatrixFilter();
    } else if (PIXI.filters && PIXI.filters.ColorMatrixFilterDeprecated) {
        return new PIXI.filters.ColorMatrixFilterDeprecated();
    } else {
        // Запасной вариант - создаем пустой фильтр
        console.warn("ColorMatrixFilter не найден в PixiJS. Используются альтернативные методы.");
        return {
            desaturate: function() {},
            tint: function() {}
        };
    }
}

// Этот метод нужно добавить в глобальную область видимости или заменить все использования
// ColorMatrixFilter в коде на вызовы этой функции
window.createColorMatrix = createColorMatrix;

// Класс базовой способности
class Ability {
    constructor(character) {
        this.character = character;
        this.energyCost = 100; // Базовая стоимость способности
        this.cooldown = 10; // Кулдаун в секундах
        this.lastUseTime = 0;
    }
    
    // Проверка возможности использования
    canUse(target, now) {
        return this.character && this.character.isAlive && // Добавляем проверку жизни персонажа
               this.character.hasEnoughEnergy(this.energyCost) && 
               now - this.lastUseTime >= this.cooldown &&
               target && target.isAlive;
    }

    // Использование способности
    use(target, now) {
        if (!this.canUse(target, now)) return false;
        
        this.character.spendEnergy(this.energyCost);
        this.lastUseTime = now;
        this.createEffect(target);
        return true;
    }
    
    // Создание визуального эффекта (переопределяется в потомках)
    createEffect(target) {}
}

// Способность воина: Цепи
class WarriorChainsAbility extends Ability {
    constructor(character) {
        super(character);
        this.name = "Цепи";
        this.cooldown = 6;
        this.stunDuration = 3; // секунды
        this.pullDistance = 200; // расстояние притягивания
    }
    
    use(target, now) {
        if (super.use(target, now)) {
            // Сохраняем начальную позицию цели
            const startX = target.x;
            const startY = target.y;
            
            // Вычисляем направление к воину
            const dx = this.character.x - target.x;
            const dy = this.character.y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Определяем новую позицию цели
            let newDistance = Math.max(0, distance - this.pullDistance);
            // Если цель уже близко, притягиваем её прямо к воину плюс небольшой отступ
            if (newDistance < this.character.radius + target.radius + 10) {
                newDistance = this.character.radius + target.radius + 10;
            }
            
            // Рассчитываем новые координаты
            const newX = this.character.x - Math.cos(angle) * newDistance;
            const newY = this.character.y - Math.sin(angle) * newDistance;
            
            // Добавляем станящий эффект
            target.stunnedUntil = now + this.stunDuration;
            
            // Создаем визуальный эффект цепи и притягивания
            this.createEffect(target, startX, startY, newX, newY);
            
            return true;
        }
        return false;
    }
    
    createEffect(target, startX, startY, newX, newY) {
        // Проверяем, существует ли персонаж и его контейнер
        if (!this.character || !this.character.container) {
            console.warn("Character or container doesn't exist, cannot create effect");
            return;
        }
        
        // Если attackEffects не существует, создаем его
        if (!this.character.attackEffects) {
            this.character.attackEffects = new PIXI.Container();
            this.character.container.addChild(this.character.attackEffects);
        }
        
        // Создаем контейнер для эффекта
        const effectContainer = new PIXI.Container();
        
        // Проверяем, существует ли цель и ее координаты
        if (!target || typeof target.x !== 'number' || typeof target.y !== 'number') {
            console.warn("Target doesn't exist or has invalid coordinates");
            return;
        }
        
        // Вычисляем направление к цели и расстояние
        const dx = startX - this.character.x;
        const dy = startY - this.character.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Создаем цепи
        const chain = new PIXI.Graphics();
        
        // Цвет и стиль цепи
        chain.lineStyle(3, 0xAAAAAA);
        
        // Рисуем цепь в виде зигзагообразной линии
        const segments = 10;
        const segmentLength = distance / segments;
        
        chain.moveTo(0, 0);
        
        for (let i = 1; i <= segments; i++) {
            const x = i * segmentLength;
            const y = (i % 2 === 0) ? 0 : 15; // Зигзаг
            chain.lineTo(x, y);
        }
        
        // Поворачиваем цепь в направлении цели
        chain.rotation = angle;
        
        // Добавляем "манжеты" в конце цепи
        const cuff = new PIXI.Graphics();
        cuff.beginFill(0x777777);
        cuff.drawCircle(distance, 0, 10);
        cuff.endFill();
        
        // Рисуем блики на кандалах
        cuff.beginFill(0xCCCCCC);
        cuff.drawCircle(distance - 3, -3, 3);
        cuff.endFill();
        
        // Добавляем все в контейнер
        effectContainer.addChild(chain);
        effectContainer.addChild(cuff);
        
        // Добавляем эффект в контейнер персонажа
        this.character.attackEffects.addChild(effectContainer);
        
        // Проверяем, существует ли контейнер цели
        if (!target.container) {
            console.warn("Target container doesn't exist, cannot add stun effect");
            return;
        }
        
        // Создаем контейнер для эффекта оглушения на цели
        const targetStunEffect = new PIXI.Container();
        target.container.addChild(targetStunEffect);
        
        // Анимация появления цепи
        gsap.from(chain.scale, {
            x: 0, 
            y: 0,
            duration: 0.2,
            ease: "back.out"
        });
        
        // Анимируем притягивание цели
        gsap.to(target, {
            x: newX,
            y: newY,
            duration: 0.01,
            ease: "power2.out",
            onUpdate: () => {
                // Обновляем позицию контейнера цели
                if (target.container) {
                    target.container.position.set(target.x, target.y);
                }
            }
        });
        
        // Добавляем эффект мигания чёрно-белого спрайта оглушённого персонажа
        this.createStunBlinkEffect(target);
        
        // Задаем анимацию исчезновения и удаляем элементы
        gsap.to(effectContainer, {
            alpha: 0,
            duration: 0.1,
            delay: 0.2,
            onComplete: () => {
                if (this.character && this.character.attackEffects && 
                    !this.character.attackEffects.destroyed &&
                    this.character.attackEffects.children.includes(effectContainer)) {
                    this.character.attackEffects.removeChild(effectContainer);
                }
            }
        });
        
        gsap.to(targetStunEffect, {
            alpha: 0,
            duration: 0.1,
            delay: this.stunDuration - 0.1,
            onComplete: () => {
                if (target && target.container && 
                    !target.container.destroyed &&
                    target.container.children.includes(targetStunEffect)) {
                    target.container.removeChild(targetStunEffect);
                    
                    // Убедимся, что фильтры персонажа сброшены после завершения эффекта
                    if (target.characterSprite) {
                        target.characterSprite.filters = null;
                    }
                }
            }
        });
    }
    
    // Новый метод для создания эффекта мигания чёрно-белого спрайта
    createStunBlinkEffect(target) {
        if (!target || !target.characterSprite) return;
        
        // Создаём эффект обесцвечивания (чёрно-белый фильтр)
        const colorMatrix = new PIXI.filters.ColorMatrixFilter();
        colorMatrix.desaturate(); // Делаем чёрно-белым
        
        // Применяем фильтр к спрайту
        target.characterSprite.filters = [colorMatrix];
        
        // Анимируем мигание (изменение интенсивности обесцвечивания)
        const blinkTween = gsap.to(colorMatrix.matrix, {
            0: 1.5, // Увеличиваем яркость
            6: 1.5, 
            12: 1.5,
            18: 1.5,
            duration: 0.3,
            repeat: Math.ceil(this.stunDuration * 2),
            yoyo: true,
            onUpdate: () => {
                // Обновляем фильтр при каждом изменении матрицы
                if (target.characterSprite) {
                    target.characterSprite.filters = [colorMatrix];
                }
            },
            onComplete: () => {
                // Сбрасываем фильтры после завершения анимации
                if (target.characterSprite) {
                    target.characterSprite.filters = null;
                }
            }
        });
        
        // Добавляем звездочки вокруг головы (опционально)
        if (target.container) {
            const stunContainer = new PIXI.Container();
            target.container.addChild(stunContainer);
            
            // Добавляем 4 звёздочки вокруг головы
            for (let i = 0; i < 4; i++) {
                const star = new PIXI.Graphics();
                const starAngle = (Math.PI * 2 / 4) * i;
                const starX = Math.cos(starAngle) * target.radius ;
                const starY = Math.sin(starAngle) * target.radius - target.radius / 2;
                
                // Рисуем звезду
                star.beginFill(0xFFFF00);
                
                // Рисуем пятиконечную звезду
                const starSize = 5;
                const innerRadius = 10;
                
                star.moveTo(starX, starY - starSize);
                
                for (let j = 0; j < 5; j++) {
                    // Внешняя точка
                    const outerAngle = -Math.PI/2 + j * 2 * Math.PI / 5;
                    const outerX = starX + Math.cos(outerAngle) * starSize;
                    const outerY = starY + Math.sin(outerAngle) * starSize;
                    
                    // Внутренняя точка
                    const innerAngle = -Math.PI/2 + (j + 0.5) * 2 * Math.PI / 5;
                    const innerX = starX + Math.cos(innerAngle) * innerRadius;
                    const innerY = starY + Math.sin(innerAngle) * innerRadius;
                    
                    // Соединяем с внутренней точкой
                    star.lineTo(innerX, innerY);
                    
                    // Если это не последняя итерация
                    if (j < 4) {
                        const nextOuterAngle = -Math.PI/2 + (j + 1) * 2 * Math.PI / 5;
                        const nextOuterX = starX + Math.cos(nextOuterAngle) * starSize;
                        const nextOuterY = starY + Math.sin(nextOuterAngle) * starSize;
                        star.lineTo(nextOuterX, nextOuterY);
                    } else {
                        // Соединяем с начальной точкой для завершения звезды
                        star.lineTo(starX, starY - starSize);
                    }
                }
                
                star.endFill();
                
                stunContainer.addChild(star);
                
                // Анимируем вращение звезд
                gsap.to(star, {
                    rotation: Math.PI / 4,
                    duration: 3,
                    repeat: this.stunDuration,
                    ease: "none"
                });
            }
            
            // Удаляем звёздочки после окончания стана
            gsap.to(stunContainer, {
                alpha: 0,
                duration: 0.001,
                delay: this.stunDuration,
                onComplete: () => {
                    if (target.container && !target.container.destroyed && 
                        target.container.children.includes(stunContainer)) {
                        target.container.removeChild(stunContainer);
                    }
                }
            });
        }
        
        // Запоминаем твин для возможной отмены при преждевременном окончании стана
        target._stunBlinkTween = blinkTween;
    }
}

// Способность лучника: Мощный выстрел
class ArcherPowerShotAbility extends Ability {
    constructor(character) {
        super(character);
        this.name = "Мощный выстрел";
        this.cooldown = 6;
        this.damageMultiplier = 2;
    }
    
    use(target, now) {
        if (super.use(target, now)) {
            // Наносим усиленный урон
            this.character.performAttack(target, this.damageMultiplier);
            return true;
        }
        return false;
    }
    
    createEffect(target) {
        // Проверяем существование персонажа и его контейнера
        if (!this.character || !this.character.container) {
            console.warn("Character or container doesn't exist, cannot create effect");
            return;
        }
        
        // Если attackEffects не существует, создаем его
        if (!this.character.attackEffects) {
            this.character.attackEffects = new PIXI.Container();
            this.character.container.addChild(this.character.attackEffects);
        }
        
        // Проверяем существование цели
        if (!target || typeof target.x !== 'number' || typeof target.y !== 'number') {
            console.warn("Target doesn't exist or has invalid coordinates");
            return;
        }
        
        // Создаем контейнер для эффекта
        const effectContainer = new PIXI.Container();
        
        // Вычисляем направление к цели
        const dx = target.x - this.character.x;
        const dy = target.y - this.character.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Создаем усиленную стрелу
        const arrow = new PIXI.Graphics();
        
        // Рисуем стрелу
        arrow.beginFill(0xFFFFFF);
        arrow.drawRect(0, -2, distance - 20, 4); // Тело стрелы
        arrow.endFill();
        
        // Наконечник стрелы
        arrow.beginFill(0xFF0000);
        arrow.moveTo(distance - 20, 0);
        arrow.lineTo(distance, 8);
        arrow.lineTo(distance, -8);
        arrow.endFill();
        
        // Оперение стрелы
        arrow.beginFill(0x00FF00);
        arrow.moveTo(0, 0);
        arrow.lineTo(15, 10);
        arrow.lineTo(15, -10);
        arrow.endFill();
        
        // Добавляем святящееся свечение вокруг стрелы
        const glow = new PIXI.Graphics();
        glow.beginFill(0xFFFF00, 0.3);
        glow.drawRect(-5, -7, distance, 14);
        glow.endFill();
        
        // Поворачиваем стрелу в направлении цели
        arrow.rotation = angle;
        glow.rotation = angle;
        
        // Добавляем все в контейнер
        effectContainer.addChild(glow);
        effectContainer.addChild(arrow);
        
        // Добавляем эффект в контейнер персонажа
        this.character.attackEffects.addChild(effectContainer);
        
        // Создаем эффект при попадании
        const impactEffect = new PIXI.Graphics();
        
        // Рисуем взрыв в точке попадания
        impactEffect.beginFill(0xFF8000, 0.7);
        impactEffect.drawCircle(0, 0, 30);
        impactEffect.endFill();
        
        // Лучи от взрыва
        for (let i = 0; i < 8; i++) {
            const rayAngle = (Math.PI * 2 / 8) * i;
            impactEffect.lineStyle(3, 0xFFFF00);
            impactEffect.moveTo(0, 0);
            const rayLength = 40 + Math.random() * 20;
            impactEffect.lineTo(
                Math.cos(rayAngle) * rayLength,
                Math.sin(rayAngle) * rayLength
            );
        }
        
        // Создаем контейнер для эффекта попадания
        const impactContainer = new PIXI.Container();
        impactContainer.addChild(impactEffect);
        impactContainer.position.set(target.x, target.y);
        
        // Анимация полета стрелы
        gsap.to(arrow, {
            alpha: 0.8,
            duration: 0.3,
            onComplete: () => {
                // Удаляем стрелу
                if (this.character && this.character.attackEffects && 
                    !this.character.attackEffects.destroyed &&
                    this.character.attackEffects.children.includes(effectContainer)) {
                    this.character.attackEffects.removeChild(effectContainer);
                    
                    // Добавляем эффект попадания
                    if (target && target.isAlive && target.container && target.container.parent) {
                        target.container.parent.addChild(impactContainer);
                        
                        // Анимация взрыва при попадании
                        gsap.from(impactEffect.scale, {
                            x: 0.1, 
                            y: 0.1,
                            duration: 0.2,
                            ease: "back.out"
                        });
                        
                        // Удаляем эффект попадания через некоторое время
                        gsap.to(impactContainer, {
                            alpha: 0,
                            duration: 0.3,
                            delay: 0.4,
                            onComplete: () => {
                                if (impactContainer.parent && 
                                    !impactContainer.parent.destroyed &&
                                    impactContainer.parent.children.includes(impactContainer)) {
                                    impactContainer.parent.removeChild(impactContainer);
                                }
                            }
                        });
                    }
                }
            }
        });
    }
}

// Способность ассасина: Рывок
class AssassinDashAbility extends Ability {
    constructor(character) {
        super(character);
        this.name = "Рывок";
        this.cooldown = 4;
        this.damageMultiplier = 1.5;
    }
    
    use(target, now) {
        if (super.use(target, now)) {
            const oldX = this.character.x;
            const oldY = this.character.y;
            
            // Рассчитываем новую позицию за спиной цели
            const dx = target.x - this.character.x;
            const dy = target.y - this.character.y;
            const angle = Math.atan2(dy, dx);
            
            // Позиция за спиной цели
            const newX = target.x - Math.cos(angle) * (target.radius + this.character.radius + 10);
            const newY = target.y - Math.sin(angle) * (target.radius + this.character.radius + 10);
            
            // Создаем эффект тени на старой позиции
            this.createDashEffect(oldX, oldY, newX, newY);
            
            // Перемещаем персонажа к цели
            this.character.x = newX;
            this.character.y = newY;
            this.character.container.position.set(newX, newY);
            
            // Поворачиваем персонажа в сторону цели
            this.character.updateFacingDirection(angle);
            
            // Наносим урон с множителем
            setTimeout(() => {
                if (target && target.isAlive) {
                    target.takeDamage(this.character.attackPower * this.damageMultiplier, this.character);
                }
            }, 100);
            
            // Сбрасываем текущую анимацию на атаку
            this.character.currentAnimation = ANIMATION_STATES.ATTACK;
            this.character.frameIndex = 0;
            this.character.updateSpriteFrame();
            
            return true;
        }
        return false;
    }
    
    createDashEffect(startX, startY, endX, endY) {
        // Проверяем, существует ли персонаж и его контейнер
        if (!this.character || !this.character.container) {
            console.warn("Character or container doesn't exist, cannot create dash effect");
            return;
        }
        
        // Проверяем, существует ли родительский контейнер
        if (!this.character.container.parent) {
            console.warn("Parent container doesn't exist, cannot add dash effect");
            return;
        }
        
        // Проверяем валидность координат
        if (typeof startX !== 'number' || typeof startY !== 'number' || 
            typeof endX !== 'number' || typeof endY !== 'number') {
            console.warn("Invalid coordinates for dash effect");
            return;
        }
        
        // Создаем контейнер для эффекта дыма/следов
        const dashContainer = new PIXI.Container();
        
        // Рассчитываем расстояние и угол перемещения
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Создаем тень на старой позиции
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.5);
        shadow.drawCircle(0, 0, this.character.radius * 1.2);
        shadow.endFill();
        shadow.position.set(startX, startY);
        
        // Создаем линию следа
        const trail = new PIXI.Graphics();
        trail.lineStyle(this.character.radius, 0x444444, 0.3);
        trail.moveTo(startX, startY);
        trail.lineTo(endX, endY);
        
        // Добавляем частицы вдоль пути
        for (let i = 0; i < 10; i++) {
            const particle = new PIXI.Graphics();
            const t = i / 10;
            const particleX = startX + dx * t;
            const particleY = startY + dy * t;
            
            particle.beginFill(0x666666, 0.4 - t * 0.3);
            particle.drawCircle(0, 0, this.character.radius * (0.8 - t * 0.5));
            particle.endFill();
            particle.position.set(particleX, particleY);
            
            dashContainer.addChild(particle);
        }
        
        // Добавляем все элементы в контейнер
        dashContainer.addChild(shadow);
        dashContainer.addChild(trail);
        
        // Добавляем контейнер с эффектом на поле боя
        const battlefield = this.character.container.parent;
        if (battlefield) {
            battlefield.addChild(dashContainer);
            
            // Анимируем исчезновение эффекта
            gsap.to(dashContainer, {
                alpha: 0,
                duration: 0.5,
                onComplete: () => {
                    if (battlefield && 
                        !battlefield.destroyed &&
                        battlefield.children.includes(dashContainer)) {
                        battlefield.removeChild(dashContainer);
                    }
                }
            });
        }
    }
}

// Способность мага огня: Огненный круг
class FireMageFireCircleAbility extends Ability {
    constructor(character) {
        super(character);
        this.name = "Огненный круг";
        this.cooldown = 6;
        this.duration = 3; // длительность эффекта в секундах
        this.damage = 20; // урон в секунду
        this.radius = 120; // радиус огненного круга
        this.stunDuration = 3; // длительность оглушения врагов
    }
    
    // Проверка на возможность использования - добавляем проверку на близость врага
    canUse(target, now) {
        // Проверка базовых условий
        if (!this.character || !this.character.isAlive || 
            !this.character.hasEnoughEnergy(this.energyCost) || 
            now - this.lastUseTime < this.cooldown ||
            !target || !target.isAlive) {
            return false;
        }
        
        // Проверяем, что враг находится в радиусе мага
        const distance = this.character.distanceTo(target);
        return distance <= this.radius;
    }
    
    use(target, now) {
        if (super.use(target, now)) {
            // Создаем огненный круг вокруг мага (а не цели)
            this.createEffect();
            
            // Применяем DoT эффект и оглушение ко всем врагам в зоне действия
            this.applyEffectsToEnemies(now);
            
            return true;
        }
        return false;
    }
    
    applyEffectsToEnemies(now) {
        // Находим всех врагов в радиусе действия
        const characters = this.character.characters || [];
        
        characters.forEach(char => {
            // Пропускаем союзников и мертвых персонажей
            if (char.team === this.character.team || !char.isAlive) return;
            
            // Проверяем, находится ли персонаж в радиусе действия от мага (не от цели)
            const dx = char.x - this.character.x;
            const dy = char.y - this.character.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.radius + char.radius) {
                // Применяем эффект периодического урона
                char.fireCircleDamage = {
                    until: now + this.duration,
                    dps: this.damage
                };
                
                // Добавляем оглушение
                char.stunnedUntil = now + this.stunDuration;
                
                // Добавляем визуальный эффект оглушения
                this.createStunEffect(char);
            }
        });
    }
    
    createStunEffect(target) {
        if (!target || !target.characterSprite) return;
        
        // Создаём эффект обесцвечивания (чёрно-белый фильтр)
        const colorMatrix = new PIXI.filters.ColorMatrixFilter();
        colorMatrix.desaturate(); // Делаем чёрно-белым
        
        // Применяем фильтр к спрайту
        target.characterSprite.filters = [colorMatrix];
        
        // Анимируем мигание (изменение интенсивности обесцвечивания)
        const blinkTween = gsap.to(colorMatrix.matrix, {
            0: 1.5, // Увеличиваем яркость
            6: 1.5, 
            12: 1.5,
            18: 1.5,
            duration: 0.3,
            repeat: Math.ceil(this.stunDuration * 2),
            yoyo: true,
            onUpdate: () => {
                // Обновляем фильтр при каждом изменении матрицы
                if (target.characterSprite) {
                    target.characterSprite.filters = [colorMatrix];
                }
            },
            onComplete: () => {
                // Сбрасываем фильтры после завершения анимации
                if (target.characterSprite) {
                    target.characterSprite.filters = null;
                }
            }
        });
        
        // Добавляем звездочки вокруг головы
        if (target.container) {
            const stunContainer = new PIXI.Container();
            target.container.addChild(stunContainer);
            
            // Добавляем звёздочки вокруг головы
            for (let i = 0; i < 4; i++) {
                const star = new PIXI.Graphics();
                const starAngle = (Math.PI * 2 / 4) * i;
                const starX = Math.cos(starAngle) * target.radius;
                const starY = Math.sin(starAngle) * target.radius - target.radius / 2;
                
                // Рисуем звезду
                star.beginFill(0xFFFF00);
                
                // Рисуем пятиконечную звезду
                const starSize = 5;
                const innerRadius = 2;
                
                star.moveTo(starX, starY - starSize);
                
                for (let j = 0; j < 5; j++) {
                    // Внешняя точка
                    const outerAngle = -Math.PI/2 + j * 2 * Math.PI / 5;
                    const outerX = starX + Math.cos(outerAngle) * starSize;
                    const outerY = starY + Math.sin(outerAngle) * starSize;
                    
                    // Внутренняя точка
                    const innerAngle = -Math.PI/2 + (j + 0.5) * 2 * Math.PI / 5;
                    const innerX = starX + Math.cos(innerAngle) * innerRadius;
                    const innerY = starY + Math.sin(innerAngle) * innerRadius;
                    
                    // Соединяем с внутренней точкой
                    star.lineTo(innerX, innerY);
                    
                    // Если это не последняя итерация
                    if (j < 4) {
                        const nextOuterAngle = -Math.PI/2 + (j + 1) * 2 * Math.PI / 5;
                        const nextOuterX = starX + Math.cos(nextOuterAngle) * starSize;
                        const nextOuterY = starY + Math.sin(nextOuterAngle) * starSize;
                        star.lineTo(nextOuterX, nextOuterY);
                    } else {
                        // Соединяем с начальной точкой для завершения звезды
                        star.lineTo(starX, starY - starSize);
                    }
                }
                
                star.endFill();
                
                stunContainer.addChild(star);
                
                // Анимируем вращение звезд
                gsap.to(star, {
                    rotation: Math.PI / 4,
                    duration: 3,
                    repeat: this.stunDuration,
                    ease: "none"
                });
            }
            
            // Удаляем звёздочки после окончания стана
            gsap.to(stunContainer, {
                alpha: 0,
                duration: 0.001,
                delay: this.stunDuration,
                onComplete: () => {
                    if (target.container && !target.container.destroyed && 
                        target.container.children.includes(stunContainer)) {
                        target.container.removeChild(stunContainer);
                    }
                }
            });
        }
        
        // Запоминаем твин для возможной отмены при преждевременном окончании стана
        target._stunBlinkTween = blinkTween;
    }
    
    createEffect() {
        // Проверяем, существует ли персонаж и его контейнер
        if (!this.character || !this.character.container) {
            console.warn("Character or container doesn't exist, cannot create fire circle effect");
            return;
        }
        
        // Проверяем, существует ли родительский контейнер
        if (!this.character.container.parent) {
            console.warn("Parent container doesn't exist, cannot add fire circle effect");
            return;
        }
        
        // Создаем контейнер для эффекта
        const effectContainer = new PIXI.Container();
        
        // Создаем основной огненный круг
        const fireCircle = new PIXI.Graphics();
        
        // Заполняем круг градиентом от красного к оранжевому с пониженной прозрачностью
        fireCircle.beginFill(0xFF0000, 0.1);  // Снижаем прозрачность для лучшей видимости
        fireCircle.drawCircle(0, 0, this.radius);
        fireCircle.endFill();
        
        fireCircle.beginFill(0xFF6600, 0.05);  // Снижаем прозрачность
        fireCircle.drawCircle(0, 0, this.radius * 0.7);
        fireCircle.endFill();
        
        // Добавляем языки пламени по периметру
        for (let i = 0; i < 16; i++) {
            const flameAngle = (Math.PI * 2 / 16) * i;
            const flame = new PIXI.Graphics();
            
            // Позиционируем пламя
            flame.x = Math.cos(flameAngle) * this.radius;
            flame.y = Math.sin(flameAngle) * this.radius;
            flame.rotation = flameAngle - Math.PI / 2;
            
            // Рисуем язык пламени с пониженной непрозрачностью
            flame.beginFill(0xFF3300, 0.3);  // Снижаем прозрачность
            flame.moveTo(0, 0);
            flame.lineTo(this.radius * 0.2, -this.radius * 0.3);
            flame.lineTo(0, -this.radius * 0.5);
            flame.lineTo(-this.radius * 0.2, -this.radius * 0.3);
            flame.endFill();
            
            // Добавляем внутренний цвет пламени
            flame.beginFill(0xFFFF00, 0.4);  // Снижаем прозрачность
            flame.moveTo(0, -this.radius * 0.1);
            flame.lineTo(this.radius * 0.1, -this.radius * 0.25);
            flame.lineTo(0, -this.radius * 0.4);
            flame.lineTo(-this.radius * 0.1, -this.radius * 0.25);
            flame.endFill();
            
            effectContainer.addChild(flame);
            
            // Анимируем колебание пламени
            gsap.to(flame.scale, {
                y: 1.2,
                duration: 0.5 + Math.random() * 0.3,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
        }
        
        // Добавляем дым/искры
        for (let i = 0; i < 20; i++) {
            const spark = new PIXI.Graphics();
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.radius * 0.8;
            
            spark.beginFill(0xFFCC00);
            spark.drawCircle(0, 0, 2 + Math.random() * 3);
            spark.endFill();
            
            spark.x = Math.cos(angle) * distance;
            spark.y = Math.sin(angle) * distance;
            
            effectContainer.addChild(spark);
            
            // Анимируем искры - они поднимаются и исчезают
            gsap.to(spark, {
                x: spark.x + (-10 + Math.random() * 20),
                y: spark.y - 30 - Math.random() * 30,
                alpha: 0,
                duration: 1 + Math.random(),
                repeat: Math.floor(this.duration / 1.5),
                ease: "power1.out",
                onComplete: () => {
                    // Возвращаем искру в исходное положение для повторной анимации
                    if (effectContainer && !effectContainer.destroyed && 
                        effectContainer.children.includes(spark)) {
                        spark.x = Math.cos(angle) * distance;
                        spark.y = Math.sin(angle) * distance;
                        spark.alpha = 1;
                    }
                }
            });
        }
        
        // Добавляем огненный круг в контейнер
        effectContainer.addChild(fireCircle);
        
        // Устанавливаем позицию эффекта ВОКРУГ МАГА
        effectContainer.position.set(this.character.x, this.character.y);
        
        // Устанавливаем режим наложения для более реалистичного эффекта
        effectContainer.blendMode = PIXI.BLEND_MODES.SCREEN;
        
        // Добавляем контейнер с эффектом на поле боя 
        const battlefield = this.character.container.parent;
        if (battlefield) {
            // ИСПРАВЛЕНИЕ: Добавляем эффект над ареной, но под персонажами
            // Находим индекс основной арены (обычно она первая в списке дочерних элементов)
            const battlefieldGraphicsIndex = battlefield.children.findIndex(
                child => child instanceof PIXI.Graphics && child.hitArea instanceof PIXI.Circle
            );
            
            if (battlefieldGraphicsIndex !== -1) {
                // Добавляем сразу после арены (индекс + 1)
                battlefield.addChildAt(effectContainer, battlefieldGraphicsIndex + 1);
            } else {
                // Если не нашли арену, просто добавим эффект с индексом 1
                // (это должно быть над ареной, но под персонажами)
                battlefield.addChildAt(effectContainer, 1);
            }
            
            // Анимируем появление эффекта
            gsap.from(effectContainer.scale, {
                x: 0.1, 
                y: 0.1,
                duration: 0.5,
                ease: "elastic.out"
            });
            
            // Добавляем пульсацию
            gsap.to(fireCircle, {
                alpha: 0.5,
                duration: 0.8,
                repeat: -1,
                yoyo: true
            });
            
            // Анимируем исчезновение эффекта после окончания действия
            gsap.to(effectContainer, {
                alpha: 0,
                duration: 0.2,
                delay: this.duration - 0.2,
                onComplete: () => {
                    if (battlefield && 
                        !battlefield.destroyed &&
                        battlefield.children.includes(effectContainer)) {
                        battlefield.removeChild(effectContainer);
                    }
                }
            });
        }
    }
    
    // Исправленный метод applyDamageOverTime для FireMageFireCircleAbility
    applyDamageOverTime(target, now) {
        // Проверяем, существует ли персонаж
        if (!this.character) {
            console.warn("Character doesn't exist, cannot apply damage over time");
            return;
        }
        
        // Проверяем, существуют ли персонажи для применения эффекта
        const characters = this.character.characters || [];
        if (!characters.length) {
            console.warn("No characters to apply effect to");
            return;
        }
        
        // Проверяем существование цели
        if (!target || typeof target.x !== 'number' || typeof target.y !== 'number') {
            console.warn("Target doesn't exist or has invalid coordinates");
            return;
        }
        
        const targetX = target.x;
        const targetY = target.y;
        const radius = this.radius;
        
        characters.forEach(char => {
            // Проверяем, что персонаж существует
            if (!char || !char.isAlive) return;
            
            // Пропускаем союзников
            if (char.team === this.character.team) return;
            
            // Проверяем, находится ли персонаж в радиусе действия
            const dx = char.x - targetX;
            const dy = char.y - targetY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius + char.radius) {
                // Применяем эффект периодического урона
                char.fireCircleDamage = {
                    until: now + this.duration,
                    dps: this.damage
                    }
                }
            });
        }
    }

// Экспортируем классы в глобальную область видимости
window.Ability = Ability;
window.WarriorChainsAbility = WarriorChainsAbility;
window.ArcherPowerShotAbility = ArcherPowerShotAbility;
window.AssassinDashAbility = AssassinDashAbility;
window.FireMageFireCircleAbility = FireMageFireCircleAbility;

// Проверка наличия Character в глобальном окружении
// и добавление методов после его полной загрузки
window.addEventListener('load', function() {
    // Дожидаемся полной загрузки всех скриптов
    setTimeout(function() {
        if (window.Character) {
            console.log("Character найден, добавляем методы способностей...");
            
            // Методы, которые не нужно добавлять, так как они уже есть в characters.js:
            // hasEnoughEnergy, spendEnergy, updateEnergyBar, createAbilityIndicator, updateAbilityIndicator
            
            // Исправляем метод performAttack, если необходимо
            // Важно: если вы не хотите переопределять этот метод, уберите этот код
            // window.Character.prototype.performAttack = performAttack;
        } else {
            console.error("Character не найден в глобальной области видимости");
        }
    }, 100);
});