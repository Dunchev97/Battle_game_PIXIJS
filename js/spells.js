// spells.js - файл для хранения всех заклинаний и их эффектов

// Класс для управления заклинаниями
window.SpellManager = class SpellManager {
    constructor(game) {
        this.game = game;
    }
    
    updateManaUI(currentMana, maxMana) {
        // Перенаправляем вызов в UI-менеджер, если он существует
        if (game && game.ui && typeof game.ui.updateManaUI === 'function') {
            game.ui.updateManaUI(currentMana, maxMana);
        }
    }

    // Методы эффектов заклинаний (переместите сюда все методы из UI)
    // Визуальный эффект лечения
createHealingEffect(x, y) {
    // Создаем контейнер для эффекта
    const effectContainer = new PIXI.Container();
    effectContainer.position.set(x, y);
    game.battlefield.container.addChild(effectContainer);
    
    // Создаем эффект свечения
    const glow = new PIXI.Graphics();
    glow.beginFill(0x00FF00, 0.5);
    glow.drawCircle(0, 0, 50);
    glow.endFill();
    effectContainer.addChild(glow);
    
    // Анимация увеличения и исчезновения
    gsap.to(glow.scale, {
        x: 1.5,
        y: 1.5,
        duration: 1,
        ease: "power2.out"
    });
    
    gsap.to(glow, {
        alpha: 0,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
            if (effectContainer.parent) {
                effectContainer.parent.removeChild(effectContainer);
            }
        }
    });
    
    // Добавляем частицы исцеления (зеленые плюсики)
    for (let i = 0; i < 10; i++) {
        const particle = new PIXI.Text("+", {
            fontFamily: "Arial",
            fontSize: 24,
            fill: 0x00FF00,
            fontWeight: "bold"
        });
        
        particle.anchor.set(0.5);
        particle.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30
        );
        
        effectContainer.addChild(particle);
        
        // Анимируем частицы
        gsap.to(particle, {
            y: particle.y - 50,
            alpha: 0,
            duration: 1 + Math.random() * 0.5,
            ease: "power1.out"
        });
    }
}
createStormEffect(x, y) {
    // Создаем контейнер для эффекта
    const effectContainer = new PIXI.Container();
    effectContainer.position.set(x, y);
    game.battlefield.container.addChild(effectContainer);
    
    // Создаем эффект бури (вихрь)
    const storm = new PIXI.Graphics();
    storm.beginFill(0x00FFFF, 0.3);
    storm.drawCircle(0, 0, 200);
    storm.endFill();
    effectContainer.addChild(storm);
    
    // Добавляем анимацию вращения
    gsap.to(storm, {
        rotation: Math.PI * 4,
        duration: 1.5,
        ease: "power2.inOut"
    });
    
    // Удаляем эффект через определенное время
    setTimeout(() => {
        if (effectContainer.parent) {
            effectContainer.parent.removeChild(effectContainer);
        }
    }, 1500);
    
    // Логика притягивания персонажей к центру
    const characters = game.battlefield.characters;
    if (characters) {
        characters.forEach(char => {
            if (!char.isAlive) return;
            
            // Рассчитываем расстояние до центра бури
            const dx = char.x - x;
            const dy = char.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Если персонаж в зоне действия
            if (distance <= 200 + char.radius) {
                // Рассчитываем вектор притяжения
                const pullStrength = 0.2; // Сила притяжения
                const pullX = dx * pullStrength;
                const pullY = dy * pullStrength;
                
                // Устанавливаем позицию ближе к центру
                gsap.to(char, {
                    x: char.x - pullX,
                    y: char.y - pullY,
                    duration: 1.5,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        // Обновляем позицию контейнера
                        if (char.container) {
                            char.container.position.set(char.x, char.y);
                        }
                    }
                });
            }
        });
    }
}
createWindArrowEffect(startX, startY, endX, endY) {
    // Рассчитываем вектор движения стрелы
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx);
    
    // Находим точку на границе боевой арены как начало стрелы
    // Центр арены
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;
    
    // Расстояние от центра до начальной точки
    const distFromCenterStart = Math.sqrt(
        (startX - centerX) * (startX - centerX) + 
        (startY - centerY) * (startY - centerY)
    );
    
    // Если начальная точка внутри арены, корректируем ее на границу
    let actualStartX = startX;
    let actualStartY = startY;
    
    if (distFromCenterStart < BATTLEFIELD_RADIUS) {
        // Находим угол к начальной точке от центра
        const angleToStart = Math.atan2(startY - centerY, startX - centerX);
        
        // Корректируем начальную точку на границу арены
        actualStartX = centerX + Math.cos(angleToStart) * BATTLEFIELD_RADIUS;
        actualStartY = centerY + Math.sin(angleToStart) * BATTLEFIELD_RADIUS;
    }
    
    // Создаем контейнер для стрелы
    const arrowContainer = new PIXI.Container();
    arrowContainer.position.set(actualStartX, actualStartY);
    arrowContainer.rotation = angle;
    game.battlefield.container.addChild(arrowContainer);
    
    // Создаем стрелу
    const arrow = new PIXI.Graphics();
    
    // Стрела с "перьями"
    arrow.beginFill(0x00FF00, 0.7); // Зеленый полупрозрачный
    arrow.moveTo(0, 0);
    arrow.lineTo(30, -10);
    arrow.lineTo(100, -5);
    arrow.lineTo(30, 0);
    arrow.lineTo(100, 5);
    arrow.lineTo(30, 10);
    arrow.lineTo(0, 0);
    arrow.endFill();
    
    arrowContainer.addChild(arrow);
    
    // Добавляем эффект ветра вокруг стрелы
    const windEffect = new PIXI.Graphics();
    windEffect.beginFill(0xCCFFCC, 0.3);
    windEffect.drawEllipse(50, 0, 80, 20);
    windEffect.endFill();
    
    arrowContainer.addChildAt(windEffect, 0); // Добавляем под стрелу
    
    // Анимация движения стрелы
    const arrowSpeed = 15; // пикселей в кадр
    const maxDistance = BATTLEFIELD_RADIUS * 2; // максимальное расстояние полета (диаметр арены)
    let distanceTraveled = 0;
    
    // Переменные для отслеживания положения стрелы
    let currentX = actualStartX;
    let currentY = actualStartY;
    
    // Определяем, попала ли стрела в кого-то
    let hitTarget = false;
    
    // Функция обновления положения стрелы
    const updateArrow = () => {
        // Если стрела уже попала в цель, останавливаем анимацию
        if (hitTarget) {
            cancelAnimationFrame(animationId);
            return;
        }
        
        // Рассчитываем новую позицию
        currentX += Math.cos(angle) * arrowSpeed;
        currentY += Math.sin(angle) * arrowSpeed;
        arrowContainer.position.set(currentX, currentY);
        
        // Обновляем пройденное расстояние
        distanceTraveled += arrowSpeed;
        
        // Проверяем столкновение с персонажами
        const characters = game.battlefield.characters;
        if (characters) {
            for (let i = 0; i < characters.length; i++) {
                const char = characters[i];
                if (!char.isAlive) continue;
                
                // Рассчитываем расстояние от стрелы до персонажа
                const dx = char.x - currentX;
                const dy = char.y - currentY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Если стрела попала в персонажа (любая команда)
                if (distance <= char.radius) {
                    // Наносим урон
                    char.takeDamage(80, null);
                    
                    // Создаем эффект попадания
                    this.createWindImpactEffect(char.x, char.y);
                    
                    // Удаляем стрелу
                    if (arrowContainer.parent) {
                        arrowContainer.parent.removeChild(arrowContainer);
                    }
                    
                    hitTarget = true;
                    cancelAnimationFrame(animationId);
                    return;
                }
            }
        }
        
        // Проверяем, достигла ли стрела максимального расстояния или края поля боя
        const distFromCenter = Math.sqrt(
            (currentX - centerX) * (currentX - centerX) + 
            (currentY - centerY) * (currentY - centerY)
        );
        
        if (distanceTraveled >= maxDistance || distFromCenter >= BATTLEFIELD_RADIUS) {
            // Удаляем стрелу
            if (arrowContainer.parent) {
                arrowContainer.parent.removeChild(arrowContainer);
            }
            
            cancelAnimationFrame(animationId);
            return;
        }
        
        // Продолжаем анимацию
        animationId = requestAnimationFrame(updateArrow);
    };
    
    // Запускаем анимацию
    let animationId = requestAnimationFrame(updateArrow);
}

