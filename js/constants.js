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
        health: 400,
        attack: 25,
        speed: 40, 
        attackRange: 1, 
        attackCooldown: 1,
        color: 0x3366ff,
        radius: 60 
    },
    [CHARACTER_TYPES.ARCHER]: {
        health: 180,
        attack: 30,
        speed: 25, 
        attackRange: 300, 
        attackCooldown: 1.5,
        safeDistance: 10, 
        color: 0x33cc33,
        radius: 50 
    },
    [CHARACTER_TYPES.ASSASSIN]: {  // Добавляем характеристики для Ассасина
        health: 250,
        attack: 35,
        speed: 70, 
        attackRange: 1, 
        attackCooldown: 0.8,
        color: 0xff0066,  // Розовый цвет для отличия
        radius: 45 
    },
    [CHARACTER_TYPES.FIREMAGE]: {  // Добавляем характеристики для Мага Огня
        health: 200,
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
    SPELL_SELECTION: 'spellSelection', 
    PLACEMENT: 'placement',
    BATTLE: 'battle',
    REINFORCEMENT: 'reinforcement',
    GAME_OVER: 'gameOver'
};

const SPELL_TYPES = {
    HEALING: 'healing',           // Лечение
    STORM: 'storm',               // Буря
    WIND_ARROW: 'windArrow',      // Стрела ветра
    SUBORDINATION: 'subordination', // Подчинение
    MINES: 'mines',               // Мины
    DECOMPOSITION: 'decomposition', // Разложение
    ARMAGEDDON: 'armageddon',     // Армагеддон
    WALL_OF_FIRE: 'wallOfFire',   // Стена огня
    ERUPTION: 'eruption',         // Извержение
    ICE_AREA: 'iceArea',          // Область льда
    ICE_WALL: 'iceWall',          // Стена льда
    FREEZING: 'freezing'          // Заморозка
};

const SPELL_INFO = {
    [SPELL_TYPES.HEALING]: {
        name: 'Лечение',
        image: 'images/Skills/Healing.png',
        manaCost: 1,
        description: 'Исцеляет выбранного персонажа на +80 здоровья',
        targetType: 'ally'
    },
    [SPELL_TYPES.STORM]: {
        name: 'Буря',
        image: 'images/Skills/Storm.png',
        manaCost: 1,
        description: 'Притягивает всех персонажей в радиусе 200 к центру круга на 1.5 секунды',
        targetType: 'area'
    },
    [SPELL_TYPES.WIND_ARROW]: {
        name: 'Стрела ветра',
        image: 'images/Skills/Wind_Arrow.png',
        manaCost: 1,
        description: 'Стрела вылетает по указанному вектору, нанося 80 урона',
        targetType: 'vector'
    },
    [SPELL_TYPES.SUBORDINATION]: {
        name: 'Подчинение',
        image: 'images/Skills/Subordination.png',
        manaCost: 1,
        description: 'Выбранный персонаж становится дружественным на 4 секунды',
        targetType: 'enemy'
    },
    [SPELL_TYPES.MINES]: {
        name: 'Мины',
        image: 'images/Skills/Mines.png',
        manaCost: 1,
        description: 'Размещает 3 мины, каждая наносит 80 урона в радиусе 150',
        targetType: 'random'
    },
    [SPELL_TYPES.DECOMPOSITION]: {
        name: 'Разложение',
        image: 'images/Skills/Decomposition.png',
        manaCost: 1,
        description: 'Выбранный враг получает отравление и теряет 100 здоровья за 4 секунды',
        targetType: 'enemy'
    },
    [SPELL_TYPES.ARMAGEDDON]: {
        name: 'Армагеддон',
        image: 'images/Skills/Armageddon.png',
        manaCost: 1,
        description: 'На арену падают 3 метеорита, каждый наносит 50 урона в радиусе 150',
        targetType: 'random'
    },
    [SPELL_TYPES.WALL_OF_FIRE]: {
        name: 'Стена огня',
        image: 'images/Skills/Wall_of_fire.png',
        manaCost: 1,
        description: 'Создает стену огня, которая наносит урон врагам',
        targetType: 'vector'
    },
    [SPELL_TYPES.ERUPTION]: {
        name: 'Извержение',
        image: 'images/Skills/Eruption.png',
        manaCost: 1,
        description: 'Через 4 секунды происходит взрыв, наносящий 100 урона в радиусе 200',
        targetType: 'point'
    },
    [SPELL_TYPES.ICE_AREA]: {
        name: 'Область льда',
        image: 'images/Skills/Ice_area.png',
        manaCost: 1,
        description: 'Создает ледяную область, замедляющую персонажей в 2 раза на 4 секунды',
        targetType: 'point'
    },
    [SPELL_TYPES.ICE_WALL]: {
        name: 'Стена льда',
        image: 'images/Skills/Ice_wall.png',
        manaCost: 1,
        description: 'Создает стену льда, замораживающую персонажей на 3 секунды',
        targetType: 'vector'
    },
    [SPELL_TYPES.FREEZING]: {
        name: 'Заморозка',
        image: 'images/Skills/Freezing.jpg',
        manaCost: 1,
        description: 'Замораживает выбранного врага на 3 секунды',
        targetType: 'enemy'
    }
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
