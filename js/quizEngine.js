/* ==========================================================================
   quizEngine.js - Bank Soal Matematika Interaktif Jaring-Jaring Bangun Ruang
   Semua diagram murni menggunakan label Huruf (A, B, C, ...) atau Angka (1, 2, 3, ...)
   TANPA tulisan kata "ALAS" atau "TUTUP" di dalam bidang.
   Dilengkapi Kuis 3: Melengkapi Jaring-Jaring Prisma dan Limas yang Belum Lengkap!
   ========================================================================== */

class QuizEngine {
  constructor() {
    this.currentQuizType = 1;
    this.currentLevel = 1;
    this.questionIndex = 0;
    this.totalQuestions = 5;
    this.score = 0;
    this.correctCount = 0;

    this.currentQuestion = null;
    this.selectedOptions = new Set();
    this.questionPool = [];
  }

  startQuiz(quizType = 1, level = 1) {
    this.currentQuizType = quizType;
    this.currentLevel = level;
    this.questionIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.selectedOptions.clear();

    // Sorot tombol kategori kuis yang aktif
    document.querySelectorAll(".quiz-cat-btn").forEach((btn, idx) => {
      if (idx + 1 === quizType) {
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-primary");
      } else {
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-secondary");
      }
    });

    this.questionPool = this.generateQuestionsForType(quizType);
    this.questionPool.sort(() => Math.random() - 0.5);
    this.totalQuestions = Math.min(5, this.questionPool.length);

    this.loadQuestion();
  }

  loadQuestion() {
    this.selectedOptions.clear();
    this.currentQuestion = this.questionPool[this.questionIndex % this.questionPool.length];
    this.renderQuestionUI();
  }

  generateQuestionsForType(type) {
    if (type === 1) {
      return this.getQuiz1Questions();
    } else if (type === 2) {
      return this.getQuiz2Questions();
    } else {
      return this.getQuiz3Questions();
    }
  }

