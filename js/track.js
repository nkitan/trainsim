class TrackSegment {
    constructor(options = {}, models) {
        this.type = options.type || 'straight';
        this.start = new THREE.Vector3(options.startX || 0, options.startY || 0, options.startZ || 0);
        this.end = new THREE.Vector3(options.endX || 10, options.endY || 0, options.endZ || 0);
        this.length = options.length || this.start.distanceTo(this.end);
        this.stations = options.stations || [];
        this.signals = options.signals || [];
        this.models = models;
        this.mesh = null;
        
        // For curved tracks
        this.radius = options.radius || 20;
        this.angle = options.angle || Math.PI/2;
        this.center = options.center || null;
        
        // Create the 3D model
        this.createMesh();
    }
    
    createMesh() {
        if (this.type === 'straight') {
            // Create a straight track segment
            this.mesh = this.models.getTrackModel('straight', { length: this.length });
            
            // Calculate direction vector
            const direction = new THREE.Vector3().subVectors(this.end, this.start).normalize();
            
            // Position the track
            this.mesh.position.copy(this.start);
            
            // Orient the track to point from start to end
            this.mesh.lookAt(this.end);
            
            // Move the track so its center is at the midpoint between start and end
            const midpoint = new THREE.Vector3().addVectors(this.start, this.end).multiplyScalar(0.5);
            this.mesh.position.copy(midpoint);
            
        } else if (this.type === 'curve') {
            // Create a curved track segment
            this.mesh = this.models.getTrackModel('curve', { 
                radius: this.radius, 
                angle: this.angle 
            });
            
            // Position the track
            if (this.center) {
                this.mesh.position.copy(this.center);
            } else {
                this.mesh.position.copy(this.start);
            }
        }
        
        // Add stations to the track
        this.addStations();
        
        // Add signals to the track
        this.addSignals();
    }
    
    addStations() {
        this.stations.forEach(station => {
            const stationModel = this.models.getStationModel();
            
            // Position the station based on its position along the track
            if (this.type === 'straight') {
                // For straight tracks, interpolate between start and end
                const t = station.position / this.length;
                const stationPos = new THREE.Vector3().lerpVectors(this.start, this.end, t);
                
                stationModel.position.copy(stationPos);
                
                // Orient the station perpendicular to the track
                const direction = new THREE.Vector3().subVectors(this.end, this.start).normalize();
                const angle = Math.atan2(direction.z, direction.x);
                stationModel.rotation.y = angle + Math.PI/2;
            } else if (this.type === 'curve') {
                // For curved tracks, position along the curve
                const t = station.position / this.length;
                const angle = t * this.angle;
                
                const x = this.center.x + this.radius * Math.cos(angle);
                const z = this.center.z + this.radius * Math.sin(angle);
                
                stationModel.position.set(x, 0, z);
                stationModel.rotation.y = angle + Math.PI/2;
            }
            
            this.mesh.add(stationModel);
        });
    }
    
    addSignals() {
        this.signals.forEach(signal => {
            const signalModel = this.models.getSignalModel();
            
            // Position the signal based on its position along the track
            if (this.type === 'straight') {
                // For straight tracks, interpolate between start and end
                const t = signal.position / this.length;
                const signalPos = new THREE.Vector3().lerpVectors(this.start, this.end, t);
                
                signalModel.position.copy(signalPos);
                
                // Orient the signal perpendicular to the track
                const direction = new THREE.Vector3().subVectors(this.end, this.start).normalize();
                const angle = Math.atan2(direction.z, direction.x);
                signalModel.rotation.y = angle + Math.PI/2;
            } else if (this.type === 'curve') {
                // For curved tracks, position along the curve
                const t = signal.position / this.length;
                const angle = t * this.angle;
                
                const x = this.center.x + this.radius * Math.cos(angle);
                const z = this.center.z + this.radius * Math.sin(angle);
                
                signalModel.position.set(x, 0, z);
                signalModel.rotation.y = angle + Math.PI/2;
            }
            
            // Set signal state
            const redLight = signalModel.getObjectByName('redLight');
            const yellowLight = signalModel.getObjectByName('yellowLight');
            const greenLight = signalModel.getObjectByName('greenLight');
            
            if (redLight && yellowLight && greenLight) {
                redLight.visible = signal.state === 'red';
                yellowLight.visible = signal.state === 'yellow';
                greenLight.visible = signal.state === 'green';
            }
            
            this.mesh.add(signalModel);
        });
    }
    
    // Get the direction vector at a specific position along the track
    getDirectionAt(position) {
        if (this.type === 'straight') {
            // For straight tracks, direction is constant
            return new THREE.Vector3().subVectors(this.end, this.start).normalize();
        } else if (this.type === 'curve') {
            // For curved tracks, direction is tangent to the curve
            // Find the closest point on the curve to the given position
            const closestPoint = this.getClosestPointOnCurve(position);
            
            // Calculate the tangent at this point
            const tangent = new THREE.Vector3();
            
            // For a circle centered at (cx, cz) with radius r,
            // the tangent at point (x, z) is perpendicular to the radius vector
            const radiusVector = new THREE.Vector3()
                .subVectors(closestPoint, this.center)
                .normalize();
            
            // Tangent is perpendicular to radius vector (rotate 90 degrees)
            tangent.set(-radiusVector.z, 0, radiusVector.x);
            
            return tangent;
        }
        
        return new THREE.Vector3(1, 0, 0); // Default direction
    }
    
    // Get the closest point on the curve to a given position
    getClosestPointOnCurve(position) {
        if (this.type === 'straight') {
            // For straight tracks, project the point onto the line
            const line = new THREE.Line3(this.start, this.end);
            const closestPoint = new THREE.Vector3();
            line.closestPointToPoint(position, true, closestPoint);
            return closestPoint;
        } else if (this.type === 'curve') {
            // For curved tracks, find the closest point on the circle
            const toPoint = new THREE.Vector3().subVectors(position, this.center);
            const distance = toPoint.length();
            
            // Normalize and scale to radius
            toPoint.normalize().multiplyScalar(this.radius);
            
            // Return the point on the circle
            return new THREE.Vector3().addVectors(this.center, toPoint);
        }
        
        return position.clone();
    }
    
    // Check if a point is on or near this track segment
    isPointOnTrack(position, threshold = 2) {
        const closestPoint = this.getClosestPointOnCurve(position);
        const distance = position.distanceTo(closestPoint);
        return distance <= threshold;
    }
}

