# Emerald Vote

Proyek voting multi-user yang dapat dipakai banyak orang dari browser berbeda, dengan hasil vote yang tersimpan di database bersama dan pengecekan satu orang hanya bisa vote sekali.

## Struktur folder

- `index.html` — halaman utama
- `assets/css/style.css` — semua styling
- `assets/js/firebase-config.js` — konfigurasi Firebase
- `assets/js/script.js` — semua logika JavaScript
- `assets/images/logo/25. Committed Generation (2025).png` — logo utama

## Persiapan Firebase

1. Buat proyek di https://console.firebase.google.com
2. Tambahkan web app dan ambil konfigurasi Firebase
3. Edit file `assets/js/firebase-config.js` dan isi semua value sesuai proyek Anda
4. Aktifkan Realtime Database
5. Atur rules Realtime Database agar bisa membaca dan menulis data untuk demo awal:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## Cara upload ke hosting publik

### Netlify
1. Masuk ke https://netlify.com
2. Drag and drop folder proyek ini
3. Situs akan otomatis dipublish

### GitHub Pages
1. Upload folder proyek ke repository GitHub
2. Buka Settings > Pages
3. Pilih branch yang dipakai dan folder root
4. Publish

## Fitur yang sudah ada

- Vote dari browser berbeda dan perangkat berbeda
- Hasil vote tersimpan di Realtime Database
- Pemilih dapat mengirim suara tanpa memasukkan ID pribadi
- Dashboard admin menampilkan hasil real-time
- Reset admin membuka kembali voting pada semua browser pemilih melalui sinkronisasi ronde Realtime Database
- PIN admin default: `3399`

## Catatan penting

- Untuk produksi, PIN admin dan rules Realtime Database harus dibuat lebih aman.
- Setelah admin menekan `Reset data`, pemilih cukup memuat ulang halaman atau menunggu sinkronisasi; status "Sudah memilih" akan terbuka otomatis.
- Reset menghapus data suara dan menaikkan ronde pemilihan pada path Realtime Database `settings/election`.
- Pastikan rules Realtime Database disesuaikan dengan kebijakan pemilihan sebelum digunakan di produksi.
- Semua referensi path menggunakan relative path supaya bisa berjalan di hosting publik.
- Gambar kandidat menggunakan URL Unsplash dan bisa tetap dipakai secara publik.