  // ========================================================================
  // KUIS 1: IDENTIFIKASI SISI ALAS & TUTUP
  // (Semua gambar berlabel nomor 1-6 atau huruf murni tanpa teks bocoran)
  // ========================================================================
  getQuiz1Questions() {
    return [
      // 1. Kubus Pola 1-4-1
      {
        shapeId: "kubus",
        title: "Perhatikan jaring-jaring <strong>Kubus</strong> di bawah ini. Jika sisi bernomor <strong>3</strong> dijadikan <strong>SISI ALAS</strong>, manakah sisi yang menjadi <strong>SISI TUTUP</strong>?",
        svg: `
          <svg width="250" height="175" viewBox="0 0 250 175" style="margin: 0 auto; display: block;">
            <rect x="95" y="10" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="117.5" y="38" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

            <rect x="50" y="55" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="72.5" y="83" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

            <rect x="95" y="55" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="117.5" y="83" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>

            <rect x="140" y="55" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="162.5" y="83" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>

            <rect x="185" y="55" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="207.5" y="83" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>

            <rect x="140" y="100" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="162.5" y="128" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">6</text>
          </svg>
        `,
        options: [
          { id: "k1_opt5", text: "Sisi 5", isCorrect: true },
          { id: "k1_opt1", text: "Sisi 1", isCorrect: false },
          { id: "k1_opt4", text: "Sisi 4", isCorrect: false },
          { id: "k1_opt6", text: "Sisi 6", isCorrect: false }
        ],
        isMultiSelect: false,
        explanation: "<strong>Pembahasan:</strong> Pada barisan 4 persegi berderet mendatar (2, 3, 4, 5), sisi yang saling melompati satu kotak akan berhadapan saat dilipat. Sisi 2 berhadapan dengan Sisi 4, dan <strong>Sisi 3 berhadapan dengan Sisi 5</strong>. Sisi 1 dan 6 menjadi penutup atas dan bawah yang saling berhadapan. Jadi jika Sisi 3 adalah alas, maka tutupnya adalah <strong>Sisi 5</strong>."
      },

      // 2. Balok Pola 1-4-1
      {
        shapeId: "balok",
        title: "Perhatikan jaring-jaring <strong>Balok</strong> berikut. Jika bidang bernomor <strong>2</strong> adalah <strong>SISI ALAS</strong>, manakah bidang yang menjadi <strong>SISI TUTUP</strong>?",
        svg: `
          <svg width="270" height="180" viewBox="0 0 270 180" style="margin: 0 auto; display: block;">
            <rect x="70" y="15" width="55" height="35" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="97.5" y="38" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

            <rect x="15" y="50" width="55" height="55" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="42.5" y="83" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

            <rect x="70" y="50" width="55" height="55" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="97.5" y="83" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>

            <rect x="125" y="50" width="55" height="55" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="152.5" y="83" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>

            <rect x="180" y="50" width="55" height="55" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="207.5" y="83" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>

            <rect x="125" y="105" width="55" height="35" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="152.5" y="128" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">6</text>
          </svg>
        `,
        options: [
          { id: "b1_opt4", text: "Bidang 4", isCorrect: true },
          { id: "b1_opt3", text: "Bidang 3", isCorrect: false },
          { id: "b1_opt5", text: "Bidang 5", isCorrect: false },
          { id: "b1_opt6", text: "Bidang 6", isCorrect: false }
        ],
        isMultiSelect: false,
        explanation: "<strong>Pembahasan:</strong> Pada barisan 4 bidang berderet mendatar (2, 3, 4, 5), sisi-sisi yang berselang satu kotak akan saling berhadapan sejajar. Maka <strong>Bidang 2 berhadapan dengan Bidang 4</strong>, dan Bidang 3 berhadapan dengan Bidang 5. Jadi jika Bidang 2 adalah alas, maka tutupnya adalah <strong>Bidang 4</strong>."
      },

      // 3. Prisma Segitiga
      {
        shapeId: "prisma_segitiga",
        title: "Perhatikan jaring-jaring <strong>Prisma Segitiga</strong> berikut. Jika bidang segitiga <strong>A</strong> adalah <strong>SISI ALAS</strong>, manakah bidang yang merupakan <strong>SISI TUTUP</strong>?",
        svg: `
          <svg width="250" height="185" viewBox="0 0 250 185" style="margin: 0 auto; display: block;">
            <polygon points="100,50 150,50 125,10" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="125" y="38" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">A</text>

            <rect x="50" y="50" width="50" height="70" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="75" y="90" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">C</text>

            <rect x="100" y="50" width="50" height="70" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="125" y="90" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">D</text>

            <rect x="150" y="50" width="50" height="70" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="175" y="90" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">E</text>

            <polygon points="100,120 150,120 125,160" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="125" y="145" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">B</text>
          </svg>
        `,
        options: [
          { id: "p3_optB", text: "Bidang Segitiga B", isCorrect: true },
          { id: "p3_optC", text: "Bidang Persegi Panjang C", isCorrect: false },
          { id: "p3_optD", text: "Bidang Persegi Panjang D", isCorrect: false },
          { id: "p3_optE", text: "Bidang Persegi Panjang E", isCorrect: false }
        ],
        isMultiSelect: false,
        explanation: "<strong>Pembahasan:</strong> Prisma segitiga dibatasi oleh sepasang segitiga kongruen yang saling berhadapan sebagai alas dan tutup. Karena Segitiga A adalah alas, maka <strong>Segitiga B adalah sisi tutup</strong>. Bidang C, D, dan E adalah sisi-sisi tegak."
      },

      // 4. Limas Segiempat
      {
        shapeId: "limas_segiempat",
        title: "Perhatikan jaring-jaring <strong>Limas Segiempat</strong> berikut. Manakah bidang yang berfungsi sebagai <strong>SISI ALAS</strong>?",
        svg: `
          <svg width="240" height="190" viewBox="0 0 240 190" style="margin: 0 auto; display: block;">
            <rect x="95" y="70" width="50" height="50" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="120" y="100" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">E</text>

            <polygon points="95,70 145,70 120,20" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="120" y="52" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">A</text>

            <polygon points="95,120 145,120 120,170" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="120" y="148" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">B</text>

            <polygon points="95,70 95,120 45,95" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="73" y="100" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">C</text>

            <polygon points="145,70 145,120 195,95" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="167" y="100" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">D</text>
          </svg>
        `,
        options: [
          { id: "l4_optE", text: "Bidang Persegi E", isCorrect: true },
          { id: "l4_optA", text: "Bidang Segitiga A", isCorrect: false },
          { id: "l4_optB", text: "Bidang Segitiga B", isCorrect: false },
          { id: "l4_optC", text: "Bidang Segitiga C", isCorrect: false }
        ],
        isMultiSelect: false,
        explanation: "<strong>Pembahasan:</strong> Limas segiempat memiliki satu sisi alas berbentuk segiempat (<strong>Bidang E</strong>), dan 4 sisi tegak berbentuk segitiga (A, B, C, D) yang akan dilipat ke atas bertemu di satu titik puncak."
      },

      // 5. Tabung
      {
        shapeId: "tabung",
        title: "Perhatikan jaring-jaring <strong>Tabung</strong> berikut. Jika bidang lingkaran <strong>K</strong> adalah <strong>SISI TUTUP</strong>, manakah bidang yang merupakan <strong>SISI ALAS</strong>?",
        svg: `
          <svg width="270" height="185" viewBox="0 0 270 185" style="margin: 0 auto; display: block;">
            <circle cx="135" cy="30" r="24" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="135" y="37" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">K</text>

            <rect x="45" y="60" width="180" height="60" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="135" y="96" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">M</text>

            <circle cx="135" cy="150" r="24" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="135" y="157" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">L</text>
          </svg>
        `,
        options: [
          { id: "tb_optL", text: "Lingkaran L", isCorrect: true },
          { id: "tb_optM", text: "Persegi Panjang M", isCorrect: false },
          { id: "tb_optK", text: "Lingkaran K", isCorrect: false },
          { id: "tb_optX", text: "Tidak ada bidang alas", isCorrect: false }
        ],
        isMultiSelect: false,
        explanation: "<strong>Pembahasan:</strong> Jaring-jaring tabung terdiri dari 2 lingkaran identik (alas dan tutup) serta 1 persegi panjang (selimut tabung). Karena Lingkaran K adalah tutup, maka <strong>Lingkaran L adalah sisi alas</strong>."
      }
    ];
  }

