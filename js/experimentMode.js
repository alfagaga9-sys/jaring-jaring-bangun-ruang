/* ==========================================================================
   experimentMode.js - Mode Eksperimen Bebas: Susun Sendiri
   Pengguna memilih potongan bentuk secara bebas dan menyusunnya di kanvas.
   Dilengkapi Magnetic Edge-Snapping cerdas sehingga sisi menempel rapat tanpa celah.
   Saat menekan "Periksa", sistem mengenali bangun ruang apa yang terbentuk.
   ========================================================================== */

// Dimensi standar modular (rusuk dasar = 60px)
const FREE_PALETTE = [
  { id: "square",   label: "Persegi",          color: "#3b82f6", w: 60, h: 60, shape: "square"   },
  { id: "rect",     label: "Persegi Panjang",   color: "#f59e0b", w: 90, h: 60, shape: "rect"     },
  { id: "triangle", label: "Segitiga",          color: "#ef4444", w: 60, h: 60, shape: "triangle" },
  { id: "pentagon", label: "Segilima",          color: "#10b981", w: 60, h: 60, shape: "pentagon" },
  { id: "hexagon",  label: "Segienam",          color: "#06b6d4", w: 60, h: 60, shape: "hexagon"  },
  { id: "circle",   label: "Lingkaran",         color: "#8b5cf6", w: 60, h: 60, shape: "circle"   },
  { id: "sector",   label: "Juring (Kerucut)",  color: "#ec4899", w: 80, h: 60, shape: "sector"   },
];

