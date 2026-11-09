# Panduan Mengelola Website (Sanity Studio)

Editor konten ada di **`/studio`** (mis. `https://damakitchen.vercel.app/studio`).
Dari sana Anda bisa mengubah **teks apa pun, foto apa pun, susunan (layout) setiap halaman,
dan warna-warna website** — tanpa menyentuh kode.

> Analogi WordPress: `/studio` = `wp-admin`, **Halaman Situs** = menu *Pages*,
> **Pengaturan Situs** = *Customizer*. Perubahan tayang setelah Anda klik **Publish**.

---

## 0. LANGKAH PERTAMA (wajib, sekali saja): Alat Konten

Buka `/studio` → menu atas **Alat Konten**.

1. **Periksa konten tersembunyi.** Jika muncul "Ditemukan X dokumen yang tidak terlihat oleh
   website", klik **Perbaiki sekarang**. Ini memperbaiki masalah lama yang membuat sebagian
   editan (mis. foto sub-brand) tidak pernah muncul di website. Semua teks & foto tetap utuh.
2. **Impor konten awal.** Klik **Impor konten sekarang**. Studio terisi dengan seluruh isi website
   saat ini — termasuk **susunan 7 halaman utama** — jadi Anda tinggal mengedit.
   Aman diklik kapan saja: yang sudah ada tidak pernah ditimpa.

---

## 1. Konsep dasar

- **Autosave** → tiap ketikan tersimpan sebagai *Draft* (belum tayang).
- **Publish** (tombol hijau, kanan bawah) → menayangkan ke website. *Paling sering terlupa!*
- **History** (ikon jam) → lihat & kembalikan versi lama.
- **⋮ / ▾ di samping Publish** → Duplicate / Delete.
- Perubahan tayang dalam **±1 menit** (atau seketika jika webhook aktif). Cek dengan refresh keras
  (Ctrl/Cmd + Shift + R).

---

## 2. Mengubah susunan halaman (layout) — menu **Halaman Situs**

Berisi 7 halaman utama: **Beranda, Cerita, Menu, Katering & Acara, Hadiah, Di mana memesan, Kontak**.
Setiap halaman adalah **daftar bagian (section)** yang bisa Anda atur bebas:

| Mau apa? | Caranya |
|---|---|
| Ubah teks/foto suatu bagian | Klik bagiannya → edit di tab **Konten** |
| Pindahkan urutan | Seret ikon **⋮⋮** di kiri bagian |
| Tambah bagian baru | Tombol **+ Add item** di bawah daftar → pilih jenis |
| Sembunyikan sementara | Buka bagian → tab **Tampilan** → **Sembunyikan sementara** |
| Hapus bagian | Menu ⋮ pada bagian → **Remove** |
| Ubah warna latar, jarak, motif | Buka bagian → tab **Tampilan** |
| Kembalikan halaman ke desain bawaan | Hapus dokumen halaman itu (⋮ → Delete) |

**Jenis bagian yang tersedia:**

- **Hero (pembuka halaman)** — judul besar, teks, tombol, foto (kiri/kanan/tanpa foto).
- **Teks** — tulisan bebas (judul, tebal, poin, kutipan, gambar, tautan), rata kiri/tengah.
- **Foto + Teks** — foto di satu sisi, tulisan di sisi lain.
- **Kutipan** — kutipan besar di tengah, atau dengan foto di samping.
- **Kartu** — 1–4 kolom kartu (dengan foto, polos, atau bernomor), bisa diberi tautan.
- **Daftar poin (dengan ikon)** — poin-poin dengan ikon pilihan (halal, pedas, porsi, dll).
- **Ajakan (panel CTA)** — 1–3 panel berwarna dengan tombol.
- **Tanya jawab (FAQ)** — otomatis juga dibaca Google sebagai FAQ.
- **Galeri foto** — kumpulan foto 1–4 kolom dengan keterangan.
- **Blok data otomatis** — menampilkan isi dari menu lain: kartu lini, pilar, nilai, testimoni,
  tombol kanal, panduan kanal, menu lengkap, produk satu lini, paket hampers, banner perayaan,
  artikel terbaru, info kontak. *(Edit isinya di menu asalnya, mis. Produk / Testimoni.)*
- **Formulir permintaan** — form penawaran katering atau hadiah (+ kotak samping opsional).
- **Pemisah / jarak** — garis berlian ◇ atau ruang kosong.

