/* ==========================================================================
   app.js - Main Application Controller & View Router
   Manages SPA routing, state persistence (0-100% progress), 2D Net previews,
   face hover synchronization, and modal dialogs.
   ========================================================================== */

class AppManager {
  constructor() {
    this.currentView = "beranda";
    this.selectedShapeId = "kubus";
    this.selectedVariationIdx = 0;
    
    // Persistent user state
    this.state = {
      overallProgress: 0,
      exploredShapes: ["kubus"],
      quizzesAttempted: 0,
      totalCorrectAnswers: 0,
      topScore: 0
    };
  }

  /**
   * Application Bootstrapper
   */
  init() {
    this.loadSavedState();

    this.selectedVarIdxA = 0;
    this.selectedVarIdxB = 1;

    // Initialize 2D Net Canvas Experiment Mode
    if (window.experimentMode) {
      window.experimentMode.init("expCanvas");
    }

    // Render Theory content
    if (window.theoryGuide) {
      window.theoryGuide.renderTheory();
    }

    // Attach Event Listeners
    this.attachEventListeners();

    // Initialize 3D Engine for Main Exploration Viewport
    if (document.getElementById("threeCanvasContainer")) {
      window.threeManager = new ThreeManager();
      window.threeManager.init("threeCanvasContainer");
    }

    // Default view
    this.showView("beranda");
    this.updateProgressUI();

    // Restore collapsed sidebar preference on desktop
    try {
      if (localStorage.getItem("sidebarCollapsed") === "true" && window.innerWidth > 768) {
        const sidebar = document.getElementById("appSidebar");
        if (sidebar) sidebar.classList.add("collapsed");
      }
    } catch (e) {}
  }

  loadSavedState() {
    const saved = localStorage.getItem("jaring_jaring_progress_v1");
    if (saved) {
      try {
        this.state = { ...this.state, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to load progress state", e);
      }
    }
  }

  saveState() {
    localStorage.setItem("jaring_jaring_progress_v1", JSON.stringify(this.state));
    this.updateProgressUI();
  }

  addProgressPoints(pts) {
    this.state.overallProgress = Math.min(100, this.state.overallProgress + pts);
    this.saveState();
  }

  recordQuizResult(score, correctCount) {
    this.state.quizzesAttempted += 1;
    this.state.totalCorrectAnswers += correctCount;
    this.state.topScore = Math.max(this.state.topScore, score);
    this.addProgressPoints(20);
  }

  updateProgressUI() {
    const fill = document.getElementById("headerProgressBarFill");
    const text = document.getElementById("headerProgressText");
    if (fill) fill.style.width = `${this.state.overallProgress}%`;
    if (text) text.innerText = `Progres Belajar: ${this.state.overallProgress}%`;

    const sidebarBadge = document.getElementById("sidebarProgressBadge");
    if (sidebarBadge) sidebarBadge.innerText = `${this.state.overallProgress}%`;
  }

  /**
   * Router: Switch View Sections
   * @param {string} viewId 'beranda', 'eksplorasi', 'variasi', 'eksperimen', 'kuis', 'guru', 'petunjuk'
   */
  showView(viewId) {
    this.currentView = viewId;

    // Toggle Active View Sections
    document.querySelectorAll(".view-section").forEach((sec) => {
      sec.classList.remove("active");
    });

    const targetSec = document.getElementById(`view_${viewId}`);
    if (targetSec) targetSec.classList.add("active");

    // Toggle Active Sidebar Nav Items
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
      if (item.dataset.view === viewId) item.classList.add("active");
    });

    // Toggle Active Mobile Bottom Nav Items
    document.querySelectorAll(".bottom-nav-item").forEach((item) => {
      item.classList.remove("active");
      if (item.dataset.view === viewId) item.classList.add("active");
    });

    // Tutup drawer navigasi jika sedang terbuka di ponsel
    this.toggleMobileNav(false);

    // Special view initializations
    if (viewId === "eksplorasi") {
      this.loadShapeInViewport(this.selectedShapeId);
      setTimeout(() => {
        if (window.threeManager) window.threeManager.onWindowResize();
      }, 50);
    } else if (viewId === "variasi") {
      this.renderVariasiGallery(this.selectedShapeId);
    } else if (viewId === "eksperimen") {
      if (window.experimentMode) window.experimentMode.resetExperiment(this.selectedShapeId);
    } else if (viewId === "kuis") {
      if (window.quizEngine) window.quizEngine.startQuiz(1, 1);
    } else if (viewId === "guru") {
      if (window.theoryGuide) window.theoryGuide.renderTeacherReport(this.state);
    }

