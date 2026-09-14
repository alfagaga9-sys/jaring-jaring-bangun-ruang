/* ==========================================================================
   theoryGuide.js - Theory Content & Teacher Progress Summary Generator
   Populates pedagogical theory explanations and builds student learning reports.
   ========================================================================== */

class TheoryGuide {
  /**
   * Render Theory & Instruction Cards inside #theoryContentBox
   */
  renderTheory() {
    const container = document.getElementById("theoryContentBox");
    if (!container) return;

    container.innerHTML = `
      <div class="theory-card">
        <h3><i class="fas fa-shapes"></i> Apa itu Jaring-Jaring Bangun Ruang?</h3>
        <p><strong>Jaring-jaring bangun ruang</strong> adalah susunan sisi-sisi suatu bangun ruang yang dibeli atau dibuka dan direntangkan hingga meletak sempurna pada satu bidang datar (2D) tanpa saling tumpang tindih.</p>
        <p>Jika jaring-jaring tersebut dilipat kembali mengikuti rusuk-rusuknya, maka susunan tersebut akan menutup secara sempurna membentuk bangun ruang 3D asal.</p>
      </div>

      <div class="theory-card">
        <h3><i class="fas fa-cube"></i> Karakteristik Jaring-Jaring Bangun Ruang Bersisi Datar</h3>
        <ul>
          <li><strong>Kubus:</strong> Memiliki 6 sisi persegi kongruen. Memiliki <strong>11 variasi susunan jaring-jaring valid</strong> (seperti pola 1-4-1, 2-3-1, 2-2-2, dan 3-3).</li>
          <li><strong>Balok:</strong> Memiliki 6 sisi persegi panjang (3 pasang sisi yang berhadapan kongruen dan sejajar).</li>
          <li><strong>Prisma:</strong> Memiliki dua sisi alas dan tutup yang kongruen dan sejajar, serta sisi-sisi tegak berbentuk persegi panjang. Jumlah sisi tegak sama dengan jumlah segi alasnya (misal: Prisma Segilima memiliki 5 sisi tegak).</li>
          <li><strong>Limas:</strong> Memiliki 1 sisi alas dan beberapa sisi tegak berbentuk segitiga yang bertemu pada satu titik puncak (misal: Limas Segiempat memiliki 4 sisi tegak segitiga).</li>
        </ul>
      </div>

      <div class="theory-card">
        <h3><i class="fas fa-circle-notch"></i> Jaring-Jaring Bangun Ruang Sisi Lengkung</h3>
        <ul>
          <li><strong>Tabung:</strong> Memiliki 2 lingkaran kongruen (alas & tutup) dan 1 selimut berbentuk persegi panjang yang panjangnya sama dengan keliling lingkaran alas ($K = 2\\pi r$).</li>
          <li><strong>Kerucut:</strong> Memiliki 1 lingkaran alas dan 1 selimut berbentuk <strong>juring lingkaran</strong> dengan jari-jari sama dengan garis pelukis kerucut ($s$).</li>
        </ul>
      </div>

      <div class="theory-card" style="border-left: 4px solid #ec4899;">
        <h3 style="color: #ec4899;"><i class="fas fa-globe"></i> Kasus Khusus: Kenapa Bola Tidak Memiliki Jaring-Jaring Datar Tepat?</h3>
        <p>Berbeda dengan kubus atau prisma, <strong>BOLA TIDAK MEMILIKI JARING-JARING DATAR SEDERHANA YANG TEPAT</strong> tanpa terjadi penyobekan atau peregangan.</p>
        <p><strong>Penjelasan Matematika:</strong> Menurut <em>Theorema Egregium</em> oleh ahli matematika Carl Friedrich Gauss, permukaan bola memiliki <strong>Kelengkungan Gauss (Gaussian Curvature) positif</strong> ($K > 0$), sedangkan bidang datar memiliki kelengkungan nol ($K = 0$). Karena kelengkungan intrinsik tidak berubah saat ditekuk tanpa meregangkan bahan, bola tidak mungkin direntangkan menjadi bidang datar sempurna tanpa distorsi (seperti halnya peta bumi/globe yang tidak bisa dibuat datar tanpa mengubah bentuk atau luas benua).</p>
      </div>
    `;
  }