**Tautan pada tombol/kartu:** tulis `/pesan`, `/menu`, `https://…`, atau cukup **`whatsapp`**
untuk membuka chat WhatsApp DAMA.

**SEO tiap halaman:** tab **SEO** → *Judul SEO* & *Deskripsi SEO* (yang tampil di Google).

### Membuat halaman BARU
Menu **Halaman Tambahan** → **+ Create** → isi *Nama halaman* → *Slug* (klik Generate) →
susun bagian-bagiannya → **Publish**. Halaman hidup di `/<slug>`.

---

## 3. Mengubah warna website — Pengaturan Situs → tab **Warna**

Tujuh warna dasar mengatur seluruh website. Ubah satu, semua turunannya (versi terang/gelap)
ikut menyesuaikan otomatis:

- **Warna utama** — judul, menu, footer, latar gelap *(asli: teal)*
- **Warna aksen** — tombol "Pesan" & sorotan *(asli: terakota)*
- **Warna sorotan** — aksen kecil *(asli: emas)*
- **Warna latar halaman** *(asli: krem)* · **Warna teks** *(asli: cokelat tua)*
- **Warna lembut** *(asli: blush)* · **Warna perayaan** *(asli: merah songket)*

**Kosongkan** sebuah warna untuk kembali ke warna asli DAMA.
Studio akan memberi **peringatan kuning** bila kombinasi warna sulit dibaca — sangat disarankan
untuk diikuti (warna latar bagian di halaman juga menyesuaikan warna teks secara otomatis).

**Warna khas tiap lini:** Sub-brand → pilih lini → **Warna penanda lini**.

---

## 4. Logo, motif, menu & footer — Pengaturan Situs

| Tab | Isi |
|---|---|
| **Tampilan** | Logo header, logo footer (versi terang), monogram, motif latar |
| **Navigasi & Footer** | Menu atas (isi, urutan, tulisan), tombol menu, judul kolom & tautan footer, kalimat bawah footer |
| **Teks halaman lini** | Judul-judul yang sama di semua halaman lini ("Tentang lini ini", "Sejujurnya, begini", …). Tulis `{nama}` untuk menyisipkan nama lini |
| **Kontak & Sosial** | Email, Instagram, TikTok, Threads, area layanan |
| **Perayaan** | Banner Lebaran/Natal (nyalakan/matikan + teks) |
| **Beranda / Brand** | Dipakai bila halaman Beranda di *Halaman Situs* belum dibuat |

---

## 5. Konten lain

- **Sub-brand** — teks, FAQ, kanal, foto hero, warna lini, catatan di halaman Pesan, dan
  **Bagian tambahan di halaman lini** (tambahkan foto, galeri, FAQ, dll. ke halaman lini).
  > Jangan menukar **Emosi** antar lini.
- **Produk / Menu** — nama, deskripsi, lini, info, harga, foto.
- **Catatan Dapur** — artikel (judul, sampul, isi teks kaya).
- **Pilar, Nilai, Testimoni** — tampil lewat *Blok data otomatis*.

**Foto:** kolom gambar → **Upload** → klik foto → **Edit hotspot** (atur titik fokus) →
isi *Deskripsi foto (alt)* → **Publish**.

---

## 6. Aturan menulis (voice DAMA)

Hangat, tulus, jujur. **Hindari**: superlatif ("ternikmat/nomor satu"), HURUF KAPITAL &
tanda seru beruntun, diskon palsu, emoji berlebihan (maksimal satu). Ajak, jangan mengejar.
Testimoni hanya dari pelanggan sungguhan yang sudah memberi izin.

---

## 7. Kalau bermasalah

- **Perubahan tak muncul** → sudah **Publish**? Tunggu ±1 menit, refresh keras. Jalankan juga
  **Alat Konten → Periksa konten tersembunyi**.
- **Halaman tampil seperti dulu** → halaman itu belum ada di *Halaman Situs*, atau semua
  bagiannya disembunyikan. Klik **Alat Konten → Impor**.
- **Studio tak terbuka / "not a member"** → `NEXT_PUBLIC_SANITY_PROJECT_ID` di Vercel belum benar
  atau belum redeploy.
- **Pesan CORS** → tambahkan origin situs di sanity.io/manage → API → CORS (Allow credentials).
- **Pesan "Content Agent perlu Studio 5.1.0"** → boleh diabaikan (fitur AI opsional).
