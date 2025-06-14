class Train {
    constructor(options = {}, models) {
        // Train properties
        this.position = new THREE.Vector3(options.x || 0, options.y || 0, options.z || 0);
        this.direction = new THREE.Vector3(1, 0, 0); // Default direction along X axis
        this.speed = options.speed || 0; // Speed in km/h
        this.maxSpeed = options.maxSpeed || 120; // Maximum speed in km/h
        this.acceleration = options.acceleration || 0.5; // Acceleration in km/h/s
        this.deceleration = options.deceleration || 1.0; // Deceleration in km/h/s
        this.length = options.length || 20; // Length in meters
        this.targetSpeed = 0; // Target speed set by the driver
        
        // Train state
        this.isMoving = false;
        this.distanceTraveled = 0; // Total distance traveled in meters
        
        // Physics properties
        this.mass = options.mass || 80000; // Mass in kg
        this.rollingResistance = options.rollingResistance || 0.002; // Rolling resistance coefficient
        this.airResistance = options.airResistance || 0.0005; // Air resistance coefficient
        
        // 3D model
        this.models = models;
        this.trainCars = [];
        this.mesh = new THREE.Group();
        
        // Create the train
        this.createTrain(options.type || 'passenger');
    }
    
    createTrain(type) {
        // Clear any existing train cars
        while (this.mesh.children.length > 0) {
            this.mesh.remove(this.mesh.children[0]);
        }
        this.trainCars = [];
        
        // Create locomotive
        const locomotive = this.models.getTrainModel('locomotive');
        this.mesh.add(locomotive);
        this.trainCars.push(locomotive);
        
        // Add passenger cars based on type
        if (type === 'passenger') {
            const carCount = 3;
            let carOffset = -15; // Start position behind locomotive
            
            for (let i = 0; i < carCount; i++) {
                const car = this.models.getTrainModel('passengerCar');
                car.position.x = carOffset;
                this.mesh.add(car);
                this.trainCars.push(car);
                carOffset -= 15; // Space between cars
            }
        }
        
        // Set initial position
        this.mesh.position.copy(this.position);
    }
    
    accelerate(targetSpeed) {
        this.targetSpeed = Math.min(targetSpeed, this.maxSpeed);
        this.isMoving = this.targetSpeed > 0;
    }
    
    brake() {
        this.targetSpeed = 0;
    }
    
    emergencyBrake() {
        this.speed = 0;
        this.targetSpeed = 0;
        this.isMoving = false;
    }
    
    calculateResistance() {
        // Calculate total resistance force in Newtons
        // Rolling resistance: F_r = C_r * m * g
        const rollingResistanceForce = this.rollingResistance * this.mass * 9.81;
        
        // Air resistance: F_a = C_a * v^2
        const speedInMS = this.speed * 1000 / 3600; // Convert km/h to m/s
        const airResistanceForce = this.airResistance * speedInMS * speedInMS;
        
        // Total resistance
        return rollingResistanceForce + airResistanceForce;
    }
    
    update(deltaTime, track) {
        // Convert deltaTime from ms to seconds
        const dt = deltaTime / 1000;
        
        // Calculate forces and acceleration
        if (this.speed < this.targetSpeed) {
            // Accelerating
            this.speed += this.acceleration * dt;
            if (this.speed > this.targetSpeed) {
                this.speed = this.targetSpeed;
            }
        } else if (this.speed > this.targetSpeed) {
            // Braking
            this.speed -= this.deceleration * dt;
            if (this.speed < this.targetSpeed) {
                this.speed = this.targetSpeed;
            }
        }
        
        // Apply resistance
        if (this.speed > 0) {
            const resistance = this.calculateResistance();
            const resistanceDeceleration = resistance / this.mass; // F = m * a, so a = F / m
            
            // Convert deceleration from m/s² to km/h/s
            const resistanceDecelerationKmh = resistanceDeceleration * 3.6;
            
            this.speed -= resistanceDecelerationKmh * dt;
        }
        
        // Ensure speed doesn't go negative
        this.speed = Math.max(0, this.speed);
        
        // Update position based on speed
        // Convert km/h to m/s: km/h * 1000 / 3600 = m/s
        const speedInMetersPerSecond = this.speed * 1000 / 3600;
        
        // Move train along its direction vector
        const movement = new THREE.Vector3()
            .copy(this.direction)
            .multiplyScalar(speedInMetersPerSecond * dt);
        
        this.position.add(movement);
        this.mesh.position.copy(this.position);
        
        // Update distance traveled
        this.distanceTraveled += speedInMetersPerSecond * dt;
        
        // Update train car wheels rotation based on speed
        this.updateWheelRotation(speedInMetersPerSecond, dt);
        
        // If we're on a track, follow it
        if (track) {
            this.followTrack(track);
        }
    }
    
    updateWheelRotation(speedInMetersPerSecond, dt) {
        // Rotate wheels based on speed
        // Assuming wheel radius of 0.75m
        const wheelRadius = 0.75;
        const rotationSpeed = speedInMetersPerSecond / wheelRadius;
        
        // Update each train car
        this.trainCars.forEach(car => {
            car.children.forEach(child => {
                // Check if this is a wheel (cylinder geometry)
                if (child.geometry && child.geometry.type === 'CylinderGeometry' && 
                    child.geometry.parameters.radiusTop === wheelRadius) {
                    child.rotation.x += rotationSpeed * dt;
                }
            });
        });
    }
    
    followTrack(track) {
        // This is a simplified track following logic
        // In a real implementation, this would use the track's curve data
        // to position and orient the train correctly
        
        // Find the closest track segment
        const closestSegment = track.getClosestSegment(this.position);
        
        if (closestSegment) {
            // Get the direction of the track at this point
            const trackDirection = closestSegment.getDirectionAt(this.position);
            
            // Smoothly rotate the train to follow the track
            if (trackDirection) {
                // Interpolate current direction with track direction
                this.direction.lerp(trackDirection, 0.1);
                this.direction.normalize();
                
                // Update train orientation
                this.mesh.lookAt(
                    this.position.x + this.direction.x,
                    this.position.y + this.direction.y,
                    this.position.z + this.direction.z
                );
            }
        }
    }
    
    // Get the front position of the train (for camera placement)
    getFrontPosition() {
        return new THREE.Vector3()
            .copy(this.position)
            .add(new THREE.Vector3()
                .copy(this.direction)
                .multiplyScalar(5)); // 5 meters in front of the train
    }
    
    // Get the driver's view position
    getDriverViewPosition() {
        return new THREE.Vector3()
            .copy(this.position)
            .add(new THREE.Vector3(0, 2.5, 0)) // Height of driver's cabin
            .add(new THREE.Vector3()
                .copy(this.direction)
                .multiplyScalar(4)); // 4 meters from the center of the train
    }
}