class ExperimentMode {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.pieces = [];
    this.selectedPiece = null;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.gridSize = 10; // Grid lebih halus (10px) agar pergeseran sangat presisi
    this.snapThreshold = 18; // Ambang jarak magnetis (pixel)
    this.activeSnapGuide = null; // Menyimpan info garis snap saat menempel
    this.wasSnapped = false; // Deteksi transisi untuk efek suara snap
    this.currentChallenge = null;
  }

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    // Mouse Listeners
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.canvas.addEventListener("mouseup",   () => this.onMouseUp());
    this.canvas.addEventListener("dblclick",  (e) => this.onDoubleClick(e));

    // Touchscreen Listeners (Dukungan HP, Tablet & Smartboard)
    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        this.onMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
      }
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
      }
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener("touchend", (e) => {
      this.onMouseUp();
      e.preventDefault();
    }, { passive: false });

    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.initFreePalette();
    this.resetCanvas();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    this.canvas.width  = parent.clientWidth || 640;
    this.canvas.height = 440;
    this.draw();
  }

  initFreePalette() {
    const box = document.getElementById("expPiecesPalette");
    if (!box) return;
    box.innerHTML = "";
    FREE_PALETTE.forEach((piece) => {
      const item = document.createElement("div");
      item.className = "piece-item";
      item.title = "Klik untuk menambahkan " + piece.label;
      const previewSize = 38;
      const cvs = document.createElement("canvas");
      cvs.width = previewSize; cvs.height = previewSize;
      cvs.style.cssText = "display:block; margin:0 auto 4px;";
      const pCtx = cvs.getContext("2d");
      this._drawShapeOnCtx(pCtx, piece.shape, previewSize / 2, previewSize / 2,
                           previewSize * 0.82, previewSize * 0.82, piece.color, false);
      const lbl = document.createElement("div");
      lbl.style.cssText = "font-size:0.68rem; font-weight:700; text-align:center; line-height:1.3;";
      lbl.textContent = piece.label;
      item.appendChild(cvs); item.appendChild(lbl);
      item.onclick = () => this.addFreePiece(piece);
      box.appendChild(item);
    });
  }

  clearResultBox() {
    const rb = document.getElementById("expResultBox");
    if (rb) { rb.innerHTML = ""; rb.className = ""; }
  }

  resetCanvas() {
    this.pieces = [];
    this.selectedPiece = null;
    this.activeSnapGuide = null;
    this.clearResultBox();
    this.draw();
  }

  resetExperiment(shapeId) {
    if (this.canvas) {
      this.resizeCanvas();
    }
  }

  addFreePiece(pieceDef) {
    this.clearResultBox();
    const cx = Math.round((this.canvas.width / 2 - pieceDef.w / 2) / this.gridSize) * this.gridSize;
    const cy = Math.round((this.canvas.height / 2 - pieceDef.h / 2) / this.gridSize) * this.gridSize;
    const jx = (this.pieces.length % 5) * 20 - 40;
    const jy = Math.floor(this.pieces.length / 5) * 20 - 20;
    this.addPiece(pieceDef.shape, cx + jx, cy + jy, pieceDef.w, pieceDef.h, pieceDef.color, pieceDef.label);
  }

  addPiece(type, x, y, width, height, color, label) {
    const piece = {
      id: "p_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      type, color, label, width, height,
      x: Math.round(x / this.gridSize) * this.gridSize,
      y: Math.round(y / this.gridSize) * this.gridSize,
      rotation: 0,
    };
    this.pieces.push(piece);
    this.selectedPiece = piece;
    this.draw();
  }

  rotateSelectedPiece() {
    if (!this.selectedPiece) return;
    this.clearResultBox();
    const p = this.selectedPiece;
    p.rotation = (p.rotation + 90) % 360;
    // Untuk persegi panjang atau juring, tukar dimensi width dan height agar hit-box dan snapping presisi
    if (p.type === "rect" || p.type === "sector") {
      const oldW = p.width;
      p.width = p.height;
      p.height = oldW;
    }
    this.draw();
  }

  deleteSelectedPiece() {
    if (!this.selectedPiece) return;
    this.clearResultBox();
    this.pieces = this.pieces.filter(p => p.id !== this.selectedPiece.id);
    this.selectedPiece = null;
    this.activeSnapGuide = null;
    this.draw();
  }

  _drawShapeOnCtx(ctx, shape, cx, cy, w, h, color, isSelected) {
    ctx.fillStyle   = color;
    ctx.strokeStyle = isSelected ? "#2563eb" : "#1e293b";
    ctx.lineWidth   = isSelected ? 3 : 1.5;
    switch (shape) {
      case "square":
      case "rect":
        ctx.beginPath(); ctx.rect(cx - w / 2, cy - h / 2, w, h); ctx.fill(); ctx.stroke(); break;
      case "triangle":
        ctx.beginPath();
        ctx.moveTo(cx, cy - h / 2);
        ctx.lineTo(cx + w / 2, cy + h / 2);
        ctx.lineTo(cx - w / 2, cy + h / 2);
        ctx.closePath(); ctx.fill(); ctx.stroke(); break;
      case "pentagon":
      case "hexagon": {
        const N = shape === "pentagon" ? 5 : 6;
        const R = Math.min(w, h) / 2 * 0.95;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const a = (i * 2 * Math.PI) / N - Math.PI / 2;
          const px = cx + R * Math.cos(a);
          const py = cy + R * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke(); break;
      }
      case "circle":
        ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) / 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); break;
      case "sector": {
        const rArc = Math.max(w, h) * 0.85;
        const sA = Math.PI * (1 + 1 / 6), eA = Math.PI * (2 - 1 / 6);
        ctx.beginPath(); ctx.moveTo(cx, cy - h * 0.1);
        ctx.arc(cx, cy - h * 0.1, rArc, sA, eA, false);
        ctx.closePath(); ctx.fill(); ctx.stroke(); break;
      }
      default:
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h); ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
    }
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background Grid
    ctx.strokeStyle = "#f1f5f9"; ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += this.gridSize * 2) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += this.gridSize * 2) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Indikator Garis Snap Magnetik (jika sedang menempel)
    if (this.activeSnapGuide) {
      ctx.save();
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(this.activeSnapGuide.x1, this.activeSnapGuide.y1);
      ctx.lineTo(this.activeSnapGuide.x2, this.activeSnapGuide.y2);
      ctx.stroke();
      ctx.restore();
    }

    // Gambar semua potongan
    this.pieces.forEach((p) => {
      const sel = this.selectedPiece && this.selectedPiece.id === p.id;
      ctx.save();
      ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
      this._drawShapeOnCtx(ctx, p.type, 0, 0, p.width, p.height, p.color, sel);

      // Label teks di dalam bentuk
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(p.label.length > 10 ? p.label.substr(0, 9) + "..." : p.label, 0, 0);

      // Kotak seleksi putus-putus untuk potongan yang aktif
      if (sel) {
        ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(-p.width / 2 - 3, -p.height / 2 - 3, p.width + 6, p.height + 6);
        ctx.setLineDash([]);
      }
      ctx.restore();
    });

    // Badge info jumlah potongan
    if (this.pieces.length > 0) {
      ctx.fillStyle = "rgba(30, 41, 59, 0.75)";
      ctx.beginPath(); ctx.roundRect(8, 8, 140, 24, 6); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(this.pieces.length + " potongan di kanvas", 14, 20);
    }
  }

  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i];
      if (mx >= p.x && mx <= p.x + p.width && my >= p.y && my <= p.y + p.height) {
        this.selectedPiece = p;
        // Bawa potongan ke lapisan paling atas
        this.pieces.splice(i, 1); this.pieces.push(p);
        this.isDragging = true;
        this.dragOffset = { x: mx - p.x, y: my - p.y };
        this.clearResultBox();
        this.draw(); return;
      }
    }
    this.selectedPiece = null;
    this.activeSnapGuide = null;
    this.draw();
  }

  /**
   * Sistem Magnetic Edge-Snapping Cerdas:
   * Mengunci tepi potongan aktif ke tepi potongan terdekat secara presisi (tanpa celah / gap).
   */
  applyMagneticSnapping(targetX, targetY) {
    const p = this.selectedPiece;
    const threshold = this.snapThreshold;
    let snappedX = targetX;
    let snappedY = targetY;
    let guide = null;

    let bestDistX = threshold;
    let bestDistY = threshold;

    for (let i = 0; i < this.pieces.length; i++) {
      const other = this.pieces[i];
      if (other.id === p.id) continue;

      // 1. VERTICAL SNAPPING (Menempel di Atas atau Bawah 'other')
      // Cek apakah posisi horizontal tumpang-tindih atau sejajar
      const xOverlap = Math.min(targetX + p.width, other.x + other.width) - Math.max(targetX, other.x);
      if (xOverlap > -threshold) {
        // Tepi atas p menempel rapat ke tepi bawah other
        const distBottom = Math.abs(targetY - (other.y + other.height));
        if (distBottom < bestDistY) {
          bestDistY = distBottom;
          snappedY = other.y + other.height; // MENEMPEL PERSIS TANPA CELAH
          guide = { x1: other.x, y1: snappedY, x2: other.x + other.width, y2: snappedY };
        }

        // Tepi bawah p menempel rapat ke tepi atas other
        const distTop = Math.abs((targetY + p.height) - other.y);
        if (distTop < bestDistY) {
          bestDistY = distTop;
          snappedY = other.y - p.height; // MENEMPEL PERSIS TANPA CELAH
          guide = { x1: other.x, y1: other.y, x2: other.x + other.width, y2: other.y };
        }
      }

      // 2. HORIZONTAL SNAPPING (Menempel di Kiri atau Kanan 'other')
      const yOverlap = Math.min(targetY + p.height, other.y + other.height) - Math.max(targetY, other.y);
      if (yOverlap > -threshold) {
        // Tepi kiri p menempel rapat ke tepi kanan other
        const distRight = Math.abs(targetX - (other.x + other.width));
        if (distRight < bestDistX) {
          bestDistX = distRight;
          snappedX = other.x + other.width; // MENEMPEL PERSIS TANPA CELAH
          guide = { x1: snappedX, y1: other.y, x2: snappedX, y2: other.y + other.height };
        }

        // Tepi kanan p menempel rapat ke tepi kiri other
        const distLeft = Math.abs((targetX + p.width) - other.x);
        if (distLeft < bestDistX) {
          bestDistX = distLeft;
          snappedX = other.x - p.width; // MENEMPEL PERSIS TANPA CELAH
          guide = { x1: other.x, y1: other.y, x2: other.x, y2: other.y + other.height };
        }
      }

      // 3. CENTER & EDGE ALIGNMENT (Meratakan Posisi Tengah atau Sisi)
      // Alignment Horizontal saat menempel di atas/bawah
      if (bestDistY < threshold) {
        // Rata Tengah (Sangat cocok untuk Lingkaran atau Segitiga di atas/bawah Persegi Panjang)
        const centerOtherX = other.x + (other.width - p.width) / 2;
        if (Math.abs(targetX - centerOtherX) < threshold) {
          snappedX = centerOtherX;
        } else if (Math.abs(targetX - other.x) < threshold) {
          snappedX = other.x; // Rata Kiri
        } else if (Math.abs((targetX + p.width) - (other.x + other.width)) < threshold) {
          snappedX = other.x + other.width - p.width; // Rata Kanan
        }
      }

      // Alignment Vertikal saat menempel di kiri/kanan
      if (bestDistX < threshold) {
        const centerOtherY = other.y + (other.height - p.height) / 2;
        if (Math.abs(targetY - centerOtherY) < threshold) {
          snappedY = centerOtherY;
        } else if (Math.abs(targetY - other.y) < threshold) {
          snappedY = other.y; // Rata Atas
        } else if (Math.abs((targetY + p.height) - (other.y + other.height)) < threshold) {
          snappedY = other.y + other.height - p.height; // Rata Bawah
        }
      }
    }

    // Jika tidak menempel pada potongan lain, snap ke grid halus
    if (bestDistX === threshold) {
      snappedX = Math.round(targetX / this.gridSize) * this.gridSize;
    }
    if (bestDistY === threshold) {
      snappedY = Math.round(targetY / this.gridSize) * this.gridSize;
    }

    const isSnappedNow = (bestDistX < threshold || bestDistY < threshold);
    if (isSnappedNow && !this.wasSnapped) {
      if (window.soundFx) window.soundFx.playSnap();
    }
    this.wasSnapped = isSnappedNow;

    this.activeSnapGuide = isSnappedNow ? guide : null;
    return { x: snappedX, y: snappedY };
  }

  onMouseMove(e) {
    if (!this.isDragging || !this.selectedPiece) return;
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;

    const rawX = mx - this.dragOffset.x;
    const rawY = my - this.dragOffset.y;

    const snapped = this.applyMagneticSnapping(rawX, rawY);
    this.selectedPiece.x = snapped.x;
    this.selectedPiece.y = snapped.y;
    this.draw();
  }

  onMouseUp() {
    this.isDragging = false;
    this.wasSnapped = false;
    this.activeSnapGuide = null;
    this.draw();
  }

  onDoubleClick() {
    if (this.selectedPiece) this.rotateSelectedPiece();
  }

  _countPieces() {
    const c = {};
    this.pieces.forEach(p => { c[p.type] = (c[p.type] || 0) + 1; });
    return c;
  }

  /**
   * Memeriksa apakah semua potongan saling menempel dan membentuk satu kesatuan jaring-jaring
   */
  _isConnected() {
    if (this.pieces.length <= 1) return true;
    const adj = Array.from({ length: this.pieces.length }, () => []);
    for (let i = 0; i < this.pieces.length; i++) {
      for (let j = i + 1; j < this.pieces.length; j++) {
        const pi = this.pieces[i], pj = this.pieces[j];
        // Cek overlap atau kedekatan tepi dengan toleransi 8px
        const xClose = Math.max(pi.x, pj.x) - Math.min(pi.x + pi.width, pj.x + pj.width) <= 8;
        const yClose = Math.max(pi.y, pj.y) - Math.min(pi.y + pi.height, pj.y + pj.height) <= 8;
        if (xClose && yClose) {
          adj[i].push(j);
          adj[j].push(i);
        }
      }
    }
    const visited = new Set([0]), queue = [0];
    while (queue.length) {
      const cur = queue.shift();
      for (const nb of adj[cur]) {
        if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
      }
    }
    return visited.size === this.pieces.length;
  }

  identifyShape(c) {
    const sq = c.square   || 0,
          rc = c.rect     || 0,
          tr = c.triangle || 0,
          pe = c.pentagon || 0,
          hx = c.hexagon  || 0,
          ci = c.circle   || 0,
          se = c.sector   || 0,
          total = sq + rc + tr + pe + hx + ci + se;

    // Kerucut: 1 juring + 1 lingkaran
    if (se === 1 && ci === 1 && total === 2)
      return { name: "Kerucut", id: "kerucut", emoji: "🔺" };

    // Tabung: 1 persegi panjang (atau 1 persegi) + 2 lingkaran
    if ((rc === 1 || sq === 1) && ci === 2 && total === 3)
      return { name: "Tabung", id: "tabung", emoji: "🫙" };

    // Kubus: 6 persegi
    if (sq === 6 && total === 6)
      return { name: "Kubus", id: "kubus", emoji: "📦" };

    // Balok: 6 sisi (campuran persegi panjang & persegi)
    if ((sq + rc) === 6 && total === 6 && sq < 6 && tr === 0 && pe === 0 && hx === 0)
      return { name: "Balok", id: "balok", emoji: "🧱" };

    // Prisma Segitiga: 2 segitiga + 3 persegi panjang/persegi
    if (tr === 2 && (sq + rc) === 3 && total === 5)
      return { name: "Prisma Segitiga", id: "prisma_segitiga", emoji: "🔷" };

    // Prisma Segiempat: 2 persegi + 4 persegi panjang
    if ((sq + rc) === 6 && tr === 0 && pe === 0 && hx === 0 && sq >= 2 && rc >= 4)
      return { name: "Prisma Segiempat", id: "prisma_segiempat", emoji: "🔷" };

    // Prisma Segilima: 2 segilima + 5 persegi panjang/persegi
    if (pe === 2 && (sq + rc) === 5 && total === 7)
      return { name: "Prisma Segilima", id: "prisma_segilima", emoji: "🔷" };

    // Prisma Segienam: 2 segienam + 6 persegi panjang/persegi
    if (hx === 2 && (sq + rc) === 6 && total === 8)
      return { name: "Prisma Segienam", id: "prisma_segienam", emoji: "🔷" };

    // Limas Segitiga: 4 segitiga
    if (tr === 4 && total === 4)
      return { name: "Limas Segitiga", id: "limas_segitiga", emoji: "🔺" };

    // Limas Segiempat: 1 persegi + 4 segitiga
    if (sq === 1 && tr === 4 && total === 5)
      return { name: "Limas Segiempat", id: "limas_segiempat", emoji: "🔺" };

    // Limas Segilima: 1 segilima + 5 segitiga
    if (pe === 1 && tr === 5 && total === 6)
      return { name: "Limas Segilima", id: "limas_segilima", emoji: "🔺" };

    // Limas Segienam: 1 segienam + 6 segitiga
    if (hx === 1 && tr === 6 && total === 7)
      return { name: "Limas Segienam", id: "limas_segienam", emoji: "🔺" };

    return null;
  }

  checkValidation() {
    const rb = document.getElementById("expResultBox");
    if (!rb) return;

    if (this.pieces.length < 2) {
      rb.className = "feedback-box wrong-fb";
      rb.innerHTML = '<h4><i class="fas fa-exclamation-triangle"></i> Kanvas Masih Kosong</h4><p>Tambahkan potongan sisi dari palet kiri, lalu susun membentuk jaring-jaring.</p>';
      return;
    }

    const counts = this._countPieces();
    const identified = this.identifyShape(counts);

    if (!identified) {
      const summary = Object.entries(counts).map(([k, v]) => {
        const p = FREE_PALETTE.find(x => x.id === k);
        return v + " " + (p ? p.label : k);
      }).join(", ");

      rb.className = "feedback-box wrong-fb";
      rb.innerHTML = '<h4><i class="fas fa-question-circle"></i> Belum Teridentifikasi</h4>'
        + '<p>Susunan saat ini: <strong>' + summary + '</strong></p>'
        + '<p>Kombinasi ini belum cocok dengan bangun ruang manapun. Periksa kembali jumlah dan jenis potongan!</p>'
        + '<details style="margin-top:8px;font-size:0.82rem;color:#475569;">'
        + '<summary style="cursor:pointer;font-weight:700;">💡 Petunjuk kombinasi yang valid</summary>'
        + '<ul style="margin:6px 0 0 16px;line-height:1.9;">'
        + '<li>📦 <b>Kubus</b>: 6 persegi</li>'
        + '<li>🧱 <b>Balok</b>: 4 persegi panjang + 2 persegi (atau 6 persegi panjang)</li>'
        + '<li>🔷 <b>Prisma Segitiga</b>: 2 segitiga + 3 persegi panjang</li>'
        + '<li>🔷 <b>Prisma Segilima</b>: 2 segilima + 5 persegi panjang</li>'
        + '<li>🔷 <b>Prisma Segienam</b>: 2 segienam + 6 persegi panjang</li>'
        + '<li>🔺 <b>Limas Segitiga</b>: 4 segitiga</li>'
        + '<li>🔺 <b>Limas Segiempat</b>: 1 persegi + 4 segitiga</li>'
        + '<li>🔺 <b>Limas Segilima</b>: 1 segilima + 5 segitiga</li>'
        + '<li>🔺 <b>Limas Segienam</b>: 1 segienam + 6 segitiga</li>'
        + '<li>🫙 <b>Tabung</b>: 1 persegi panjang + 2 lingkaran</li>'
        + '<li>🔺 <b>Kerucut</b>: 1 juring + 1 lingkaran</li>'
        + '</ul></details>';
      return;
    }

    if (!this._isConnected()) {
      rb.className = "feedback-box wrong-fb";
      rb.innerHTML = '<h4><i class="fas fa-exclamation-triangle"></i> Potongan Belum Saling Menempel</h4>'
        + '<p>Kombinasi potonganmu cocok untuk <strong>' + identified.name + '</strong>, tetapi posisinya belum saling menempel rapat.</p>'
        + '<p>Geser potongan mendekati sisi potongan lain hingga menempel erat!</p>';
      return;
    }

    rb.className = "feedback-box correct-fb";
    rb.innerHTML = '<h4><i class="fas fa-check-circle"></i> ' + identified.emoji + ' Berhasil! Kamu menyusun jaring-jaring <strong>' + identified.name + '</strong>!</h4>'
      + '<p>Hebat! Susunan potonganmu menempel sempurna dan dapat dilipat menjadi bangun ruang <strong>' + identified.name + '</strong>. 🎉</p>'
      + '<button class="btn btn-primary" style="margin-top:10px;" onclick="window.appManager&&window.appManager.open3DFoldPreview(\'' + identified.id + '\')">'
      + '<i class="fas fa-cube"></i> Lihat Simulasi Pelipatan 3D</button>';

    // Audio Fanfare & Visual Confetti
    if (window.soundFx) {
      window.soundFx.playSuccess();
      window.soundFx.triggerConfetti();
    }

    if (window.appManager) window.appManager.addProgressPoints(15);
  }

  /**
   * Mode Misi Tantangan Acak:
   * Menyebarkan potongan acak untuk suatu bangun ruang, siswa ditantang merakitnya!
   */
  startChallenge() {
    const targets = [
      {
        id: "kubus", name: "Kubus",
        pieces: [
          { type: "square", label: "Alas", color: "#3b82f6", w: 60, h: 60 },
          { type: "square", label: "Tutup", color: "#10b981", w: 60, h: 60 },
          { type: "square", label: "Tegak 1", color: "#f59e0b", w: 60, h: 60 },
          { type: "square", label: "Tegak 2", color: "#f59e0b", w: 60, h: 60 },
          { type: "square", label: "Tegak 3", color: "#f59e0b", w: 60, h: 60 },
          { type: "square", label: "Tegak 4", color: "#f59e0b", w: 60, h: 60 }
        ]
      },
      {
        id: "limas_segiempat", name: "Limas Segiempat",
        pieces: [
          { type: "square", label: "Alas", color: "#3b82f6", w: 60, h: 60 },
          { type: "triangle", label: "Tegak 1", color: "#ef4444", w: 60, h: 60 },
          { type: "triangle", label: "Tegak 2", color: "#ef4444", w: 60, h: 60 },
          { type: "triangle", label: "Tegak 3", color: "#ef4444", w: 60, h: 60 },
          { type: "triangle", label: "Tegak 4", color: "#ef4444", w: 60, h: 60 }
        ]
      },
      {
        id: "prisma_segitiga", name: "Prisma Segitiga",
        pieces: [
          { type: "triangle", label: "Alas", color: "#ef4444", w: 60, h: 60 },
          { type: "triangle", label: "Tutup", color: "#ef4444", w: 60, h: 60 },
          { type: "rect", label: "Tegak 1", color: "#f59e0b", w: 90, h: 60 },
          { type: "rect", label: "Tegak 2", color: "#f59e0b", w: 90, h: 60 },
          { type: "rect", label: "Tegak 3", color: "#f59e0b", w: 90, h: 60 }
        ]
      },
      {
        id: "tabung", name: "Tabung",
        pieces: [
          { type: "rect", label: "Selimut", color: "#f59e0b", w: 90, h: 60 },
          { type: "circle", label: "Alas", color: "#8b5cf6", w: 60, h: 60 },
          { type: "circle", label: "Tutup", color: "#8b5cf6", w: 60, h: 60 }
        ]
      },
      {
        id: "kerucut", name: "Kerucut",
        pieces: [
          { type: "sector", label: "Juring", color: "#ec4899", w: 80, h: 60 },
          { type: "circle", label: "Alas", color: "#8b5cf6", w: 60, h: 60 }
        ]
      }
    ];

    const pick = targets[Math.floor(Math.random() * targets.length)];
    this.currentChallenge = pick;
    this.pieces = [];
    this.selectedPiece = null;

    const W = this.canvas ? this.canvas.width : 600;
    const H = this.canvas ? this.canvas.height : 400;

    pick.pieces.forEach((pDef, idx) => {
      // Posisi acak terdistribusi di kanvas
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const rx = 50 + col * 170 + Math.floor((Math.random() - 0.5) * 40);
      const ry = 50 + row * 130 + Math.floor((Math.random() - 0.5) * 30);
      this.addPiece(pDef.type, Math.max(30, Math.min(W - 100, rx)), Math.max(30, Math.min(H - 80, ry)),
                    pDef.w, pDef.h, pDef.color, pDef.label);
    });

    const rb = document.getElementById("expResultBox");
    if (rb) {
      rb.className = "feedback-box";
      rb.style.background = "#eef2ff";
      rb.style.border = "1.5px solid #818cf8";
      rb.innerHTML = `<h4><i class="fas fa-flag-checkered" style="color:#4f46e5;"></i> Misi: Susun Jaring-Jaring ${pick.name}!</h4>
        <p>Potongan yang dibutuhkan sudah disiapkan di kanvas. Geser, putar, dan rekatkan potongan-potongan tersebut hingga membentuk jaring-jaring <strong>${pick.name}</strong> yang sempurna!</p>`;
    }
  }
}

window.experimentMode = new ExperimentMode();
