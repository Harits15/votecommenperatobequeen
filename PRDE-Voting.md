# Product Requirement Document (PRD)

## 1. Ringkasan Proyek (Executive Summary)

* **Nama Produk:** Aplikasi E-Voting Online Emerald (Private Admin Result Edition)
* **Versi:** 2.0.0
* **Status:** Dalam Pengembangan / Prototip
* **Deskripsi Singkat:** Web aplikasi pemungutan suara (voting) daring yang sederhana, aman, intuitif, dan responsif dengan tema **Emerald Green**. Pada versi ini, hasil perolehan suara disembunyikan sepenuhnya dari publik/pemilih dan hanya dapat dipantau oleh Admin berwenang menggunakan PIN otentikasi.

---

## 2. Latar Belakang & Tujuan (Background & Goals)

### 2.1 Latar Belakang

Pada berbagai proses pemilihan (seperti pemilihan ketua organisasi, pengurus, atau pemilu internal), publikasi grafik hasil suara secara *real-time* kepada pemilih dapat memicu *bandwagon effect* (pemilih cenderung mengikuti calon yang sedang unggul). Untuk menjaga independensi pemilih dan privasi proses pemilihan, hasil pemungutan suara perlu diisolasi dari tampilan publik/pemilih dan hanya boleh dipantau oleh panitia/admin.

### 2.2 Tujuan Produk

1. Menyediakan antarmuka pemungutan suara yang fokus dan bebas dari pengaruh dinamika hasil suara sementara bagi pemilih.
2. Menyajikan dashboard pemantauan hasil yang aman dan terlindungi bagi Admin/Panitia Pemilihan.
3. Mencegah manipulasi suara sederhana (*double voting*) pada tingkat peramban pemilih.

---

## 3. Target Pengguna & Hak Akses (User Roles & Access Control)

| Peran (Role) | Hak Akses & Deskripsi |
| --- | --- |
| **Pemilih (Voter)** | Akses publik. Dapat melihat daftar kandidat, profil/visi-misi kandidat, dan melakukan pemungutan suara 1x. **Tidak memiliki akses** ke hasil suara, grafik, maupun statistik perolehan. |
| **Admin / Panitia** | Akses terbatas via PIN/Sandi. Dapat memantau total suara masuk, melihat grafik *real-time* (Chart.js), indikator pemenang (*leaderboard*), dan melakukan *reset* data simulasi. |

---

## 4. Ruang Lingkup Produk (Product Scope)

### In-Scope (Fitur Utama)

* **Antarmuka Pemilih (Public View):**
* Tampilan daftar kandidat lengkap (foto, visi-misi ringkas, badge keahlian).
* Modal detail kandidat untuk melihat informasi lengkap/program kerja.
* Fitur voting 1 kali per peramban (*localStorage restriction*).
* Notifikasi sukses voting tanpa menampilkan perolehan suara.


* **Panel Khusus Admin (Admin Private Panel):**
* Akses masuk dengan modal autentikasi PIN (`1234`).
* Dashboard statistik *real-time* (Total Suara, Total Kandidat, Status Pemilihan).
* Visualisasi grafik perolehan suara interaktif (Chart.js).
* *Leaderboard* kandidat unggulan.
* Tombol reset data voting untuk kebutuhan pengujian/simulasi.



### Out-of-Scope (Pengembangan Masa Depan)

* Database terpusat berbasis server (MySQL/PostgreSQL/Firebase).
* Manajemen akun multi-admin dengan hirarki role dinamis.
* Ekspor otomatis laporan hasil pemilihan ke format PDF/Excel.

---

## 5. Fitur & Persyaratan Fungsional (Functional Requirements)

