// Константы для анимаций
window.SPRITE_SIZE = 48; // размер одного кадра в пикселях (для старых анимаций)
window.NEW_SPRITE_SIZE = 128; // размер одного кадра в пикселях для новых анимаций

// Функция для вычисления координат кадра анимации (для старых спрайтов)
function getFrameCoordinates(frames, frameIndex) {
    const frame = frames[frameIndex];
    return {
        x: frame.col * SPRITE_SIZE,
        y: frame.row * SPRITE_SIZE,
        width: SPRITE_SIZE,
        height: SPRITE_SIZE
    };
}

// Функция для вычисления координат кадра анимации (для новых спрайтов)
function getNewFrameCoordinates(frames, frameIndex) {
    const frame = frames[frameIndex];
    return {
        x: frame.col * NEW_SPRITE_SIZE,
        y: frame.row * NEW_SPRITE_SIZE,
        width: NEW_SPRITE_SIZE,
        height: NEW_SPRITE_SIZE
    };
}

// Делаем функции доступными глобально
window.getFrameCoordinates = getFrameCoordinates;
window.getNewFrameCoordinates = getNewFrameCoordinates;

// Определяем анимации для лучника (старые)
window.ARCHER_ANIMATIONS = {
    // Состояние покоя
    idle: {
        frames: [
            {row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, 
            {row: 0, col: 3}, {row: 0, col: 4}, {row: 0, col: 5}
        ],
        duration: 0.8, // длительность анимации в секундах
        loop: true     // зацикленная анимация
    },
    // Ходьба
    walk: {
        frames: [
            {row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}, 
            {row: 1, col: 4}, {row: 1, col: 5}, {row: 1, col: 6}, {row: 1, col: 7}
        ],
        duration: 0.7,
        loop: true
    },
    // Атака
    attack: {
        frames: [
            {row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}, {row: 2, col: 3}, 
            {row: 2, col: 4}, {row: 2, col: 5}, {row: 2, col: 6}, {row: 2, col: 7}
        ],
        duration: 0.5,
        loop: false
    },
    // Получение урона
    hurt: {
        frames: [
            {row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}, {row: 3, col: 3}
        ],
        duration: 0.3,
        loop: false
    },
    // Смерть
    death: {
        frames: [
            {row: 4, col: 0}, {row: 4, col: 1}, {row: 4, col: 2}, {row: 4, col: 3}
        ],
        duration: 0.8,
        loop: false
    }
};

// Определяем анимации для воина (старые)
window.WARRIOR_ANIMATIONS = {
    // Состояние покоя
    idle: {
        frames: [
            {row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, 
            {row: 0, col: 3}, {row: 0, col: 4}, {row: 0, col: 5}
        ],
        duration: 0.8,
        loop: true
    },
    // Ходьба
    walk: {
        frames: [
            {row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}, 
            {row: 1, col: 4}, {row: 1, col: 5}, {row: 1, col: 6}, {row: 1, col: 7}
        ],
        duration: 0.6,
        loop: true
    },
    // Атака
    attack: {
        frames: [
            {row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}, 
            {row: 2, col: 3}, {row: 2, col: 4}, {row: 2, col: 5}
        ],
        duration: 0.2,
        loop: false
    },
    // Получение урона
    hurt: {
        frames: [
            {row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}, {row: 3, col: 3}
        ],
        duration: 0.3,
        loop: false
    },
    // Смерть
    death: {
        frames: [
            {row: 4, col: 0}, {row: 4, col: 1}, {row: 4, col: 2}, {row: 4, col: 3}
        ],
        duration: 0.8,
        loop: false
    }
};

// Определяем НОВЫЕ анимации для воина (Knight_1_Spritesheet1.png)
window.NEW_WARRIOR_ANIMATIONS = {
    // Состояние покоя (4 кадра)
    idle: {
        frames: [
            {row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}
        ],
        duration: 0.8,
        loop: true
    },
    // Ходьба (8 кадров)
    walk: {
        frames: [
            {row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3},
            {row: 1, col: 4}, {row: 1, col: 5}, {row: 1, col: 6}, {row: 1, col: 7}
        ],
        duration: 0.8,
        loop: true
    },
    // Атака (8 кадров)
    attack: {
        frames: [
            {row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}, {row: 2, col: 3},
            {row: 2, col: 4}, {row: 2, col: 5}, {row: 2, col: 6}, {row: 2, col: 7}
        ],
        duration: 0.6,
        loop: false
    },
    // Получение урона (2 кадра)
    hurt: {
        frames: [
            {row: 3, col: 0}, {row: 3, col: 1}
        ],
        duration: 0.3,
        loop: false
    },
    // Смерть (6 кадров)
    death: {
        frames: [
            {row: 4, col: 0}, {row: 4, col: 1}, {row: 4, col: 2},
            {row: 4, col: 3}, {row: 4, col: 4}, {row: 4, col: 5}
        ],
        duration: 1.0,
        loop: false
    }
};

// Определяем НОВЫЕ анимации для лучника (Samurai_Archer_SpriteSheet.png)
window.NEW_ARCHER_ANIMATIONS = {
    // Состояние покоя (9 кадров)
    idle: {
        frames: [
            {row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2},
            {row: 0, col: 3}, {row: 0, col: 4}, {row: 0, col: 5},
            {row: 0, col: 6}, {row: 0, col: 7}, {row: 0, col: 8}
        ],
        duration: 0.9,
        loop: true
    },
    // Ходьба (8 кадров)
    walk: {
        frames: [
            {row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3},
            {row: 1, col: 4}, {row: 1, col: 5}, {row: 1, col: 6}, {row: 1, col: 7}
        ],
        duration: 0.8,
        loop: true
    },
    // Атака (14 кадров)
    attack: {
        frames: [
            {row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}, {row: 2, col: 3},
            {row: 2, col: 4}, {row: 2, col: 5}, {row: 2, col: 6}, {row: 2, col: 7},
            {row: 2, col: 8}, {row: 2, col: 9}, {row: 2, col: 10}, {row: 2, col: 11},
            {row: 2, col: 12}, {row: 2, col: 13}
        ],
        duration: 1.0,
        loop: false
    },
    // Получение урона (3 кадра)
    hurt: {
        frames: [
            {row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}
        ],
        duration: 0.3,
        loop: false
    },
    // Смерть (5 кадров)
    death: {
        frames: [
            {row: 4, col: 0}, {row: 4, col: 1}, {row: 4, col: 2},
            {row: 4, col: 3}, {row: 4, col: 4}
        ],
        duration: 0.8,
        loop: false
    }
};

// Функция для получения координат кадра из спрайт-листа (оставляем как есть для обратной совместимости)
window.getFrameCoordinates = function(frames, frameIndex) {
    if (!frames || frames.length === 0) {
        // console.log('[АНИМАЦИЯ] Ошибка: пустой массив кадров');
        return { x: 0, y: 0, width: SPRITE_SIZE, height: SPRITE_SIZE };
    }
    
    // Убеждаемся, что индекс кадра в пределах допустимых значений
    const safeIndex = frameIndex % frames.length;
    const frame = frames[safeIndex];
    
    if (!frame) {
        // console.log(`[АНИМАЦИЯ] Ошибка: не найден кадр с индексом ${safeIndex} в массиве длиной ${frames.length}`);
        return { x: 0, y: 0, width: SPRITE_SIZE, height: SPRITE_SIZE };
    }
    
    // console.log(`[АНИМАЦИЯ] Получаем координаты кадра ${safeIndex}: строка=${frame.row}, колонка=${frame.col}`);
    
    return {
        x: frame.col * SPRITE_SIZE,
        y: frame.row * SPRITE_SIZE,
        width: SPRITE_SIZE,
        height: SPRITE_SIZE
    };
};

// Состояния анимации
window.ANIMATION_STATES = {
    IDLE: 'idle',
    WALK: 'walk',
    ATTACK: 'attack',
    HURT: 'hurt',
    DEATH: 'death'
};