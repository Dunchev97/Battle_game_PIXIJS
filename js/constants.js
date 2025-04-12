// Game constants
const GAME_WIDTH = 1920; // Изменено с 1600 до 1920
const GAME_HEIGHT = 1080; // Изменено с 1200 до 1080
const BATTLEFIELD_RADIUS = 500; // Увеличено в 2 раза с 250 до 500

// Уровни сложности игры
const DIFFICULTY = {
    EASY: 'easy',
    HARD: 'hard',
    UNFAIR: 'unfair'
};

// Количество врагов для каждого уровня сложности
const ENEMIES_BY_DIFFICULTY = {
    [DIFFICULTY.EASY]: 6,
    [DIFFICULTY.HARD]: 7,
    [DIFFICULTY.UNFAIR]: 8
};

// Цвета кнопок для каждого уровня сложности
const DIFFICULTY_COLORS = {
    [DIFFICULTY.EASY]: 0x4CAF50,    // Зеленый
    [DIFFICULTY.HARD]: 0xFF9100,    // Оранжевый
    [DIFFICULTY.UNFAIR]: 0xF44336   // Красный
};

// Character types
const CHARACTER_TYPES = {
    WARRIOR: 'warrior',
    ARCHER: 'archer',
    ASSASSIN: 'assassin',
    FIREMAGE: 'firemage'
};
// Team types
const TEAM_TYPES = {
    PLAYER: 'player',
    ENEMY: 'enemy'
};

// Character stats
const CHARACTER_STATS = {
    [CHARACTER_TYPES.WARRIOR]: {
        health: 160,
        attack: 20,
        speed: 40, 
        attackRange: 1, 
        attackCooldown: 1,
        color: 0x3366ff,
        radius: 60 
    },
    [CHARACTER_TYPES.ARCHER]: {
        health: 100,
        attack: 30,
        speed: 25, 
        attackRange: 300, 
        attackCooldown: 1.5,
        safeDistance: 10, 
        color: 0x33cc33,
        radius: 50 
    },
    [CHARACTER_TYPES.ASSASSIN]: {  // Добавляем характеристики для Ассасина
        health: 80,
        attack: 35,
        speed: 70, 
        attackRange: 1, 
        attackCooldown: 0.6,
        color: 0xff0066,  // Розовый цвет для отличия
        radius: 45 
    },
    [CHARACTER_TYPES.FIREMAGE]: {  // Добавляем характеристики для Мага Огня
        health: 90,
        attack: 30,
        speed: 35, 
        attackRange: 150,
        attackCooldown: 1.2,
        safeDistance: 10,  // Добавляем безопасную дистанцию как у лучника
        splashRadius: 70,  // Добавляем радиус сплеш-урона
        color: 0xff3300,   // Оранжево-красный цвет
        radius: 50 
    }
};

// Game states
const GAME_STATES = {
    SELECTION: 'selection',
    PLACEMENT: 'placement',
    BATTLE: 'battle',
    REINFORCEMENT: 'reinforcement',
    GAME_OVER: 'gameOver'
};

// Team types
const TEAMS = {
    PLAYER: 'player',
    ENEMY: 'enemy'
};

// Number of slots and characters
const TOTAL_SLOTS = 6;
const BATTLEFIELD_CHARACTERS = 3;

// Состояния анимации
const ANIMATION_STATES = {
    IDLE: 'idle',
    WALK: 'walk',
    ATTACK: 'attack',
    HURT: 'hurt',
    DEATH: 'death'
};