  // ========================================================================
  // KUIS 2: MENENTUKAN SISI TEGAK (MULTI-SELECT / PILIHAN GANDA KOMPLEKS)
  // ========================================================================
  getQuiz2Questions() {
    return [
      // 1. Prisma Segitiga
      {
        shapeId: "prisma_segitiga",
        title: "Perhatikan jaring-jaring <strong>Prisma Segitiga</strong> berikut. Bidang segitiga A dan B adalah alas dan tutup. Pilihlah <strong>SEMUA bidang yang merupakan SISI TEGAK</strong>! <i>(Pilih semua yang benar)</i>",
        svg: `
          <svg width="270" height="185" viewBox="0 0 270 185" style="margin: 0 auto; display: block;">
            <polygon points="110,50 160,50 135,10" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="135" y="38" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">A</text>

            <rect x="60" y="50" width="50" height="75" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="85" y="93" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

            <rect x="110" y="50" width="50" height="75" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="135" y="93" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

            <rect x="160" y="50" width="50" height="75" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="185" y="93" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>

            <polygon points="110,125 160,125 135,165" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="135" y="148" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">B</text>
          </svg>
        `,
        options: [
          { id: "q2_p3_1", text: "Bidang 1", isCorrect: true },
          { id: "q2_p3_2", text: "Bidang 2", isCorrect: true },
          { id: "q2_p3_3", text: "Bidang 3", isCorrect: true },
          { id: "q2_p3_A", text: "Bidang A", isCorrect: false },
          { id: "q2_p3_B", text: "Bidang B", isCorrect: false }
        ],
        isMultiSelect: true,
        explanation: "<strong>Pembahasan:</strong> Sisi tegak pada prisma segitiga berjumlah 3 buah berbentuk persegi panjang, yaitu <strong>Bidang 1, 2, dan 3</strong>. Bidang A dan B adalah alas dan tutup."
      },

      // 2. Limas Segiempat
      {
        shapeId: "limas_segiempat",
        title: "Perhatikan jaring-jaring <strong>Limas Segiempat</strong> berikut. Bidang persegi E adalah Sisi Alas. Pilihlah <strong>SEMUA bidang yang merupakan SISI TEGAK</strong>! <i>(Pilih semua yang benar)</i>",
        svg: `
          <svg width="240" height="195" viewBox="0 0 240 195" style="margin: 0 auto; display: block;">
            <rect x="95" y="70" width="50" height="50" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="120" y="100" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">E</text>

            <polygon points="95,70 145,70 120,20" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="120" y="52" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">A</text>

            <polygon points="95,120 145,120 120,170" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="120" y="148" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">B</text>

            <polygon points="95,70 95,120 45,95" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="73" y="100" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">C</text>

            <polygon points="145,70 145,120 195,95" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="167" y="100" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">D</text>
          </svg>
        `,
        options: [
          { id: "q2_l4_A", text: "Bidang Segitiga A", isCorrect: true },
          { id: "q2_l4_B", text: "Bidang Segitiga B", isCorrect: true },
          { id: "q2_l4_C", text: "Bidang Segitiga C", isCorrect: true },
          { id: "q2_l4_D", text: "Bidang Segitiga D", isCorrect: true },
          { id: "q2_l4_E", text: "Bidang Persegi E", isCorrect: false }
        ],
        isMultiSelect: true,
        explanation: "<strong>Pembahasan:</strong> Sisi tegak pada limas segiempat adalah seluruh bidang segitiga yang menyelimuti limas, yaitu <strong>Bidang Segitiga A, B, C, dan D</strong> (total 4 bidang segitiga). Bidang E adalah alas."
      },

      // 3. Kubus
      {
        shapeId: "kubus",
        title: "Perhatikan jaring-jaring <strong>Kubus</strong> berikut. Jika Sisi 1 adalah TUTUP dan Sisi 6 adalah ALAS, manakah yang termasuk <strong>SISI-SISI TEGAK KUBUS</strong>? <i>(Pilih semua yang benar)</i>",
        svg: `
          <svg width="260" height="175" viewBox="0 0 260 175" style="margin: 0 auto; display: block;">
            <rect x="100" y="10" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="122.5" y="38" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

            <rect x="55" y="55" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="77.5" y="83" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

            <rect x="100" y="55" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="122.5" y="83" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>

            <rect x="145" y="55" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="167.5" y="83" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>

            <rect x="190" y="55" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="212.5" y="83" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>

            <rect x="100" y="100" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="122.5" y="128" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">6</text>
          </svg>
        `,
        options: [
          { id: "q2_k_2", text: "Sisi 2", isCorrect: true },
          { id: "q2_k_3", text: "Sisi 3", isCorrect: true },
          { id: "q2_k_4", text: "Sisi 4", isCorrect: true },
          { id: "q2_k_5", text: "Sisi 5", isCorrect: true },
          { id: "q2_k_1", text: "Sisi 1", isCorrect: false },
          { id: "q2_k_6", text: "Sisi 6", isCorrect: false }
        ],
        isMultiSelect: true,
        explanation: "<strong>Pembahasan:</strong> Kubus memiliki 6 sisi. Jika Sisi 1 adalah tutup dan Sisi 6 adalah alas, maka keempat sisi yang melingkar di sekelilingnya (<strong>Sisi 2, 3, 4, dan 5</strong>) adalah sisi tegak kubus."
      },

      // 4. Limas Segitiga
      {
        shapeId: "limas_segitiga",
        title: "Perhatikan jaring-jaring <strong>Limas Segitiga</strong> berikut. Bidang A adalah Sisi Alas. Pilihlah <strong>SEMUA bidang yang merupakan SISI TEGAK</strong>! <i>(Pilih semua yang benar)</i>",
        svg: `
          <svg width="240" height="215" viewBox="0 0 240 215" style="margin: 0 auto; display: block;">
            <polygon points="120,55 80,125 160,125" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="120" y="105" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">A</text>

            <polygon points="120,55 80,125 40,55" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="80" y="75" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">B</text>

            <polygon points="120,55 160,125 200,55" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="160" y="75" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">C</text>

            <polygon points="80,125 160,125 120,195" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="120" y="158" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">D</text>
          </svg>
        `,
        options: [
          { id: "q2_l3_b", text: "Bidang B", isCorrect: true },
          { id: "q2_l3_c", text: "Bidang C", isCorrect: true },
          { id: "q2_l3_d", text: "Bidang D", isCorrect: true },
          { id: "q2_l3_a", text: "Bidang A", isCorrect: false }
        ],
        isMultiSelect: true,
        explanation: "<strong>Pembahasan:</strong> Limas segitiga dibatasi oleh 1 bidang alas (Bidang A) dan 3 bidang sisi tegak (<strong>Bidang B, C, dan D</strong>) yang saling bertemu di titik puncak limas."
      },

      // 5. Tabung
      {
        shapeId: "tabung",
        title: "Perhatikan jaring-jaring <strong>Tabung</strong> berikut. Manakah bidang yang berfungsi sebagai <strong>SELIMUT / SISI TEGAK TABUNG</strong>?",
        svg: `
          <svg width="270" height="175" viewBox="0 0 270 175" style="margin: 0 auto; display: block;">
            <circle cx="90" cy="30" r="22" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="90" y="36" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">P</text>

            <rect x="35" y="55" width="200" height="60" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="135" y="90" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">R</text>

            <circle cx="180" cy="140" r="22" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="180" y="146" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">Q</text>
          </svg>
        `,
        options: [
          { id: "q2_tb_r", text: "Bidang Persegi Panjang R", isCorrect: true },
          { id: "q2_tb_p", text: "Bidang Lingkaran P", isCorrect: false },
          { id: "q2_tb_q", text: "Bidang Lingkaran Q", isCorrect: false }
        ],
        isMultiSelect: false,
        explanation: "<strong>Pembahasan:</strong> Selimut tabung jika dibentangkan membentuk <strong>Bidang Persegi Panjang R</strong>. Bidang P dan Q adalah lingkaran alas dan tutup tabung."
      }
    ];
  }