// Эффект попадания стрелы ветра
createWindImpactEffect(x, y) {
    // Создаем контейнер для эффекта
    const impactContainer = new PIXI.Container();
    impactContainer.position.set(x, y);
    game.battlefield.container.addChild(impactContainer);
    
    // Создаем эффект взрыва ветра
    const impact = new PIXI.Graphics();
    impact.beginFill(0x00FF00, 0.5);
    impact.drawCircle(0, 0, 50);
    impact.endFill();
    impactContainer.addChild(impact);
    
    // Анимация расширения и исчезновения
    gsap.to(impact.scale, {
        x: 2,
        y: 2,
        duration: 0.5,
        ease: "power1.out"
    });
    
    gsap.to(impact, {
        alpha: 0,
        duration: 0.5,
        ease: "power1.out",
        onComplete: () => {
            if (impactContainer.parent) {
                impactContainer.parent.removeChild(impactContainer);
            }
        }
    });
    
    // Добавляем частицы разлетающегося ветра
    for (let i = 0; i < 20; i++) {
        const particle = new PIXI.Graphics();
        particle.beginFill(0x00FF00, 0.7);
        particle.drawCircle(0, 0, 2 + Math.random() * 3);
        particle.endFill();
        
        // Размещаем вокруг точки удара
        particle.position.set(0, 0);
        
        impactContainer.addChild(particle);
        
        // Анимация разлета частиц
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 70;
        
        gsap.to(particle, {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            alpha: 0,
            duration: 0.5,
            ease: "power1.out"
        });
    }
}
createSubordinationEffect(character) {
    if (!character || !character.container) return;
    
    // Создаем контейнер для эффекта и прикрепляем непосредственно к контейнеру персонажа
    const effectContainer = new PIXI.Container();
    character.container.addChild(effectContainer);
    
    // Создаем эффект свечения вокруг персонажа
    const glow = new PIXI.Graphics();
    glow.beginFill(0xFF00FF, 0.5); // фиолетовое свечение
    glow.drawCircle(0, 0, character.radius * 1.2);
    glow.endFill();
    effectContainer.addChild(glow);
    
    // Создаем круговые символы контроля
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i;
        const symbolRadius = character.radius * 1.5;
        
        const symbol = new PIXI.Graphics();
        symbol.beginFill(0xFF00FF);
        symbol.drawCircle(0, 0, 5);
        symbol.endFill();
        
        symbol.position.set(
            Math.cos(angle) * symbolRadius,
            Math.sin(angle) * symbolRadius
        );
        
        effectContainer.addChild(symbol);
        
        // Анимация вращения для каждого символа
        gsap.to(symbol, {
            rotation: Math.PI * 2,
            duration: 4,
            repeat: 1,
            ease: "none"
        });
    }
    
    // Анимация пульсации свечения
    gsap.to(glow, {
        alpha: 0.2,
        duration: 0.8,
        repeat: 5,
        yoyo: true,
        ease: "power1.inOut"
    });
    
    // Удаляем эффект через 4 секунды
    setTimeout(() => {
        if (effectContainer.parent) {
            effectContainer.parent.removeChild(effectContainer);
        }
    }, 4000);
    
    // Добавляем фиолетовый оттенок персонажу
    if (character.characterSprite) {
        const colorMatrix = createColorMatrix ? createColorMatrix() : new PIXI.filters.ColorMatrixFilter();
        colorMatrix.tint(0xFF00FF, 0.5); // Фиолетовый оттенок
        
        // Сохраняем оригинальные фильтры
        const originalFilters = character.characterSprite.filters || [];
        
        // Применяем фильтр
        character.characterSprite.filters = [...originalFilters, colorMatrix];
        
        // Сбрасываем фильтр через 4 секунды
        setTimeout(() => {
            if (character && character.characterSprite) {
                character.characterSprite.filters = originalFilters;
            }
        }, 4000);
    }
}