    // Scroll to top
    const content = document.querySelector(".app-content");
    if (content) content.scrollTop = 0;
  }

  /**
   * Load selected shape into 3D viewports & sidebar info card
   * @param {string} shapeId 
   */
  loadShapeInViewport(shapeId) {
    this.selectedShapeId = shapeId;
    this.selectedVariationIdx = 0;

    const shapeData = SHAPES_DATA[shapeId];
    if (!shapeData) return;

    // Sync shape select dropdowns
    const globalSel = document.getElementById("globalShapeSelect");
    if (globalSel && globalSel.value !== shapeId) globalSel.value = shapeId;
    const varSel = document.getElementById("variasiShapeSelect");
    if (varSel && varSel.value !== shapeId) varSel.value = shapeId;

    // Track explored shape progress
    if (!this.state.exploredShapes.includes(shapeId)) {
      this.state.exploredShapes.push(shapeId);
      this.addProgressPoints(5);
    }

    // Update Exploration 3D Viewport
    if (window.threeManager) {
      window.threeManager.loadShape(shapeId, 0);
    }

    // Render 2D Net Variations Gallery
    this.renderVariasiGallery(shapeId);

    // Update Shape Info UI Sidebar
    this.renderShapeInfoCard(shapeData);

    // Render Net Variations Panel
    this.renderNetVariationsPanel(shapeData);
  }

  renderVariasiGallery(shapeId) {
    const shapeData = SHAPES_DATA[shapeId];
    const container = document.getElementById("variasiGalleryContainer");
    if (!container || !shapeData) return;

    container.innerHTML = "";

    let variations = [];
    if (shapeId === "kubus") {
      variations = [
        { name: "Pola 1-4-1 (Cross / Salib Standar)", desc: "4 persegi berderet mendatar dengan 1 sisi tutup di atas dan 1 sisi alas di bawah." },
        { name: "Pola 1-4-1 Geser (Off-Center)", desc: "4 persegi berderet mendatar dengan posisi sisi tutup dan alas digeser ke samping." },
        { name: "Pola 2-3-1 (Tangga / Z-Shape)", desc: "Susunan bertingkat membentuk pola tangga (2 persegi, 3 persegi, 1 persegi)." },
        { name: "Pola 2-2-2 (Tangga Simetris)", desc: "3 baris bertangga yang masing-masing terdiri dari 2 persegi kongruen." },
        { name: "Pola 3-3 (Baling-baling / Strip Ganda)", desc: "2 deret horizontal yang masing-masing terdiri dari 3 persegi." }
      ];
    } else if (shapeId === "balok") {
      variations = [
        { name: "Pola Standar 1-4-1 (Atas di Depan)", desc: "Sisi tutup terpasang pada sisi tegak depan, sejajar dengan sisi alas." },
        { name: "Pola 1-4-1 (Atas di Kiri)", desc: "Sisi tutup terpasang di ujung sebelah kiri dari deretan sisi tegak." },
        { name: "Pola 1-4-1 (Atas di Kanan)", desc: "Sisi tutup terpasang di sebelah kanan dari deretan sisi tegak balok." }
      ];
    } else if (shapeData.hasNet && shapeData.variations && shapeData.variations.length > 0) {
      variations = shapeData.variations.map((v) => ({
        name: v.name,
        desc: `Variasi susunan jaring-jaring 2D untuk ${shapeData.name}.`
      }));
    } else {
      variations = [
        { name: "Pola Standar", desc: `Susunan jaring-jaring 2D untuk ${shapeData.name}.` }
      ];
    }

    variations.forEach((v, idx) => {
      const card = document.createElement("div");
      card.className = "gallery-card";
      card.style.cssText = "background: white; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 1.25rem; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.75rem;";

      const canvasId = `galCanvas_${shapeId}_${idx}`;
      card.innerHTML = `
        <div style="font-weight: 800; font-size: 0.92rem; color: #1e293b; min-height: 2.2rem; display: flex; align-items: center; justify-content: center;">
          ${v.name}
        </div>
        <canvas id="${canvasId}" width="240" height="160" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 0.25rem 0; width: 100%; max-width: 240px; height: 160px;"></canvas>
        <div style="font-size: 0.78rem; color: #64748b; line-height: 1.4; flex: 1;">
          ${v.desc}
        </div>
        <span class="badge" style="font-size: 0.72rem; background: #dbeafe; color: #1d4ed8; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.35rem;">
          <i class="fas fa-check-circle"></i> 100% Kongruen
        </span>
      `;

      container.appendChild(card);
      this.draw2DNetPreviewOnCanvas(canvasId, shapeData, idx);
    });
  }

  draw2DNetPreviewOnCanvas(canvasId, data, varIdx) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!data || !data.hasNet) {
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Tidak ada jaring-jaring.", w / 2, h / 2);
      return;
    }

    const cx = w / 2;
    const cy = h / 2;

    const cAlas   = "#3b82f6";
    const cTutup  = "#10b981";
    const cTegak  = "#f59e0b";
    const cSelimut = "#8b5cf6";

    const drawSquare = (x, y, sz, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5;
      ctx.strokeRect(x - sz / 2, y - sz / 2, sz, sz);
    };
    const drawRect = (x, y, rw, rh, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x - rw / 2, y - rh / 2, rw, rh);
      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5;
      ctx.strokeRect(x - rw / 2, y - rh / 2, rw, rh);
    };
    const drawTriangle = (p1, p2, p3, color) => {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]); ctx.closePath();
      ctx.fill(); ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5; ctx.stroke();
    };
    const drawBottomNGon = (bx, by, edgeW, N, color) => {
      const R_in = edgeW / (2 * Math.tan(Math.PI / N));
      const R = edgeW / (2 * Math.sin(Math.PI / N));
      const centerY = by + R_in;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const angle = -Math.PI / 2 + Math.PI / N + (i * 2 * Math.PI) / N;
        const px = bx + R * Math.cos(angle);
        const py = centerY + R * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5; ctx.stroke();
    };
    const drawTopNGon = (tx, ty, edgeW, N, color) => {
      const R_in = edgeW / (2 * Math.tan(Math.PI / N));
      const R = edgeW / (2 * Math.sin(Math.PI / N));
      const centerY = ty - R_in;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const angle = Math.PI / 2 - Math.PI / N - (i * 2 * Math.PI) / N;
        const px = tx + R * Math.cos(angle);
        const py = centerY + R * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5; ctx.stroke();
    };

    if (data.id === "kubus") {
      const sz = h > 100 ? 26 : 12;
      if (varIdx === 0) {
        // 1-4-1: 4 sisi horizontal, tutup di atas, alas di bawah
        drawSquare(cx - sz * 1.5, cy, sz, cTegak);
        drawSquare(cx - sz * 0.5, cy, sz, cTegak);
        drawSquare(cx + sz * 0.5, cy, sz, cTegak);
        drawSquare(cx + sz * 1.5, cy, sz, cTegak);
        drawSquare(cx - sz * 0.5, cy - sz, sz, cTutup);
        drawSquare(cx - sz * 0.5, cy + sz, sz, cAlas);
      } else if (varIdx === 1) {
        // 1-4-1 Geser: tutup di atas ujung kiri, alas di bawah sisi ke-3
        drawSquare(cx - sz * 1.5, cy, sz, cTegak);
        drawSquare(cx - sz * 0.5, cy, sz, cTegak);
        drawSquare(cx + sz * 0.5, cy, sz, cTegak);
        drawSquare(cx + sz * 1.5, cy, sz, cTegak);
        drawSquare(cx - sz * 1.5, cy - sz, sz, cTutup);
        drawSquare(cx + sz * 0.5, cy + sz, sz, cAlas);
      } else if (varIdx === 2) {
        // 2-3-1 Tangga: tutup di sudut atas kiri, alas di sudut bawah kanan
        drawSquare(cx - sz, cy - sz, sz, cTutup);
        drawSquare(cx, cy - sz, sz, cTegak);
        drawSquare(cx - sz, cy, sz, cTegak);
        drawSquare(cx, cy, sz, cTegak);
        drawSquare(cx + sz, cy, sz, cTegak);
        drawSquare(cx + sz, cy + sz, sz, cAlas);
      } else if (varIdx === 3) {
        // 2-2-2 Z: tutup di sudut atas kiri, alas di sudut bawah kanan
        drawSquare(cx - sz, cy - sz, sz, cTutup);
        drawSquare(cx, cy - sz, sz, cTegak);
        drawSquare(cx, cy, sz, cTegak);
        drawSquare(cx + sz, cy, sz, cTegak);
        drawSquare(cx + sz, cy + sz, sz, cTegak);
        drawSquare(cx + sz * 2, cy + sz, sz, cAlas);
      } else {
        // 3-3 Baling-baling: tutup di kiri baris atas, alas di kanan baris bawah
        drawSquare(cx - sz, cy - sz / 2, sz, cTutup);
        drawSquare(cx, cy - sz / 2, sz, cTegak);
        drawSquare(cx + sz, cy - sz / 2, sz, cTegak);
        drawSquare(cx, cy + sz / 2, sz, cTegak);
        drawSquare(cx + sz, cy + sz / 2, sz, cTegak);
        drawSquare(cx + sz * 2, cy + sz / 2, sz, cAlas);
      }
    } else if (data.id === "balok") {
      const rw = h > 100 ? 32 : 15;
      const rh = h > 100 ? 22 : 11;
      // 4 sisi horizontal semua = cTegak (sisi tegak)
      drawRect(cx - rw * 1.5, cy, rw, rh, cTegak);
      drawRect(cx - rw * 0.5, cy, rw, rh, cTegak);
      drawRect(cx + rw * 0.5, cy, rw, rh, cTegak);
      drawRect(cx + rw * 1.5, cy, rw, rh, cTegak);
      // tutup di atas
      let topXOffset = -0.5;
      if (varIdx === 1) topXOffset = -1.5;
      else if (varIdx === 2) topXOffset = 0.5;
      drawRect(cx + rw * topXOffset, cy - rh * 1.2, rw, rh, cTutup);
      // alas di bawah
      let botXOffset = -0.5;
      if (varIdx === 1) botXOffset = 0.5;
      else if (varIdx === 2) botXOffset = 1.5;
      drawRect(cx + rw * botXOffset, cy + rh * 1.2, rw, rh, cAlas);

    } else if (data.category === "Prisma") {
      const N = data.id === "prisma_segitiga" ? 3 : (data.id === "prisma_segiempat" ? 4 : (data.id === "prisma_segilima" ? 5 : 6));
      const rw = h > 100 ? (N >= 5 ? 18 : 22) : (N >= 5 ? 9 : 11);
      const rh = h > 100 ? 36 : 16;
      const startX = cx - (N * rw) / 2 + rw / 2;
      for (let i = 0; i < N; i++) drawRect(startX + i * rw, cy, rw, rh, cTegak);
      drawBottomNGon(startX, cy + rh / 2, rw, N, cAlas);
      const topIdx = varIdx % N;
      const topX = startX + topIdx * rw;
      drawTopNGon(topX, cy - rh / 2, rw, N, cTutup);
    } else if (data.category === "Limas") {
      const N = data.id === "limas_segitiga" ? 3 : (data.id === "limas_segiempat" ? 4 : (data.id === "limas_segilima" ? 5 : 6));
      const r = h > 100 ? (N >= 5 ? 20 : 24) : (N >= 5 ? 10 : 12);

      if (varIdx === 0) {
        // Star pattern: alas di tengah, segitiga menjulur ke luar
        const R_in = r;
        const R_circ = r / Math.sin(Math.PI / N);
        // Draw base polygon
        ctx.fillStyle = cAlas;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const a = (i * 2 * Math.PI) / N - Math.PI / 2;
          const px = cx + R_in * Math.cos(a); const py = cy + R_in * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5; ctx.stroke();
        // Draw N triangular faces radiating outward
        for (let i = 0; i < N; i++) {
          const a1 = (i * 2 * Math.PI) / N - Math.PI / 2;
          const a2 = ((i + 1) * 2 * Math.PI) / N - Math.PI / 2;
          const midA = (a1 + a2) / 2;
          const p1x = cx + R_in * Math.cos(a1); const p1y = cy + R_in * Math.sin(a1);
          const p2x = cx + R_in * Math.cos(a2); const p2y = cy + R_in * Math.sin(a2);
          const apexX = cx + (R_in + R_circ * 0.9) * Math.cos(midA);
          const apexY = cy + (R_in + R_circ * 0.9) * Math.sin(midA);
          drawTriangle([p1x, p1y], [p2x, p2y], [apexX, apexY], cTegak);
        }
      } else {
        // Linear fan: alas + segitiga direntang horizontal
        const triBase = r * 1.5;
        const triH = triBase * 0.9;
        const totalW = N * triBase;
        const startX = cx - totalW / 2;
        const baseY = cy + triH * 0.2;
        // Draw base polygon on left
        const baseW = triBase * 1.1;
        drawBottomNGon(startX + triBase / 2, baseY, baseW, N, cAlas);
        // Draw N triangles side by side
        for (let i = 0; i < N; i++) {
          const tx = startX + i * triBase + triBase / 2;
          const p1x = tx - triBase / 2; const p1y = baseY;
          const p2x = tx + triBase / 2; const p2y = baseY;
          const apexX = tx; const apexY = baseY - triH;
          drawTriangle([p1x, p1y], [p2x, p2y], [apexX, apexY], cTegak);
        }
      }
    } else if (data.id === "tabung") {
      const rw = h > 100 ? 72 : 36;
      const rh = h > 100 ? 38 : 18;
      const rad = h > 100 ? 18 : 9;
      const offsetY = h > 100 ? 36 : 17;
      drawRect(cx, cy, rw, rh, cSelimut);
      const topX = varIdx === 1 ? cx + rw / 4 : cx;
      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5;
      ctx.fillStyle = cTutup;
      ctx.beginPath(); ctx.arc(topX, cy - offsetY, rad, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = cAlas;
      ctx.beginPath(); ctx.arc(cx, cy + offsetY, rad, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (data.id === "kerucut") {
      // Cone net: fan sector (juring) pointing upward + circle (alas) below
      const secRad = h > 100 ? 44 : 22;
      const rad = h > 100 ? 14 : 7;
      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5;

      // Draw sector: fan opening downward — from 3π/4 to 9π/4 (bottom half open)
      // Use a proper sector centered at top with opening downward
      const sectorCX = cx;
      const sectorCY = cy - (h > 100 ? 8 : 4);
      const startA = Math.PI * (1 + 1/6);   // ~210°
      const endA   = Math.PI * (2 - 1/6);   // ~330° — wide bottom fan
      ctx.fillStyle = cSelimut;
      ctx.beginPath();
      ctx.moveTo(sectorCX, sectorCY);
      ctx.arc(sectorCX, sectorCY, secRad, startA, endA, false);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Alas circle: at the tip of the fan (bottom center)
      const alasCY = sectorCY + secRad + rad + (h > 100 ? 3 : 1);
      if (varIdx === 0) {
        // Alas attached below the arc midpoint
        ctx.fillStyle = cAlas;
        ctx.beginPath(); ctx.arc(sectorCX, alasCY, rad, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else {
        // Alas attached at the right edge of the sector
        const edgeX = sectorCX + secRad * Math.cos(endA);
        const edgeY = sectorCY + secRad * Math.sin(endA);
        ctx.fillStyle = cAlas;
        ctx.beginPath(); ctx.arc(edgeX, edgeY + rad, rad, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    }
  }

  toggleAudio() {
    if (!window.soundFx) return;
    window.soundFx.isMuted = !window.soundFx.isMuted;
    const icon = document.getElementById("audioToggleIcon");
    const btn = document.getElementById("audioToggleBtn");
    if (window.soundFx.isMuted) {
      if (icon) icon.className = "fas fa-volume-mute";
      if (btn) { btn.title = "Efek Suara Dibisukan"; btn.style.opacity = "0.5"; }
    } else {
      if (icon) icon.className = "fas fa-volume-up";
      if (btn) { btn.title = "Efek Suara Aktif"; btn.style.opacity = "1"; }
      window.soundFx.playSnap();
    }
  }

  renderShapeInfoCard(data) {
    const cardHeader = document.getElementById("infoCardTitle");
    const shapeTag = document.getElementById("infoCardCategory");
    const facesVal = document.getElementById("propFacesVal");
    const edgesVal = document.getElementById("propEdgesVal");
    const vertVal = document.getElementById("propVertVal");
    const shapeDesc = document.getElementById("infoCardDesc");
    const faceListContainer = document.getElementById("infoCardFaceList");

    if (cardHeader) cardHeader.innerText = data.name;
    if (shapeTag) shapeTag.innerText = `${data.category} | ${data.faceShape}`;
    if (facesVal) facesVal.innerText = data.facesCount;
    if (edgesVal) edgesVal.innerText = data.edgesCount;
    if (vertVal) vertVal.innerText = data.verticesCount > 0 ? data.verticesCount : "-";
    if (shapeDesc) shapeDesc.innerText = data.description;

    // Render Face Legend Items
    if (faceListContainer) {
      faceListContainer.innerHTML = "";
      data.faceTypes.forEach((ft) => {
        const item = document.createElement("div");
        item.className = "face-item";
        item.innerHTML = `
          <div>
            <span class="face-color-dot" style="background: ${ft.color};"></span>
            <strong>${ft.label}</strong>
          </div>
          <span style="font-size: 0.75rem; color: #64748b; font-weight: 700;">${ft.count} buah</span>
        `;
        item.onmouseenter = () => {
          if (window.threeManager) window.threeManager.highlightFaceById(ft.id);
        };
        item.onmouseleave = () => {
          if (window.threeManager) window.threeManager.clearHoverHighlight();
        };
        faceListContainer.appendChild(item);
      });
    }

    // Render Surface Area Formula Box
    const formulaBox = document.getElementById("infoCardFormulaBox");
    const formulaMain = document.getElementById("infoCardFormulaMain");
    const formulaDesc = document.getElementById("infoCardFormulaDesc");
    if (formulaBox && formulaMain && formulaDesc) {
      if (data.surfaceArea) {
        formulaBox.style.display = "block";
        formulaMain.innerText = data.surfaceArea.formula;
        formulaDesc.innerText = data.surfaceArea.breakdown;
      } else {
        formulaBox.style.display = "none";
      }
    }

    // Sphere special note warning
    const sphereNoteBox = document.getElementById("sphereMathWarningBox");
    if (sphereNoteBox) {
      if (data.id === "bola") {
        sphereNoteBox.style.display = "block";
        sphereNoteBox.innerHTML = `
          <div class="feedback-box" style="background: #fdf2f8; border: 1px solid #fbcfe8; color: #9d174d; margin: 0;">
            <h4><i class="fas fa-exclamation-triangle"></i> Catatan Penting Geometri Bola</h4>
            <p style="font-size: 0.82rem; line-height: 1.4;">${data.sphereMathNote}</p>
          </div>
        `;
      } else {
        sphereNoteBox.style.display = "none";
      }
    }
  }

  /**
   * Fitur Cetak Pola Kertas (Printable Paper Craft)
   * Menyiapkan halaman pola A4 beresolusi tinggi dengan garis gunting, lipat, dan lidah lem.
   */
  printNetPattern(shapeId) {
    const targetId = shapeId || this.selectedShapeId || "kubus";
    const data = SHAPES_DATA[targetId] || SHAPES_DATA.kubus;

    if (!data.hasNet) {
      alert(`Bangun ${data.name} tidak memiliki pola jaring-jaring datar untuk dicetak.`);
      return;
    }

    // Ambil gambar jaring-jaring dari canvas preview 2D
    const previewCanvas = document.getElementById("net2DPreviewCanvas");
    let netImgData = "";
    if (previewCanvas) {
      netImgData = previewCanvas.toDataURL("image/png");
    }

    const printHTML = `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b;">
        <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="margin: 0; font-size: 1.5rem; color: #1e3a8a;">Lembar Kerja Paper Craft: Jaring-Jaring ${data.name}</h1>
            <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #64748b;">Media Pembelajaran Matematika Interaktif Bangun Ruang</p>
          </div>
          <div style="text-align: right; font-size: 0.85rem;">
            <div>Nama: _______________________</div>
            <div style="margin-top: 4px;">Kelas / No: ___________________</div>
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px dashed #94a3b8; border-radius: 8px; padding: 10px 14px; margin-bottom: 20px; font-size: 0.82rem; line-height: 1.6;">
          <strong>✂️ Petunjuk Perakitan:</strong>
          <ol style="margin: 4px 0 0 18px; padding: 0;">
            <li>Guntinglah pola jaring-jaring di bawah ini mengikuti <strong>garis terluar hitam</strong>.</li>
            <li>Lipatlah setiap rusuk ke arah dalam mengikuti <strong>garis batas sisi</strong>.</li>
            <li>Oleskan lem pada <strong>lidah pengeleman (tepi sambungan)</strong>, lalu rekatkan hingga membentuk bangun ruang <strong>${data.name}</strong> yang kokoh.</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <img src="${netImgData}" style="max-width: 90%; max-height: 480px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #ffffff;" alt="Pola Jaring-Jaring ${data.name}" />
        </div>

        <div style="border-top: 1.5px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; font-size: 0.8rem; color: #64748b;">
          <span>Sifat: ${data.facesCount} Sisi | ${data.edgesCount} Rusuk | ${data.verticesCount > 0 ? data.verticesCount + ' Titik Sudut' : '-'}</span>
          <span>Rumus Luas Permukaan: <strong>${data.surfaceArea ? data.surfaceArea.formula : '-'}</strong></span>
        </div>
      </div>
    `;

    // Pasang ke print area
    const printArea = document.getElementById("printablePaperCraftArea");
    if (printArea) printArea.innerHTML = printHTML;

    // Tampilkan di modal preview
    const modalPreview = document.getElementById("printModalPreviewBox");
    if (modalPreview) modalPreview.innerHTML = printHTML;

    const modal = document.getElementById("printPreviewModal");
    if (modal) modal.style.display = "flex";
  }

  renderNetVariationsPanel(data) {
    const container = document.getElementById("variationsBtnsRow");
    if (!container) return;

    container.innerHTML = "";

    if (!data.hasNet || data.variations.length === 0) {
      container.innerHTML = `<span style="font-size: 0.85rem; color: #64748b;">Bangun ${data.name} tidak memiliki variasi jaring-jaring datar sederhana.</span>`;
      this.draw2DNetPreview(data, 0);
      return;
    }

    data.variations.forEach((varObj, idx) => {
      const btn = document.createElement("button");
      btn.className = `variation-btn ${idx === this.selectedVariationIdx ? "active" : ""}`;
      btn.innerText = varObj.name;
      btn.onclick = () => {
        this.selectedVariationIdx = idx;
        document.querySelectorAll(".variation-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        if (window.threeManager) window.threeManager.loadShape(data.id, idx);
        this.draw2DNetPreview(data, idx);
      };
      container.appendChild(btn);
    });

    this.draw2DNetPreview(data, this.selectedVariationIdx);
  }

  /**
   * Draw 2D Net diagram on 2D preview canvas
   */
  draw2DNetPreview(data, varIdx) {
    const canvas = document.getElementById("net2DPreviewCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!data.hasNet) {
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Bola tidak memiliki jaring-jaring datar sederhana.", w / 2, h / 2);
      return;
    }

    const cx = w / 2;
    const cy = h / 2;

    const cAlas = "#3b82f6";   // Blue
    const cTutup = "#10b981";  // Green
    const cTegak = "#f59e0b";  // Yellow/Orange
    const cSelimut = "#8b5cf6"; // Purple

    const drawSquare = (x, y, sz, color, label) => {
      ctx.fillStyle = color;
      ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - sz / 2, y - sz / 2, sz, sz);
      if (label) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, x, y + 3);
      }
    };

    const drawRect = (x, y, rw, rh, color, label) => {
      ctx.fillStyle = color;
      ctx.fillRect(x - rw / 2, y - rh / 2, rw, rh);
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - rw / 2, y - rh / 2, rw, rh);
      if (label) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, x, y + 3);
      }
    };

    const drawBottomNGon = (bx, by, edgeW, N, color, label) => {
      const R_in = edgeW / (2 * Math.tan(Math.PI / N));
      const R = edgeW / (2 * Math.sin(Math.PI / N));
      const centerY = by + R_in;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const angle = -Math.PI / 2 + Math.PI / N + (i * 2 * Math.PI) / N;
        const px = bx + R * Math.cos(angle);
        const py = centerY + R * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5; ctx.stroke();
      if (label) {
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(label, bx, centerY + 3);
      }
    };

    const drawTopNGon = (tx, ty, edgeW, N, color, label) => {
      const R_in = edgeW / (2 * Math.tan(Math.PI / N));
      const R = edgeW / (2 * Math.sin(Math.PI / N));
      const centerY = ty - R_in;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const angle = Math.PI / 2 - Math.PI / N - (i * 2 * Math.PI) / N;
        const px = tx + R * Math.cos(angle);
        const py = centerY + R * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5; ctx.stroke();
      if (label) {
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(label, tx, centerY + 3);
      }
    };

    if (data.id === "kubus") {
      const sz = 32;
      if (varIdx === 0) {
        // Pola 1-4-1 Standar: 4 sisi tegak, tutup di atas, alas di bawah
        drawSquare(cx - sz * 1.5, cy, sz, cTegak, "Kiri");
        drawSquare(cx - sz * 0.5, cy, sz, cTegak, "Depan");
        drawSquare(cx + sz * 0.5, cy, sz, cTegak, "Kanan");
        drawSquare(cx + sz * 1.5, cy, sz, cTegak, "Belak");
        drawSquare(cx - sz * 0.5, cy - sz, sz, cTutup, "Tutup");
        drawSquare(cx - sz * 0.5, cy + sz, sz, cAlas, "Alas");
      } else if (varIdx === 1) {
        // Pola 1-4-1 Geser: tutup di atas kiri, alas di bawah sisi ke-3
        drawSquare(cx - sz * 1.5, cy, sz, cTegak, "Kiri");
        drawSquare(cx - sz * 0.5, cy, sz, cTegak, "Depan");
        drawSquare(cx + sz * 0.5, cy, sz, cTegak, "Kanan");
        drawSquare(cx + sz * 1.5, cy, sz, cTegak, "Belak");
        drawSquare(cx - sz * 1.5, cy - sz, sz, cTutup, "Tutup");
        drawSquare(cx + sz * 0.5, cy + sz, sz, cAlas, "Alas");
      } else if (varIdx === 2) {
        // Pola 2-3-1 Tangga: tutup sudut atas kiri, alas sudut bawah kanan
        drawSquare(cx - sz, cy - sz, sz, cTutup, "Tutup");
        drawSquare(cx, cy - sz, sz, cTegak, "Sisi1");
        drawSquare(cx - sz, cy, sz, cTegak, "Sisi2");
        drawSquare(cx, cy, sz, cTegak, "Sisi3");
        drawSquare(cx + sz, cy, sz, cTegak, "Sisi4");
        drawSquare(cx + sz, cy + sz, sz, cAlas, "Alas");
      } else if (varIdx === 3) {
        // Pola 2-2-2 Z: tutup sudut atas kiri, alas sudut bawah kanan
        drawSquare(cx - sz, cy - sz, sz, cTutup, "Tutup");
        drawSquare(cx, cy - sz, sz, cTegak, "Sisi1");
        drawSquare(cx, cy, sz, cTegak, "Sisi2");
        drawSquare(cx + sz, cy, sz, cTegak, "Sisi3");
        drawSquare(cx + sz, cy + sz, sz, cTegak, "Sisi4");
        drawSquare(cx + sz * 2, cy + sz, sz, cAlas, "Alas");
      } else {
        // Pola 3-3 Baling-baling: tutup di kiri atas, alas di kanan bawah
        drawSquare(cx - sz, cy - sz / 2, sz, cTutup, "Tutup");
        drawSquare(cx, cy - sz / 2, sz, cTegak, "Sisi1");
        drawSquare(cx + sz, cy - sz / 2, sz, cTegak, "Sisi2");
        drawSquare(cx, cy + sz / 2, sz, cTegak, "Sisi3");
        drawSquare(cx + sz, cy + sz / 2, sz, cTegak, "Sisi4");
        drawSquare(cx + sz * 2, cy + sz / 2, sz, cAlas, "Alas");
      }
    } else if (data.id === "balok") {
      const rw = 36, rh = 26;
      if (varIdx === 0) {
        // Standard 1-4-1: tutup di atas sisi ke-2, alas di bawah sisi ke-2
        drawRect(cx - rw * 1.5, cy, rw, rh, cTegak, "Kiri");
        drawRect(cx - rw * 0.5, cy, rw, rh, cTegak, "Depan");
        drawRect(cx + rw * 0.5, cy, rw, rh, cTegak, "Kanan");
        drawRect(cx + rw * 1.5, cy, rw, rh, cTegak, "Belak");
        drawRect(cx - rw * 0.5, cy - rh * 1.2, rw, rh, cTutup, "Tutup");
        drawRect(cx - rw * 0.5, cy + rh * 1.2, rw, rh, cAlas, "Alas");
      } else if (varIdx === 1) {
        // Selang-Seling: tutup di atas kiri, alas di bawah sisi ke-3
        drawRect(cx - rw * 1.5, cy, rw, rh, cTegak, "Kiri");
        drawRect(cx - rw * 0.5, cy, rw, rh, cTegak, "Depan");
        drawRect(cx + rw * 0.5, cy, rw, rh, cTegak, "Kanan");
        drawRect(cx + rw * 1.5, cy, rw, rh, cTegak, "Belak");
        drawRect(cx - rw * 1.5, cy - rh * 1.2, rw, rh, cTutup, "Tutup");
        drawRect(cx + rw * 0.5, cy + rh * 1.2, rw, rh, cAlas, "Alas");
      } else {
        // Sayap Ganda: tutup di atas sisi ke-3, alas di bawah sisi ke-4
        drawRect(cx - rw * 1.5, cy, rw, rh, cTegak, "Kiri");
        drawRect(cx - rw * 0.5, cy, rw, rh, cTegak, "Depan");
        drawRect(cx + rw * 0.5, cy, rw, rh, cTegak, "Kanan");
        drawRect(cx + rw * 1.5, cy, rw, rh, cTegak, "Belak");
        drawRect(cx + rw * 0.5, cy - rh * 1.2, rw, rh, cTutup, "Tutup");
        drawRect(cx + rw * 1.5, cy + rh * 1.2, rw, rh, cAlas, "Alas");
      }
    } else if (data.category === "Prisma") {
      const N = data.id === "prisma_segitiga" ? 3 : (data.id === "prisma_segiempat" ? 4 : (data.id === "prisma_segilima" ? 5 : 6));
      const rw = Math.min(32, 140 / N);
      const rh = 40;
      const startX = cx - (N * rw) / 2 + rw / 2;

      // Draw N side rectangle walls
      for (let i = 0; i < N; i++) {
        const x = startX + i * rw;
        drawRect(x, cy, rw, rh, cTegak, `${i + 1}`);
      }

      // Draw Base N-gon (Alas) on side 0
      drawBottomNGon(startX, cy + rh / 2, rw, N, cAlas, "Alas");

      // Draw Top N-gon (Tutup) on side (varIdx % N)
      const topIdx = varIdx % N;
      const topX = startX + topIdx * rw;
      drawTopNGon(topX, cy - rh / 2, rw, N, cTutup, "Tutup");

    } else if (data.category === "Limas") {
      const N = data.id === "limas_segitiga" ? 3 : (data.id === "limas_segiempat" ? 4 : (data.id === "limas_segilima" ? 5 : 6));
      const r = 26;

      if (varIdx === 0) {
        // Star pattern: alas di tengah, segitiga menjulur ke luar
        const R_circ = r / Math.sin(Math.PI / N);
        ctx.fillStyle = cAlas;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const a = (i * 2 * Math.PI) / N - Math.PI / 2;
          const px = cx + r * Math.cos(a); const py = cy + r * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5; ctx.stroke();
        // Label alas
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Alas", cx, cy + 3);
        // N radial triangles
        for (let i = 0; i < N; i++) {
          const a1 = (i * 2 * Math.PI) / N - Math.PI / 2;
          const a2 = ((i + 1) * 2 * Math.PI) / N - Math.PI / 2;
          const midA = (a1 + a2) / 2;
          const p1x = cx + r * Math.cos(a1); const p1y = cy + r * Math.sin(a1);
          const p2x = cx + r * Math.cos(a2); const p2y = cy + r * Math.sin(a2);
          const apexX = cx + (r + R_circ * 0.88) * Math.cos(midA);
          const apexY = cy + (r + R_circ * 0.88) * Math.sin(midA);
          ctx.fillStyle = cTegak;
          ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.lineTo(apexX, apexY); ctx.closePath();
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#ffffff"; ctx.font = "bold 8px sans-serif"; ctx.textAlign = "center";
          ctx.fillText(`S${i+1}`, (p1x+p2x+apexX)/3, (p1y+p2y+apexY)/3 + 3);
        }
      } else {
        // Linear fan: alas + N segitiga berbaris horizontal
        const triBase = Math.min(34, 130 / N);
        const triH = triBase * 0.95;
        const totalW = N * triBase;
        const startX = cx - totalW / 2;
        const baseY = cy + triH * 0.3;
        drawBottomNGon(startX + triBase / 2, baseY, triBase * 1.1, N, cAlas, "Alas");
        for (let i = 0; i < N; i++) {
          const tx = startX + i * triBase + triBase / 2;
          const p1x = tx - triBase / 2; const p1y = baseY;
          const p2x = tx + triBase / 2; const p2y = baseY;
          const apexX = tx; const apexY = baseY - triH;
          ctx.fillStyle = cTegak;
          ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.lineTo(apexX, apexY); ctx.closePath();
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#ffffff"; ctx.font = "bold 8px sans-serif"; ctx.textAlign = "center";
          ctx.fillText(`S${i+1}`, tx, baseY - triH / 3);
        }
      }
    } else if (data.id === "tabung") {
      const rw = 100, rh = 50;
      const rCap = 22;

      // Selimut rectangle
      drawRect(cx, cy, rw, rh, cSelimut, "Selimut Tabung");

      let topX = cx;
      let botX = cx;
      if (varIdx === 1) {
        topX = cx + rw * 0.25;
        botX = cx - rw * 0.25;
      }

      // Top circle
      ctx.fillStyle = cTutup;
      ctx.beginPath(); ctx.arc(topX, cy - rh / 2 - rCap, rCap, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Tutup", topX, cy - rh / 2 - rCap + 3);

      // Bottom circle
      ctx.fillStyle = cAlas;
      ctx.beginPath(); ctx.arc(botX, cy + rh / 2 + rCap, rCap, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px sans-serif";
      ctx.fillText("Alas", botX, cy + rh / 2 + rCap + 3);

    } else if (data.id === "kerucut") {
      // Proper cone net: sector (juring) fan shape opening downward
      const rArc = 58;
      const rCap = 20;
      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5;

      // Fan sector pointing downward from pivot at top
      const pivotX = cx;
      const pivotY = cy - 22;
      const startAngle = Math.PI * (1 + 1/5);  // ~216°
      const endAngle   = Math.PI * (2 - 1/5);  // ~324°
      ctx.fillStyle = cSelimut;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.arc(pivotX, pivotY, rArc, startAngle, endAngle, false);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Juring", pivotX, pivotY + rArc * 0.55);

      // Base circle
      if (varIdx === 0) {
        // Alas at arc bottom midpoint
        const alasCY = pivotY + rArc + rCap + 2;
        ctx.fillStyle = cAlas;
        ctx.beginPath(); ctx.arc(pivotX, alasCY, rCap, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Alas", pivotX, alasCY + 3);
      } else {
        // Alas at right arc edge
        const edgeX = pivotX + rArc * Math.cos(endAngle);
        const edgeY = pivotY + rArc * Math.sin(endAngle);
        ctx.fillStyle = cAlas;
        ctx.beginPath(); ctx.arc(edgeX, edgeY + rCap + 2, rCap, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Alas", edgeX, edgeY + rCap + 5);
      }
    }
  }

  randomizeCurrentNetVariation() {
    const data = SHAPES_DATA[this.selectedShapeId];
    if (data && data.variations.length > 0) {
      const nextIdx = (this.selectedVariationIdx + 1) % data.variations.length;
      this.selectedVariationIdx = nextIdx;
      this.renderNetVariationsPanel(data);
    }
  }

  on3DFaceHover(faceId, faceName) {
    const tooltip = document.getElementById("3dFaceHoverTooltip");
    if (!tooltip) return;

    if (faceId && faceName) {
      tooltip.style.display = "flex";
      tooltip.innerHTML = `<i class="fas fa-hand-pointer"></i> Sisi Terpilih: <strong>${faceName}</strong>`;
    } else {
      tooltip.style.display = "none";
    }
  }

  open3DFoldPreview(shapeId) {
    this.showView("eksplorasi");
    this.loadShapeInViewport(shapeId);
    setTimeout(() => {
      if (window.threeManager) window.threeManager.playUnfold();
    }, 400);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.error(err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  toggleMobileNav(forceState) {
    const sidebar = document.getElementById("appSidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (!sidebar) return;
    const shouldOpen = forceState !== undefined ? forceState : !sidebar.classList.contains("mobile-open");
    if (shouldOpen) {
      sidebar.classList.add("mobile-open");
      if (backdrop) backdrop.classList.add("active");
    } else {
      sidebar.classList.remove("mobile-open");
      if (backdrop) backdrop.classList.remove("active");
    }
  }

  toggleSidebarCollapse() {
    const sidebar = document.getElementById("appSidebar");
    if (!sidebar) return;
    sidebar.classList.toggle("collapsed");
    const isCollapsed = sidebar.classList.contains("collapsed");
    try {
      localStorage.setItem("sidebarCollapsed", isCollapsed ? "true" : "false");
    } catch (e) {}

    // Beri jeda animasi transisi 260ms lalu sesuaikan Three.js canvas
    setTimeout(() => {
      if (window.threeManager) window.threeManager.onWindowResize();
    }, 260);
  }

  attachEventListeners() {
    // Desktop / Drawer Sidebar Navigation items
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const viewId = item.dataset.view;
        this.showView(viewId);
      });
    });

    // Mobile Bottom Navigation Bar items
    document.querySelectorAll(".bottom-nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const viewId = item.dataset.view;
        this.showView(viewId);
      });
    });

    // Mobile nav toggle & backdrop
    const mobileBtn = document.getElementById("btnMobileNavToggle");
    if (mobileBtn) {
      mobileBtn.onclick = (e) => {
        e.stopPropagation();
        this.toggleMobileNav();
      };
    }

    const backdrop = document.getElementById("sidebarBackdrop");
    if (backdrop) {
      backdrop.onclick = () => this.toggleMobileNav(false);
    }

    // Shape selector dropdowns
    const shapeSelect = document.getElementById("globalShapeSelect");
    if (shapeSelect) {
      shapeSelect.addEventListener("change", (e) => {
        this.loadShapeInViewport(e.target.value);
      });
    }

    const varShapeSelect = document.getElementById("variasiShapeSelect");
    if (varShapeSelect) {
      varShapeSelect.addEventListener("change", (e) => {
        this.loadShapeInViewport(e.target.value);
      });
    }

    // 3D Control buttons
    const btnPlay = document.getElementById("btnPlayPause");
    if (btnPlay) btnPlay.onclick = () => window.threeManager.togglePlayPause();

    const btnReset = document.getElementById("btnResetUnfold");
    if (btnReset) btnReset.onclick = () => window.threeManager.setFoldProgress(1.0);

    const btnFold = document.getElementById("btnFoldOnly");
    if (btnFold) btnFold.onclick = () => window.threeManager.playFold();

    const scrubber = document.getElementById("unfoldScrubber");
    if (scrubber) {
      scrubber.oninput = (e) => {
        const val = parseFloat(e.target.value) / 100;
        window.threeManager.setFoldProgress(val);
      };
    }

    const scrubberVar = document.getElementById("unfoldScrubberVariasi");
    if (scrubberVar) {
      scrubberVar.oninput = (e) => {
        const val = parseFloat(e.target.value) / 100;
        if (window.variasiThreeManager) {
          window.variasiThreeManager.setFoldProgress(val);
        }
      };
    }

    // Speed selector pills
    document.querySelectorAll(".speed-pill").forEach((pill) => {
      pill.onclick = () => {
        document.querySelectorAll(".speed-pill").forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        const speed = parseFloat(pill.dataset.speed || 1.0);
        window.threeManager.setSpeed(speed);
      };
    });
  }
}

// Global initialization on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.appManager = new AppManager();
  window.appManager.init();
});