class Track {
    constructor(options = {}, models) {
        this.segments = [];
        this.models = models;
        
        // Create default track if no segments provided
        if (!options.segments) {
            this.generateDefaultTrack();
        } else {
            options.segments.forEach(segmentOptions => {
                this.addSegment(segmentOptions);
            });
        }
    }
    
    generateDefaultTrack() {
        // Create a simple track layout
        
        // Start with a straight segment
        this.addSegment({
            type: 'straight',
            startX: -100, startY: 0, startZ: 0,
            endX: 100, endY: 0, endZ: 0,
            stations: [
                { name: 'Central Station', position: 0.25 } // 25% along the segment
            ],
            signals: [
                { position: 0.9, state: 'green' } // 90% along the segment
            ]
        });
        
        // Add a curved segment
        this.addSegment({
            type: 'curve',
            center: new THREE.Vector3(100, 0, 20),
            radius: 20,
            angle: Math.PI/2,
            signals: [
                { position: 0.5, state: 'green' } // 50% along the curve
            ]
        });
        
        // Add another straight segment
        this.addSegment({
            type: 'straight',
            startX: 120, startY: 0, startZ: 20,
            endX: 120, endY: 0, endZ: 120,
            stations: [
                { name: 'North Station', position: 0.7 } // 70% along the segment
            ],
            signals: [
                { position: 0.95, state: 'red' } // 95% along the segment
            ]
        });
    }
    
    addSegment(options) {
        const segment = new TrackSegment(options, this.models);
        this.segments.push(segment);
        return segment;
    }
    
    removeSegment(segment) {
        const index = this.segments.indexOf(segment);
        if (index !== -1) {
            this.segments.splice(index, 1);
        }
    }
    
    // Get the closest track segment to a given position
    getClosestSegment(position) {
        let closestSegment = null;
        let closestDistance = Infinity;
        
        this.segments.forEach(segment => {
            const closestPoint = segment.getClosestPointOnCurve(position);
            const distance = position.distanceTo(closestPoint);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestSegment = segment;
            }
        });
        
        return closestSegment;
    }
    
    // Get the next signal ahead of the train
    getNextSignal(position, direction) {
        // Find the segment the train is on
        const currentSegment = this.getClosestSegment(position);
        if (!currentSegment) return null;
        
        // Find signals on this segment that are ahead of the train
        let closestSignal = null;
        let closestDistance = Infinity;
        
        // Check signals on the current segment
        currentSegment.signals.forEach(signal => {
            // Calculate signal position in world coordinates
            let signalPosition;
            
            if (currentSegment.type === 'straight') {
                const t = signal.position / currentSegment.length;
                signalPosition = new THREE.Vector3().lerpVectors(
                    currentSegment.start, currentSegment.end, t
                );
            } else if (currentSegment.type === 'curve') {
                const t = signal.position / currentSegment.length;
                const angle = t * currentSegment.angle;
                
                const x = currentSegment.center.x + currentSegment.radius * Math.cos(angle);
                const z = currentSegment.center.z + currentSegment.radius * Math.sin(angle);
                
                signalPosition = new THREE.Vector3(x, 0, z);
            }
            
            // Check if signal is ahead of the train
            const toSignal = new THREE.Vector3().subVectors(signalPosition, position);
            const dotProduct = toSignal.dot(direction);
            
            if (dotProduct > 0) { // Signal is ahead
                const distance = position.distanceTo(signalPosition);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestSignal = {
                        position: signalPosition,
                        state: signal.state,
                        distance: distance
                    };
                }
            }
        });
        
        // If no signal found on current segment, check the next segments
        // This would require track connectivity information
        
        return closestSignal;
    }
}