/**
 * Terrain.js - Manages the 3D terrain for the railway simulator
 */
class Terrain {
    constructor(scene) {
        this.scene = scene;
        this.terrainSize = 1000;
        this.terrainSegments = 100;
        
        // Create the terrain
        this.createTerrain();
    }
    
    createTerrain() {
        // Create a flat ground plane
        const groundGeometry = new THREE.PlaneGeometry(this.terrainSize, this.terrainSize, this.terrainSegments, this.terrainSegments);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8BC34A,  // Green color for grass
            side: THREE.DoubleSide,
            flatShading: true
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        ground.position.y = -0.2; // Slightly below the track
        ground.receiveShadow = true;
        
        this.scene.terrainGroup.add(ground);
        
        // Add some random trees and rocks for visual interest
        this.addEnvironmentObjects();
    }
    
    addEnvironmentObjects() {
        // Create tree models
        const createTree = () => {
            const tree = new THREE.Group();
            
            // Tree trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 5, 8);
            const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 2.5;
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            tree.add(trunk);
            
            // Tree foliage
            const foliageGeometry = new THREE.ConeGeometry(3, 6, 8);
            const foliageMaterial = new THREE.MeshPhongMaterial({ color: 0x2E7D32 });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 7;
            foliage.castShadow = true;
            foliage.receiveShadow = true;
            tree.add(foliage);
            
            return tree;
        };
        
        // Create rock models
        const createRock = () => {
            const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 2 + 1, 0);
            const rockMaterial = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            
            // Random rotation
            rock.rotation.x = Math.random() * Math.PI;
            rock.rotation.y = Math.random() * Math.PI;
            rock.rotation.z = Math.random() * Math.PI;
            
            rock.castShadow = true;
            rock.receiveShadow = true;
            
            return rock;
        };
        
        // Add trees
        const treeCount = 100;
        for (let i = 0; i < treeCount; i++) {
            const tree = createTree();
            
            // Random position within terrain bounds, but not too close to the center (where tracks will be)
            const minDistance = 20; // Minimum distance from center
            let x, z;
            
            do {
                x = (Math.random() - 0.5) * this.terrainSize;
                z = (Math.random() - 0.5) * this.terrainSize;
            } while (Math.sqrt(x*x + z*z) < minDistance);
            
            tree.position.set(x, 0, z);
            
            // Random scale variation
            const scale = Math.random() * 0.5 + 0.7;
            tree.scale.set(scale, scale, scale);
            
            this.scene.terrainGroup.add(tree);
        }
        
        // Add rocks
        const rockCount = 50;
        for (let i = 0; i < rockCount; i++) {
            const rock = createRock();
            
            // Random position within terrain bounds
            const x = (Math.random() - 0.5) * this.terrainSize;
            const z = (Math.random() - 0.5) * this.terrainSize;
            
            rock.position.set(x, 0, z);
            this.scene.terrainGroup.add(rock);
        }
        
        // Add distant mountains for visual interest
        this.addMountains();
    }
    
    addMountains() {
        // Create a mountain range in the distance
        const mountainCount = 10;
        const mountainDistance = this.terrainSize / 2 - 50; // Place near the edge of the terrain
        
        for (let i = 0; i < mountainCount; i++) {
            // Create a mountain
            const mountainGeometry = new THREE.ConeGeometry(
                Math.random() * 50 + 50, // Random radius
                Math.random() * 100 + 100, // Random height
                8 // Segments
            );
            
            const mountainMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x4b5320, // Mountain color
                flatShading: true
            });
            
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            
            // Position around the perimeter
            const angle = (i / mountainCount) * Math.PI * 2;
            const x = Math.cos(angle) * mountainDistance;
            const z = Math.sin(angle) * mountainDistance;
            
            mountain.position.set(x, 0, z);
            mountain.castShadow = true;
            mountain.receiveShadow = true;
            
            this.scene.terrainGroup.add(mountain);
        }
    }
}