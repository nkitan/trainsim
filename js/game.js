class RailwaySimulator {
    constructor() {
        // Get DOM elements
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.speedControl = document.getElementById('speedControl');
        this.speedValue = document.getElementById('speedValue');
        this.speedometer = document.getElementById('speedometer');
        this.distanceDisplay = document.getElementById('distance');
        this.nextSignalDisplay = document.getElementById('nextSignal');
        this.buildModeBtn = document.getElementById('buildModeBtn');
        this.driveModeBtn = document.getElementById('driveModeBtn');
        
        // Create loading indicator
        this.createLoadingIndicator();
        
        // Initialize 3D scene
        this.scene = new Scene3D();
        
        // Create terrain
        this.terrain = new Terrain(this.scene);
        
        // Initialize models
        this.models = new Models(this.scene);
        
        // Game objects
        this.track = new Track({}, this.models);
        
        // Add track segments to scene
        this.track.segments.forEach(segment => {
            this.scene.trackGroup.add(segment.mesh);
        });
        
        // Create train
        this.train = new Train({
            x: -90, // Start position
            y: 0,
            z: 0
        }, this.models);
        
        // Add train to scene
        this.scene.trainGroup.add(this.train.mesh);
        
        // Initialize track builder
        this.builder = new TrackBuilder(this.scene, this.track, this.models);
        
        // Game state
        this.isRunning = false;
        this.lastTimestamp = 0;
        this.gameMode = 'drive'; // 'drive' or 'build'
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Hide loading indicator
        this.hideLoadingIndicator();
        
        // Start the render loop
        this.render();
    }
    
    createLoadingIndicator() {
        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.innerHTML = '<div class="loading-text">Loading 3D Railway Simulator...</div>';
        document.body.appendChild(loading);
        this.loadingIndicator = loading;
    }
    
    hideLoadingIndicator() {
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.add('hidden');
        }
    }
    
    initEventListeners() {
        // Game controls
        this.startBtn.addEventListener('click', () => this.startGame());
        this.stopBtn.addEventListener('click', () => this.stopGame());
        
        // Speed control
        this.speedControl.addEventListener('input', () => {
            const targetSpeed = parseInt(this.speedControl.value);
            this.speedValue.textContent = targetSpeed;
            this.train.accelerate(targetSpeed);
        });
        
        // Mode switching
        this.buildModeBtn.addEventListener('click', () => this.setGameMode('build'));
        this.driveModeBtn.addEventListener('click', () => this.setGameMode('drive'));
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gameMode === 'drive') {
                switch(e.key) {
                    case 'ArrowUp':
                        this.increaseSpeed();
                        break;
                    case 'ArrowDown':
                        this.decreaseSpeed();
                        break;
                    case ' ':  // Spacebar
                        this.emergencyBrake();
                        break;
                    case 'v':  // Toggle view
                        this.toggleView();
                        break;
                }
            }
        });
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        
        if (mode === 'build') {
            // Activate builder
            this.builder.activate();
            
            // Update UI
            this.buildModeBtn.classList.add('active');
            this.driveModeBtn.classList.remove('active');
            
            // Stop the train
            this.stopGame();
        } else {
            // Deactivate builder
            this.builder.deactivate();
            
            // Update UI
            this.buildModeBtn.classList.remove('active');
            this.driveModeBtn.classList.add('active');
        }
    }
    
    toggleView() {
        // Toggle between third-person and first-person view
        this.scene.setFirstPersonMode(!this.scene.firstPersonMode);
    }
    
    startGame() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTimestamp = performance.now();
            
            // Switch to drive mode
            this.setGameMode('drive');
        }
    }
    
    stopGame() {
        this.isRunning = false;
        this.train.brake();
        this.speedControl.value = 0;
        this.speedValue.textContent = 0;
    }
    
    increaseSpeed() {
        const newSpeed = Math.min(parseInt(this.speedControl.value) + 5, 100);
        this.speedControl.value = newSpeed;
        this.speedValue.textContent = newSpeed;
        this.train.accelerate(newSpeed);
    }
    
    decreaseSpeed() {
        const newSpeed = Math.max(parseInt(this.speedControl.value) - 5, 0);
        this.speedControl.value = newSpeed;
        this.speedValue.textContent = newSpeed;
        this.train.accelerate(newSpeed);
    }
    
    emergencyBrake() {
        this.train.emergencyBrake();
        this.speedControl.value = 0;
        this.speedValue.textContent = 0;
    }
    
    updateGameState(deltaTime) {
        if (this.isRunning) {
            // Update train
            this.train.update(deltaTime, this.track);
            
            // Check for signals
            const nextSignal = this.track.getNextSignal(this.train.position, this.train.direction);
            if (nextSignal) {
                // Update signal display
                const signalLight = this.nextSignalDisplay.querySelector('.signal-light');
                signalLight.className = 'signal-light ' + nextSignal.state;
                
                // Auto-brake for red signals
                if (nextSignal.state === 'red' && 
                    nextSignal.distance < 50 && 
                    this.train.speed > 0) {
                    this.decreaseSpeed();
                }
            }
        }
        
        // Update dashboard
        this.updateDashboard();
        
        // Update camera position in first-person mode
        if (this.scene.firstPersonMode) {
            this.scene.attachCameraToTrain(this.train);
        }
    }
    
    updateDashboard() {
        // Update speedometer
        this.speedometer.textContent = Math.round(this.train.speed);
        
        // Update distance (convert meters to kilometers)
        const distanceInKm = (this.train.distanceTraveled / 1000).toFixed(1);
        this.distanceDisplay.textContent = distanceInKm;
    }
    
    render(timestamp) {
        if (timestamp) {
            // Calculate time since last frame
            const deltaTime = this.lastTimestamp ? timestamp - this.lastTimestamp : 16.7;
            this.lastTimestamp = timestamp;
            
            // Update game state
            this.updateGameState(deltaTime);
        }
        
        // Render the scene
        this.scene.render();
        
        // Schedule next frame
        requestAnimationFrame((timestamp) => this.render(timestamp));
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    // Create instructions element
    const instructions = document.createElement('div');
    instructions.className = 'instructions';
    instructions.innerHTML = `
        <h2>3D Railway Simulator</h2>
        <p>Use the controls to drive the train or build your railway network.</p>
        <h3>Drive Mode:</h3>
        <ul>
            <li>Arrow Up/Down: Increase/decrease speed</li>
            <li>Spacebar: Emergency brake</li>
            <li>V: Toggle between first-person and third-person view</li>
        </ul>
        <h3>Build Mode:</h3>
        <ul>
            <li>Click to place track segments, stations, or signals</li>
            <li>R: Toggle between straight and curved track</li>
            <li>ESC: Cancel current action</li>
        </ul>
        <p>Click anywhere to start</p>
    `;
    document.body.appendChild(instructions);
    
    // Hide instructions on click
    document.addEventListener('click', () => {
        instructions.classList.add('hidden');
    }, { once: true });
    
    // Initialize the game
    const game = new RailwaySimulator();
});