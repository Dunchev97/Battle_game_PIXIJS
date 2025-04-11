// Main Game class
class Game {
    constructor() {
        // Initialize PIXI Application
        this.app = new PIXI.Application({
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            backgroundColor: 0x333333,
            view: document.getElementById('gameCanvas'),
            resolution: window.devicePixelRatio || 1
        });
        
        // Create separate containers for different game layers
        this.uiLayer = new PIXI.Container();
        this.battlefieldLayer = new PIXI.Container();
        
        // Add layers to stage in the correct order (battlefield behind UI)
        this.app.stage.addChild(this.battlefieldLayer);
        this.app.stage.addChild(this.uiLayer);
        
        // Hide battlefield layer initially
        this.battlefieldLayer.visible = false;
        
        // Set initial game state
        this.state = GAME_STATES.SELECTION;
        
        // Initialize managers with proper layers
        this.ui = new UIManager(this.app, this.uiLayer);
        this.battlefield = new BattlefieldManager(this.app, this.battlefieldLayer);
        
        // Start game loop
        this.app.ticker.add(this.update.bind(this));
        
        // Start the game
        this.startSelection();
    }
    
    // Обновление игры
    update(delta) {
        // Если мы в режиме битвы, обновляем персонажей
        if (this.state === GAME_STATES.BATTLE) {
            console.log(`[ИГРА] Обновление в режиме битвы, delta: ${delta}`);
            this.battlefield.update(delta);
        } else {
            console.log(`[ИГРА] Текущий режим: ${this.state}, не обновляем персонажей`);
        }
    }
    
    // Start character selection phase
    startSelection() {
        this.state = GAME_STATES.SELECTION;
        this.ui.createSelectionUI();
        this.battlefieldLayer.visible = false;
    }
    
    // Start character placement phase
    startPlacement() {
        this.state = GAME_STATES.PLACEMENT;
        this.ui.createPlacementUI();
        
        // Create battlefield, show it, and generate enemies
        this.battlefield.createBattlefield();
        this.battlefieldLayer.visible = true;
        this.battlefield.generateEnemies();
    }
    
    // Start battle phase
    startBattle() {
        this.state = GAME_STATES.BATTLE;
        this.ui.createBattleUI();
    }
    
    // Start reinforcement phase
    startReinforcement() {
        this.state = GAME_STATES.REINFORCEMENT;
        this.ui.createReinforcementUI();
    }
    
    // Resume battle after reinforcement
    resumeBattle() {
        this.state = GAME_STATES.BATTLE;
        this.ui.createBattleUI();
    }
    
    // Game over
    gameOver(isVictory) {
        this.state = GAME_STATES.GAME_OVER;
        this.ui.createGameOverUI(isVictory);
    }
    
    // Restart game
    restart() {
        // Reset battlefield
        this.battlefield.reset();
        
        // Start from selection
        this.startSelection();
    }
    
    // Update game state
    update(delta) {
        // Scale delta to be in seconds
        delta = delta / 60;
        
        // Update based on game state
        switch (this.state) {
            case GAME_STATES.BATTLE:
                this.battlefield.update(delta);
                break;
        }
    }
}

// Initialize game when window loads
window.onload = function() {
    // Create global game instance
    window.game = new Game();
};
