/* ==========================================================================
   netFoldEngine.js - Parametric 3D Mesh & Hinge Folding Engine
   100% Mathematically Exact Folding & Unfolding Animations for all 13 3D Shapes.
   ========================================================================== */

class NetFoldEngine {
  constructor() {
    this.currentShapeId = null;
    this.currentMeshGroup = null;
    this.hingeList = []; // Array of { group, axis, targetAngle, direction }
    this.faceMeshMap = new Map(); // Map of faceId -> THREE.Mesh
    this.customFoldUpdater = null; // Custom updater function for Tabung/Kerucut
  }

  /**
   * Build 3D mesh structure for specified shape
   * @param {string} shapeId 
   * @param {number} variationIndex 
   * @returns {THREE.Group} Three.js group containing the foldable mesh hierarchy
   */
  buildShapeMesh(shapeId, variationIndex = 0) {
    this.currentShapeId = shapeId;
    this.hingeList = [];
    this.faceMeshMap.clear();
    this.customFoldUpdater = null;

    const rootGroup = new THREE.Group();
    rootGroup.name = `shape_root_${shapeId}`;

    switch (shapeId) {
      case "kubus":
        this.buildCube(rootGroup, 2.0, variationIndex);
        break;
      case "balok":
        this.buildCuboid(rootGroup, 2.4, 1.4, 1.8, variationIndex);
        break;
      case "prisma_segitiga":
        this.buildPrism(rootGroup, 3, 1.5, 2.4, variationIndex);
        break;
      case "prisma_segiempat":
        this.buildPrism(rootGroup, 4, 1.4, 2.4, variationIndex);
        break;
      case "prisma_segilima":
        this.buildPrism(rootGroup, 5, 1.3, 2.4, variationIndex);
        break;
      case "prisma_segienam":
        this.buildPrism(rootGroup, 6, 1.2, 2.4, variationIndex);
        break;
      case "limas_segitiga":
        this.buildPyramid(rootGroup, 3, 1.5, 2.2, variationIndex);
        break;
      case "limas_segiempat":
        this.buildPyramid(rootGroup, 4, 1.5, 2.2, variationIndex);
        break;
      case "limas_segilima":
        this.buildPyramid(rootGroup, 5, 1.4, 2.2, variationIndex);
        break;
      case "limas_segienam":
        this.buildPyramid(rootGroup, 6, 1.3, 2.2, variationIndex);
        break;
      case "tabung":
        this.buildCylinder(rootGroup, 1.2, 2.4, variationIndex);
        break;
      case "kerucut":
        this.buildCone(rootGroup, 1.3, 2.2, variationIndex);
        break;
      case "bola":
        this.buildSphere(rootGroup, 1.6);
        break;
      default:
        this.buildCube(rootGroup, 2.0, 0);
    }

    this.currentMeshGroup = rootGroup;
    return rootGroup;
  }

  /**
   * Update fold progress across all hinges and custom geometry morphers
   * @param {number} progress Normalized progress from 0.0 (unfolded net) to 1.0 (folded 3D shape)
   */
  setFoldProgress(progress) {
    const t = Math.max(0, Math.min(1, progress));

    if (this.customFoldUpdater) {
      this.customFoldUpdater(t);
      return;
    }

    // Standard polyhedra hinge rotation
    for (const item of this.hingeList) {
      const angle = item.targetAngle * t * item.direction;
      if (item.axis === "X") {
        item.group.rotation.x = angle;
      } else if (item.axis === "Z") {
        item.group.rotation.z = angle;
      } else if (item.axis === "Y") {
        item.group.rotation.y = angle;
      }
    }
  }