  // ========================================================================
  // KUIS 3: MELENGKAPI JARING-JARING PRISMA DAN LIMAS
  // (Menampilkan jaring-jaring yang belum lengkap dengan slot bertanda [ ? ])
  // Siswa menentukan bentuk potongan dan posisinya agar sempurna!
  // ========================================================================
  getQuiz3Questions() {
    return [
      // 1. Melengkapi Prisma Segitiga (Kurang 1 Tutup Segitiga di Bawah Sisi 2)
      {
        shapeId: "prisma_segitiga",
        title: "Perhatikan jaring-jaring <strong>Prisma Segitiga</strong> yang belum lengkap di bawah ini. Potongan bentuk apakah yang harus ditambahkan dan di manakah posisinya pada area bertanda <strong>[ ? ]</strong> agar jaring-jaring tersebut lengkap?",
        svg: `
          <svg width="270" height="200" viewBox="0 0 270 200" style="margin: 0 auto; display: block;">
            <!-- Segitiga Alas A di atas Sisi 2 -->
            <polygon points="110,55 160,55 135,15" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="135" y="42" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">A</text>

            <!-- 3 Persegi Panjang Sisi Tegak: 1, 2, 3 -->
            <rect x="60" y="55" width="50" height="70" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="85" y="95" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

            <rect x="110" y="55" width="50" height="70" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="135" y="95" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

            <rect x="160" y="55" width="50" height="70" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="185" y="95" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>

            <!-- Area Kosong yang Hilang [ ? ] (Segitiga Tutup Bawah) -->
            <polygon points="110,125 160,125 135,165" fill="#f8fafc" stroke="#6366f1" stroke-width="2.5" stroke-dasharray="5,3"/>
            <text x="135" y="148" font-size="16" font-weight="bold" fill="#4f46e5" text-anchor="middle">[ ? ]</text>
          </svg>
        `,
        options: [
          { id: "q3_p3_opt1", text: "Menambahkan 1 buah segitiga kongruen di bawah Sisi 2", isCorrect: true },
          { id: "q3_p3_opt2", text: "Menambahkan 1 buah persegi panjang di sebelah kanan Sisi 3", isCorrect: false },
          { id: "q3_p3_opt3", text: "Menambahkan 1 buah persegi di bawah Sisi 2", isCorrect: false },
          { id: "q3_p3_opt4", text: "Menambahkan 1 buah segitiga di atas Sisi 1", isCorrect: false }
        ],
        isMultiSelect: false,
        explanation: "<strong>Pembahasan:</strong> Prisma segitiga dibatasi oleh 2 buah bidang segitiga kongruen (alas dan tutup) serta 3 persegi panjang (sisi tegak). Pada gambar sudah ada 3 persegi panjang (1, 2, 3) dan 1 segitiga (A), sehingga potongan yang kurang adalah <strong>1 buah segitiga kongruen yang dipasang di bagian bawah Sisi 2</strong>."
      },

      // 2. Melengkapi Limas Segiempat (Kurang 1 Sisi Tegak Segitiga di Kanan Alas)
      {
        shapeId: "limas_segiempat",
        title: "Perhatikan jaring-jaring <strong>Limas Segiempat</strong> berikut. Bangun ini baru memiliki 1 alas persegi (E) dan 3 sisi tegak segitiga (A, B, C). Bentuk potongan apa dan di mana letaknya yang harus ditambahkan pada area <strong>[ ? ]</strong>?",
        svg: `
          <svg width="250" height="200" viewBox="0 0 250 200" style="margin: 0 auto; display: block;">
            <!-- Persegi Alas E di tengah -->
            <rect x="95" y="75" width="50" height="50" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="120" y="105" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">E</text>

            <!-- 3 Segitiga Tegak yang sudah ada: Atas (A), Bawah (B), Kiri (C) -->
            <polygon points="95,75 145,75 120,25" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="120" y="58" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">A</text>

            <polygon points="95,125 145,125 120,175" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="120" y="152" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">B</text>

            <polygon points="95,75 95,125 45,100" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="73" y="105" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">C</text>

            <!-- Area Kosong yang Hilang [ ? ] (Segitiga Kanan) -->
            <polygon points="145,75 145,125 195,100" fill="#f8fafc" stroke="#6366f1" stroke-width="2.5" stroke-dasharray="5,3"/>
            <text x="168" y="105" font-size="16" font-weight="bold" fill="#4f46e5" text-anchor="middle">[ ? ]</text>
          </svg>
        `,
        options: [
          { id: "q3_l4_opt1", text: "Menambahkan 1 buah segitiga di sebelah kanan bidang persegi E", isCorrect: true },
          { id: "q3_l4_opt2", text: "Menambahkan 1 buah persegi di sebelah kanan bidang persegi E", isCorrect: false },
          { id: "q3_l4_opt3", text: "Menambahkan 1 buah segitiga menempel di atas bidang A", isCorrect: false },
          { id: "q3_l4_opt4", text: "Menambahkan 1 buah persegi panjang di sebelah kiri bidang C", isCorrect: false }
        ],
        isMultiSelect: false,
        explanation: "<strong>Pembahasan:</strong> Limas segiempat membutuhkan 1 alas persegi dan 4 sisi tegak berbentuk segitiga. Pada gambar baru terdapat 3 segitiga (atas, bawah, kiri), sehingga sisi yang kurang adalah <strong>1 buah segitiga pada rusuk kanan bidang persegi E</strong> agar seluruh sisi dapat bertemu di puncak limas."
      },

      // 3. Melengkapi Balok / Prisma Segiempat (Kurang 1 Persegi Panjang di Deretan Sisi Tegak)
      {
        shapeId: "balok",
        title: "Perhatikan jaring-jaring <strong>Balok</strong> yang belum lengkap di bawah ini. Agar jaring-jaring ini dapat dilipat menjadi balok yang sempurna, potongan bentuk apakah yang harus ditambahkan pada posisi <strong>[ ? ]</strong>?",
        svg: `
          <svg width="280" height="180" viewBox="0 0 280 180" style="margin: 0 auto; display: block;">
            <!-- Tutup Atas A dan Alas Bawah B di Sisi 2 -->
            <rect x="65" y="15" width="55" height="35" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="92.5" y="38" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">A</text>

            <!-- Baris mendatar: Sisi 1, Sisi 2, Sisi 3, dan [ ? ] -->
            <rect x="10" y="50" width="55" height="55" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="37.5" y="83" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

            <rect x="65" y="50" width="55" height="55" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="92.5" y="83" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

            <rect x="120" y="50" width="55" height="55" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="147.5" y="83" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>

            <!-- Slot kosong [ ? ] di samping Sisi 3 -->
            <rect x="175" y="50" width="55" height="55" fill="#f8fafc" stroke="#6366f1" stroke-width="2.5" stroke-dasharray="5,3"/>
            <text x="202.5" y="83" font-size="16" font-weight="bold" fill="#4f46e5" text-anchor="middle">[ ? ]</text>

            <rect x="65" y="105" width="55" height="35" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="92.5" y="128" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">B</text>
          </svg>
        `,
        options: [
          { id: "q3_blk_opt1", text: "Menambahkan 1 buah persegi panjang sisi tegak di sebelah kanan Sisi 3", isCorrect: true },
          { id: "q3_blk_opt2", text: "Menambahkan 1 buah segitiga di sebelah kanan Sisi 3", isCorrect: false },
          { id: "q3_blk_opt3", text: "Menambahkan 1 buah persegi di atas Sisi 1", isCorrect: false },
          { id: "q3_blk_opt4", text: "Menambahkan 1 buah lingkaran di bawah Sisi 3", isCorrect: false }
        ],
        isMultiSelect: false,
        explanation: "<strong>Pembahasan:</strong> Balok memiliki 4 sisi tegak yang melingkari bidang alas dan tutup (A dan B). Pada gambar deretan sisi tegak baru ada 3 buah (Sisi 1, 2, 3). Maka potongan yang harus ditambahkan adalah <strong>1 buah persegi panjang sisi tegak di sebelah kanan Sisi 3</strong>."
      },

      // 4. Melengkapi Limas Segitiga (Kurang 1 Segitiga di Bawah Alas)
      {
        shapeId: "limas_segitiga",
        title: "Perhatikan jaring-jaring <strong>Limas Segitiga</strong> yang belum lengkap di bawah ini. Potongan bentuk apa dan di manakah posisinya yang harus ditambahkan pada area <strong>[ ? ]</strong> agar membentuk jaring-jaring limas segitiga yang sempurna?",
        svg: `
          <svg width="240" height="215" viewBox="0 0 240 215" style="margin: 0 auto; display: block;">
            <!-- Segitiga Alas A di tengah -->
            <polygon points="120,55 80,125 160,125" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="120" y="105" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">A</text>

            <!-- 2 Segitiga Tegak yang sudah ada: Kiri (B) dan Kanan (C) -->
            <polygon points="120,55 80,125 40,55" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="80" y="75" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">B</text>

            <polygon points="120,55 160,125 200,55" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="160" y="75" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">C</text>

            <!-- Area Kosong yang Hilang [ ? ] (Segitiga Bawah Kongruen) -->
            <polygon points="80,125 160,125 120,195" fill="#f8fafc" stroke="#6366f1" stroke-width="2.5" stroke-dasharray="6,4"/>
            <text x="120" y="158" font-size="16" font-weight="bold" fill="#4f46e5" text-anchor="middle">[ ? ]</text>
          </svg>
        `,
        options: [
          { id: "q3_l3_opt1", text: "Menambahkan 1 buah segitiga sama sisi pada sisi bawah segitiga A", isCorrect: true },
          { id: "q3_l3_opt2", text: "Menambahkan 1 buah persegi pada sisi bawah segitiga A", isCorrect: false },
          { id: "q3_l3_opt3", text: "Menambahkan 1 buah segitiga di atas sisi B", isCorrect: false },
          { id: "q3_l3_opt4", text: "Menambahkan 1 buah juring lingkaran pada sisi A", isCorrect: false }
        ],
        isMultiSelect: false,
        explanation: "<strong>Pembahasan:</strong> Limas segitiga (tetrahedron) dibatasi oleh 4 buah segitiga sama sisi yang kongruen. Pada gambar baru terdapat 3 buah segitiga (A, B, C), sehingga dibutuhkan <strong>1 buah segitiga sama sisi lagi yang dipasang pada rusuk bawah segitiga A</strong>."
      },

      // 5. Melengkapi Prisma Segilima (Kurang 1 Persegi Panjang Sisi Tegak)
      {
        shapeId: "prisma_segilima",
        title: "Perhatikan jaring-jaring <strong>Prisma Segilima</strong> berikut. Bangun ini baru memiliki 2 segilima (alas dan tutup) serta 4 persegi panjang sisi tegak. Bentuk apakah yang harus ditambahkan pada posisi <strong>[ ? ]</strong>?",
        svg: `
          <svg width="270" height="185" viewBox="0 0 270 185" style="margin: 0 auto; display: block;">
            <!-- Segilima Atas -->
            <polygon points="105,10 130,28 120,55 90,55 80,28" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>

            <!-- 4 Persegi Panjang Sisi Tegak: 1, 2, 3, 4 -->
            <rect x="15" y="55" width="42" height="70" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="36" y="95" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

            <rect x="57" y="55" width="42" height="70" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="78" y="95" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

            <rect x="99" y="55" width="42" height="70" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="120" y="95" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>

            <rect x="141" y="55" width="42" height="70" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="162" y="95" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>

            <!-- Slot Kosong [ ? ] di Samping Sisi 4 -->
            <rect x="183" y="55" width="42" height="70" fill="#f8fafc" stroke="#6366f1" stroke-width="2.5" stroke-dasharray="5,3"/>
            <text x="204" y="95" font-size="15" font-weight="bold" fill="#4f46e5" text-anchor="middle">[ ? ]</text>

            <!-- Segilima Bawah -->
            <polygon points="105,175 130,157 120,130 90,130 80,157" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
          </svg>
        `,
        options: [
          { id: "q3_p5_opt1", text: "Menambahkan 1 buah persegi panjang sisi tegak di sebelah kanan Sisi 4", isCorrect: true },
          { id: "q3_p5_opt2", text: "Menambahkan 1 buah bidang segilima di sebelah kanan Sisi 4", isCorrect: false },
          { id: "q3_p5_opt3", text: "Menambahkan 1 buah segitiga di bawah Sisi 4", isCorrect: false },
          { id: "q3_p5_opt4", text: "Menambahkan 1 buah lingkaran di sebelah kiri Sisi 1", isCorrect: false }
        ],
        isMultiSelect: false,
        explanation: "<strong>Pembahasan:</strong> Prisma segilima membutuhkan 2 bidang segilima kongruen (alas dan tutup) serta 5 bidang persegi panjang sebagai sisi-sisi tegaknya. Karena pada deretan sisi tegak baru ada 4 buah, maka potongan yang harus ditambahkan adalah <strong>1 buah persegi panjang sisi tegak di sebelah kanan Sisi 4</strong>."
      },

      // 6. Melengkapi Kubus Pola 1-4-1
      {
        shapeId: "kubus",
        title: "Perhatikan jaring-jaring <strong>Kubus</strong> di bawah ini yang baru memiliki 5 sisi. Bentuk potongan apakah dan di manakah posisinya pada area <strong>[ ? ]</strong> agar jaring-jaring ini dapat dilipat menjadi kubus yang sempurna?",
        svg: `
          <svg width="250" height="175" viewBox="0 0 250 175" style="margin: 0 auto; display: block;">
            <!-- Sisi Atas di atas Sisi 2 -->
            <rect x="95" y="10" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="117.5" y="38" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>

            <!-- Baris mendatar: Sisi 2, 3, 4, 5 -->
            <rect x="50" y="55" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="72.5" y="83" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>

            <rect x="95" y="55" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="117.5" y="83" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>

            <rect x="140" y="55" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="162.5" y="83" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>

            <rect x="185" y="55" width="45" height="45" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
            <text x="207.5" y="83" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>

            <!-- Slot Kosong [ ? ] di Bawah Sisi 4 -->
            <rect x="140" y="100" width="45" height="45" fill="#f8fafc" stroke="#6366f1" stroke-width="2.5" stroke-dasharray="5,3"/>
            <text x="162.5" y="128" font-size="16" font-weight="bold" fill="#4f46e5" text-anchor="middle">[ ? ]</text>
          </svg>
        `,
        options: [
          { id: "q3_k_opt1", text: "Menambahkan 1 buah persegi kongruen di bawah Sisi 4", isCorrect: true },
          { id: "q3_k_opt2", text: "Menambahkan 1 buah persegi panjang di bawah Sisi 4", isCorrect: false },
          { id: "q3_k_opt3", text: "Menambahkan 1 buah segitiga di bawah Sisi 4", isCorrect: false },
          { id: "q3_k_opt4", text: "Menambahkan 1 buah persegi menumpuk di atas Sisi 1", isCorrect: false }
        ],
        isMultiSelect: false,
        explanation: "<strong>Pembahasan:</strong> Kubus membutuhkan 6 buah persegi yang kongruen. Dengan menambahkan <strong>1 buah persegi kongruen di bawah Sisi 4</strong>, jaring-jaring akan membentuk pola 1-4-1 yang valid dan dapat dilipat sempurna menjadi kubus."
      }
    ];
  }

