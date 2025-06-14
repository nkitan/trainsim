/**
 * Models.js - Contains 3D models for the railway simulator
 */
class Models {
    constructor(scene) {
        this.scene = scene;
        this.trainModels = {};
        this.trackModels = {};
        this.stationModels = {};
        this.signalModels = {};
        
        // Initialize models
        this.initTrainModels();
        this.initTrackModels();
        this.initStationModels();
        this.initSignalModels();
    }
    
    initTrainModels() {
        // Create a simple locomotive model
        const createLocomotive = () => {
            const group = new THREE.Group();
            
            // Main body - Positioned to align with tracks
            const bodyGeometry = new THREE.BoxGeometry(10, 3, 3);
            const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.set(0, 1.5, 0); // Positioned to align with tracks (0.75 wheel radius + 0.1 sleeper height + 0.65 body clearance)
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);
            
            // Cabin
            const cabinGeometry = new THREE.BoxGeometry(4, 2, 3);
            const cabinMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
            const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
            cabin.position.set(3, 4.0, 0); // Positioned on top of the body
            cabin.castShadow = true;
            cabin.receiveShadow = true;
            group.add(cabin);
            
            // Windows
            const windowMaterial = new THREE.MeshPhongMaterial({ color: 0xecf0f1, transparent: true, opacity: 0.7 });
            
            // Front window
            const frontWindowGeometry = new THREE.PlaneGeometry(1.5, 1);
            const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
            frontWindow.position.set(5.01, 4.0, 0); // Aligned with cabin
            frontWindow.rotation.y = Math.PI / 2;
            group.add(frontWindow);
            
            // Side windows
            const sideWindowGeometry = new THREE.PlaneGeometry(2, 1);
            
            const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
            leftWindow.position.set(3, 4.0, 1.51); // Aligned with cabin
            group.add(leftWindow);
            
            const rightWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
            rightWindow.position.set(3, 4.0, -1.51); // Aligned with cabin
            rightWindow.rotation.y = Math.PI;
            group.add(rightWindow);
            
            // Wheels
            const wheelGeometry = new THREE.CylinderGeometry(0.75, 0.75, 0.5, 16);
            const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            
            // Create 8 wheels (4 on each side) - Positioned exactly on the rails
            const wheelPositions = [
                [-3.5, 0.75, 1.0], [-1.5, 0.75, 1.0], [1.5, 0.75, 1.0], [3.5, 0.75, 1.0],
                [-3.5, 0.75, -1.0], [-1.5, 0.75, -1.0], [1.5, 0.75, -1.0], [3.5, 0.75, -1.0]
            ];
            
            wheelPositions.forEach(pos => {
                const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                wheel.position.set(pos[0], pos[1], pos[2]);
                wheel.rotation.z = Math.PI / 2;
                wheel.castShadow = true;
                wheel.receiveShadow = true;
                group.add(wheel);
            });
            
            // Rotate the entire train to face forward along the X axis
            group.rotation.y = Math.PI / 2;
            
            return group;
        };
        
        // Create a simple passenger car model
        const createPassengerCar = () => {
            const group = new THREE.Group();
            
            // Main body - Positioned to align with tracks
            const bodyGeometry = new THREE.BoxGeometry(12, 3, 3);
            const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x2ecc71 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.set(0, 1.5, 0); // Positioned to align with tracks (0.75 wheel radius + 0.1 sleeper height + 0.65 body clearance)
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);
            
            // Windows
            const windowMaterial = new THREE.MeshPhongMaterial({ color: 0xecf0f1, transparent: true, opacity: 0.7 });
            
            // Create windows along the sides
            for (let i = -4; i <= 4; i += 2) {
                // Left side windows
                const leftWindow = new THREE.Mesh(
                    new THREE.PlaneGeometry(1.5, 1),
                    windowMaterial
                );
                leftWindow.position.set(i, 2.0, 1.51); // Positioned on the body
                group.add(leftWindow);
                
                // Right side windows
                const rightWindow = new THREE.Mesh(
                    new THREE.PlaneGeometry(1.5, 1),
                    windowMaterial
                );
                rightWindow.position.set(i, 2.0, -1.51); // Positioned on the body
                rightWindow.rotation.y = Math.PI;
                group.add(rightWindow);
            }
            