// Визуальный эффект Разложения
createDecompositionEffect(character) {
    if (!character || !character.container) return;
    
    // Создаем контейнер для эффекта и прикрепляем к контейнеру персонажа
    const effectContainer = new PIXI.Container();
    character.container.addChild(effectContainer);
    
    // Создаем эффект свечения вокруг персонажа
    const glow = new PIXI.Graphics();
    glow.beginFill(0xAA00AA, 0.5); // темно-фиолетовое свечение
    glow.drawCircle(0, 0, character.radius * 1.2);
    glow.endFill();
    effectContainer.addChild(glow);
    
    // Создаем частицы разложения
    for (let i = 0; i < 20; i++) {
        const particle = new PIXI.Graphics();
        particle.beginFill(0xAA00AA);
        particle.drawCircle(0, 0, 2 + Math.random() * 3);
        particle.endFill();
        
        // Размещаем частицы вокруг персонажа
        const angle = Math.random() * Math.PI * 2;
        const radius = character.radius * Math.random();
        
        particle.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
        );
        
        effectContainer.addChild(particle);
        
        // Анимируем частицы
        gsap.to(particle, {
            x: particle.x + (Math.random() - 0.5) * 20,
            y: particle.y + (Math.random() - 0.5) * 20,
            alpha: 0,
            duration: 1 + Math.random(),
            repeat: 4,
            ease: "power1.inOut"
        });
    }
    
    // Удаляем эффект через 4 секунды
    setTimeout(() => {
        if (effectContainer.parent) {
            effectContainer.parent.removeChild(effectContainer);
        }
    }, 4000);
    
    // Добавляем фиолетовый оттенок персонажу
    if (character.characterSprite) {
        const colorMatrix = createColorMatrix ? createColorMatrix() : new PIXI.filters.ColorMatrixFilter();
        colorMatrix.tint(0xAA00AA, 0.5); // Фиолетовый оттенок
        
        // Сохраняем оригинальные фильтры
        const originalFilters = character.characterSprite.filters || [];
        
        // Применяем фильтр
        character.characterSprite.filters = [...originalFilters, colorMatrix];
        
        // Сбрасываем фильтр через 4 секунды
        setTimeout(() => {
            if (character && character.characterSprite) {
                character.characterSprite.filters = originalFilters;
            }
        }, 4000);
    }
}