  renderQuestionUI() {
    const container = document.getElementById("quizCardContainer");
    if (!container || !this.currentQuestion) return;

    const q = this.currentQuestion;

    let optionsHTML = "";
    q.options.forEach((opt) => {
      const inputType = q.isMultiSelect ? "checkbox" : "radio";
      const isSelected = this.selectedOptions.has(opt.id);
      optionsHTML += `
        <button class="option-btn ${isSelected ? "selected" : ""}" id="${opt.id}" onclick="window.quizEngine.selectOption('${opt.id}', ${q.isMultiSelect})">
          <input type="${inputType}" name="quizOpt" style="pointer-events:none;" ${isSelected ? "checked" : ""}>
          <span>${opt.text}</span>
        </button>
      `;
    });

    const categoryNames = [
      "Kuis 1: Identifikasi Sisi (Alas & Tutup)",
      "Kuis 2: Menentukan Sisi Tegak (Multi-select)",
      "Kuis 3: Melengkapi Jaring-Jaring Prisma & Limas"
    ];
    const catTitle = categoryNames[this.currentQuizType - 1] || "Kuis Jaring-Jaring";

    container.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-meta-bar">
          <span class="level-badge"><i class="fas fa-tasks"></i> ${catTitle}</span>
          <span class="score-badge"><i class="fas fa-star"></i> Soal ${this.questionIndex + 1}/${this.totalQuestions} | Skor: ${this.score}</span>
        </div>

        <div class="question-title">${q.title}</div>

        <div class="quiz-media-box" id="quizMediaCanvasBox" style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 20px 16px; margin: 12px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
          <div id="quiz2DNetGraphic" style="width: 100%; display: flex; justify-content: center; align-items: center; margin-bottom: 12px;">
            ${q.svg}
          </div>
          <div style="text-align: center; width: 100%;">
            <span style="font-size: 0.78rem; font-weight: 700; color: #475569; background: #e2e8f0; padding: 4px 14px; border-radius: 12px; display: inline-block;">
              Visualisasi Jaring-Jaring 2D
            </span>
          </div>
        </div>

        <div class="options-grid">
          ${optionsHTML}
        </div>

        <div id="quizFeedbackBox"></div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem;">
          <button class="btn btn-secondary" onclick="window.quizEngine.loadQuestion()"><i class="fas fa-redo"></i> Ganti Soal</button>
          <button class="btn btn-primary" id="btnSubmitAnswer" onclick="window.quizEngine.submitAnswer()"><i class="fas fa-paper-plane"></i> Periksa Jawaban</button>
        </div>
      </div>
    `;
  }

  selectOption(optId, isMultiSelect) {
    if (!isMultiSelect) {
      this.selectedOptions.clear();
      this.selectedOptions.add(optId);

      document.querySelectorAll(".option-btn").forEach((btn) => {
        btn.classList.remove("selected");
        const radio = btn.querySelector("input");
        if (radio) radio.checked = false;
      });

      const selBtn = document.getElementById(optId);
      if (selBtn) {
        selBtn.classList.add("selected");
        const radio = selBtn.querySelector("input");
        if (radio) radio.checked = true;
      }
    } else {
      const selBtn = document.getElementById(optId);
      const input = selBtn ? selBtn.querySelector("input") : null;

      if (this.selectedOptions.has(optId)) {
        this.selectedOptions.delete(optId);
        if (selBtn) selBtn.classList.remove("selected");
        if (input) input.checked = false;
      } else {
        this.selectedOptions.add(optId);
        if (selBtn) selBtn.classList.add("selected");
        if (input) input.checked = true;
      }
    }
  }

  submitAnswer() {
    if (this.selectedOptions.size === 0) {
      alert("Silakan pilih jawaban terlebih dahulu!");
      return;
    }

    const q = this.currentQuestion;
    let isCorrect = true;

    if (!q.isMultiSelect) {
      const chosenId = Array.from(this.selectedOptions)[0];
      const opt = q.options.find((o) => o.id === chosenId);
      isCorrect = opt && opt.isCorrect;
    } else {
      q.options.forEach((opt) => {
        const userPicked = this.selectedOptions.has(opt.id);
        if ((opt.isCorrect && !userPicked) || (!opt.isCorrect && userPicked)) {
          isCorrect = false;
        }
      });
    }

    q.options.forEach((opt) => {
      const btn = document.getElementById(opt.id);
      if (!btn) return;
      if (opt.isCorrect) btn.classList.add("correct");
      else if (this.selectedOptions.has(opt.id)) btn.classList.add("wrong");
    });

    const fbBox = document.getElementById("quizFeedbackBox");
    if (isCorrect) {
      this.score += 20;
      this.correctCount += 1;

      if (window.soundFx) {
        window.soundFx.playSuccess();
        window.soundFx.triggerConfetti();
      }

      fbBox.className = "feedback-box correct-fb";
      fbBox.innerHTML = `
        <h4><i class="fas fa-check-circle"></i> Jawaban Benar! (+20 Poin)</h4>
        <p>${q.explanation}</p>
        <button class="btn btn-success" style="margin-top:8px;" onclick="window.appManager && window.appManager.open3DFoldPreview('${q.shapeId}')">
          <i class="fas fa-play"></i> Putar Animasi Pelipatan 3D Pembahasan
        </button>
      `;

      if (window.appManager) window.appManager.addProgressPoints(10);
    } else {
      fbBox.className = "feedback-box wrong-fb";
      fbBox.innerHTML = `
        <h4><i class="fas fa-times-circle"></i> Jawaban Belum Tepat</h4>
        <p>${q.explanation}</p>
        <button class="btn btn-secondary" style="margin-top:8px;" onclick="window.appManager && window.appManager.open3DFoldPreview('${q.shapeId}')">
          <i class="fas fa-eye"></i> Amati Bentuk 3D Bangun Ini
        </button>
      `;
    }

    const btnSubmit = document.getElementById("btnSubmitAnswer");
    if (btnSubmit) {
      if (this.questionIndex < this.totalQuestions - 1) {
        btnSubmit.innerHTML = '<i class="fas fa-arrow-right"></i> Soal Berikutnya';
        btnSubmit.onclick = () => {
          this.questionIndex++;
          this.loadQuestion();
        };
      } else {
        btnSubmit.innerHTML = '<i class="fas fa-award"></i> Lihat Hasil Kuis';
        btnSubmit.onclick = () => this.showQuizResults();
      }
    }
  }

  showQuizResults() {
    const container = document.getElementById("quizCardContainer");
    if (!container) return;

    const percentage = Math.round((this.score / 100) * 100);
    let categoryText = "";
    let categoryClass = "";

    if (this.score >= 90) {
      categoryText = "Sangat Baik! 🌟 Kamu sudah sangat menguasai konsep jaring-jaring!";
      categoryClass = "text-emerald-600";
    } else if (this.score >= 70) {
      categoryText = "Bagus! 👍 Pemahamanmu tentang jaring-jaring sudah mantap!";
      categoryClass = "text-blue-600";
    } else if (this.score >= 50) {
      categoryText = "Cukup Baik, terus berlatih! 💪 Coba amati animasi pelipatan di menu Eksplorasi.";
      categoryClass = "text-amber-600";
    } else {
      categoryText = "Ayo pelajari kembali! 📚 Buka menu Eksplorasi dan Variasi Jaring-Jaring.";
      categoryClass = "text-red-600";
    }

    container.innerHTML = `
      <div class="quiz-card" style="text-align: center; padding: 2.5rem 1.5rem;">
        <div style="font-size: 3.2rem; color: #3b82f6; margin-bottom: 0.5rem;"><i class="fas fa-trophy"></i></div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a;">Kuis Selesai!</h2>
        
        <div style="font-size: 2.5rem; font-weight: 800; color: #2563eb; margin: 0.8rem 0;">
          Skor: ${this.score} / 100
        </div>

        <div style="font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem;" class="${categoryClass}">
          ${categoryText}
        </div>

        <div style="display: flex; justify-content: center; gap: 2rem; background: #f8fafc; padding: 1.2rem; border-radius: 12px; margin-bottom: 1.8rem;">
          <div>
            <div style="font-size: 0.78rem; color: #64748b; font-weight: 700;">JAWABAN BENAR</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: #10b981;">${this.correctCount} / ${this.totalQuestions}</div>
          </div>
          <div style="border-right: 1px solid #e2e8f0;"></div>
          <div>
            <div style="font-size: 0.78rem; color: #64748b; font-weight: 700;">NILAI AKHIR</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: #3b82f6;">${percentage}%</div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-secondary" onclick="window.quizEngine.startQuiz(${this.currentQuizType}, ${this.currentLevel})">
            <i class="fas fa-redo"></i> Ulangi Kuis
          </button>
          <button class="btn btn-primary" onclick="window.appManager && window.appManager.showView('eksplorasi')">
            <i class="fas fa-cube"></i> Buka Menu Eksplorasi
          </button>
        </div>
      </div>
    `;

    if (window.appManager) {
      window.appManager.recordQuizResult(this.score, this.correctCount);
    }
  }
}

window.quizEngine = new QuizEngine();
