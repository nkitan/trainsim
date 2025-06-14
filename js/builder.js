/**
 * Builder.js - Handles track building functionality
 */
class TrackBuilder {
    constructor(scene, track, models) {
        this.scene = scene;
        this.track = track;
        this.models = models;
        this.isActive = false;
        this.buildMode = 'track'; // 'track', 'station', 'signal'
        this.deleteMode = false;
        
        // For track building
        this.startPoint = null;
        this.endPoint = null;
        this.previewMesh = null;
        this.trackType = 'straight'; // 'straight' or 'curve'
        
        // For curved tracks
        this.curveCenter = null;
        this.curveRadius = 20;
        this.curveAngle = Math.PI/2;
        
        // Initialize UI elements
        this.buildControls = document.getElementById('buildControls');
        this.addTrackBtn = document.getElementById('addTrackBtn');
        this.addStationBtn = document.getElementById('addStationBtn');
        this.addSignalBtn = document.getElementById('addSignalBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Build mode buttons
        this.addTrackBtn.addEventListener('click', () => this.setBuildMode('track'));
        this.addStationBtn.addEventListener('click', () => this.setBuildMode('station'));
        this.addSignalBtn.addEventListener('click', () => this.setBuildMode('signal'));
        this.deleteBtn.addEventListener('click', () => this.toggleDeleteMode());
        
        // Mouse events for building
        this.scene.renderer.domElement.addEventListener('click', (event) => this.handleClick(event));
        this.scene.renderer.domElement.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        
        // Keyboard events for building
        document.addEventListener('keydown', (event) => {
            if (!this.isActive) return;
            
            switch (event.key) {
                case 'Escape':
                    this.cancelCurrentAction();
                    break;
                case 'r':
                    this.toggleTrackType();
                    break;
                case 'Delete':
                case 'Backspace':
                    if (this.selectedObject) {
                        this.deleteSelectedObject();
                    }
                    break;
            }
        });
    }
    
    activate() {
        this.isActive = true;
        this.buildControls.classList.add('active');
        this.scene.setFirstPersonMode(false); // Ensure we're in orbit mode for building
    }
    
    deactivate() {
        this.isActive = false;
        this.buildControls.classList.remove('active');
        this.cancelCurrentAction();
    }
    
    setBuildMode(mode) {
        this.buildMode = mode;
        this.deleteMode = false;
        this.cancelCurrentAction();
        
        // Update UI
        this.addTrackBtn.classList.toggle('active', mode === 'track');
        this.addStationBtn.classList.toggle('active', mode === 'station');
        this.addSignalBtn.classList.toggle('active', mode === 'signal');
        this.deleteBtn.classList.remove('active');
    }
    
    toggleDeleteMode() {
        this.deleteMode = !this.deleteMode;
        this.cancelCurrentAction();
        
        // Update UI
        this.deleteBtn.classList.toggle('active', this.deleteMode);
        this.addTrackBtn.classList.remove('active');
        this.addStationBtn.classList.remove('active');
        this.addSignalBtn.classList.remove('active');
    }
    
    toggleTrackType() {
        if (this.buildMode === 'track') {
            this.trackType = this.trackType === 'straight' ? 'curve' : 'straight';
            this.updatePreview();
        }
    }
    
    cancelCurrentAction() {
        this.startPoint = null;
        this.endPoint = null;
        
        if (this.previewMesh) {
            this.scene.scene.remove(this.previewMesh);
            this.previewMesh = null;
        }
    }
    
    handleClick(event) {
        if (!this.isActive) return;
        
        // Get mouse position
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Raycasting to find intersection with ground plane
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.scene.camera);
        
        // Create a ground plane for intersection
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectionPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(groundPlane, intersectionPoint);
        
        if (this.deleteMode) {
            // Check for intersection with track segments
            const intersects = raycaster.intersectObjects(this.scene.trackGroup.children, true);
            
            if (intersects.length > 0) {
                // Find the track segment that contains this mesh
                const mesh = intersects[0].object;
                let segmentToDelete = null;
                
                for (const segment of this.track.segments) {
                    if (segment.mesh === mesh || segment.mesh.children.includes(mesh)) {
                        segmentToDelete = segment;
                        break;
                    }
                }
                
                if (segmentToDelete) {
                    // Remove the segment
                    this.scene.trackGroup.remove(segmentToDelete.mesh);
                    this.track.removeSegment(segmentToDelete);
                }
            }
        } else if (this.buildMode === 'track') {
            if (!this.startPoint) {
                // First click - set start point
                this.startPoint = intersectionPoint.clone();
                
                // Create preview mesh
                this.createPreviewMesh();
            } else {
                // Second click - set end point and create track
                this.endPoint = intersectionPoint.clone();
                
                if (this.trackType === 'straight') {
                    // Create straight track segment
                    const segment = this.track.addSegment({
                        type: 'straight',
                        startX: this.startPoint.x,
                        startY: this.startPoint.y,
                        startZ: this.startPoint.z,
                        endX: this.endPoint.x,
                        endY: this.endPoint.y,
                        endZ: this.endPoint.z
                    });
                    
                    // Add to scene
                    this.scene.trackGroup.add(segment.mesh);
                } else if (this.trackType === 'curve') {
                    // Calculate curve parameters
                    this.calculateCurveParameters();
                    
                    // Create curved track segment
                    const segment = this.track.addSegment({
                        type: 'curve',
                        center: this.curveCenter,
                        radius: this.curveRadius,
                        angle: this.curveAngle
                    });
                    
                    // Add to scene
                    this.scene.trackGroup.add(segment.mesh);
                }
                
                // Reset for next track segment
                this.cancelCurrentAction();
            }
        } else if (this.buildMode === 'station') {
            // Check for intersection with track segments
            const intersects = raycaster.intersectObjects(this.scene.trackGroup.children, true);
            
            if (intersects.length > 0) {
                // Find the track segment that contains this mesh
                const mesh = intersects[0].object;
                let segment = null;
                
                for (const s of this.track.segments) {
                    if (s.mesh === mesh || s.mesh.children.includes(mesh)) {
                        segment = s;
                        break;
                    }
                }
                
                if (segment) {
                    // Calculate position along the track
                    let position;
                    
                    if (segment.type === 'straight') {
                        // Project the intersection point onto the track line
                        const line = new THREE.Line3(segment.start, segment.end);
                        const closestPoint = new THREE.Vector3();
                        line.closestPointToPoint(intersectionPoint, true, closestPoint);
                        
                        // Calculate position as a fraction of track length
                        position = segment.start.distanceTo(closestPoint) / segment.length;
                    } else if (segment.type === 'curve') {
                        // Calculate angle from center to intersection point
                        const toPoint = new THREE.Vector3().subVectors(intersectionPoint, segment.center);
                        const angle = Math.atan2(toPoint.z, toPoint.x);
                        
                        // Normalize angle to [0, segment.angle]
                        let normalizedAngle = angle;
                        if (normalizedAngle < 0) normalizedAngle += Math.PI * 2;
                        
                        // Calculate position as a fraction of track angle
                        position = normalizedAngle / segment.angle;
                    }
                    
                    // Add station to the segment
                    segment.stations.push({
                        name: 'New Station',
                        position: position
                    });
                    
                    // Recreate the segment mesh
                    this.scene.trackGroup.remove(segment.mesh);
                    segment.createMesh();
                    this.scene.trackGroup.add(segment.mesh);
                }
            }
        } else if (this.buildMode === 'signal') {
            // Check for intersection with track segments
            const intersects = raycaster.intersectObjects(this.scene.trackGroup.children, true);
            
            if (intersects.length > 0) {
                // Find the track segment that contains this mesh
                const mesh = intersects[0].object;
                let segment = null;
                
                for (const s of this.track.segments) {
                    if (s.mesh === mesh || s.mesh.children.includes(mesh)) {
                        segment = s;
                        break;
                    }
                }
                
                if (segment) {
                    // Calculate position along the track
                    let position;
                    
                    if (segment.type === 'straight') {
                        // Project the intersection point onto the track line
                        const line = new THREE.Line3(segment.start, segment.end);
                        const closestPoint = new THREE.Vector3();
                        line.closestPointToPoint(intersectionPoint, true, closestPoint);
                        
                        // Calculate position as a fraction of track length
                        position = segment.start.distanceTo(closestPoint) / segment.length;
                    } else if (segment.type === 'curve') {
                        // Calculate angle from center to intersection point
                        const toPoint = new THREE.Vector3().subVectors(intersectionPoint, segment.center);
                        const angle = Math.atan2(toPoint.z, toPoint.x);
                        
                        // Normalize angle to [0, segment.angle]
                        let normalizedAngle = angle;
                        if (normalizedAngle < 0) normalizedAngle += Math.PI * 2;
                        
                        // Calculate position as a fraction of track angle
                        position = normalizedAngle / segment.angle;
                    }
                    
                    // Add signal to the segment
                    segment.signals.push({
                        position: position,
                        state: 'green'
                    });
                    
                    // Recreate the segment mesh
                    this.scene.trackGroup.remove(segment.mesh);
                    segment.createMesh();
                    this.scene.trackGroup.add(segment.mesh);
                }
            }
        }
    }
    
