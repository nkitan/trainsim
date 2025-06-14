/**
 * Scene.js - Manages the 3D scene, camera, and renderer
 */
class Scene3D {
    constructor() {
        // Create the scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Create the camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.set(0, 2, 5);
        
        // Create the renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add renderer to the DOM
        const container = document.getElementById('gameCanvas');
        container.appendChild(this.renderer.domElement);
        
        // Set up lighting
        this.setupLights();
        
        // Set up controls
        this.setupControls();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        // First-person mode flag
        this.firstPersonMode = false;
        
        // Create a group for the train
        this.trainGroup = new THREE.Group();
        this.scene.add(this.trainGroup);
        
        // Create a group for the tracks
        this.trackGroup = new THREE.Group();
        this.scene.add(this.trackGroup);
        
        // Create a group for the terrain
        this.terrainGroup = new THREE.Group();
        this.scene.add(this.terrainGroup);
    }
    
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        
        // Set up shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(directionalLight);
    }
    
    setupControls() {
        // Orbit controls for build mode
        this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.25;
        this.orbitControls.screenSpacePanning = false;
        this.orbitControls.maxPolarAngle = Math.PI / 2;
        this.orbitControls.enabled = true;
        
        // First-person controls for drive mode
        this.fpControls = new THREE.PointerLockControls(this.camera, this.renderer.domElement);
        
        // Add event listener for locking/unlocking controls
        document.addEventListener('click', () => {
            if (this.firstPersonMode && !this.fpControls.isLocked) {
                this.fpControls.lock();
            }
        });
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    setFirstPersonMode(enabled) {
        this.firstPersonMode = enabled;
        
        if (enabled) {
            // Disable orbit controls
            this.orbitControls.enabled = false;
            
            // Enable first-person controls
            this.fpControls.enabled = true;
        } else {
            // Enable orbit controls
            this.orbitControls.enabled = true;
            
            // Disable first-person controls
            if (this.fpControls.isLocked) {
                this.fpControls.unlock();
            }
        }
    }
    
    attachCameraToTrain(train) {
        if (this.firstPersonMode) {
            // Position camera at the front of the train
            this.camera.position.set(
                train.position.x + train.direction.x * 5,
                train.position.y + 2.5, // Height of driver's cabin
                train.position.z + train.direction.z * 5
            );
            
            // Look in the direction of travel
            this.camera.lookAt(
                train.position.x + train.direction.x * 100,
                train.position.y + 2.5,
                train.position.z + train.direction.z * 100
            );
        }
    }
    
    render() {
        if (this.orbitControls.enabled) {
            this.orbitControls.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // Add a new track segment to the scene
    addTrackSegment(segment) {
        this.trackGroup.add(segment.mesh);
    }
    
    // Remove a track segment from the scene
    removeTrackSegment(segment) {
        this.trackGroup.remove(segment.mesh);
    }
    
    // Clear all tracks from the scene
    clearTracks() {
        while (this.trackGroup.children.length > 0) {
            const object = this.trackGroup.children[0];
            this.trackGroup.remove(object);
        }
    }
}