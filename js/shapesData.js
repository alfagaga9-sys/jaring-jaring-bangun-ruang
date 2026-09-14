/* ==========================================================================
   shapesData.js - Geometry Specifications & Net Definitions
   Contains properties, face categories, net variations, and descriptions
   for all 13 3D shapes required by the curriculum.
   ========================================================================== */

const SHAPES_DATA = {
  kubus: {
    id: "kubus",
    surfaceArea: { formula: "L = 6 × s²", breakdown: "6 buah persegi kongruen: 6 × (sisi × sisi)" },
    name: "Kubus",
    category: "Prisma",
    facesCount: 6,
    edgesCount: 12,
    verticesCount: 8,
    faceShape: "6 Persegi Kongruen",
    description: "Kubus adalah bangun ruang 3D yang dibatasi oleh 6 sisi berbentuk persegi yang sama besar (kongruen). Semua rusuknya memiliki panjang yang sama.",
    hasNet: true,
    faceTypes: [
      { id: "alas", label: "Sisi Alas", color: "#3b82f6", count: 1 },
      { id: "tutup", label: "Sisi Tutup", color: "#10b981", count: 1 },
      { id: "tegak", label: "Sisi Tegak", color: "#f59e0b", count: 4 }
    ],
    variations: [
      { name: "Pola 1-4-1 (Standar)", code: "1-4-1-a" },
      { name: "Pola 1-4-1 (Variasi B)", code: "1-4-1-b" },
      { name: "Pola 2-3-1 (Tangga)", code: "2-3-1" },
      { name: "Pola 2-2-2", code: "2-2-2" },
      { name: "Pola 3-3 (Baling)", code: "3-3" }
    ]
  },

  balok: {
    id: "balok",
    surfaceArea: { formula: "L = 2(p·l + p·t + l·t)", breakdown: "2 × (alas/tutup + depan/belakang + samping kiri/kanan)" },
    name: "Balok",
    category: "Prisma",
    facesCount: 6,
    edgesCount: 12,
    verticesCount: 8,
    faceShape: "6 Persegi Panjang (3 pasang kongruen)",
    description: "Balok adalah bangun ruang yang dibatasi oleh 6 sisi berbentuk persegi panjang, di mana sisi-sisi yang berhadapan sejajar dan kongruen.",
    hasNet: true,
    faceTypes: [
      { id: "alas", label: "Sisi Alas", color: "#3b82f6", count: 1 },
      { id: "tutup", label: "Sisi Tutup", color: "#10b981", count: 1 },
      { id: "tegak", label: "Sisi Tegak", color: "#f59e0b", count: 4 }
    ],
    variations: [
      { name: "Pola Standar 1-4-1", code: "balok-1" },
      { name: "Pola Selang-Seling", code: "balok-2" },
      { name: "Pola Sayap Ganda", code: "balok-3" }
    ]
  },

  prisma_segitiga: {
    id: "prisma_segitiga",
    surfaceArea: { formula: "L = (2 × Luas Alas) + (Keliling Alas × t)", breakdown: "2 segitiga (alas & tutup) + 3 persegi panjang (sisi tegak)" },
    name: "Prisma Segitiga",
    category: "Prisma",
    facesCount: 5,
    edgesCount: 9,
    verticesCount: 6,
    faceShape: "2 Segitiga & 3 Persegi Panjang",
    description: "Prisma segitiga memiliki alas dan tutup berbentuk segitiga yang kongruen dan sejajar, serta 3 sisi tegak berbentuk persegi panjang.",
    hasNet: true,
    faceTypes: [
      { id: "alas", label: "Sisi Alas (Segitiga)", color: "#3b82f6", count: 1 },
      { id: "tutup", label: "Sisi Tutup (Segitiga)", color: "#10b981", count: 1 },
      { id: "tegak", label: "Sisi Tegak", color: "#f59e0b", count: 3 }
    ],
    variations: [
      { name: "Alas & Tutup Berseberangan", code: "p3-1" },
      { name: "Alas & Tutup Sejajar Sisi", code: "p3-2" },
      { name: "Pola Terbuka Linear", code: "p3-3" }
    ]
  },

  prisma_segiempat: {
    id: "prisma_segiempat",
    surfaceArea: { formula: "L = (2 × Luas Alas) + (Keliling Alas × t)", breakdown: "2 segiempat (alas & tutup) + 4 persegi panjang (sisi tegak)" },
    name: "Prisma Segiempat",
    category: "Prisma",
    facesCount: 6,
    edgesCount: 12,
    verticesCount: 8,
    faceShape: "2 Segiempat & 4 Persegi Panjang",
    description: "Prisma segiempat memiliki alas dan tutup berbentuk segiempat (persegi/trapesium/jajargenjang) dan 4 sisi tegak tegak lurus alas.",
    hasNet: true,
    faceTypes: [
      { id: "alas", label: "Sisi Alas", color: "#3b82f6", count: 1 },
      { id: "tutup", label: "Sisi Tutup", color: "#10b981", count: 1 },
      { id: "tegak", label: "Sisi Tegak", color: "#f59e0b", count: 4 }
    ],
    variations: [
      { name: "Variasi Utamanya (1-4-1)", code: "p4-1" },
      { name: "Variasi Samping", code: "p4-2" }
    ]
  },

  prisma_segilima: {
    id: "prisma_segilima",
    surfaceArea: { formula: "L = (2 × Luas Alas) + (Keliling Alas × t)", breakdown: "2 segilima beraturan + 5 persegi panjang (sisi tegak)" },
    name: "Prisma Segilima",
    category: "Prisma",
    facesCount: 7,
    edgesCount: 15,
    verticesCount: 10,
    faceShape: "2 Segilima Beraturan & 5 Persegi Panjang",
    description: "Prisma segilima mempunyai alas dan tutup berbentuk segilima beraturan serta 5 sisi tegak berbentuk persegi panjang.",
    hasNet: true,
    faceTypes: [
      { id: "alas", label: "Sisi Alas (Segilima)", color: "#3b82f6", count: 1 },
      { id: "tutup", label: "Sisi Tutup (Segilima)", color: "#10b981", count: 1 },
      { id: "tegak", label: "Sisi Tegak", color: "#f59e0b", count: 5 }
    ],
    variations: [
      { name: "Alas Top-Bottom Berseberangan", code: "p5-1" },
      { name: "Alas Tutup Satu Sisi", code: "p5-2" }
    ]
  },

  prisma_segienam: {
    id: "prisma_segienam",
    surfaceArea: { formula: "L = (2 × Luas Alas) + (Keliling Alas × t)", breakdown: "2 segienam beraturan + 6 persegi panjang (sisi tegak)" },
    name: "Prisma Segienam",
    category: "Prisma",
    facesCount: 8,
    edgesCount: 18,
    verticesCount: 12,
    faceShape: "2 Segienam Beraturan & 6 Persegi Panjang",
    description: "Prisma segienam mempunyai alas dan tutup berbentuk segienam beraturan dan 6 sisi tegak persegi panjang.",
    hasNet: true,
    faceTypes: [
      { id: "alas", label: "Sisi Alas (Segienam)", color: "#3b82f6", count: 1 },
      { id: "tutup", label: "Sisi Tutup (Segienam)", color: "#10b981", count: 1 },
      { id: "tegak", label: "Sisi Tegak", color: "#f59e0b", count: 6 }
    ],
    variations: [
      { name: "Alas & Tutup Simetris", code: "p6-1" },
      { name: "Variasi Sisi Tegak Deret", code: "p6-2" }
    ]
  },

  limas_segitiga: {
    id: "limas_segitiga",
    surfaceArea: { formula: "L = Luas Alas + (3 × Luas Sisi Tegak)", breakdown: "1 segitiga alas + 3 segitiga selubung tegak" },
    name: "Limas Segitiga (Tetrahedron)",
    category: "Limas",
    facesCount: 4,
    edgesCount: 6,
    verticesCount: 4,
    faceShape: "4 Segitiga",
    description: "Limas segitiga adalah bangun ruang yang dibatasi oleh 1 alas berbentuk segitiga dan 3 sisi tegak berbentuk segitiga yang bertemu di satu titik puncak.",
    hasNet: true,
    faceTypes: [
      { id: "alas", label: "Sisi Alas (Segitiga)", color: "#3b82f6", count: 1 },
      { id: "tegak", label: "Sisi Tegak (Segitiga)", color: "#f59e0b", count: 3 }
    ],
    variations: [
      { name: "Pola Bintang (Alas di Tengah)", code: "l3-1" },
      { name: "Pola Deret Segitiga", code: "l3-2" }
    ]
  },

  limas_segiempat: {
    id: "limas_segiempat",
    surfaceArea: { formula: "L = s² + 4(½ × s × t_segitiga)", breakdown: "1 persegi alas + 4 segitiga selubung tegak" },
    name: "Limas Segiempat",
    category: "Limas",
    facesCount: 5,
    edgesCount: 8,
    verticesCount: 5,
    faceShape: "1 Segiempat (Alas) & 4 Segitiga (Tegak)",
    description: "Limas segiempat memiliki alas berbentuk persegi/segiempat dan 4 sisi tegak berbentuk segitiga yang puncak-puncaknya bertemu pada 1 titik.",
    hasNet: true,
    faceTypes: [
      { id: "alas", label: "Sisi Alas (Persegi)", color: "#3b82f6", count: 1 },
      { id: "tegak", label: "Sisi Tegak (Segitiga)", color: "#f59e0b", count: 4 }
    ],
    variations: [
      { name: "Pola Bintang 4 Arah", code: "l4-1" },
      { name: "Pola Sayap Gandeng", code: "l4-2" }
    ]
  },

  limas_segilima: {
    id: "limas_segilima",
    surfaceArea: { formula: "L = Luas Alas + (5 × Luas Sisi Tegak)", breakdown: "1 segilima alas + 5 segitiga selubung tegak" },
    name: "Limas Segilima",
    category: "Limas",
    facesCount: 6,
    edgesCount: 10,
    verticesCount: 6,
    faceShape: "1 Segilima & 5 Segitiga",
    description: "Limas segilima memiliki 1 alas segilima beraturan dan 5 sisi tegak segitiga yang bertemu pada puncak limas.",
    hasNet: true,
    faceTypes: [
      { id: "alas", label: "Sisi Alas (Segilima)", color: "#3b82f6", count: 1 },
      { id: "tegak", label: "Sisi Tegak (Segitiga)", color: "#f59e0b", count: 5 }
    ],
    variations: [
      { name: "Pola Bunga Bintang", code: "l5-1" },
      { name: "Pola Rantai Segitiga", code: "l5-2" }
    ]
  },

  limas_segienam: {
    id: "limas_segienam",
    surfaceArea: { formula: "L = Luas Alas + (6 × Luas Sisi Tegak)", breakdown: "1 segienam alas + 6 segitiga selubung tegak" },
    name: "Limas Segienam",
    category: "Limas",
    facesCount: 7,
    edgesCount: 12,
    verticesCount: 7,
    faceShape: "1 Segienam & 6 Segitiga",
    description: "Limas segienam dipadukan dari alas berbentuk segienam dan 6 sisi tegak berbentuk segitiga.",
    hasNet: true,
    faceTypes: [
      { id: "alas", label: "Sisi Alas (Segienam)", color: "#3b82f6", count: 1 },
      { id: "tegak", label: "Sisi Tegak (Segitiga)", color: "#f59e0b", count: 6 }
    ],
    variations: [
      { name: "Pola Bintang Segienam", code: "l6-1" }
    ]
  },

  tabung: {
    id: "tabung",
    surfaceArea: { formula: "L = 2πr(r + t)", breakdown: "2 lingkaran (alas & tutup: 2πr²) + 1 persegi panjang (selimut: 2πr × t)" },
    name: "Tabung (Silinder)",
    category: "Bangun Lengkung",
    facesCount: 3,
    edgesCount: 2,
    verticesCount: 0,
    faceShape: "2 Lingkaran & 1 Persegi Panjang (Selimut)",
    description: "Tabung adalah bangun ruang yang dibatasi oleh dua lingkaran kongruen yang sejajar (alas & tutup) dan sebuah selimut berbentuk persegi panjang yang melengkung.",
    hasNet: true,
    faceTypes: [
      { id: "alas", label: "Lingkaran Alas", color: "#3b82f6", count: 1 },
      { id: "tutup", label: "Lingkaran Tutup", color: "#10b981", count: 1 },
      { id: "selimut", label: "Selimut Tabung", color: "#8b5cf6", count: 1 }
    ],
    variations: [
      { name: "Alas & Tutup Berseberangan", code: "tabung-1" },
      { name: "Alas & Tutup Sejajar Samping", code: "tabung-2" }
    ]
  },

  kerucut: {
    id: "kerucut",
    surfaceArea: { formula: "L = πr(r + s)", breakdown: "1 lingkaran (alas: πr²) + 1 juring lingkaran (selimut: πrs)" },
    name: "Kerucut",
    category: "Bangun Lengkung",
    facesCount: 2,
    edgesCount: 1,
    verticesCount: 1,
    faceShape: "1 Lingkaran & 1 Juring Lingkaran (Selimut)",
    description: "Kerucut dibatasi oleh sebuah alas berbentuk lingkaran dan selimut melengkung yang berupa juring lingkaran yang bertemu di satu titik puncak.",
    hasNet: true,
    faceTypes: [
      { id: "alas", label: "Lingkaran Alas", color: "#3b82f6", count: 1 },
      { id: "selimut", label: "Selimut (Juring)", color: "#8b5cf6", count: 1 }
    ],
    variations: [
      { name: "Alas Terhubung di Tengah Juring", code: "kerucut-1" },
      { name: "Alas Terhubung di Ujung Juring", code: "kerucut-2" }
    ]
  },

  bola: {
    id: "bola",
    surfaceArea: { formula: "L = 4πr²", breakdown: "Setara dengan luas 4 lingkaran berjari-jari sama (4 × πr²)" },
    name: "Bola",
    category: "Bangun Lengkung",
    facesCount: 1,
    edgesCount: 0,
    verticesCount: 0,
    faceShape: "1 Permukaan Lengkung Tertutup",
    description: "Bola adalah bangun ruang 3D bundar sempurna di mana setiap titik pada permukaannya berjarak sama (jari-jari) ke titik pusat.",
    hasNet: false,
    faceTypes: [
      { id: "selimut", label: "Permukaan Bola", color: "#ec4899", count: 1 }
    ],
    variations: [],
    sphereMathNote: "Secara matematis, BOLA TIDAK MEMILIKI JARING-JARING DATAR SEDERHANA yang tepat tanpa peregangan atau penyobekan. Hal ini dibuktikan oleh Carl Friedrich Gauss dalam 'Theorema Egregium', karena permukaan bola memiliki Kelengkungan Gauss (Gaussian Curvature) positif yang konstan, sedangkan bidang datar memiliki kelengkungan nol. Peta bumi (seperti proyeksi Mercator atau Goode) adalah contoh upaya merentangkan bola ke bidang datar dengan konsekuensi terjadinya distorsi luas atau bentuk."
  }
};
