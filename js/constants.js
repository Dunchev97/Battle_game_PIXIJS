// Game constants
const GAME_WIDTH = 1920; // Изменено с 1600 до 1920
const GAME_HEIGHT = 1080; // Изменено с 1200 до 1080
const BATTLEFIELD_RADIUS = 500; // Увеличено в 2 раза с 250 до 500

// Character types
const CHARACTER_TYPES = {
    WARRIOR: 'warrior',
    ARCHER: 'archer'
};

// Team types
const TEAM_TYPES = {
    PLAYER: 'player',
    ENEMY: 'enemy'
};

// Character stats
const CHARACTER_STATS = {
    [CHARACTER_TYPES.WARRIOR]: {
        health: 150,
        attack: 20,
        speed: 20, // Увеличено в 10 раз (5 * 2)
        attackRange: 100, // Увеличена дистанция атаки в 2 раза
        attackCooldown: 1.5,
        color: 0x3366ff,
        radius: 60 // Увеличен радиус в 3 раза
    },
    [CHARACTER_TYPES.ARCHER]: {
        health: 100,
        attack: 30,
        speed: 15, // Увеличено в 10 раз (5 * 2)
        attackRange: 400, // Увеличена дистанция атаки в 2 раза
        attackCooldown: 2,
        safeDistance: 120, // Увеличена безопасная дистанция в 2 раза
        color: 0x33cc33,
        radius: 54 // Увеличен радиус в 3 раза
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
