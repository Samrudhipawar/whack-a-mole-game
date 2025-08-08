document.addEventListener('DOMContentLoaded', () => {

    const holes = document.querySelectorAll('.hole');
    const moles = document.querySelectorAll('.mole');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button'); // Added for pause feature
    const soundToggle = document.getElementById('sound-toggle');
    const gameOverTag = document.getElementById('game-over-tag');
    const scorePopup = document.getElementById('score-popup');
    const finalScoreDisplay = document.getElementById('final-score');
    const highScoreDisplay = document.getElementById('high-score');
    
    // Level selection elements
    const levelSelect = document.getElementById('level-select');
    
    // Theme selection elements
    const themeSelect = document.getElementById('theme-select');
    
    let highScore = localStorage.getItem('highScore') || 0;
    highScoreDisplay.textContent = highScore;

 
    let score = 0;
    let timeLeft = 30;
    let gameTimer;
    let moleTimer;
    let isPlaying = false;
    let isPaused = false; // Added for pause feature
    let currentLevel = 'easy';
    
    
    const levelConfig = {
        easy: {
            timeLimit: 30,
            minMoleTime: 800,
            maxMoleTime: 1500,
            label: 'Easy',
            background: '#90ee90'

        },
        medium: {
            timeLimit: 45,
            minMoleTime: 500,
            maxMoleTime: 1000,
            label: 'Medium',
            background: '#fff97eff'
        },
        hard: {
            timeLimit: 60,
            minMoleTime: 300,
            maxMoleTime: 700,
            label: 'Hard',
            background: '#eb9e9e'
        }
    };

    const whackSound = new Audio('sounds/whack.mp3');
    const gameOverSound = new Audio('sounds/game-over.mp3');
    const backgroundMusic = new Audio('sounds/background.mp3');
    
    
    backgroundMusic.loop = false;
    backgroundMusic.volume = 0.5;
    
    pauseButton.disabled = true; // Added for pause feature

    // Initialize theme
    const savedTheme = localStorage.getItem('gameTheme') || 'classic';
    document.body.setAttribute('data-theme', savedTheme);
    themeSelect.value = savedTheme;
    
    // Theme selection event listener
    themeSelect.addEventListener('change', () => {
        const selectedTheme = themeSelect.value;
        document.body.setAttribute('data-theme', selectedTheme);
        localStorage.setItem('gameTheme', selectedTheme);
    });
    
    // Level selection event listener
    levelSelect.addEventListener('change', () => {
        // Update current level
        currentLevel = levelSelect.value;
        
        // Update time display based on selected level
        timeDisplay.textContent = levelConfig[currentLevel].timeLimit;
        
        // Update background color based on selected level
        document.getElementById('level-select').style.background = levelConfig[currentLevel].background;
        // Update start button text
        const levelName = levelConfig[currentLevel].label;
        startButton.innerHTML = `<i class="fas fa-play"></i> Start Game (${levelName})`;
    });
    
    function initGame() {
        score = 0;
        timeLeft = levelConfig[currentLevel].timeLimit;
        isPlaying = true;
        isPaused = false; // Added for pause feature
        
        // Update UI
        scoreDisplay.textContent = score;
        timeDisplay.textContent = timeLeft;
        startButton.disabled = true;
        pauseButton.disabled = false; // Added for pause feature
        pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause'; // Added for pause feature
        gameOverTag.style.display = 'none';
        scorePopup.style.display = 'none';
        
        // Disable level selection during game
        levelSelect.disabled = true;
        
        // Handle background music
        const soundEnabled = soundToggle.checked;
        if (soundEnabled) {
            backgroundMusic.currentTime = 0;
            backgroundMusic.play().catch(error => {
                console.log("Audio play failed:", error);
            });
            
            // Stop background music before game ends
            setTimeout(() => {
                if (isPlaying) {
                    backgroundMusic.pause();
                }
            }, (timeLeft - 1) * 1000);
        }
        
        
        gameTimer = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            
            if (timeLeft === 1) {
                if (soundEnabled) {
                    gameOverSound.currentTime = 0;
                    gameOverSound.load();
                }
            }
            
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
        
       
        showMole();
    }
    
   
    function showMole() {
        // Hide all moles first
        moles.forEach(mole => {
            mole.classList.remove('active');
        });
        
        // Check if game is still playing
        if (!isPlaying || isPaused) return; // Modified for pause feature
        
        // Get random hole
        const randomHole = Math.floor(Math.random() * holes.length);
        const mole = holes[randomHole].querySelector('.mole');
        
        // Show the mole
        mole.classList.add('active');
        
        // Calculate show time based on current level
        const config = levelConfig[currentLevel];
        const showTime = Math.random() * (config.maxMoleTime - config.minMoleTime) + config.minMoleTime;
        
        
        moleTimer = setTimeout(() => {
            mole.classList.remove('active');
            if (isPlaying) showMole();
        }, showTime);
    }
    
    
    function endGame() {
        clearInterval(gameTimer);
        clearTimeout(moleTimer);
        isPlaying = false;
        pauseButton.disabled = true; // Added for pause feature
        
        // Hide all moles
        moles.forEach(mole => {
            mole.classList.remove('active');
        });
        
        // Re-enable level selection
        levelSelect.disabled = false;
       
        // Stop background music
        backgroundMusic.pause();
        
        // Play game over sound
        const soundEnabled = soundToggle.checked;
        if (soundEnabled) {
            gameOverSound.play().catch(error => {
                console.log("Game over sound failed:", error);
            });
        }
       
        // Show game over message
        gameOverTag.style.display = 'block';
        
        // Show final score
        finalScoreDisplay.textContent = score;
        scorePopup.style.display = 'block';

        // Update high score if necessary
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreDisplay.textContent = highScore;
        }
        
        // Re-enable start button after delay
        setTimeout(() => {
            startButton.disabled = false;
            const levelName = levelConfig[currentLevel].label;
            startButton.innerHTML = `<i class="fas fa-play"></i> Start Game (${levelName})`;
        }, 3000);
    }
    
   
    startButton.addEventListener('click', initGame);
    
    // --- Entire block added for pause feature ---
    pauseButton.addEventListener('click', () => {
        if (!isPlaying) return;

        isPaused = !isPaused;

        if (isPaused) {
            // Pause the game
            clearInterval(gameTimer);
            clearTimeout(moleTimer);
            backgroundMusic.pause();
            pauseButton.innerHTML = '<i class="fas fa-play"></i> Resume';
        } else {
            // Resume the game
            pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
            if (soundToggle.checked) {
                backgroundMusic.play().catch(error => console.log("Audio play failed:", error));
            }

            const soundEnabled = soundToggle.checked;
            gameTimer = setInterval(() => {
                timeLeft--;
                timeDisplay.textContent = timeLeft;
                if (timeLeft === 1 && soundEnabled) {
                    gameOverSound.currentTime = 0;
                    gameOverSound.load();
                }
                if (timeLeft <= 0) {
                    endGame();
                }
            }, 1000);

            showMole();
        }
    });
    // --- End of pause feature block ---

    const restartButton = document.getElementById('restart-button');
    restartButton.addEventListener('click', function () {
        if (isPlaying) {
            // Stop current game
            clearInterval(gameTimer);
            clearTimeout(moleTimer);
            backgroundMusic.pause();
            isPlaying = false;
        }

        // Hide all moles
        moles.forEach(mole => {
            mole.classList.remove('active');
        });

        // Re-enable level selection
        levelSelect.disabled = false;
        
        // Start new game with current level
        initGame();
    });

    
moles.forEach(mole => {
    mole.addEventListener('click', function() {
        if (!isPlaying || isPaused) return; // Modified for pause feature
        
        if (mole.classList.contains('active') && !mole.classList.contains('whacked')) {
           
            const soundEnabled = soundToggle.checked;
            if (soundEnabled) {
                whackSound.currentTime = 0;
                whackSound.play().catch(error => {
                    console.log("Audio play failed:", error);
                });
            }
            
            
            score++;
            scoreDisplay.textContent = score;
            
            
            mole.classList.add('whacked');
            
           
            setTimeout(() => {
                mole.classList.remove('active');
                mole.classList.remove('whacked');
            }, 300); 
        }
    });
});
    
    
    soundToggle.addEventListener('change', function() {
        const soundEnabled = this.checked;
        
       
        whackSound.volume = soundEnabled ? 1.0 : 0;
        gameOverSound.volume = soundEnabled ? 1.0 : 0;
        backgroundMusic.volume = soundEnabled ? 0.5 : 0;
        
        
        if (isPlaying && !isPaused && soundEnabled && backgroundMusic.paused) { // Modified for pause feature
            backgroundMusic.play().catch(error => {
                console.log("Audio play failed:", error);
            });
        }
        
       
        if (isPlaying && !soundEnabled && !backgroundMusic.paused) {
            backgroundMusic.pause();
        }
    });
});

// LIGHT AND DARK MODE
const themeToggleBtn = document.getElementById('theme-toggle');

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Toggle Light Mode';
}

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  themeToggleBtn.innerHTML = isDark
    ? '<i class="fas fa-sun"></i> Toggle Light Mode'
    : '<i class="fas fa-moon"></i> Toggle Dark Mode';

  //  choice
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});