// Визуальный эффект Мин
createMinesEffect() {
    // Создаем 3 мины в случайных местах
    for (let i = 0; i < 3; i++) {
        // Случайная позиция в пределах арены
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (BATTLEFIELD_RADIUS - 50);
        
        const x = GAME_WIDTH / 2 + Math.cos(angle) * radius;
        const y = GAME_HEIGHT / 2 + Math.sin(angle) * radius;
        
        // Создаем контейнер для мины
        const mineContainer = new PIXI.Container();
        mineContainer.position.set(x, y);
        game.battlefield.container.addChild(mineContainer);
        
        // Рисуем мину
        const mine = new PIXI.Graphics();
        mine.beginFill(0xFF00FF); // Фиолетовый
        mine.drawCircle(0, 0, 15);
        mine.endFill();
        
        // Рисуем узор на мине
        mine.lineStyle(2, 0xFFFFFF);
        mine.moveTo(-7, -7);
        mine.lineTo(7, 7);
        mine.moveTo(7, -7);
        mine.lineTo(-7, 7);
        
        mineContainer.addChild(mine);
        
        // Добавляем пульсацию
        gsap.to(mine.scale, {
            x: 1.2,
            y: 1.2,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
        
        // Добавляем область детекции врагов
        const detectionRadius = 100;
        
        // Создаем невидимую область обнаружения
        const detectionArea = new PIXI.Graphics();
        detectionArea.beginFill(0xFF00FF, 0);
        detectionArea.drawCircle(0, 0, detectionRadius);
        detectionArea.endFill();
        mineContainer.addChild(detectionArea);
        
        // Добавляем логику детекции врагов
        const checkEnemies = () => {
            const characters = game.battlefield.characters;
            
            if (!characters) return;
            
            for (let j = 0; j < characters.length; j++) {
                const character = characters[j];
                
                if (!character || !character.isAlive || character.team === TEAMS.PLAYER) continue;
                
                // Рассчитываем расстояние
                const dx = character.x - x;
                const dy = character.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Если враг в зоне действия, активируем мину
                if (distance <= detectionRadius + character.radius) {
                    // Останавливаем проверку
                    clearInterval(detectionInterval);
                    
                    // Активируем мину
                    this.activateMine(x, y);
                    
                    // Наносим урон всем персонажам в радиусе взрыва
                    const explosionRadius = 150;
                    
                    for (let k = 0; k < characters.length; k++) {
                        const targetChar = characters[k];
                        
                        if (!targetChar || !targetChar.isAlive) continue;
                        
                        // Рассчитываем расстояние
                        const tdx = targetChar.x - x;
                        const tdy = targetChar.y - y;
                        const tDistance = Math.sqrt(tdx * tdx + tdy * tdy);
                        
                        // Если персонаж в зоне взрыва
                        if (tDistance <= explosionRadius + targetChar.radius) {
                            // Наносим урон
                            targetChar.takeDamage(80, null);
                        }
                    }
                    
                    // Удаляем мину
                    if (mineContainer.parent) {
                        mineContainer.parent.removeChild(mineContainer);
                    }
                    
                    break;
                }
            }
        };
        
        // Проверяем врагов каждые 100 мс
        const detectionInterval = setInterval(checkEnemies, 100);
        
        // Через 30 секунд уничтожаем мину, если она не взорвалась
        setTimeout(() => {
            clearInterval(detectionInterval);
            
            if (mineContainer.parent) {
                gsap.to(mineContainer, {
                    alpha: 0,
                    duration: 0.5,
                    onComplete: () => {
                        if (mineContainer.parent) {
                            mineContainer.parent.removeChild(mineContainer);
                        }
                    }
                });
            }
        }, 30000);
    }
}
// Активация мины
activateMine(x, y) {
    // Создаем эффект взрыва
    const explosionContainer = new PIXI.Container();
    explosionContainer.position.set(x, y);
    game.battlefield.container.addChild(explosionContainer);
    
    // Основное свечение
    const glow = new PIXI.Graphics();
    glow.beginFill(0xFF00FF, 0.7);
    glow.drawCircle(0, 0, 150);
    glow.endFill();
    explosionContainer.addChild(glow);
    
    // Анимация взрыва
    gsap.from(glow.scale, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "back.out(2)"
    });
    
    gsap.to(glow, {
        alpha: 0,
        duration: 0.5,
        delay: 0.3,
        onComplete: () => {
            if (explosionContainer.parent) {
                explosionContainer.parent.removeChild(explosionContainer);
            }
        }
    });
    
    // Добавляем частицы взрыва
    for (let i = 0; i < 20; i++) {
        const particle = new PIXI.Graphics();
        particle.beginFill(0xFF00FF);
        particle.drawCircle(0, 0, 3 + Math.random() * 5);
        particle.endFill();
        
        // Начальная позиция
        particle.position.set(0, 0);
        
        explosionContainer.addChild(particle);
        
        // Анимация разлета частиц
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 100;
        
        gsap.to(particle, {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            alpha: 0,
            duration: 0.5 + Math.random() * 0.5,
            ease: "power1.out"
        });
    }
}

// Визуальный эффект Армагеддона
createArmageddonEffect() {
    // Создаем 3 метеорита
    for (let i = 0; i < 3; i++) {
        // Случайная позиция в пределах арены, но немного над ареной
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (BATTLEFIELD_RADIUS - 100);
        
        const targetX = GAME_WIDTH / 2 + Math.cos(angle) * radius;
        const targetY = GAME_HEIGHT / 2 + Math.sin(angle) * radius;
        
        // Начальная позиция метеорита (высоко над целью)
        const startX = targetX - 300 + Math.random() * 600;
        const startY = targetY - 500; // Начинаем выше арены
        
        // Создаем контейнер для метеорита
        const meteorContainer = new PIXI.Container();
        meteorContainer.position.set(startX, startY);
        game.battlefield.container.addChild(meteorContainer);
        
        // Рисуем метеорит
        const meteor = new PIXI.Graphics();
        meteor.beginFill(0xFF6600);
        meteor.drawCircle(0, 0, 20);
        meteor.endFill();
        
        // Добавляем след
        const trail = new PIXI.Graphics();
        trail.beginFill(0xFF8800, 0.5);
        trail.drawRect(-10, 0, 20, 60);
        trail.endFill();
        trail.rotation = Math.PI / 2; // Направление следа
        
        meteorContainer.addChild(trail);
        meteorContainer.addChild(meteor);
        
        // Анимация падения метеорита
        gsap.to(meteorContainer, {
            x: targetX,
            y: targetY,
            duration: 1,
            ease: "power1.in",
            onComplete: () => {
                // Создаем эффект взрыва
                this.createMeteorExplosion(targetX, targetY);
                
                // Удаляем метеорит
                if (meteorContainer.parent) {
                    meteorContainer.parent.removeChild(meteorContainer);
                }
                
                // Наносим урон всем персонажам в радиусе взрыва
                const characters = game.battlefield.characters;
                const explosionRadius = 150;
                
                if (characters) {
                    characters.forEach(char => {
                        if (!char.isAlive) return;
                        
                        // Рассчитываем расстояние
                        const dx = char.x - targetX;
                        const dy = char.y - targetY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        // Если персонаж в зоне взрыва
                        if (distance <= explosionRadius + char.radius) {
                            // Наносим урон
                            char.takeDamage(50, null);
                        }
                    });
                }
            }
        });
        
        // Анимация следа
        gsap.to(trail, {
            alpha: 0.2,
            duration: 0.3,
            repeat: 3,
            yoyo: true
        });
        
        // Задержка между метеоритами
        if (i < 2) {
            setTimeout(() => {}, 300 * (i + 1));
        }
    }
}

// Эффект взрыва метеорита
createMeteorExplosion(x, y) {
    // Создаем контейнер для эффекта взрыва
    const explosionContainer = new PIXI.Container();
    explosionContainer.position.set(x, y);
    game.battlefield.container.addChild(explosionContainer);
    
    // Основное свечение
    const glow = new PIXI.Graphics();
    glow.beginFill(0xFF3300, 0.7);
    glow.drawCircle(0, 0, 150);
    glow.endFill();
    explosionContainer.addChild(glow);
    
    // Анимация взрыва
    gsap.from(glow.scale, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "back.out(2)"
    });
    
    gsap.to(glow, {
        alpha: 0,
        duration: 0.5,
        delay: 0.3,
        onComplete: () => {
            if (explosionContainer.parent) {
                explosionContainer.parent.removeChild(explosionContainer);
            }
        }
    });
    
    // Добавляем частицы взрыва
    for (let i = 0; i < 30; i++) {
        const particle = new PIXI.Graphics();
        particle.beginFill(0xFF3300);
        particle.drawCircle(0, 0, 3 + Math.random() * 5);
        particle.endFill();
        
        // Начальная позиция
        particle.position.set(0, 0);
        
        explosionContainer.addChild(particle);
        
        // Анимация разлета частиц
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 100;
        
        gsap.to(particle, {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            alpha: 0,
            duration: 0.5 + Math.random() * 0.5,
            ease: "power1.out"
        });
    }
}
// Визуальный эффект Стены огня
createWallOfFireEffect(startX, startY, endX, endY) {
    // Рассчитываем вектор стены
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // Ограничиваем длину стены до 400
    const maxLength = 400;
    const actualLength = Math.min(length, maxLength);
    
    // Создаем контейнер для стены
    const wallContainer = new PIXI.Container();
    wallContainer.position.set(startX, startY);
    wallContainer.rotation = angle;
    game.battlefield.container.addChild(wallContainer);
    
    // Создаем эффект стены огня
    const wall = new PIXI.Graphics();
    wall.beginFill(0xFF6600, 0.7);
    wall.drawRect(0, -20, actualLength, 40);
    wall.endFill();
    wallContainer.addChild(wall);
    
    // Добавляем частицы огня
    for (let i = 0; i < actualLength / 20; i++) {
        // Создаем огненную частицу
        const fire = new PIXI.Graphics();
        fire.beginFill(0xFF9900, 0.7);
        fire.drawCircle(0, 0, 15);
        fire.endFill();
        
        // Добавляем ядро пламени
        fire.beginFill(0xFFFF00, 0.8);
        fire.drawCircle(0, 0, 5);
        fire.endFill();
        
        // Размещаем вдоль стены
        fire.position.set(i * 20 + 10, 0);
        
        wallContainer.addChild(fire);
        
        // Анимация пламени
        gsap.to(fire.scale, {
            x: 0.8 + Math.random() * 0.4,
            y: 0.8 + Math.random() * 0.4,
            duration: 0.3 + Math.random() * 0.3,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
    }
    
    // Логика нанесения урона
    let wallActive = true;
    const wallDamageInterval = setInterval(() => {
        if (!wallActive) {
            clearInterval(wallDamageInterval);
            return;
        }
        
        // Проверяем всех персонажей
        const characters = game.battlefield.characters;
        if (!characters) return;
        
        characters.forEach(char => {
            if (!char.isAlive) return;
            
            // Используем простой алгоритм для определения расстояния от точки до линии
            // Вычисляем проекцию вектора "персонаж-начало стены" на направление стены
            const charToWallStartX = char.x - startX;
            const charToWallStartY = char.y - startY;
            
            // Нормализуем вектор направления стены
            const wallDirX = dx / length;
            const wallDirY = dy / length;
            
            // Скалярное произведение = проекция
            const projection = charToWallStartX * wallDirX + charToWallStartY * wallDirY;
            
            // Ограничиваем проекцию длиной стены
            const clampedProjection = Math.max(0, Math.min(actualLength, projection));
            
            // Точка на стене, ближайшая к персонажу
            const nearestPointX = startX + wallDirX * clampedProjection;
            const nearestPointY = startY + wallDirY * clampedProjection;
            
            // Вычисляем расстояние от персонажа до ближайшей точки
            const distToWallX = char.x - nearestPointX;
            const distToWallY = char.y - nearestPointY;
            const distanceToWall = Math.sqrt(distToWallX * distToWallX + distToWallY * distToWallY);
            
            // Если персонаж находится в радиусе действия стены
            if (distanceToWall <= 100) {
                // Наносим урон
                char.takeDamage(40, null); // 40 урона в секунду
            }
        });
    }, 1000); // Проверяем каждую секунду
    
    // Удаляем стену через 3 секунды
    setTimeout(() => {
        wallActive = false;
        
        // Анимация исчезновения
        gsap.to(wallContainer, {
            alpha: 0,
            duration: 0.5,
            onComplete: () => {
                if (wallContainer.parent) {
                    wallContainer.parent.removeChild(wallContainer);
                }
                
                // Останавливаем интервал проверки урона
                clearInterval(wallDamageInterval);
            }
        });
    }, 3000);
}
// Визуальный эффект Извержения
createEruptionEffect(x, y) {
    // Создаем контейнер для эффекта
    const effectContainer = new PIXI.Container();
    effectContainer.position.set(x, y);
    game.battlefield.container.addChild(effectContainer);
    
    // Создаем индикатор предстоящего извержения
    const warningCircle = new PIXI.Graphics();
    warningCircle.lineStyle(3, 0xFF0000);
    warningCircle.drawCircle(0, 0, 200);
    effectContainer.addChild(warningCircle);
    
    // Добавляем текст с обратным отсчетом
    const countdownText = new PIXI.Text("4", {
        fontFamily: "Arial",
        fontSize: 48,
        fill: 0xFF0000,
        fontWeight: "bold"
    });
    countdownText.anchor.set(0.5);
    effectContainer.addChild(countdownText);
    
    // Обратный отсчет
    let countdown = 4;
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownText.text = countdown.toString();
        } else {
            // При достижении нуля, очищаем интервал и запускаем извержение
            clearInterval(countdownInterval);
            countdownText.text = "";
            
            // Запускаем извержение
            this.triggerEruption(x, y, effectContainer);
        }
    }, 1000);
    
    // Пульсация предупреждения
    gsap.to(warningCircle, {
        alpha: 0.3,
        duration: 0.5,
        repeat: 7,
        yoyo: true
    });
}
// Запуск извержения
triggerEruption(x, y, container) {
    // Удаляем все предыдущие элементы из контейнера
    container.removeChildren();
    
    // Создаем эффект взрыва
    const explosion = new PIXI.Graphics();
    explosion.beginFill(0xFF3300, 0.8);
    explosion.drawCircle(0, 0, 200);
    explosion.endFill();
    
    // Добавляем внутренний круг
    explosion.beginFill(0xFF9900, 0.9);
    explosion.drawCircle(0, 0, 150);
    explosion.endFill();
    
    // Добавляем ядро извержения
    explosion.beginFill(0xFFFF00, 1);
    explosion.drawCircle(0, 0, 75);
    explosion.endFill();
    
    container.addChild(explosion);
    
    // Анимация взрыва
    gsap.from(explosion.scale, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "back.out(2)"
    });
    
    // Добавляем частицы извержения
    for (let i = 0; i < 50; i++) {
        const particle = new PIXI.Graphics();
        
        // Случайный размер и цвет
        const size = 5 + Math.random() * 10;
        const colorChoice = Math.random();
        
        if (colorChoice < 0.33) {
            particle.beginFill(0xFF3300); // Красный
        } else if (colorChoice < 0.66) {
            particle.beginFill(0xFF9900); // Оранжевый
        } else {
            particle.beginFill(0xFFFF00); // Желтый
        }
        
        particle.drawCircle(0, 0, size);
        particle.endFill();
        
        // Начальная позиция в центре
        particle.position.set(0, 0);
        
        container.addChild(particle);
          // Анимация разлета частиц
          const angle = Math.random() * Math.PI * 2;
          const distance = 150 + Math.random() * 250;
          
          gsap.to(particle, {
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              alpha: 0,
              duration: 0.5 + Math.random() * 0.7,
              ease: "power1.out"
          });
      }
      
      // Наносим урон всем персонажам в радиусе взрыва
      const characters = game.battlefield.characters;
      if (characters) {
          characters.forEach(char => {
              if (!char.isAlive) return;
              
              // Рассчитываем расстояние
              const dx = char.x - x;
              const dy = char.y - y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              // Если персонаж в зоне взрыва
              if (distance <= 200 + char.radius) {
                  // Наносим урон
                  char.takeDamage(100, null);
              }
          });
      }
      
      // Удаляем эффект через некоторое время
      setTimeout(() => {
          gsap.to(container, {
              alpha: 0,
              duration: 0.7,
              onComplete: () => {
                  if (container.parent) {
                      container.parent.removeChild(container);
                  }
              }
          });
      }, 1500);
  }