            // Wheels
            const wheelGeometry = new THREE.CylinderGeometry(0.75, 0.75, 0.5, 16);
            const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            
            // Create 8 wheels (4 on each side) - Positioned exactly on the rails
            const wheelPositions = [
                [-4, 0.75, 1.0], [-2, 0.75, 1.0], [2, 0.75, 1.0], [4, 0.75, 1.0],
                [-4, 0.75, -1.0], [-2, 0.75, -1.0], [2, 0.75, -1.0], [4, 0.75, -1.0]
            ];
            
            wheelPositions.forEach(pos => {
                const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                wheel.position.set(pos[0], pos[1], pos[2]);
                wheel.rotation.z = Math.PI / 2;
                wheel.castShadow = true;
                wheel.receiveShadow = true;
                group.add(wheel);
            });
            
            // Rotate the entire car to face forward along the X axis
            group.rotation.y = Math.PI / 2;
            
            return group;
        };
        
        // Store the models
        this.trainModels.locomotive = createLocomotive();
        this.trainModels.passengerCar = createPassengerCar();
    }
    
    initTrackModels() {
        // Create a straight track segment
        const createStraightTrack = (length = 10) => {
            const group = new THREE.Group();
            
            // Rails
            const railGeometry = new THREE.BoxGeometry(length, 0.2, 0.3);
            const railMaterial = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
            
            const leftRail = new THREE.Mesh(railGeometry, railMaterial);
            leftRail.position.set(0, 0, 1);
            leftRail.castShadow = true;
            leftRail.receiveShadow = true;
            group.add(leftRail);
            
            const rightRail = new THREE.Mesh(railGeometry, railMaterial);
            rightRail.position.set(0, 0, -1);
            rightRail.castShadow = true;
            rightRail.receiveShadow = true;
            group.add(rightRail);
            
            // Sleepers (railroad ties)
            const sleeperGeometry = new THREE.BoxGeometry(0.5, 0.1, 3);
            const sleeperMaterial = new THREE.MeshPhongMaterial({ color: 0x5d4037 });
            
            const sleeperCount = Math.floor(length / 1);
            for (let i = 0; i < sleeperCount; i++) {
                const sleeper = new THREE.Mesh(sleeperGeometry, sleeperMaterial);
                sleeper.position.set(-length/2 + i * (length/sleeperCount) + 0.5, -0.1, 0);
                sleeper.castShadow = true;
                sleeper.receiveShadow = true;
                group.add(sleeper);
            }
            
            return group;
        };
        
        // Create a curved track segment
        const createCurvedTrack = (radius = 20, angle = Math.PI/2) => {
            const group = new THREE.Group();
            
            // Rails
            const railMaterial = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
            
            // Create curved rails using tube geometry
            const innerRadius = radius - 1;
            const outerRadius = radius + 1;
            
            // Inner rail
            const innerCurve = new THREE.EllipseCurve(
                0, 0,             // Center x, y
                innerRadius, innerRadius, // xRadius, yRadius
                0, angle,         // startAngle, endAngle
                false,            // clockwise
                0                 // rotation
            );
            
            const innerPoints = innerCurve.getPoints(50);
            const innerPath = new THREE.BufferGeometry().setFromPoints(innerPoints);
            const innerRail = new THREE.Mesh(
                new THREE.TubeGeometry(
                    new THREE.CatmullRomCurve3(
                        innerPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
                    ),
                    50,
                    0.15,
                    8,
                    false
                ),
                railMaterial
            );
            innerRail.castShadow = true;
            innerRail.receiveShadow = true;
            group.add(innerRail);
            
            // Outer rail
            const outerCurve = new THREE.EllipseCurve(
                0, 0,             // Center x, y
                outerRadius, outerRadius, // xRadius, yRadius
                0, angle,         // startAngle, endAngle
                false,            // clockwise
                0                 // rotation
            );
            
            const outerPoints = outerCurve.getPoints(50);
            const outerPath = new THREE.BufferGeometry().setFromPoints(outerPoints);
            const outerRail = new THREE.Mesh(
                new THREE.TubeGeometry(
                    new THREE.CatmullRomCurve3(
                        outerPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
                    ),
                    50,
                    0.15,
                    8,
                    false
                ),
                railMaterial
            );
            outerRail.castShadow = true;
            outerRail.receiveShadow = true;
            group.add(outerRail);
            
            // Sleepers (railroad ties)
            const sleeperMaterial = new THREE.MeshPhongMaterial({ color: 0x5d4037 });
            const sleeperCount = Math.floor(angle * radius / 1);
            
            for (let i = 0; i <= sleeperCount; i++) {
                const sleeperAngle = (i / sleeperCount) * angle;
                const sleeperX = Math.cos(sleeperAngle) * radius;
                const sleeperZ = Math.sin(sleeperAngle) * radius;
                
                const sleeper = new THREE.Mesh(
                    new THREE.BoxGeometry(3, 0.1, 0.5),
                    sleeperMaterial
                );
                
                sleeper.position.set(sleeperX, -0.1, sleeperZ);
                sleeper.rotation.y = sleeperAngle + Math.PI/2;
                sleeper.castShadow = true;
                sleeper.receiveShadow = true;
                group.add(sleeper);
            }
            
            return group;
        };
        
        // Store the models
        this.trackModels.straight = createStraightTrack();
        this.trackModels.curve = createCurvedTrack();
    }
    
    initStationModels() {
        // Create a simple station model
        const createStation = () => {
            const group = new THREE.Group();
            
            // Platform
            const platformGeometry = new THREE.BoxGeometry(20, 0.5, 5);
            const platformMaterial = new THREE.MeshPhongMaterial({ color: 0xe74c3c });
            const platform = new THREE.Mesh(platformGeometry, platformMaterial);
            platform.position.set(0, 0.25, 3);
            platform.castShadow = true;
            platform.receiveShadow = true;
            group.add(platform);
            
            // Station building
            const buildingGeometry = new THREE.BoxGeometry(10, 5, 4);
            const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0xecf0f1 });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            building.position.set(0, 2.75, 6);
            building.castShadow = true;
            building.receiveShadow = true;
            group.add(building);
            
            // Roof
            const roofGeometry = new THREE.ConeGeometry(7, 3, 4);
            const roofMaterial = new THREE.MeshPhongMaterial({ color: 0xc0392b });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.set(0, 6.75, 6);
            roof.rotation.y = Math.PI / 4;
            roof.castShadow = true;
            roof.receiveShadow = true;
            group.add(roof);
            
            // Windows and door
            const windowMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db, transparent: true, opacity: 0.7 });
            
            // Front door
            const doorGeometry = new THREE.PlaneGeometry(2, 3);
            const door = new THREE.Mesh(doorGeometry, new THREE.MeshPhongMaterial({ color: 0x7f8c8d }));
            door.position.set(0, 1.75, 8.01);
            group.add(door);
            
            // Windows
            const windowGeometry = new THREE.PlaneGeometry(1.5, 1.5);
            
            // Front windows
            for (let i = -3; i <= 3; i += 3) {
                if (i !== 0) { // Skip the door position
                    const window = new THREE.Mesh(windowGeometry, windowMaterial);
                    window.position.set(i, 3, 8.01);
                    group.add(window);
                }
            }
            
            // Side windows
            for (let i = -3; i <= 3; i += 3) {
                // Left side
                const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                leftWindow.position.set(-5.01, 3, i + 6);
                leftWindow.rotation.y = Math.PI / 2;
                group.add(leftWindow);
                
                // Right side
                const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                rightWindow.position.set(5.01, 3, i + 6);
                rightWindow.rotation.y = -Math.PI / 2;
                group.add(rightWindow);
            }
            
            // Station sign
            const signGeometry = new THREE.BoxGeometry(8, 1, 0.2);
            const signMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
            const sign = new THREE.Mesh(signGeometry, signMaterial);
            sign.position.set(0, 5, 8.1);
            sign.castShadow = true;
            sign.receiveShadow = true;
            group.add(sign);
            
            return group;
        };
        
        // Store the model
        this.stationModels.standard = createStation();
    }
    
    initSignalModels() {
        // Create a signal model
        const createSignal = () => {
            const group = new THREE.Group();
            
            // Signal post
            const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
            const postMaterial = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.set(0, 2.5, 0);
            post.castShadow = true;
            post.receiveShadow = true;
            group.add(post);
            
            // Signal head
            const headGeometry = new THREE.BoxGeometry(0.5, 1.2, 0.5);
            const headMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.set(0, 5, 0.3);
            head.castShadow = true;
            head.receiveShadow = true;
            group.add(head);
            
            // Signal lights
            const lightGeometry = new THREE.CircleGeometry(0.15, 16);
            
            // Red light
            const redLightMaterial = new THREE.MeshBasicMaterial({ color: 0xe74c3c });
            const redLight = new THREE.Mesh(lightGeometry, redLightMaterial);
            redLight.position.set(0, 5.3, 0.55);
            redLight.name = 'redLight';
            group.add(redLight);
            
            // Yellow light
            const yellowLightMaterial = new THREE.MeshBasicMaterial({ color: 0xf1c40f });
            const yellowLight = new THREE.Mesh(lightGeometry, yellowLightMaterial);
            yellowLight.position.set(0, 5, 0.55);
            yellowLight.name = 'yellowLight';
            group.add(yellowLight);
            
            // Green light
            const greenLightMaterial = new THREE.MeshBasicMaterial({ color: 0x2ecc71 });
            const greenLight = new THREE.Mesh(lightGeometry, greenLightMaterial);
            greenLight.position.set(0, 4.7, 0.55);
            greenLight.name = 'greenLight';
            group.add(greenLight);
            
            // Set initial state (all lights off)
            redLight.visible = false;
            yellowLight.visible = false;
            greenLight.visible = true; // Green light on by default
            
            return group;
        };
        
        // Store the model
        this.signalModels.standard = createSignal();
    }
    
    // Get a clone of a train model
    getTrainModel(type = 'locomotive') {
        if (this.trainModels[type]) {
            return this.trainModels[type].clone();
        }
        return null;
    }
    
    // Get a clone of a track model
    getTrackModel(type = 'straight', params = {}) {
        if (type === 'straight') {
            const length = params.length || 10;
            const group = new THREE.Group();
            
            // Rails
            const railGeometry = new THREE.BoxGeometry(length, 0.2, 0.3);
            const railMaterial = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
            
            const leftRail = new THREE.Mesh(railGeometry, railMaterial);
            leftRail.position.set(0, 0, 1);
            leftRail.castShadow = true;
            leftRail.receiveShadow = true;
            group.add(leftRail);
            
            const rightRail = new THREE.Mesh(railGeometry, railMaterial);
            rightRail.position.set(0, 0, -1);
            rightRail.castShadow = true;
            rightRail.receiveShadow = true;
            group.add(rightRail);
            
            // Sleepers (railroad ties)
            const sleeperGeometry = new THREE.BoxGeometry(0.5, 0.1, 3);
            const sleeperMaterial = new THREE.MeshPhongMaterial({ color: 0x5d4037 });
            
            const sleeperCount = Math.floor(length / 1);
            for (let i = 0; i < sleeperCount; i++) {
                const sleeper = new THREE.Mesh(sleeperGeometry, sleeperMaterial);
                sleeper.position.set(-length/2 + i * (length/sleeperCount) + 0.5, -0.1, 0);
                sleeper.castShadow = true;
                sleeper.receiveShadow = true;
                group.add(sleeper);
            }
            
            return group;
        } else if (type === 'curve') {
            const radius = params.radius || 20;
            const angle = params.angle || Math.PI/2;
            return this.trackModels.curve.clone();
        }
        
        return null;
    }
    
    // Get a clone of a station model
    getStationModel(type = 'standard') {
        if (this.stationModels[type]) {
            return this.stationModels[type].clone();
        }
        return null;
    }
    
    // Get a clone of a signal model
    getSignalModel(type = 'standard') {
        if (this.signalModels[type]) {
            return this.signalModels[type].clone();
        }
        return null;
    }
}