| ID Fitur | Nama Fitur | Deskripsi & Aturan Bisnis |
| --- | --- | --- |
| **FR-01** | **Header Publik** | Menampilkan judul aplikasi, status pemilihan ("Pemilihan Berlangsung"), dan tombol modal "Akses Admin". |
| **FR-02** | **Katalog Kandidat** | Menampilkan kartu kandidat beserta foto, nama, posisi, visi ringkas, dan tombol "Pilih Kandidat". |
| **FR-03** | **Detail Kandidat (Modal)** | Pop-up modal yang menampilkan biodata lengkap, visi, misi, program kerja, dan riwayat pengalaman kandidat. |
| **FR-04** | **Mekanisme Voting Pemilih** | Pemilih memilih 1 kandidat. Setelah dikonfirmasi, sistem menyimpan pilihan di `localStorage`, mengunci tombol voting, dan menampilkan notifikasi terima kasih **tanpa membocorkan angka/persentase suara**. |
| **FR-05** | **Autentikasi Admin** | Admin menekan tombol "Akses Admin" dan memasukkan PIN valid (default: `1234`). Jika salah, sistem menolak akses dengan pesan peringatan. |
| **FR-06** | **Dashboard Hasil Admin** | Setelah berhasil terautentikasi, Admin dapat melihat: <br>

<br>1. Ringkasan total suara masuk. <br>

<br>2. Grafik batang perolehan suara *real-time* (Chart.js). <br>

<br>3. Status kandidat dengan perolehan terbanyak (*Leaderboard*). |
| **FR-07** | **Reset Simulation (Admin Only)** | Tombol khusus di dalam Panel Admin untuk mengosongkan data `localStorage` guna mengulang simulasi pemilihan dari awal. |

---

## 6. Persyaratan Non-Fungsional (Non-Functional Requirements)

### 6.1 UI/UX & Proteksi Informasi

* **Keamanan Informasi Hasil:** Hasil suara **wajib tersembunyi** dari antarmuka pemilih dan hanya dipanggil/ditampilkan saat Admin berhasil login.
* **Tema Visual:** Emerald Green (`#059669`, `#10B981`, `#0F5132`) dengan gaya modern, kartu berbayangan halus (*card shadow*), dan elemen interaktif.
* **Responsivitas:** Tampilan menyesuaikan secara optimal di perangkat Mobile, Tablet, dan Desktop (Mobile-First approach).

### 6.2 Performa & Penyimpanan

* **Waktu Muat:** Halaman dimuat < 2 detik via CDN Bootstrap, FontAwesome, & Chart.js.
* **Penyimpanan Data:** Memanfaatkan `localStorage` peramban untuk persistensi data voting dan status pilihan pengguna.

---

## 7. Arsitektur Teknis & Teknologi (Tech Stack)

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS ES6+).
* **CSS Framework:** Bootstrap 5.3 (Grid system, Modal, Card, Utilities).
* **Visualisasi Data:** Chart.js v4.x (Khusus Render di Panel Admin).
* **Iconography:** FontAwesome 6 / Bootstrap Icons.

---

## 8. Alur Pengguna (User Flow)

### 8.1 Alur Pemilih (Voter Flow)

1. Pemilih membuka halaman utama e-voting.
2. Pemilih mengeksplorasi profil dan visi-misi kandidat.
3. Pemilih menekan tombol **"Pilih Kandidat"**.
4. Pemilih mengonfirmasi pilihan pada dialog konfirmasi.
5. Suara terrekam, tombol voting menjadi *disabled* ("Sudah Memilih"), dan muncul pesan sukses. Hasil suara **tetap tidak terlihat** oleh pemilih.

### 8.2 Alur Admin (Admin Flow)

1. Admin menekan tombol **"Akses Admin"** di pojok kanan atas *header*.
2. Admin memasukkan PIN keamanan (`1234`).
3. Sistem memverifikasi PIN. Jika benar, modal **Dashboard Hasil Pemilihan** terbuka.
4. Admin dapat memantau total suara masuk, grafik interaktif perolehan suara *real-time*, dan kandidat unggulan.
5. Admin dapat melakukan *reset* data jika diperlukan.

---

## 9. Rencana Pengembangan Masa Depan (Roadmap v3.0)

1. Integrasi **Backend API** (Node.js/Laravel) dengan enkripsi data hasil suara.
2. Autentikasi Pemilih berbasis Token Unik / OTP Email / NIM untuk mencegah pemilih ganda antar-perangkat.
3. Fitur **Ekspor Laporan Hasil** (PDF & Excel) langsung dari Panel Admin.