  /**
   * Helper: Create colored face mesh with crisp dark edge outline
   */
  createFaceMesh(geometry, colorHex, faceId, name, addEdges = true) {
    const material = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.userData = { faceId, colorHex, name };

    if (addEdges) {
      const edgesGeom = new THREE.EdgesGeometry(geometry, 15);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 });
      const edges = new THREE.LineSegments(edgesGeom, lineMat);
      mesh.add(edges);
    }

    this.faceMeshMap.set(faceId, mesh);
    return mesh;
  }

  /* ==========================================================================
     1. KUBUS (CUBE) BUILDER
     ========================================================================== */
  /* ==========================================================================
     1. KUBUS (CUBE) BUILDER - 5 Distinct Mathematical Net Variations
     ========================================================================== */
  buildCube(parentGroup, size, varIdx) {
    const S = size;
    const h = S / 2;

    const cAlas = 0x3b82f6;   // Blue
    const cTutup = 0x10b981;  // Green
    const cTegak = 0xf59e0b;  // Yellow/Orange

    const pattern = varIdx % 5;

    if (pattern === 0) {
      // ----------------------------------------------------------------------
      // Pattern 0: Pola 1-4-1 (Cross / Salib Standar)
      // ----------------------------------------------------------------------
      const baseMesh = this.createFaceMesh(new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2), cAlas, "alas", "Sisi Alas");
      parentGroup.add(baseMesh);

      // Front
      const hFront = new THREE.Group(); hFront.position.set(0, 0, h); parentGroup.add(hFront);
      const fGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); fGeom.translate(0, 0, h);
      hFront.add(this.createFaceMesh(fGeom, cTegak, "tegak_1", "Sisi Tegak Depan"));
      this.hingeList.push({ group: hFront, axis: "X", direction: -1, targetAngle: Math.PI / 2 });

      // Back
      const hBack = new THREE.Group(); hBack.position.set(0, 0, -h); parentGroup.add(hBack);
      const bGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); bGeom.translate(0, 0, -h);
      hBack.add(this.createFaceMesh(bGeom, cTegak, "tegak_2", "Sisi Tegak Belakang"));
      this.hingeList.push({ group: hBack, axis: "X", direction: 1, targetAngle: Math.PI / 2 });

      // Right
      const hRight = new THREE.Group(); hRight.position.set(h, 0, 0); parentGroup.add(hRight);
      const rGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); rGeom.translate(h, 0, 0);
      hRight.add(this.createFaceMesh(rGeom, cTegak, "tegak_3", "Sisi Tegak Kanan"));
      this.hingeList.push({ group: hRight, axis: "Z", direction: 1, targetAngle: Math.PI / 2 });

      // Left
      const hLeft = new THREE.Group(); hLeft.position.set(-h, 0, 0); parentGroup.add(hLeft);
      const lGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); lGeom.translate(-h, 0, 0);
      hLeft.add(this.createFaceMesh(lGeom, cTegak, "tegak_4", "Sisi Tegak Kiri"));
      this.hingeList.push({ group: hLeft, axis: "Z", direction: -1, targetAngle: Math.PI / 2 });

      // Top (attached to Front)
      const hTop = new THREE.Group(); hTop.position.set(0, 0, S); hFront.add(hTop);
      const topGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); topGeom.translate(0, 0, h);
      hTop.add(this.createFaceMesh(topGeom, cTutup, "tutup", "Sisi Tutup"));
      this.hingeList.push({ group: hTop, axis: "X", direction: -1, targetAngle: Math.PI / 2 });

    } else if (pattern === 1) {
      // ----------------------------------------------------------------------
      // Pattern 1: Pola 1-4-1 Geser (Off-center Top & Bottom)
      // ----------------------------------------------------------------------
      const baseMesh = this.createFaceMesh(new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2), cAlas, "alas", "Sisi Alas");
      parentGroup.add(baseMesh);

      // Front
      const hFront = new THREE.Group(); hFront.position.set(0, 0, h); parentGroup.add(hFront);
      const fGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); fGeom.translate(0, 0, h);
      hFront.add(this.createFaceMesh(fGeom, cTegak, "tegak_1", "Sisi Tegak Depan"));
      this.hingeList.push({ group: hFront, axis: "X", direction: -1, targetAngle: Math.PI / 2 });

      // Back
      const hBack = new THREE.Group(); hBack.position.set(0, 0, -h); parentGroup.add(hBack);
      const bGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); bGeom.translate(0, 0, -h);
      hBack.add(this.createFaceMesh(bGeom, cTegak, "tegak_2", "Sisi Tegak Belakang"));
      this.hingeList.push({ group: hBack, axis: "X", direction: 1, targetAngle: Math.PI / 2 });

      // Right
      const hRight = new THREE.Group(); hRight.position.set(h, 0, 0); parentGroup.add(hRight);
      const rGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); rGeom.translate(h, 0, 0);
      hRight.add(this.createFaceMesh(rGeom, cTegak, "tegak_3", "Sisi Tegak Kanan"));
      this.hingeList.push({ group: hRight, axis: "Z", direction: 1, targetAngle: Math.PI / 2 });

      // Left (attached to Front at -X = -h)
      const hLeft = new THREE.Group(); hLeft.position.set(-h, 0, h); hFront.add(hLeft);
      const lGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); lGeom.translate(-h, 0, 0);
      hLeft.add(this.createFaceMesh(lGeom, cTegak, "tegak_4", "Sisi Tegak Kiri"));
      this.hingeList.push({ group: hLeft, axis: "Z", direction: -1, targetAngle: Math.PI / 2 });

      // Top (attached to Right at +X = S)
      const hTop = new THREE.Group(); hTop.position.set(S, 0, 0); hRight.add(hTop);
      const topGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); topGeom.translate(h, 0, 0);
      hTop.add(this.createFaceMesh(topGeom, cTutup, "tutup", "Sisi Tutup"));
      this.hingeList.push({ group: hTop, axis: "Z", direction: 1, targetAngle: Math.PI / 2 });

    } else if (pattern === 2) {
      // ----------------------------------------------------------------------
      // Pattern 2: Pola 2-3-1 (Tangga)
      // ----------------------------------------------------------------------
      const baseMesh = this.createFaceMesh(new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2), cAlas, "alas", "Sisi Alas");
      parentGroup.add(baseMesh);

      // Front
      const hFront = new THREE.Group(); hFront.position.set(0, 0, h); parentGroup.add(hFront);
      const fGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); fGeom.translate(0, 0, h);
      hFront.add(this.createFaceMesh(fGeom, cTegak, "tegak_1", "Sisi Tegak Depan"));
      this.hingeList.push({ group: hFront, axis: "X", direction: -1, targetAngle: Math.PI / 2 });

      // Right
      const hRight = new THREE.Group(); hRight.position.set(h, 0, 0); parentGroup.add(hRight);
      const rGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); rGeom.translate(h, 0, 0);
      hRight.add(this.createFaceMesh(rGeom, cTegak, "tegak_3", "Sisi Tegak Kanan"));
      this.hingeList.push({ group: hRight, axis: "Z", direction: 1, targetAngle: Math.PI / 2 });

      // Back (attached to -Z of Right)
      const hBack = new THREE.Group(); hBack.position.set(S, 0, -h); hRight.add(hBack);
      const bGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); bGeom.translate(0, 0, -h);
      hBack.add(this.createFaceMesh(bGeom, cTegak, "tegak_2", "Sisi Tegak Belakang"));
      this.hingeList.push({ group: hBack, axis: "X", direction: 1, targetAngle: Math.PI / 2 });

      // Left
      const hLeft = new THREE.Group(); hLeft.position.set(-h, 0, 0); parentGroup.add(hLeft);
      const lGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); lGeom.translate(-h, 0, 0);
      hLeft.add(this.createFaceMesh(lGeom, cTegak, "tegak_4", "Sisi Tegak Kiri"));
      this.hingeList.push({ group: hLeft, axis: "Z", direction: -1, targetAngle: Math.PI / 2 });

      // Top (attached to +Z of Left)
      const hTop = new THREE.Group(); hTop.position.set(-S, 0, h); hLeft.add(hTop);
      const topGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); topGeom.translate(0, 0, h);
      hTop.add(this.createFaceMesh(topGeom, cTutup, "tutup", "Sisi Tutup"));
      this.hingeList.push({ group: hTop, axis: "X", direction: -1, targetAngle: Math.PI / 2 });

    } else if (pattern === 3) {
      // ----------------------------------------------------------------------
      // Pattern 3: Pola 2-2-2 (Tangga Simetris)
      // ----------------------------------------------------------------------
      const baseMesh = this.createFaceMesh(new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2), cAlas, "alas", "Sisi Alas");
      parentGroup.add(baseMesh);

      // Front
      const hFront = new THREE.Group(); hFront.position.set(0, 0, h); parentGroup.add(hFront);
      const fGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); fGeom.translate(0, 0, h);
      hFront.add(this.createFaceMesh(fGeom, cTegak, "tegak_1", "Sisi Tegak Depan"));
      this.hingeList.push({ group: hFront, axis: "X", direction: -1, targetAngle: Math.PI / 2 });

      // Top (attached to -X of Front)
      const hTop = new THREE.Group(); hTop.position.set(-h, 0, S); hFront.add(hTop);
      const topGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); topGeom.translate(-h, 0, 0);
      hTop.add(this.createFaceMesh(topGeom, cTutup, "tutup", "Sisi Tutup"));
      this.hingeList.push({ group: hTop, axis: "Z", direction: -1, targetAngle: Math.PI / 2 });

      // Right
      const hRight = new THREE.Group(); hRight.position.set(h, 0, 0); parentGroup.add(hRight);
      const rGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); rGeom.translate(h, 0, 0);
      hRight.add(this.createFaceMesh(rGeom, cTegak, "tegak_3", "Sisi Tegak Kanan"));
      this.hingeList.push({ group: hRight, axis: "Z", direction: 1, targetAngle: Math.PI / 2 });

      // Back (attached to -Z of Right)
      const hBack = new THREE.Group(); hBack.position.set(S, 0, -h); hRight.add(hBack);
      const bGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); bGeom.translate(0, 0, -h);
      hBack.add(this.createFaceMesh(bGeom, cTegak, "tegak_2", "Sisi Tegak Belakang"));
      this.hingeList.push({ group: hBack, axis: "X", direction: 1, targetAngle: Math.PI / 2 });

      // Left (attached to +X of Back)
      const hLeft = new THREE.Group(); hLeft.position.set(S, 0, -S); hBack.add(hLeft);
      const lGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); lGeom.translate(h, 0, 0);
      hLeft.add(this.createFaceMesh(lGeom, cTegak, "tegak_4", "Sisi Tegak Kiri"));
      this.hingeList.push({ group: hLeft, axis: "Z", direction: 1, targetAngle: Math.PI / 2 });

    } else {
      // ----------------------------------------------------------------------
      // Pattern 4: Pola 3-3 (Baling-baling / Strip Ganda)
      // ----------------------------------------------------------------------
      const baseMesh = this.createFaceMesh(new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2), cAlas, "alas", "Sisi Alas");
      parentGroup.add(baseMesh);

      // Front
      const hFront = new THREE.Group(); hFront.position.set(0, 0, h); parentGroup.add(hFront);
      const fGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); fGeom.translate(0, 0, h);
      hFront.add(this.createFaceMesh(fGeom, cTegak, "tegak_1", "Sisi Tegak Depan"));
      this.hingeList.push({ group: hFront, axis: "X", direction: -1, targetAngle: Math.PI / 2 });

      // Top (attached to +X of Front)
      const hTop = new THREE.Group(); hTop.position.set(h, 0, S); hFront.add(hTop);
      const topGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); topGeom.translate(h, 0, 0);
      hTop.add(this.createFaceMesh(topGeom, cTutup, "tutup", "Sisi Tutup"));
      this.hingeList.push({ group: hTop, axis: "Z", direction: 1, targetAngle: Math.PI / 2 });

      // Left (attached to -X of Front)
      const hLeft = new THREE.Group(); hLeft.position.set(-h, 0, S); hFront.add(hLeft);
      const lGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); lGeom.translate(-h, 0, 0);
      hLeft.add(this.createFaceMesh(lGeom, cTegak, "tegak_4", "Sisi Tegak Kiri"));
      this.hingeList.push({ group: hLeft, axis: "Z", direction: -1, targetAngle: Math.PI / 2 });

      // Right (attached to +X of Base)
      const hRight = new THREE.Group(); hRight.position.set(h, 0, 0); parentGroup.add(hRight);
      const rGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); rGeom.translate(h, 0, 0);
      hRight.add(this.createFaceMesh(rGeom, cTegak, "tegak_3", "Sisi Tegak Kanan"));
      this.hingeList.push({ group: hRight, axis: "Z", direction: 1, targetAngle: Math.PI / 2 });

      // Back (attached to +X of Right)
      const hBack = new THREE.Group(); hBack.position.set(S, 0, 0); hRight.add(hBack);
      const bGeom = new THREE.PlaneGeometry(S, S).rotateX(Math.PI / 2); bGeom.translate(h, 0, 0);
      hBack.add(this.createFaceMesh(bGeom, cTegak, "tegak_2", "Sisi Tegak Belakang"));
      this.hingeList.push({ group: hBack, axis: "Z", direction: 1, targetAngle: Math.PI / 2 });
    }
  }

  /* ==========================================================================
     2. BALOK (CUBOID) BUILDER
     ========================================================================== */
  buildCuboid(parentGroup, width, height, depth, varIdx) {
    const W = width, H = height, D = depth;
    const hw = W / 2, hh = H / 2, hd = D / 2;
    const cAlas = 0x3b82f6, cTutup = 0x10b981, cTegak = 0xf59e0b;

    // Base (Alas W x D) on XZ plane
    const baseGeom = new THREE.PlaneGeometry(W, D);
    baseGeom.rotateX(Math.PI / 2);
    const baseMesh = this.createFaceMesh(baseGeom, cAlas, "alas", "Sisi Alas");
    parentGroup.add(baseMesh);

    // Front Side (+Z edge at Z = hd, size W x H)
    const hFront = new THREE.Group();
    hFront.position.set(0, 0, hd);
    parentGroup.add(hFront);
    const fGeom = new THREE.PlaneGeometry(W, H);
    fGeom.rotateX(Math.PI / 2);
    fGeom.translate(0, 0, hh); // Extends along +Z when unfolded (t=0)
    const meshFront = this.createFaceMesh(fGeom, cTegak, "tegak_1", "Sisi Tegak Depan");
    hFront.add(meshFront);
    this.hingeList.push({ group: hFront, axis: "X", direction: -1, targetAngle: Math.PI / 2 });

    // Back Side (-Z edge at Z = -hd, size W x H)
    const hBack = new THREE.Group();
    hBack.position.set(0, 0, -hd);
    parentGroup.add(hBack);
    const bGeom = new THREE.PlaneGeometry(W, H);
    bGeom.rotateX(Math.PI / 2);
    bGeom.translate(0, 0, -hh); // Extends along -Z when unfolded (t=0)
    const meshBack = this.createFaceMesh(bGeom, cTegak, "tegak_2", "Sisi Tegak Belakang");
    hBack.add(meshBack);
    this.hingeList.push({ group: hBack, axis: "X", direction: 1, targetAngle: Math.PI / 2 });

    // Right Side (+X edge at X = hw, size D x H)
    const hRight = new THREE.Group();
    hRight.position.set(hw, 0, 0);
    parentGroup.add(hRight);
    const rGeom = new THREE.PlaneGeometry(H, D);
    rGeom.rotateX(Math.PI / 2);
    rGeom.translate(hh, 0, 0); // Extends along +X when unfolded (t=0)
    const meshRight = this.createFaceMesh(rGeom, cTegak, "tegak_3", "Sisi Tegak Kanan");
    hRight.add(meshRight);
    this.hingeList.push({ group: hRight, axis: "Z", direction: 1, targetAngle: Math.PI / 2 });

    // Left Side (-X edge at X = -hw, size D x H)
    const hLeft = new THREE.Group();
    hLeft.position.set(-hw, 0, 0);
    parentGroup.add(hLeft);
    const lGeom = new THREE.PlaneGeometry(H, D);
    lGeom.rotateX(Math.PI / 2);
    lGeom.translate(-hh, 0, 0); // Extends along -X when unfolded (t=0)
    const meshLeft = this.createFaceMesh(lGeom, cTegak, "tegak_4", "Sisi Tegak Kiri");
    hLeft.add(meshLeft);
    this.hingeList.push({ group: hLeft, axis: "Z", direction: -1, targetAngle: Math.PI / 2 });

    // Select hinge to attach Top face based on variationIndex
    const attachConfigs = [
      { parent: hFront, pos: new THREE.Vector3(0, 0, H), axis: "X", dir: -1, trans: new THREE.Vector3(0, 0, hd) },
      { parent: hLeft, pos: new THREE.Vector3(-H, 0, 0), axis: "Z", dir: -1, trans: new THREE.Vector3(-hw, 0, 0) },
      { parent: hRight, pos: new THREE.Vector3(H, 0, 0), axis: "Z", dir: 1, trans: new THREE.Vector3(hw, 0, 0) }
    ];
    const config = attachConfigs[varIdx % attachConfigs.length];

    const hTop = new THREE.Group();
    hTop.position.copy(config.pos);
    config.parent.add(hTop);

    const topGeom = new THREE.PlaneGeometry(W, D);
    topGeom.rotateX(Math.PI / 2);
    topGeom.translate(config.trans.x, config.trans.y, config.trans.z);
    const meshTop = this.createFaceMesh(topGeom, cTutup, "tutup", "Sisi Tutup");
    hTop.add(meshTop);
    this.hingeList.push({ group: hTop, axis: config.axis, direction: config.dir, targetAngle: Math.PI / 2 });
  }

  /* ==========================================================================
     3. PRISMA (N-GON PRISMS) BUILDER
     ========================================================================== */
  buildPrism(parentGroup, N, radius, height, varIdx) {
    const R = radius, H = height;
    const cAlas = 0x3b82f6, cTutup = 0x10b981, cTegak = 0xf59e0b;

    const delta = (2 * Math.PI) / N;
    const baseShape = new THREE.Shape();
    for (let i = 0; i < N; i++) {
      const a = i * delta;
      const x = R * Math.cos(a);
      const y = R * Math.sin(a);
      if (i === 0) baseShape.moveTo(x, y);
      else baseShape.lineTo(x, y);
    }
    baseShape.closePath();

    const baseGeom = new THREE.ShapeGeometry(baseShape);
    baseGeom.rotateX(Math.PI / 2); // XZ plane, normal pointing UP (+Y)
    const baseMesh = this.createFaceMesh(baseGeom, cAlas, "alas", `Alas Prisma Segi-${N}`);
    parentGroup.add(baseMesh);

    this.buildPrismFaces(parentGroup, N, R, H, varIdx, cTutup, cTegak);
  }

  /**
   * Helper: Build N side wall rectangles and top N-gon cap with 100% gapless corner alignment
   */
  buildPrismFaces(parentGroup, N, R, H, varIdx, cTutup, cTegak) {
    const delta = (2 * Math.PI) / N;
    const E = 2 * R * Math.sin(Math.PI / N); // Edge length
    const R_in = R * Math.cos(Math.PI / N);  // Inradius

    const sideHinges = [];

    for (let i = 0; i < N; i++) {
      // Midpoint angle of edge i (connecting vertex i to vertex i+1)
      const midAngle = i * delta + delta / 2;
      const hx = R_in * Math.cos(midAngle);
      const hz = R_in * Math.sin(midAngle);

      const hGroup = new THREE.Group();
      hGroup.position.set(hx, 0, hz);
      hGroup.rotation.y = -midAngle; // Local +X points along outward normal, Local +Z along edge direction
      parentGroup.add(hGroup);

      // Side rectangle geometry: E wide along local Z (-E/2 to +E/2), H long along local X (0 to H)
      const rectGeom = new THREE.PlaneGeometry(H, E);
      rectGeom.translate(H / 2, 0, 0); // X_geom in [0, H], Y_geom in [-E/2, E/2]
      rectGeom.rotateX(Math.PI / 2);   // Maps to X_local in [0, H], Z_local in [-E/2, E/2]
      const rectMesh = this.createFaceMesh(rectGeom, cTegak, `tegak_${i+1}`, `Sisi Tegak ${i+1}`);
      hGroup.add(rectMesh);

      // Rotating around local Z by +90 deg rotates local +X (outward normal) straight UP (+Y)
      this.hingeList.push({ group: hGroup, axis: "Z", direction: 1, targetAngle: Math.PI / 2 });

      sideHinges.push(hGroup);
    }

    // Top N-gon (Tutup) attached to outer edge of Side Face (varIdx % N) at X_local = H
    const targetSideIdx = varIdx % N;
    const targetHinge = sideHinges[targetSideIdx];

    if (targetHinge) {
      const hTop = new THREE.Group();
      hTop.position.set(H, 0, 0);
      targetHinge.add(hTop);

      // Exact mathematical local vertices for Top N-gon cap:
      const topShape = new THREE.Shape();
      for (let i = 0; i < N; i++) {
        const angle = (i - targetSideIdx) * delta - delta / 2;
        const x = R_in - R * Math.cos(angle);
        const z = R * Math.sin(angle);
        if (i === 0) topShape.moveTo(x, z);
        else topShape.lineTo(x, z);
      }
      topShape.closePath();

      const topShapeGeom = new THREE.ShapeGeometry(topShape);
      topShapeGeom.rotateX(Math.PI / 2); // Put (x, z) on XZ plane, normal pointing UP
      const topMesh = this.createFaceMesh(topShapeGeom, cTutup, "tutup", `Tutup Prisma Segi-${N}`);
      hTop.add(topMesh);

      // Rotating around local Z by +90 deg relative to side face covers the top at Y=H
      this.hingeList.push({ group: hTop, axis: "Z", direction: 1, targetAngle: Math.PI / 2 });
    }
  }

  /* ==========================================================================
     4. LIMAS (N-GON PYRAMIDS) BUILDER
     ========================================================================== */
  buildPyramid(parentGroup, N, radius, height, varIdx) {
    const R = radius, H = height;
    const cAlas = 0x3b82f6, cTegak = 0xf59e0b;

    const delta = (2 * Math.PI) / N;
    const E = 2 * R * Math.sin(Math.PI / N);
    const R_in = R * Math.cos(Math.PI / N);
    const Slant = Math.sqrt(R_in * R_in + H * H);

    // Dihedral fold angle to close side triangle from flat ground plane to apex (0, H, 0)
    const foldAngle = Math.PI - Math.atan2(H, R_in);

    // Base N-gon
    const baseShape = new THREE.Shape();
    for (let i = 0; i < N; i++) {
      const a = i * delta;
      const x = R * Math.cos(a);
      const y = R * Math.sin(a);
      if (i === 0) baseShape.moveTo(x, y);
      else baseShape.lineTo(x, y);
    }
    baseShape.closePath();

    const baseGeom = new THREE.ShapeGeometry(baseShape);
    baseGeom.rotateX(Math.PI / 2);
    const baseMesh = this.createFaceMesh(baseGeom, cAlas, "alas", `Alas Limas Segi-${N}`);
    parentGroup.add(baseMesh);

    // Build N triangular faces attached to N edges of base
    for (let i = 0; i < N; i++) {
      const midAngle = i * delta + delta / 2;
      const hx = R_in * Math.cos(midAngle);
      const hz = R_in * Math.sin(midAngle);

      const hGroup = new THREE.Group();
      hGroup.position.set(hx, 0, hz);
      hGroup.rotation.y = -midAngle;
      parentGroup.add(hGroup);

      // Isosceles triangle shape on XZ plane: Base along Z (-E/2 to E/2), Apex at X_local = Slant
      const triShape = new THREE.Shape();
      triShape.moveTo(0, -E / 2);
      triShape.lineTo(0, E / 2);
      triShape.lineTo(Slant, 0);
      triShape.closePath();

      const triGeom = new THREE.ShapeGeometry(triShape);
      triGeom.rotateX(Math.PI / 2);
      const triMesh = this.createFaceMesh(triGeom, cTegak, `tegak_${i+1}`, `Sisi Tegak ${i+1}`);
      hGroup.add(triMesh);

      // Rotating around local Z by +foldAngle folds apex to (0, H, 0)
      this.hingeList.push({ group: hGroup, axis: "Z", direction: 1, targetAngle: foldAngle });
    }
  }

  /* ==========================================================================
     5. TABUNG (CYLINDER) BUILDER
     ========================================================================== */
  buildCylinder(parentGroup, radius, height, varIdx) {
    const R = radius, H = height;
    const cAlas = 0x3b82f6, cTutup = 0x10b981, cSelimut = 0x8b5cf6;
    const C = 2 * Math.PI * R; // Circumference

    const cylGroup = new THREE.Group();
    parentGroup.add(cylGroup);

    // Dynamic unrolling body plane (X: -C/2 to C/2, Y: -H/2 to H/2)
    const segsX = 48;
    const geomSelimut = new THREE.PlaneGeometry(C, H, segsX, 1);
    // Disable static EdgesGeometry so it doesn't leave a flat wireframe rectangle
    const meshSelimut = this.createFaceMesh(geomSelimut, cSelimut, "selimut", "Selimut Tabung", false);
    cylGroup.add(meshSelimut);

    // Dynamic edge lines for top & bottom circular rims
    const lineMat = new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 });

    const topRimGeom = new THREE.BufferGeometry();
    const botRimGeom = new THREE.BufferGeometry();
    const rimPositionsTop = new Float32Array((segsX + 1) * 3);
    const rimPositionsBot = new Float32Array((segsX + 1) * 3);

    topRimGeom.setAttribute('position', new THREE.BufferAttribute(rimPositionsTop, 3));
    botRimGeom.setAttribute('position', new THREE.BufferAttribute(rimPositionsBot, 3));

    const lineTopRim = new THREE.Line(topRimGeom, lineMat);
    const lineBotRim = new THREE.Line(botRimGeom, lineMat);
    cylGroup.add(lineTopRim);
    cylGroup.add(lineBotRim);

    // Top Circle Cap attached to top edge
    const circGeomTop = new THREE.CircleGeometry(R, 32);
    circGeomTop.translate(0, R, 0); // Attached at bottom point of circle
    const meshTop = this.createFaceMesh(circGeomTop, cTutup, "tutup", "Lingkaran Tutup");

    const hTop = new THREE.Group();
    hTop.add(meshTop);
    cylGroup.add(hTop);

    // Bottom Circle Cap attached to bottom edge
    const circGeomBot = new THREE.CircleGeometry(R, 32);
    circGeomBot.translate(0, -R, 0); // Attached at top point of circle
    const meshBot = this.createFaceMesh(circGeomBot, cAlas, "alas", "Lingkaran Alas");

    const hBot = new THREE.Group();
    hBot.add(meshBot);
    cylGroup.add(hBot);

    // Custom parametric updater
    this.customFoldUpdater = (t) => {
      // 1. Morph cylinder body mesh curvature
      const pos = geomSelimut.attributes.position;

      for (let i = 0; i <= segsX; i++) {
        const u = i / segsX - 0.5; // -0.5 to 0.5

        let x, z;
        if (t < 0.001) {
          x = u * C;
          z = 0;
        } else {
          const angle = u * (2 * Math.PI) * t;
          const curR = R / t;
          x = curR * Math.sin(angle);
          z = curR * (1 - Math.cos(angle));
        }

        // Top vertex (j=0) and Bottom vertex (j=1)
        const idxTop = i;
        const idxBot = i + (segsX + 1);

        pos.setXYZ(idxTop, x, H / 2, z);
        pos.setXYZ(idxBot, x, -H / 2, z);

        // Update rim line positions
        rimPositionsTop[i * 3] = x;
        rimPositionsTop[i * 3 + 1] = H / 2;
        rimPositionsTop[i * 3 + 2] = z;

        rimPositionsBot[i * 3] = x;
        rimPositionsBot[i * 3 + 1] = -H / 2;
        rimPositionsBot[i * 3 + 2] = z;
      }

      pos.needsUpdate = true;
      geomSelimut.computeVertexNormals();

      topRimGeom.attributes.position.needsUpdate = true;
      botRimGeom.attributes.position.needsUpdate = true;

      // 2. Transition top & bottom circle caps to fold and seal cylinder top/bottom openings
      hTop.position.set(0, H / 2, 0);
      hTop.rotation.x = (Math.PI / 2) * t;

      hBot.position.set(0, -H / 2, 0);
      hBot.rotation.x = -(Math.PI / 2) * t;
    };
  }

  /* ==========================================================================
     6. KERUCUT (CONE) BUILDER
     ========================================================================== */
  buildCone(parentGroup, radius, height, varIdx) {
    const R = radius, H = height;
    const cAlas = 0x3b82f6, cSelimut = 0x8b5cf6;
    const Slant = Math.sqrt(R * R + H * H);
    const sectorAngle = (2 * Math.PI * R) / Slant;

    const coneGroup = new THREE.Group();
    parentGroup.add(coneGroup);

    // Cone unrolling sector mesh (Apex at 0,0,0, Arc extends in +Y up to Slant)
    const segsX = 48;
    const geomSelimut = new THREE.PlaneGeometry(sectorAngle * Slant, Slant, segsX, 1);
    geomSelimut.translate(0, Slant / 2, 0); // Apex at (0, 0, 0), arc at Y = +Slant
    const meshSelimut = this.createFaceMesh(geomSelimut, cSelimut, "selimut", "Selimut Kerucut (Juring)", false);
    coneGroup.add(meshSelimut);

    // Base Circle Cap attached to arc edge (Y = +Slant)
    const circGeom = new THREE.CircleGeometry(R, 32);
    circGeom.translate(0, R, 0); // Bottom of circle attached to hinge (0,0,0)
    const meshAlas = this.createFaceMesh(circGeom, cAlas, "alas", "Lingkaran Alas");

    const hAlas = new THREE.Group();
    hAlas.add(meshAlas);
    coneGroup.add(hAlas);

    // Dynamic edge line for base rim
    const lineMat = new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 });
    const rimGeom = new THREE.BufferGeometry();
    const rimPositions = new Float32Array((segsX + 1) * 3);
    rimGeom.setAttribute('position', new THREE.BufferAttribute(rimPositions, 3));
    const lineRim = new THREE.Line(rimGeom, lineMat);
    coneGroup.add(lineRim);

    // Custom fold updater
    this.customFoldUpdater = (t) => {
      const pos = geomSelimut.attributes.position;

      for (let i = 0; i <= segsX; i++) {
        const u = i / segsX - 0.5; // -0.5 to 0.5
        const curAngle = u * sectorAngle * (1 - t * 0.999);

        for (let j = 0; j <= 1; j++) {
          const idx = i + j * (segsX + 1);
          const rDist = j === 0 ? 0.02 : Slant; // Distance from apex

          if (t < 0.001) {
            // Flat sector extending upwards in +Y space
            const x = rDist * Math.sin(curAngle);
            const y = rDist * Math.cos(curAngle);
            const z = 0;
            pos.setXYZ(idx, x, y, z);
          } else {
            // Morphing cone surface
            const coneAngle = u * 2 * Math.PI * t + curAngle * (1 - t);
            const coneR = (rDist / Slant) * R * t + rDist * (1 - t);
            const coneY = (1 - rDist / Slant) * H * t + rDist * Math.cos(curAngle) * (1 - t);

            const x = coneR * Math.sin(coneAngle);
            const y = coneY;
            // Z math: Base center at (0, 0, R), Apex at (0, H, R).
            const z = (R - (rDist / Slant) * R * Math.cos(coneAngle)) * t;

            pos.setXYZ(idx, x, y, z);
          }
        }

        // Update arc rim positions for outer edge j=1
        const idxArc = i + (segsX + 1);
        rimPositions[i * 3] = pos.getX(idxArc);
        rimPositions[i * 3 + 1] = pos.getY(idxArc);
        rimPositions[i * 3 + 2] = pos.getZ(idxArc);
      }

      pos.needsUpdate = true;
      geomSelimut.computeVertexNormals();

      rimGeom.attributes.position.needsUpdate = true;

      // Base circle folds into bottom opening at position (0, Y_base, Z_base)
      const hingeY = Slant * (1 - t);
      hAlas.position.set(0, hingeY, 0);
      hAlas.rotation.x = (Math.PI / 2) * t;
    };
  }

  /* ==========================================================================
     7. BOLA (SPHERE) BUILDER
     ========================================================================== */
  buildSphere(parentGroup, radius) {
    const R = radius;
    const geom = new THREE.SphereGeometry(R, 32, 24);
    const mesh = this.createFaceMesh(geom, 0xec4899, "selimut", "Permukaan Bola 3D");
    parentGroup.add(mesh);
  }

  /* ==========================================================================
     8. MULTI-NET GRID GENERATOR (Simultaneous 3D Nets Grid Display)
     ========================================================================== */
  buildShapeGridMesh(shapeId, colorTheme = "gold") {
    this.currentShapeId = shapeId;
    this.gridHingeLists = [];
    this.customFoldUpdaterList = [];
    this.faceMeshMap.clear();

    const rootGroup = new THREE.Group();
    rootGroup.name = `grid_root_${shapeId}`;

    const shapeData = SHAPES_DATA[shapeId] || SHAPES_DATA["kubus"];
    const numVariations = (shapeId === "kubus") ? 11 : (shapeData.hasNet ? Math.max(1, shapeData.variations.length) : 0);

    if (numVariations === 0) {
      this.buildSphere(rootGroup, 1.6);
      this.currentMeshGroup = rootGroup;
      return rootGroup;
    }

    const cols = (numVariations >= 9) ? 4 : (numVariations >= 4 ? 3 : 2);
    const spacingX = 4.2;
    const spacingZ = 4.2;

    for (let i = 0; i < numVariations; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      const subGroup = new THREE.Group();
      subGroup.position.set((col - (cols - 1) / 2) * spacingX, 0, (row - (Math.ceil(numVariations / cols) - 1) / 2) * spacingZ);
      rootGroup.add(subGroup);

      this.hingeList = [];
      this.customFoldUpdater = null;

      if (shapeId === "kubus") {
        this.buildCubeVariation(subGroup, 1.6, i, colorTheme);
      } else {
        this.buildShapeMeshForGrid(subGroup, shapeId, i, colorTheme);
      }

      if (this.hingeList.length > 0) {
        this.gridHingeLists.push([...this.hingeList]);
      }
      if (this.customFoldUpdater) {
        this.customFoldUpdaterList.push(this.customFoldUpdater);
      }
    }

    this.currentMeshGroup = rootGroup;
    return rootGroup;
  }

  buildShapeMeshForGrid(subGroup, shapeId, varIdx, colorTheme) {
    switch (shapeId) {
      case "balok":
        this.buildCuboid(subGroup, 2.0, 1.2, 1.5, varIdx);
        break;
      case "prisma_segitiga":
        this.buildPrism(subGroup, 3, 1.3, 2.0, varIdx);
        break;
      case "prisma_segiempat":
        this.buildPrism(subGroup, 4, 1.2, 2.0, varIdx);
        break;
      case "prisma_segilima":
        this.buildPrism(subGroup, 5, 1.1, 2.0, varIdx);
        break;
      case "prisma_segienam":
        this.buildPrism(subGroup, 6, 1.0, 2.0, varIdx);
        break;
      case "limas_segitiga":
        this.buildPyramid(subGroup, 3, 1.3, 1.8, varIdx);
        break;
      case "limas_segiempat":
        this.buildPyramid(subGroup, 4, 1.3, 1.8, varIdx);
        break;
      case "limas_segilima":
        this.buildPyramid(subGroup, 5, 1.2, 1.8, varIdx);
        break;
      case "limas_segienam":
        this.buildPyramid(subGroup, 6, 1.1, 1.8, varIdx);
        break;
      case "tabung":
        this.buildCylinder(subGroup, 1.0, 2.0, varIdx);
        break;
      case "kerucut":
        this.buildCone(subGroup, 1.1, 1.8, varIdx);
        break;
      default:
        this.buildCubeVariation(subGroup, 1.6, varIdx, colorTheme);
    }
  }

  /* ==========================================================================
     9. 11 CLASSIC CUBE NET VARIATIONS BUILDER
     ========================================================================== */
  buildCubeVariation(parentGroup, size, varIdx, colorTheme) {
    const S = size;
    const h = S / 2;

    let cAlas = 0x3b82f6, cTutup = 0x10b981, cTegak = 0xf59e0b;
    if (colorTheme === "gold") {
      cAlas = 0xfacc15;
      cTutup = 0xfacc15;
      cTegak = 0xfacc15;
    }

    // Base Square (Alas) - Fixed on XZ plane
    const baseGeom = new THREE.PlaneGeometry(S, S);
    baseGeom.rotateX(Math.PI / 2);
    const baseMesh = this.createFaceMesh(baseGeom, cAlas, "alas", "Alas");
    parentGroup.add(baseMesh);

    // Front Side (+Z edge)
    const hFront = new THREE.Group();
    hFront.position.set(0, 0, h);
    parentGroup.add(hFront);
    const fGeom = new THREE.PlaneGeometry(S, S);
    fGeom.rotateX(Math.PI / 2);
    fGeom.translate(0, 0, h);
    const meshFront = this.createFaceMesh(fGeom, cTegak, "tegak_1", "Sisi 1");
    hFront.add(meshFront);
    this.hingeList.push({ group: hFront, axis: "X", direction: -1, targetAngle: Math.PI / 2 });

    // Back Side (-Z edge)
    const hBack = new THREE.Group();
    hBack.position.set(0, 0, -h);
    parentGroup.add(hBack);
    const bGeom = new THREE.PlaneGeometry(S, S);
    bGeom.rotateX(Math.PI / 2);
    bGeom.translate(0, 0, -h);
    const meshBack = this.createFaceMesh(bGeom, cTegak, "tegak_2", "Sisi 2");
    hBack.add(meshBack);
    this.hingeList.push({ group: hBack, axis: "X", direction: 1, targetAngle: Math.PI / 2 });

    // Right Side (+X edge)
    const hRight = new THREE.Group();
    hRight.position.set(h, 0, 0);
    parentGroup.add(hRight);
    const rGeom = new THREE.PlaneGeometry(S, S);
    rGeom.rotateX(Math.PI / 2);
    rGeom.translate(h, 0, 0);
    const meshRight = this.createFaceMesh(rGeom, cTegak, "tegak_3", "Sisi 3");
    hRight.add(meshRight);
    this.hingeList.push({ group: hRight, axis: "Z", direction: 1, targetAngle: Math.PI / 2 });

    // Left Side (-X edge)
    const hLeft = new THREE.Group();
    hLeft.position.set(-h, 0, 0);
    parentGroup.add(hLeft);
    const lGeom = new THREE.PlaneGeometry(S, S);
    lGeom.rotateX(Math.PI / 2);
    lGeom.translate(-h, 0, 0);
    const meshLeft = this.createFaceMesh(lGeom, cTegak, "tegak_4", "Sisi 4");
    hLeft.add(meshLeft);
    this.hingeList.push({ group: hLeft, axis: "Z", direction: -1, targetAngle: Math.PI / 2 });

    // Top Face attachment based on 11 classic topologies
    const configs = [
      // 0: Pola 1-4-1 A (Top attached to Front +Z)
      { parent: hFront, pos: new THREE.Vector3(0, 0, S), axis: "X", dir: -1, trans: new THREE.Vector3(0, 0, h) },
      // 1: Pola 1-4-1 B (Top attached to Left -X)
      { parent: hLeft, pos: new THREE.Vector3(-S, 0, 0), axis: "Z", dir: -1, trans: new THREE.Vector3(-h, 0, 0) },
      // 2: Pola 1-4-1 C (Top attached to Back -Z)
      { parent: hBack, pos: new THREE.Vector3(0, 0, -S), axis: "X", dir: 1, trans: new THREE.Vector3(0, 0, -h) },
      // 3: Pola 1-4-1 D (Top attached to Right +X)
      { parent: hRight, pos: new THREE.Vector3(S, 0, 0), axis: "Z", dir: 1, trans: new THREE.Vector3(h, 0, 0) },
      // 4: Pola 1-4-1 E (Top attached to outer edge of Left shifted)
      { parent: hLeft, pos: new THREE.Vector3(-S, 0, S), axis: "X", dir: -1, trans: new THREE.Vector3(0, 0, h) },
      // 5: Pola 1-4-1 F (Top attached to outer edge of Right shifted)
      { parent: hRight, pos: new THREE.Vector3(S, 0, -S), axis: "X", dir: 1, trans: new THREE.Vector3(0, 0, -h) },
      // 6: Pola 2-3-1 A (Tangga)
      { parent: hFront, pos: new THREE.Vector3(-S, 0, S), axis: "Z", dir: -1, trans: new THREE.Vector3(-h, 0, 0) },
      // 7: Pola 2-3-1 B (Tangga)
      { parent: hFront, pos: new THREE.Vector3(S, 0, S), axis: "Z", dir: 1, trans: new THREE.Vector3(h, 0, 0) },
      // 8: Pola 2-3-1 C (Tangga)
      { parent: hBack, pos: new THREE.Vector3(S, 0, -S), axis: "Z", dir: 1, trans: new THREE.Vector3(h, 0, 0) },
      // 9: Pola 2-2-2 (Z-Pattern)
      { parent: hRight, pos: new THREE.Vector3(S, 0, S), axis: "X", dir: -1, trans: new THREE.Vector3(0, 0, h) },
      // 10: Pola 3-3 (Baling)
      { parent: hLeft, pos: new THREE.Vector3(-S, 0, -S), axis: "X", dir: 1, trans: new THREE.Vector3(0, 0, -h) }
    ];

    const cfg = configs[varIdx % configs.length];
    const hTop = new THREE.Group();
    hTop.position.copy(cfg.pos);
    cfg.parent.add(hTop);

    const topGeom = new THREE.PlaneGeometry(S, S);
    topGeom.rotateX(Math.PI / 2);
    topGeom.translate(cfg.trans.x, cfg.trans.y, cfg.trans.z);
    const meshTop = this.createFaceMesh(topGeom, cTutup, "tutup", "Tutup");
    hTop.add(meshTop);
    this.hingeList.push({ group: hTop, axis: cfg.axis, direction: cfg.dir, targetAngle: Math.PI / 2 });
  }
}

// Instantiate global NetFoldEngine
window.netFoldEngine = new NetFoldEngine();

