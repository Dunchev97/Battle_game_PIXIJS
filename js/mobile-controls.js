// Класс для управления мобильными элементами управления
class MobileControls {
    constructor() {
        this.initTouchControls();
    }
    
    initTouchControls() {
        // Проверяем, находимся ли мы на мобильном устройстве
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (!isMobile) {
            // Скрываем мобильные элементы управления, если мы не на мобильном устройстве
            const mobileControls = document.getElementById('mobileControls');
            if (mobileControls) {
                mobileControls.style.display = 'none';
            }
            return;
        }
        
        // Показываем мобильные элементы управления
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.style.display = 'flex';
        }
        
        // Настраиваем кнопку действия
        const actionButton = document.getElementById('actionButton');
        if (actionButton) {
            // Предотвращаем двойной тап на кнопке (может вызывать зум)
            actionButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleActionButton();
            });
        }
        
        // Настраиваем обработку жестов свайпа
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), false);
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), false);
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), false);
        
        // Инициализируем переменные для отслеживания свайпов
        this.xDown = null;
        this.yDown = null;
    }
    
    // Обработка кнопки действия
    handleActionButton() {
        // Действие зависит от текущего состояния игры
        if (game.state === GAME_STATES.BATTLE) {
            // В режиме боя кнопка действия может активировать способность выбранного персонажа
            // Здесь может быть логика использования способности
        } else if (game.state === GAME_STATES.PLACEMENT) {
            // В режиме размещения кнопка действия может подтверждать размещение персонажа
        }
    }
    
    // Обработка начала касания для свайпа
    handleTouchStart(evt) {
        const firstTouch = evt.touches[0];
        this.xDown = firstTouch.clientX;
        this.yDown = firstTouch.clientY;
    }
    
    // Обработка движения пальца
    handleTouchMove(evt) {
        if (!this.xDown || !this.yDown) {
            return;
        }
        
        const xUp = evt.touches[0].clientX;
        const yUp = evt.touches[0].clientY;
        
        const xDiff = this.xDown - xUp;
        const yDiff = this.yDown - yUp;
        
        // Определяем направление свайпа
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) {
                // Свайп влево
                this.handleSwipeLeft();
            } else {
                // Свайп вправо
                this.handleSwipeRight();
            }
        } else {
            if (yDiff > 0) {
                // Свайп вверх
                this.handleSwipeUp();
            } else {
                // Свайп вниз
                this.handleSwipeDown();
            }
        }
        
        // Сбрасываем значения
        this.xDown = null;
        this.yDown = null;
    }
    
    // Обработка окончания касания
    handleTouchEnd(evt) {
        // Можно добавить дополнительную логику при завершении касания
    }
    
    // Обработчики свайпов
    handleSwipeLeft() {
        // Логика для свайпа влево в зависимости от состояния игры
    }
    
    handleSwipeRight() {
        // Логика для свайпа вправо в зависимости от состояния игры
    }
    
    handleSwipeUp() {
        // Логика для свайпа вверх в зависимости от состояния игры
    }
    
    handleSwipeDown() {
        // Логика для свайпа вниз в зависимости от состояния игры
    }
}

// Экспортируем класс в глобальную область видимости
window.MobileControls = MobileControls;

// Создаем экземпляр при загрузке страницы
window.addEventListener('load', () => {
    window.mobileControls = new MobileControls();
});