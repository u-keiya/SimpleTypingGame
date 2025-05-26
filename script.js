class TypingGame {
    constructor() {
        this.words = [
            'apple', 'banana', 'orange', 'grape', 'lemon', 'peach', 'cherry', 'melon',
            'strawberry', 'blueberry', 'raspberry', 'pineapple', 'coconut', 'mango',
            'computer', 'keyboard', 'mouse', 'monitor', 'laptop', 'desktop', 'tablet',
            'smartphone', 'internet', 'website', 'software', 'hardware', 'program',
            'coding', 'typing', 'gaming', 'music', 'movie', 'book', 'reading',
            'writing', 'learning', 'studying', 'working', 'playing', 'running',
            'walking', 'swimming', 'dancing', 'singing', 'cooking', 'eating',
            'sleeping', 'traveling', 'shopping', 'driving', 'flying', 'jumping',
            'house', 'home', 'family', 'friend', 'love', 'happy', 'smile',
            'laugh', 'enjoy', 'fun', 'exciting', 'amazing', 'wonderful', 'beautiful',
            'nature', 'flower', 'tree', 'forest', 'mountain', 'ocean', 'river',
            'sky', 'cloud', 'sun', 'moon', 'star', 'light', 'dark', 'bright',
            'color', 'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink',
            'black', 'white', 'gray', 'brown', 'silver', 'gold', 'rainbow'
        ];
        
        this.fallingWords = [];
        this.score = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.consecutiveCorrect = 0;
        this.totalAttempts = 0;
        this.correctAttempts = 0;
        this.gameStartTime = 0;
        this.currentInput = '';
        this.wordSpawnTimer = null;
        this.gameTimer = null;
        this.fallSpeed = 10; // 秒で落下（より速く）
        
        this.initializeElements();
        this.bindEvents();
        this.initializeDisplay();
    }
    
    initializeElements() {
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.accuracyElement = document.getElementById('accuracy');
        this.fallingWordsContainer = document.getElementById('falling-words-container');
        this.inputFieldElement = document.getElementById('input-field');
        this.feedbackElement = document.getElementById('feedback');
        this.startScreenElement = document.getElementById('start-screen');
        this.resultScreenElement = document.getElementById('result-screen');
        this.gameAreaElement = document.getElementById('game-area');
        this.startBtnElement = document.getElementById('start-btn');
        this.restartBtnElement = document.getElementById('restart-btn');
        this.finalScoreElement = document.getElementById('final-score');
        this.finalAccuracyElement = document.getElementById('final-accuracy');
        this.wpmElement = document.getElementById('wpm');
    }
    
    bindEvents() {
        this.startBtnElement.addEventListener('click', () => this.startGame());
        this.restartBtnElement.addEventListener('click', () => this.restartGame());
        this.inputFieldElement.addEventListener('input', (e) => this.handleInput(e));
    }
    
    initializeDisplay() {
        // 初期状態の設定
        this.gameAreaElement.style.display = 'none';
        this.resultScreenElement.classList.add('hidden');
        this.startScreenElement.classList.remove('hidden');
    }
    
    startGame() {
        this.gameActive = true;
        this.score = 0;
        this.timeLeft = 30;
        this.consecutiveCorrect = 0;
        this.totalAttempts = 0;
        this.correctAttempts = 0;
        this.gameStartTime = Date.now();
        this.fallingWords = [];
        this.currentInput = '';
        
        this.startScreenElement.classList.add('hidden');
        this.resultScreenElement.classList.add('hidden');
        this.gameAreaElement.style.display = 'block';
        
        this.inputFieldElement.disabled = false;
        this.inputFieldElement.focus();
        this.inputFieldElement.value = '';
        
        // 落下コンテナをクリア
        this.fallingWordsContainer.innerHTML = '';
        
        this.updateDisplay();
        this.startTimer();
        this.startWordSpawning();
    }
    
    startWordSpawning() {
        // 最初の単語をすぐに生成
        this.spawnWord();
        
        // 1.5秒ごとに新しい単語を生成（より頻繁に）
        this.wordSpawnTimer = setInterval(() => {
            if (this.gameActive) {
                this.spawnWord();
            }
        }, 1500);
    }
    
    spawnWord() {
        const word = this.words[Math.floor(Math.random() * this.words.length)];
        const wordElement = document.createElement('div');
        wordElement.className = 'falling-word';
        wordElement.textContent = word;
        
        // ランダムな水平位置
        const containerWidth = this.fallingWordsContainer.offsetWidth;
        const wordWidth = 120; // 推定幅
        const maxLeft = containerWidth - wordWidth;
        const left = Math.max(0, Math.random() * maxLeft);
        
        wordElement.style.left = left + 'px';
        wordElement.style.animationDuration = this.fallSpeed + 's';
        
        // 単語データを保存
        const wordData = {
            element: wordElement,
            text: word,
            typed: '',
            completed: false,
            missed: false
        };
        
        this.fallingWords.push(wordData);
        this.fallingWordsContainer.appendChild(wordElement);
        
        // アニメーション終了時の処理
        wordElement.addEventListener('animationend', () => {
            if (!wordData.completed && !wordData.missed) {
                this.missWord(wordData);
            }
        });
    }
    
    missWord(wordData) {
        if (wordData.missed) return;
        
        wordData.missed = true;
        wordData.element.classList.add('missed');
        
        // 正確性に影響を与える（ミスとして記録）
        this.totalAttempts++;
        
        // 時間を1秒減少
        this.timeLeft = Math.max(0, this.timeLeft - 1);
        this.feedbackElement.textContent = '💥 単語を逃しました！時間 -1秒、正確性ダウン';
        this.feedbackElement.className = 'feedback error';
        
        // 連続正解をリセット
        this.consecutiveCorrect = 0;
        
        setTimeout(() => {
            this.removeWord(wordData);
        }, 1000);
        
        this.updateDisplay();
    }
    
    removeWord(wordData) {
        const index = this.fallingWords.indexOf(wordData);
        if (index > -1) {
            this.fallingWords.splice(index, 1);
        }
        
        if (wordData.element && wordData.element.parentNode) {
            wordData.element.parentNode.removeChild(wordData.element);
        }
    }
    
    handleInput(e) {
        if (!this.gameActive) return;
        
        const input = e.target.value.trim().toLowerCase();
        this.currentInput = input;
        
        if (input === '') {
            this.resetWordHighlights();
            this.feedbackElement.textContent = '';
            this.feedbackElement.className = 'feedback';
            return;
        }
        
        // 落下中の単語で部分一致を検索
        let foundMatch = false;
        let perfectMatch = null;
        
        this.fallingWords.forEach(wordData => {
            if (wordData.completed || wordData.missed) return;
            
            if (wordData.text.toLowerCase().startsWith(input)) {
                wordData.typed = input;
                wordData.element.classList.add('typed');
                foundMatch = true;
                
                if (wordData.text.toLowerCase() === input) {
                    perfectMatch = wordData;
                    this.feedbackElement.textContent = '✓ 完璧！';
                    this.feedbackElement.className = 'feedback success';
                } else {
                    this.feedbackElement.textContent = `入力中: ${wordData.text}`;
                    this.feedbackElement.className = 'feedback';
                }
            } else {
                wordData.element.classList.remove('typed');
                wordData.typed = '';
            }
        });
        
        if (!foundMatch) {
            this.feedbackElement.textContent = '× 単語が見つかりません';
            this.feedbackElement.className = 'feedback error';
        }
        
        // 完全一致した場合は自動的に確定
        if (perfectMatch) {
            this.completeWord(perfectMatch);
            this.inputFieldElement.value = '';
            this.resetWordHighlights();
        }
    }
    
    resetWordHighlights() {
        this.fallingWords.forEach(wordData => {
            if (!wordData.completed && !wordData.missed) {
                wordData.element.classList.remove('typed');
                wordData.typed = '';
            }
        });
    }
    
    completeWord(wordData) {
        if (wordData.completed || wordData.missed) return;
        
        this.totalAttempts++;
        this.correctAttempts++;
        this.score++;
        this.consecutiveCorrect++;
        
        wordData.completed = true;
        wordData.element.classList.add('completed');
        
        // 連続正解ボーナス（3回連続で時間延長）
        if (this.consecutiveCorrect >= 3) {
            this.timeLeft += 1;
            this.consecutiveCorrect = 0;
            this.feedbackElement.textContent = '🎉 ボーナス！時間が1秒延長されました！';
            this.feedbackElement.className = 'feedback bonus';
        } else {
            this.feedbackElement.textContent = '✓ 正解！';
            this.feedbackElement.className = 'feedback success';
        }
        
        // 単語を削除
        setTimeout(() => {
            this.removeWord(wordData);
        }, 500);
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.timerElement.textContent = this.timeLeft;
        this.scoreElement.textContent = this.score;
        
        const accuracy = this.totalAttempts > 0 ? 
            Math.round((this.correctAttempts / this.totalAttempts) * 100) : 100;
        this.accuracyElement.textContent = accuracy;
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    endGame() {
        this.gameActive = false;
        clearInterval(this.timer);
        clearInterval(this.wordSpawnTimer);
        
        this.inputFieldElement.disabled = true;
        this.gameAreaElement.style.display = 'none';
        
        // 結果を計算
        const gameTime = (Date.now() - this.gameStartTime) / 1000 / 60; // 分
        const wpm = Math.round(this.score / gameTime);
        const accuracy = this.totalAttempts > 0 ? 
            Math.round((this.correctAttempts / this.totalAttempts) * 100) : 100;
        
        // 結果を表示
        this.finalScoreElement.textContent = this.score;
        this.finalAccuracyElement.textContent = accuracy;
        this.wpmElement.textContent = wpm;
        
        this.resultScreenElement.classList.remove('hidden');
    }
    
    restartGame() {
        // すべてのタイマーをクリア
        if (this.timer) clearInterval(this.timer);
        if (this.wordSpawnTimer) clearInterval(this.wordSpawnTimer);
        
        this.startGame();
    }
}

// ゲームを初期化
document.addEventListener('DOMContentLoaded', () => {
    new TypingGame();
});