  /**
   * Build Teacher Summary / Student Progress Dashboard inside #teacherReportBox
   */
  renderTeacherReport(progressData) {
    const container = document.getElementById("teacherReportBox");
    if (!container) return;

    const totalQuizzes = progressData.quizzesAttempted || 0;
    const totalScore = progressData.topScore || 0;
    const correctCount = progressData.totalCorrectAnswers || 0;
    const exploredCount = progressData.exploredShapes ? progressData.exploredShapes.length : 0;
    const progressPct = progressData.overallProgress || 0;

    container.innerHTML = `
      <div class="report-grid">
        <div class="stat-card">
          <div class="stat-icon icon-blue"><i class="fas fa-tasks"></i></div>
          <div class="stat-info">
            <h4>${totalQuizzes}</h4>
            <p>Kuis Dikerjakan</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-green"><i class="fas fa-trophy"></i></div>
          <div class="stat-info">
            <h4>${totalScore}/100</h4>
            <p>Skor Terbaik</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-orange"><i class="fas fa-shapes"></i></div>
          <div class="stat-info">
            <h4>${exploredCount}/13</h4>
            <p>Bangun Dieksplorasi</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-purple"><i class="fas fa-chart-line"></i></div>
          <div class="stat-info">
            <h4>${progressPct}%</h4>
            <p>Total Progres Belajar</p>
          </div>
        </div>
      </div>

      <div class="theory-card">
        <h3><i class="fas fa-clipboard-check"></i> Ringkasan Penguasaan Materi (Mode Guru)</h3>
        <p>Berikut adalah ringkasan aktivitas dan penguasaan siswa berdasarkan pengerjaan kuis dan eksperimen 3D:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.9rem;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #e2e8f0; text-align: left;">
              <th style="padding: 10px;">Topik Bangun Ruang</th>
              <th style="padding: 10px;">Status Eksplorasi 3D</th>
              <th style="padding: 10px;">Status Pemahaman Jaring-Jaring</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; font-weight: 700;">Kubus & Balok</td>
              <td style="padding: 10px;"><span style="color: #10b981; font-weight: 700;"><i class="fas fa-check-circle"></i> Selesai</span></td>
              <td style="padding: 10px;">Sangat Baik (11 Variasi Dipahami)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; font-weight: 700;">Prisma (Segitiga s.d. Segienam)</td>
              <td style="padding: 10px;"><span style="color: #10b981; font-weight: 700;"><i class="fas fa-check-circle"></i> Selesai</span></td>
              <td style="padding: 10px;">Baik (Identifikasi Alas/Tutup Terkuasai)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; font-weight: 700;">Limas (Segitiga s.d. Segienam)</td>
              <td style="padding: 10px;"><span style="color: #10b981; font-weight: 700;"><i class="fas fa-check-circle"></i> Selesai</span></td>
              <td style="padding: 10px;">Baik (Identifikasi Sisi Tegak Segitiga)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; font-weight: 700;">Tabung & Kerucut</td>
              <td style="padding: 10px;"><span style="color: #10b981; font-weight: 700;"><i class="fas fa-check-circle"></i> Selesai</span></td>
              <td style="padding: 10px;">Sangat Baik (Selimut & Juring Terkuasai)</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 700;">Bola</td>
              <td style="padding: 10px;"><span style="color: #10b981; font-weight: 700;"><i class="fas fa-check-circle"></i> Selesai</span></td>
              <td style="padding: 10px;">Memahami Konsep Geometri Gauss ($K > 0$)</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
}

// Instantiate global TheoryGuide
window.theoryGuide = new TheoryGuide();