    handleMouseMove(event) {
        if (!this.isActive || !this.startPoint || this.buildMode !== 'track') return;
        
        // Get mouse position
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Raycasting to find intersection with ground plane
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.scene.camera);
        
        // Create a ground plane for intersection
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectionPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(groundPlane, intersectionPoint);
        
        // Update end point
        this.endPoint = intersectionPoint.clone();
        
        // Update preview mesh
        this.updatePreview();
    }
    
    createPreviewMesh() {
        if (this.previewMesh) {
            this.scene.scene.remove(this.previewMesh);
        }
        
        this.previewMesh = new THREE.Group();
        this.scene.scene.add(this.previewMesh);
        
        // Add a simple line for now
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        
        const points = [
            this.startPoint.clone(),
            this.startPoint.clone() // Will be updated in updatePreview
        ];
        
        geometry.setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        this.previewMesh.add(line);
    }
    
    updatePreview() {
        if (!this.previewMesh || !this.startPoint || !this.endPoint) return;
        
        // Remove old preview
        while (this.previewMesh.children.length > 0) {
            this.previewMesh.remove(this.previewMesh.children[0]);
        }
        
        if (this.trackType === 'straight') {
            // Create a line from start to end
            const geometry = new THREE.BufferGeometry();
            const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
            
            const points = [
                this.startPoint.clone(),
                this.endPoint.clone()
            ];
            
            geometry.setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            this.previewMesh.add(line);
        } else if (this.trackType === 'curve') {
            // Calculate curve parameters
            this.calculateCurveParameters();
            
            // Create a curve preview
            if (this.curveCenter && this.curveRadius && this.curveAngle) {
                const curve = new THREE.EllipseCurve(
                    this.curveCenter.x, this.curveCenter.z, // Center x, z
                    this.curveRadius, this.curveRadius, // xRadius, yRadius
                    0, this.curveAngle, // startAngle, endAngle
                    false, // clockwise
                    0 // rotation
                );
                
                const points = curve.getPoints(50);
                const geometry = new THREE.BufferGeometry().setFromPoints(
                    points.map(p => new THREE.Vector3(p.x, 0, p.y))
                );
                
                const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
                const curveObject = new THREE.Line(geometry, material);
                this.previewMesh.add(curveObject);
            }
        }
    }
    
    calculateCurveParameters() {
        if (!this.startPoint || !this.endPoint) return;
        
        // Calculate the midpoint between start and end
        const midpoint = new THREE.Vector3().addVectors(this.startPoint, this.endPoint).multiplyScalar(0.5);
        
        // Calculate the direction vector from start to end
        const direction = new THREE.Vector3().subVectors(this.endPoint, this.startPoint).normalize();
        
        // Calculate a perpendicular vector
        const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
        
        // Calculate the distance between start and end
        const distance = this.startPoint.distanceTo(this.endPoint);
        
        // Calculate the radius (half the distance)
        this.curveRadius = distance / 2;
        
        // Calculate the center point
        this.curveCenter = new THREE.Vector3().addVectors(midpoint, perpendicular.multiplyScalar(this.curveRadius));
        
        // Calculate the angle
        this.curveAngle = Math.PI; // Half circle by default
    }
}