// Визуальный эффект Области льда
createIceAreaEffect(x, y) {
    // Создаем контейнер для эффекта
    const effectContainer = new PIXI.Container();
    effectContainer.position.set(x, y);
    game.battlefield.container.addChild(effectContainer);
    
    // Создаем ледяную область
    const iceArea = new PIXI.Graphics();
    iceArea.beginFill(0x00FFFF, 0.3);
    iceArea.drawCircle(0, 0, 200);
    iceArea.endFill();
    effectContainer.addChild(iceArea);
    
    // Добавляем рисунок льда (снежинки и кристаллы)
    for (let i = 0; i < 20; i++) {
        // Создаем кристалл льда
        const crystal = new PIXI.Graphics();
        crystal.beginFill(0x00FFFF, 0.7);
        
        // Форма снежинки или кристалла
        const size = 5 + Math.random() * 10;
        
        // С вероятностью выбираем форму
        if (Math.random() < 0.5) {
            // Кристалл
            crystal.moveTo(0, -size);
            crystal.lineTo(size, 0);
            crystal.lineTo(0, size);
            crystal.lineTo(-size, 0);
            crystal.lineTo(0, -size);
        } else {
            // Упрощенная снежинка
            crystal.moveTo(0, -size);
            crystal.lineTo(0, size);
            crystal.moveTo(-size, 0);
            crystal.lineTo(size, 0);
            crystal.moveTo(-size * 0.7, -size * 0.7);
            crystal.lineTo(size * 0.7, size * 0.7);
            crystal.moveTo(-size * 0.7, size * 0.7);
            crystal.lineTo(size * 0.7, -size * 0.7);
        }
        
        crystal.endFill();
        
        // Размещаем случайно в пределах области
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 190;
        
        crystal.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
        );
        
        // Случайное вращение
        crystal.rotation = Math.random() * Math.PI * 2;
        
        effectContainer.addChild(crystal);
        
        // Добавляем анимацию мерцания
        gsap.to(crystal, {
            alpha: 0.3,
            duration: 0.5 + Math.random() * 0.5,
            repeat: 8,
            yoyo: true
        });
    }
    
    // Область замедления (логика)
    let iceActive = true;
    const slowDownInterval = setInterval(() => {
        if (!iceActive) {
            clearInterval(slowDownInterval);
            return;
        }
        
        // Применяем замедление ко всем персонажам в области
        const characters = game.battlefield.characters;
        if (!characters) return;
        
        characters.forEach(char => {
            if (!char.isAlive) return;
            
            // Рассчитываем расстояние
            const dx = char.x - x;
            const dy = char.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Если персонаж в ледяной области
            if (distance <= 200 + char.radius) {
                // Применяем замедление
                if (!char._originalMoveSpeed) {
                    char._originalMoveSpeed = char.moveSpeed;
                    char.moveSpeed /= 2; // Замедляем в 2 раза
                }
            } else if (char._originalMoveSpeed) {
                // Возвращаем обычную скорость, если персонаж вышел из области
                char.moveSpeed = char._originalMoveSpeed;
                delete char._originalMoveSpeed;
            }
        });
    }, 100);
    
    // Удаляем эффект через 4 секунды
    setTimeout(() => {
        iceActive = false;
        
        // Возвращаем скорость всем персонажам
        const characters = game.battlefield.characters;
        if (characters) {
            characters.forEach(char => {
                if (char._originalMoveSpeed) {
                    char.moveSpeed = char._originalMoveSpeed;
                    delete char._originalMoveSpeed;
                }
            });
        }
        
        // Анимация таяния
        gsap.to(effectContainer, {
            alpha: 0,
            duration: 0.7,
            onComplete: () => {
                if (effectContainer.parent) {
                    effectContainer.parent.removeChild(effectContainer);
                }
            }
        });
    }, 4000);
}
// Визуальный эффект Стены льда
// Исправляем createIceWallEffect:
createIceWallEffect(startX, startY, endX, endY) {
    // Рассчитываем вектор стены
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // Ограничиваем длину стены до 400
    const maxLength = 400;
    const actualLength = Math.min(length, maxLength);
    
    // Создаем контейнер для стены
    const wallContainer = new PIXI.Container();
    wallContainer.position.set(startX, startY);
    wallContainer.rotation = angle;
    game.battlefield.container.addChild(wallContainer);
    
    // Создаем эффект ледяной стены
    const wall = new PIXI.Graphics();
    wall.beginFill(0x00FFFF, 0.5);
    wall.drawRect(0, -30, actualLength, 60);
    wall.endFill();
    wallContainer.addChild(wall);
    
    // Добавляем кристаллы льда
    for (let i = 0; i < actualLength / 30; i++) {
        // Создаем ледяной кристалл
        const crystal = new PIXI.Graphics();
        crystal.beginFill(0x00FFFF, 0.7);
        
        // Рисуем кристалл (треугольник)
        crystal.moveTo(0, -30);
        crystal.lineTo(15, 0);
        crystal.lineTo(0, 30);
        crystal.lineTo(-15, 0);
        crystal.lineTo(0, -30);
        
        crystal.endFill();
        
        // Размещаем вдоль стены
        crystal.position.set(i * 30 + 15, 0);
        
        // Случайное вращение
        crystal.rotation = (Math.random() - 0.5) * 0.5;
        
        wallContainer.addChild(crystal);
    }
    
    // Логика замораживания персонажей
    // Проверяем каждые 100 мс для плавного обнаружения
    let wallActive = true;
    const freezeCheckInterval = setInterval(() => {
        if (!wallActive) {
            clearInterval(freezeCheckInterval);
            return;
        }
        
        // Проверяем всех персонажей
        const characters = game.battlefield.characters;
        if (!characters) return;
        
        characters.forEach(char => {
            if (!char.isAlive || char._frozenByWall) return;
            
            // Тот же алгоритм определения расстояния, что и для стены огня
            const charToWallStartX = char.x - startX;
            const charToWallStartY = char.y - startY;
            
            const wallDirX = dx / length;
            const wallDirY = dy / length;
            
            const projection = charToWallStartX * wallDirX + charToWallStartY * wallDirY;
            const clampedProjection = Math.max(0, Math.min(actualLength, projection));
            
            const nearestPointX = startX + wallDirX * clampedProjection;
            const nearestPointY = startY + wallDirY * clampedProjection;
            
            const distToWallX = char.x - nearestPointX;
            const distToWallY = char.y - nearestPointY;
            const distanceToWall = Math.sqrt(distToWallX * distToWallX + distToWallY * distToWallY);
            
            // Если персонаж находится в радиусе действия стены
            if (distanceToWall <= 100) {
                // Отмечаем, что персонаж заморожен этой стеной
                char._frozenByWall = true;
                
                // Замораживаем персонажа
                this.freezeCharacter(char);
            }
        });
        
    }, 100);
    
    // Удаляем стену через 3 секунды
    setTimeout(() => {
        wallActive = false;
        
        // Анимация исчезновения
        gsap.to(wallContainer, {
            alpha: 0,
            duration: 0.5,
            onComplete: () => {
                if (wallContainer.parent) {
                    wallContainer.parent.removeChild(wallContainer);
                }
                // Очищаем флаги заморозки
                const characters = game.battlefield.characters;
                if (characters) {
                    characters.forEach(char => {
                        if (char) {
                            delete char._frozenByWall;
                        }
                    });
                }
            }
        });
    }, 3000);
}
// Визуальный эффект Заморозки
createFreezingEffect(character) {
    if (!character || !character.container) return;
    
    // Создаем контейнер для эффекта
    const effectContainer = new PIXI.Container();
    effectContainer.position.set(character.x, character.y);
    game.battlefield.container.addChild(effectContainer);
    
    // Создаем эффект льда вокруг персонажа
    const iceCircle = new PIXI.Graphics();
    iceCircle.beginFill(0x00FFFF, 0.3);
    iceCircle.drawCircle(0, 0, character.radius * 1.2);
    iceCircle.endFill();
    effectContainer.addChild(iceCircle);
    
    // Создаем кристаллы льда вокруг персонажа
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const iceRadius = character.radius * 1.1;
        
        // Кристалл льда
        const crystal = new PIXI.Graphics();
        crystal.beginFill(0x00FFFF, 0.7);
        
        // Рисуем кристалл из треугольника
        crystal.moveTo(0, -10);
        crystal.lineTo(5, 10);
        crystal.lineTo(-5, 10);
        crystal.lineTo(0, -10);
        
        crystal.endFill();
        
        crystal.position.set(
            Math.cos(angle) * iceRadius,
            Math.sin(angle) * iceRadius
        );
        
        crystal.rotation = angle;
        
        effectContainer.addChild(crystal);
        
        // Анимация роста кристаллов
        gsap.from(crystal.scale, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "back.out"
        });
    }
    
    // Анимация пульсации льда
    gsap.to(iceCircle, {
        alpha: 0.1,
        duration: 1,
        repeat: 3,
        yoyo: true,
        ease: "power1.inOut"
    });
    
    // Удаляем эффект через 3 секунды
    setTimeout(() => {
        if (effectContainer.parent) {
            gsap.to(effectContainer, {
                alpha: 0,
                duration: 0.5,
                onComplete: () => {
                    if (effectContainer.parent) {
                        effectContainer.parent.removeChild(effectContainer);
                    }
                }
            });
        }
    }, 2500);
}
// Метод для замораживания персонажа
freezeCharacter(character) {
    if (!character || !character.isAlive) return;
    
    // Запоминаем текущее состояние
    const wasFrozen = character.stunnedUntil ? true : false;
    
    // Замораживаем на 3 секунды
    character.stunnedUntil = performance.now() / 1000 + 3;
    
    // Создаем визуальный эффект заморозки
    this.createFreezingEffect(character);
}
    
    // Методы применения заклинаний к персонажам
