// Константы для анимаций
window.SPRITE_SIZE = 48; // размер одного кадра в пикселях

// Функция для вычисления координат кадра анимации
function getFrameCoordinates(frames, frameIndex) {
    const frame = frames[frameIndex];
    return {
        x: frame.col * SPRITE_SIZE,
        y: frame.row * SPRITE_SIZE,
        width: SPRITE_SIZE,
        height: SPRITE_SIZE
    };
}

// Делаем функцию доступной глобально
window.getFrameCoordinates = getFrameCoordinates;

// Определяем анимации для лучника
window.ARCHER_ANIMATIONS = {
    // Состояние покоя
    idle: {
        frames: [
            {row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, 
            {row: 0, col: 3}, {row: 0, col: 4}, {row: 0, col: 5}
        ],
        duration: 1.5, // длительность анимации в секундах
        loop: true     // зацикленная анимация
    },
    // Ходьба
    walk: {
        frames: [
            {row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}, 
            {row: 1, col: 4}, {row: 1, col: 5}, {row: 1, col: 6}, {row: 1, col: 7}
        ],
        duration: 0.8,
        loop: true
    },
    // Атака
    attack: {
        frames: [
            {row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}, {row: 2, col: 3}, 
            {row: 2, col: 4}, {row: 2, col: 5}, {row: 2, col: 6}, {row: 2, col: 7}
        ],
        duration: 0.8,
        loop: false
    },
    // Получение урона
    hurt: {
        frames: [
            {row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}, {row: 3, col: 3}
        ],
        duration: 0.4,
        loop: false
    },
    // Смерть
    death: {
        frames: [
            {row: 4, col: 0}, {row: 4, col: 1}, {row: 4, col: 2}, {row: 4, col: 3}
        ],
        duration: 1,
        loop: false
    }
};

// Определяем анимации для воина
window.WARRIOR_ANIMATIONS = {
    // Состояние покоя
    idle: {
        frames: [
            {row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, 
            {row: 0, col: 3}, {row: 0, col: 4}, {row: 0, col: 5}
        ],
        duration: 1.5,
        loop: true
    },
    // Ходьба
    walk: {
        frames: [
            {row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}, 
            {row: 1, col: 4}, {row: 1, col: 5}, {row: 1, col: 6}, {row: 1, col: 7}
        ],
        duration: 0.8,
        loop: true
    },
    // Атака
    attack: {
        frames: [
            {row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}, 
            {row: 2, col: 3}, {row: 2, col: 4}, {row: 2, col: 5}
        ],
        duration: 0.6,
        loop: false
    },
    // Получение урона
    hurt: {
        frames: [
            {row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}, {row: 3, col: 3}
        ],
        duration: 0.4,
        loop: false
    },
    // Смерть
    death: {
        frames: [
            {row: 4, col: 0}, {row: 4, col: 1}, {row: 4, col: 2}, {row: 4, col: 3}
        ],
        duration: 1,
        loop: false
    }
};

// Функция для получения координат кадра из спрайт-листа
window.getFrameCoordinates = function(frames, frameIndex) {
    if (!frames || frames.length === 0) {
        console.log('[АНИМАЦИЯ] Ошибка: пустой массив кадров');
        return { x: 0, y: 0, width: SPRITE_SIZE, height: SPRITE_SIZE };
    }
    
    // Убеждаемся, что индекс кадра в пределах допустимых значений
    const safeIndex = frameIndex % frames.length;
    const frame = frames[safeIndex];
    
    if (!frame) {
        console.log(`[АНИМАЦИЯ] Ошибка: не найден кадр с индексом ${safeIndex} в массиве длиной ${frames.length}`);
        return { x: 0, y: 0, width: SPRITE_SIZE, height: SPRITE_SIZE };
    }
    
    console.log(`[АНИМАЦИЯ] Получаем координаты кадра ${safeIndex}: строка=${frame.row}, колонка=${frame.col}`);
    
    return {
        x: frame.col * SPRITE_SIZE,
        y: frame.row * SPRITE_SIZE,
        width: SPRITE_SIZE,
        height: SPRITE_SIZE
    };
}

// Состояния анимации
window.ANIMATION_STATES = {
    IDLE: 'idle',
    WALK: 'walk',
    ATTACK: 'attack',
    HURT: 'hurt',
    DEATH: 'death'
};