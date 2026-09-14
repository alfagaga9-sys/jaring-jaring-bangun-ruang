/* ==========================================================================
   threeManager.js - Three.js Viewport Manager & Raycasting Ray-Picker
   Handles WebGL rendering, lighting, camera preset views, orbit controls,
   animation timeline loop, and face hover/click raycasting.
   ========================================================================== */

class ThreeManager {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    
    this.netFoldEngine = new NetFoldEngine(); // Independent folding engine per viewport manager

    this.currentMeshGroup = null;
    this.hoveredMesh = null;
    this.originalEmissive = new Map();

    // Animation timeline state
    this.isPlaying = false;
    this.isUnfolding = true;
    this.foldProgress = 1.0; // 1.0 = 3D Closed, 0.0 = 2D Flat Net
    this.animSpeed = 0.008; // Normal speed
    this.animFrameId = null;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  /**
   * Initialize Three.js WebGL viewport inside specified container ID
   * @param {string} containerId 
   */
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    let width = this.container.clientWidth || 600;
    let height = this.container.clientHeight || 420;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf1f5f9);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(4, 4, 6);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls
    const OrbitControlsClass = (window.THREE && window.THREE.OrbitControls) ? window.THREE.OrbitControls : window.OrbitControls;
    if (OrbitControlsClass) {
      this.controls = new OrbitControlsClass(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 25;
      this.controls.minDistance = 2;
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(6, 10, 8);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // Grid Floor
    const grid = new THREE.GridHelper(16, 16, 0xcbd5e1, 0xe2e8f0);
    grid.position.y = -0.01;
    this.scene.add(grid);

    // Event Listeners
    window.addEventListener("resize", () => this.onWindowResize());
    this.container.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.container.addEventListener("mouseleave", () => this.clearHoverHighlight());

    // Start render loop
    this.animate();
  }

  /**
   * Load and display 3D shape
   * @param {string} shapeId 
   * @param {number} variationIndex 
   */
  loadShape(shapeId, variationIndex = 0) {
    if (!this.scene) return;

    if (this.currentMeshGroup) {
      this.scene.remove(this.currentMeshGroup);
    }

    this.stopAnimation();
    this.foldProgress = 1.0; // Start folded as 3D shape

    const meshGroup = this.netFoldEngine.buildShapeMesh(shapeId, variationIndex);
    this.currentMeshGroup = meshGroup;
    this.scene.add(meshGroup);

    this.netFoldEngine.setFoldProgress(this.foldProgress);
    this.resetCamera();

    // Ensure canvas dimensions are up-to-date
    this.onWindowResize();

    // Update UI slider if present
    const slider = document.getElementById("unfoldScrubber");
    if (slider) slider.value = 100;
  }

  /**
   * Load and display grid of 3D net variations (Simultaneous Multi-Net Display)
   * @param {string} shapeId 
   * @param {string} colorTheme 'gold' or 'category'
   */
  loadGridShape(shapeId = "kubus", colorTheme = "gold") {
    if (!this.scene) return;

    if (this.currentMeshGroup) {
      this.scene.remove(this.currentMeshGroup);
    }

    this.stopAnimation();
    this.foldProgress = 1.0; // Start folded as 3D shapes in grid

    const gridMeshGroup = this.netFoldEngine.buildShapeGridMesh(shapeId, colorTheme);
    this.currentMeshGroup = gridMeshGroup;
    this.scene.add(gridMeshGroup);

    this.netFoldEngine.setFoldProgress(this.foldProgress);

    // Set camera position optimized for 3D multi-net grid layout (isometric perspective)
    this.camera.position.set(0, 12, 13);
    if (this.controls) {
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    } else {
      this.camera.lookAt(0, 0, 0);
    }

    this.onWindowResize();

    const slider = document.getElementById("unfoldScrubberVariasi");
    if (slider) slider.value = 100;
    const label = document.getElementById("variasiProgressLabel");
    if (label) label.innerText = "100% (3D)";
  }

  /**
   * Render Loop
   */
  animate() {
    this.animFrameId = requestAnimationFrame(() => this.animate());

    // Timeline animation playback
    if (this.isPlaying) {
      if (this.isUnfolding) {
        this.foldProgress -= this.animSpeed;
        if (this.foldProgress <= 0) {
          this.foldProgress = 0;
          this.isPlaying = false;
          this.updatePlayPauseBtnUI();
        }
      } else {
        this.foldProgress += this.animSpeed;
        if (this.foldProgress >= 1) {
          this.foldProgress = 1;
          this.isPlaying = false;
          this.updatePlayPauseBtnUI();
        }
      }

      this.netFoldEngine.setFoldProgress(this.foldProgress);

      const pct = Math.round(this.foldProgress * 100);
      const slider = document.getElementById("unfoldScrubber");
      if (slider) slider.value = pct;
      const sliderVar = document.getElementById("unfoldScrubberVariasi");
      if (sliderVar) sliderVar.value = pct;
      const labelVar = document.getElementById("variasiProgressLabel");
      if (labelVar) labelVar.innerText = pct === 0 ? "0% (2D Flat)" : (pct === 100 ? "100% (3D)" : `${pct}%`);
    }

    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // Animation Controls
  playUnfold() {
    this.isUnfolding = true;
    if (this.foldProgress <= 0) this.foldProgress = 1.0;
    this.isPlaying = true;
    this.updatePlayPauseBtnUI();
  }

  playFold() {
    this.isUnfolding = false;
    if (this.foldProgress >= 1.0) this.foldProgress = 0.0;
    this.isPlaying = true;
    this.updatePlayPauseBtnUI();
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    this.updatePlayPauseBtnUI();
  }

  pauseAnimation() {
    this.isPlaying = false;
    this.updatePlayPauseBtnUI();
  }

  stopAnimation() {
    this.isPlaying = false;
    this.updatePlayPauseBtnUI();
  }

  setFoldProgress(progress) {
    this.stopAnimation();
    this.foldProgress = Math.max(0, Math.min(1, progress));
    this.netFoldEngine.setFoldProgress(this.foldProgress);

    const pct = Math.round(this.foldProgress * 100);
    const sliderVar = document.getElementById("unfoldScrubberVariasi");
    if (sliderVar) sliderVar.value = pct;
    const labelVar = document.getElementById("variasiProgressLabel");
    if (labelVar) labelVar.innerText = pct === 0 ? "0% (2D Flat)" : (pct === 100 ? "100% (3D)" : `${pct}%`);
  }

  setSpeed(speedMultiplier) {
    this.animSpeed = 0.008 * speedMultiplier;
  }

  updatePlayPauseBtnUI() {
    const btn = document.getElementById("btnPlayPause");
    if (btn) {
      btn.innerHTML = this.isPlaying
        ? '<i class="fas fa-pause"></i> Jeda'
        : '<i class="fas fa-play"></i> ▶ Buka';
    }
    const btnVar = document.getElementById("btnPlayPauseVariasi");
    if (btnVar) {
      btnVar.innerHTML = this.isPlaying
        ? '<i class="fas fa-pause"></i> Jeda Animasi'
        : '<i class="fas fa-play"></i> ▶ Animasi Buka / Lipat';
    }
  }

  // Camera Presets
  resetCamera() {
    this.camera.position.set(4, 4, 6);
    if (this.controls) {
      this.controls.target.set(0, 0.8, 0);
      this.controls.update();
    } else {
      this.camera.lookAt(0, 0.8, 0);
    }
  }

  setCameraPreset(view) {
    switch (view) {
      case "top":
        this.camera.position.set(0, 8, 0.1);
        break;
      case "front":
        this.camera.position.set(0, 1.5, 7);
        break;
      case "side":
        this.camera.position.set(7, 1.5, 0);
        break;
      default:
        this.resetCamera();
        return;
    }
    if (this.controls) {
      this.controls.target.set(0, 0.8, 0);
      this.controls.update();
    } else {
      this.camera.lookAt(0, 0.8, 0);
    }
  }

  // Mouse Raycasting & Hover Highlight Sync
  onMouseMove(event) {
    if (!this.container || !this.currentMeshGroup) return;

    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.currentMeshGroup.children, true);

    let foundMesh = null;
    for (const hit of intersects) {
      if (hit.object.userData && hit.object.userData.faceId) {
        foundMesh = hit.object;
        break;
      }
    }

    if (foundMesh !== this.hoveredMesh) {
      this.clearHoverHighlight();

      if (foundMesh) {
        this.hoveredMesh = foundMesh;
        if (foundMesh.material) {
          foundMesh.material.emissive.setHex(0x38bdf8); // Light cyan glow
          foundMesh.material.emissiveIntensity = 0.5;
        }

        // Show tooltip & sync with 2D net viewer
        const faceData = foundMesh.userData;
        if (window.appManager) {
          window.appManager.on3DFaceHover(faceData.faceId, faceData.name);
        }
      } else {
        if (window.appManager) {
          window.appManager.on3DFaceHover(null, null);
        }
      }
    }
  }

  clearHoverHighlight() {
    if (this.hoveredMesh && this.hoveredMesh.material) {
      this.hoveredMesh.material.emissive.setHex(0x000000);
      this.hoveredMesh.material.emissiveIntensity = 0;
      this.hoveredMesh = null;
    }
  }

  highlightFaceById(faceId) {
    this.clearHoverHighlight();
    const targetMesh = this.netFoldEngine.faceMeshMap.get(faceId);
    if (targetMesh && targetMesh.material) {
      this.hoveredMesh = targetMesh;
      targetMesh.material.emissive.setHex(0xf59e0b); // Orange glow
      targetMesh.material.emissiveIntensity = 0.7;
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 420;
    if (width > 0 && height > 0) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }
}

// Instantiate global ThreeManager
window.threeManager = new ThreeManager();