// Применение заклинания к персонажу
castSpellOnCharacter(spellType, character) {
    const spellInfo = SPELL_INFO[spellType];
    
    // Применяем эффект заклинания
    switch (spellType) {
        case SPELL_TYPES.HEALING:
            // Лечение
            if (character && character.isAlive && character.health < character.maxHealth) {
                const oldHealth = character.health;
                character.health += 80; // +80 здоровья
                if (character.health > character.maxHealth) {
                    character.health = character.maxHealth;
                }
                
                console.log(`Персонаж ${character.type} излечен с ${oldHealth} до ${character.health}`);
                
                // Обновляем полосу здоровья
                character.updateHealthBar();
                
                // Создаем визуальный эффект лечения
                this.createHealingEffect(character.x, character.y);
            } else {
                // Если персонаж уже имеет полное здоровье или мертв
                console.log(`Не удалось вылечить персонажа ${character ? character.type : 'неизвестно'}`);
                if (character) {
                    console.log(`Причина: жив: ${character.isAlive}, здоровье: ${character.health}/${character.maxHealth}`);
                }
            }
            break;
            
        case SPELL_TYPES.SUBORDINATION:
            // Подчинение врага
            this.createSubordinationEffect(character);
            
            // Временно меняем команду персонажа
            const originalTeam = character.team;
            character.team = TEAMS.PLAYER;
            
            // Возвращаем обратно через 4 секунды
            setTimeout(() => {
                if (character && character.isAlive) {
                    character.team = originalTeam;
                }
            }, 4000);
            break;
            
        case SPELL_TYPES.DECOMPOSITION:
            // Разложение (ДоТ)
            this.createDecompositionEffect(character);
            
            // Наносим урон за время (100 урона за 4 секунды = 25 урона в секунду)
            let damageInterval = setInterval(() => {
                if (character && character.isAlive) {
                    character.takeDamage(25, null);
                } else {
                    clearInterval(damageInterval);
                }
            }, 1000); // Каждую секунду
            
            // Останавливаем через 4 секунды
            setTimeout(() => {
                clearInterval(damageInterval);
            }, 4000);
            break;
            
        case SPELL_TYPES.FREEZING:
            // Заморозка
            this.createFreezingEffect(character);
            
            // Запоминаем текущее состояние
            const wasFrozen = character.stunnedUntil ? true : false;
            
            // Замораживаем на 3 секунды
            character.stunnedUntil = performance.now() / 1000 + 3;
            
            // Создаем визуальный эффект заморозки используя совместимый метод для ColorMatrixFilter
            const blueFilter = createColorMatrix ? createColorMatrix() : new PIXI.filters.ColorMatrixFilter();
            blueFilter.tint(0x0000FF); // Синий оттенок
            
            if (character.characterSprite) {
                // Сохраняем оригинальные фильтры
                const originalFilters = character.characterSprite.filters || [];
                
                // Применяем фильтр заморозки
                character.characterSprite.filters = [...originalFilters, blueFilter];
                
                // Сбрасываем фильтр через 3 секунды
                setTimeout(() => {
                    if (character && character.characterSprite) {
                        character.characterSprite.filters = originalFilters;
                    }
                }, 3000);
            }
            break;
    }
}
}