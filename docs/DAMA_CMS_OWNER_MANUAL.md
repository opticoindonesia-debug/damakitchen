# Panduan Pemilik — Mengelola Website DAMA KITCHEN

Semua isi website DAMA bisa diubah sendiri tanpa menyentuh kode: teks, foto, produk, harga, artikel, susunan halaman, warna, menu, dan pengaturan. Panduan ini ditulis untuk pemilik dan tim DAMA.

> **Prinsip utama:** perubahan disimpan dulu sebagai **draf**, lalu **tampil di website setelah Anda klik "Terbitkan"**.
> Draf tidak pernah terlihat pengunjung.

---

## Daftar isi

1. [Masuk ke admin](#1-masuk-ke-admin)
2. [Mengenal dasbor](#2-mengenal-dasbor)
3. [Draf, Pratinjau, Terbitkan](#3-draf-pratinjau-terbitkan)
4. [Mengubah teks di halaman](#4-mengubah-teks-di-halaman)
5. [Mengganti foto](#5-mengganti-foto)
6. [Mengatur susunan halaman (layout)](#6-mengatur-susunan-halaman-layout)
7. [Menambah produk](#7-menambah-produk)
8. [Mengubah harga](#8-mengubah-harga)
9. [Menulis artikel Catatan Dapur](#9-menulis-artikel-catatan-dapur)
10. [Mengubah warna & tampilan](#10-mengubah-warna--tampilan)
11. [Mengubah menu & footer](#11-mengubah-menu--footer)
12. [Pengaturan situs: WhatsApp, kontak, kanal](#12-pengaturan-situs-whatsapp-kontak-kanal)
13. [SEO (tampilan di Google)](#13-seo-tampilan-di-google)
14. [Sub-brand, testimoni, FAQ](#14-sub-brand-testimoni-faq)
15. [Cadangan (backup) & pemulihan](#15-cadangan-backup--pemulihan)
16. [Akun, kata sandi & keamanan](#16-akun-kata-sandi--keamanan)
17. [Jika ada masalah](#17-jika-ada-masalah)

---

## 1. Masuk ke admin

1. Buka **`https://damakitchen.id/admin`** (ganti dengan domain Anda).
2. Isi **email** dan **kata sandi**, lalu klik **Masuk**.

**Pertama kali (belum ada akun):**

1. Orang yang memegang akses hPanel menambahkan `ADMIN_SETUP_TOKEN` di pengaturan server. Lihat panduan deploy, bagian Variabel lingkungan.
2. Buka `/admin/setup`. Isi **Kode setup** (nilai token tadi), nama, email, dan kata sandi (minimal 10 karakter).
3. Klik **Buat akun pemilik**, lalu masuk seperti biasa.
4. **Penting:** setelah berhasil, hapus `ADMIN_SETUP_TOKEN` dari hPanel. Selama token masih ada, dasbor akan menampilkan peringatan.

> Jika salah memasukkan kata sandi 5 kali, akun dikunci 15 menit. Ini perlindungan dari peretas.

## 2. Mengenal dasbor

Menu di kiri:

| Menu | Isinya |
|---|---|
| **Dasbor** | Ringkasan, perubahan terakhir, hal yang perlu perhatian |
| **Halaman** | Beranda, Cerita, Menu, Katering, Hadiah, Pesan, Kontak, dan halaman baru |
| **Produk & harga** | Menu makanan, harga, foto, ketersediaan, kategori |
| **Sub-brand** | LAMAK DAMA, WARISAN DAMA, HIDANG BASAMO, DAMA KAPAU, TANDO MATO |
| **Catatan Dapur** | Artikel |
| **Testimoni, FAQ & nilai** | Testimoni pelanggan, tanya jawab, pilar & nilai brand |
| **Media** | Semua foto & file PDF |
| **Tampilan & warna** | Warna, huruf, bentuk tombol, jarak, header & footer |
| **Menu & footer** | Menu atas, tombol "Pesan", footer |
| **Pengaturan situs** | Nama, logo, WhatsApp, email, Shopee/TikTok, media sosial |
| **Pengalihan** | Alamat lama → alamat baru |
| **Cadangan** | Unduh & pulihkan cadangan |
| **Akun & pengguna** | Ganti kata sandi, tambah pengguna |

## 3. Draf, Pratinjau, Terbitkan

Di **Halaman**, **Catatan Dapur**, **Tampilan**, **Menu & footer**, dan **Pengaturan situs** ada tiga tombol:

| Tombol | Fungsi |
|---|---|
| **Simpan draf** | Menyimpan tanpa mengubah website. Sistem juga **menyimpan otomatis** beberapa detik setelah Anda berhenti mengetik (lihat tulisan "Draf tersimpan otomatis ✓"). |
| **Pratinjau** | Membuka website di tab baru dengan draf Anda. Ada pita kuning "Mode pratinjau" di atasnya. Hanya Anda (yang sudah masuk) yang melihat ini. Klik **Keluar pratinjau** untuk kembali. |
| **Terbitkan** | Menayangkan perubahan ke semua pengunjung, **seketika**. |

- Label **"Tayang · ada perubahan belum terbit"** berarti ada draf yang belum diterbitkan.
- **Batalkan perubahan** membuang draf dan kembali ke versi yang sedang tayang.

**Produk, sub-brand, testimoni/FAQ, dan pengalihan** tidak memakai draf. Yang dipakai adalah status atau sakelar **Tayang / Tampil**:

- Klik **Simpan** pada item yang berstatus **Tayang**, maka perubahan langsung tampil.
- Untuk menyembunyikan sebuah item, ubah statusnya ke **Draf** atau **Diarsipkan**.

## 4. Mengubah teks di halaman

Contoh: mengubah judul besar di Beranda.

1. **Halaman** → klik **Beranda**.
2. Di kiri ada daftar **bagian** (section) dari atas ke bawah. Klik bagian **Hero (pembuka halaman)**.
3. Di kanan, tab **Konten**: ubah **Judul**, **Teks**, atau **Tombol**.
4. Klik **Pratinjau** untuk melihat hasilnya. Jika sudah pas, klik **Terbitkan**.

Untuk teks panjang (bagian **Teks**, **Foto + Teks**, **Blok kustom**), tersedia alat seperti di Word:

- judul bagian, tebal, miring
- daftar poin, kutipan
- tautan, foto

**Tautan pada tombol:**

| Ingin ke… | Tulis |
|---|---|
| Halaman lain di website | `/pesan`, `/menu`, `/lamak-dama` |
| Situs luar | `https://...` |
| Chat WhatsApp DAMA | `whatsapp` (otomatis memakai nomor di Pengaturan situs) |

## 5. Mengganti foto

**Dari dalam halaman/produk:**

1. Di kolom foto, klik **Pilih foto** atau **Ganti foto**.
2. Pilih foto yang sudah ada, atau klik **Unggah file** / seret foto ke kotak.
3. Isi **Deskripsi foto (alt)**, satu kalimat tentang isi foto. Contoh: "Sepiring rendang hangat di meja makan keluarga". Ini penting untuk Google dan pembaca layar.
4. **Terbitkan** (halaman) atau **Simpan** (produk).

**Di menu Media:**

- Lihat semua foto. Cari berdasarkan nama, kelompokkan dengan **folder**.
- Klik sebuah foto untuk mengubah deskripsi, lalu **Simpan**.
- **Ganti file:** menukar fotonya, tetapi alamatnya tetap sama, jadi **semua halaman yang memakai foto itu ikut berubah**.
- **Hapus:** sistem memberi tahu di mana foto masih dipakai sebelum menghapus.

**Tentang file:**

- Format yang diterima: JPG, PNG, WebP, AVIF, GIF, PDF, maksimal 8 MB. Foto otomatis diperkecil dan dioptimalkan.
- Data lokasi (GPS) di foto dihapus otomatis demi privasi.
- File SVG tidak diterima demi keamanan.

## 6. Mengatur susunan halaman (layout)

Setiap halaman tersusun dari **bagian-bagian**. Pada daftar bagian:

| Ingin… | Caranya |
|---|---|
| Menambah bagian | **Tambah bagian** → pilih jenis (Hero, Teks, Foto + Teks, Galeri, Produk, FAQ, Ajakan, Formulir, Kontak, dll.). Bagian baru muncul di bawah bagian yang sedang dipilih. |
| Memindahkan urutan | Seret ikon **⋮⋮**, atau klik panah **↑ / ↓** |
| Menyembunyikan sementara | Klik ikon **mata**. Bagian tetap tersimpan tetapi tidak tampil. |
| Menggandakan | Ikon **salin** |
| Menghapus | Ikon **tempat sampah**. Selama belum diterbitkan, bisa dibatalkan dengan **Batalkan perubahan**. |

Tab **Tampilan** pada setiap bagian:

- **Warna latar**: mengikuti warna tema; warna teks menyesuaikan otomatis.
- **Jarak atas-bawah**, **motif latar**, **garis pemisah ◇**.
- **Posisi foto** di desktop (kiri/kanan) dan di **HP** (atas/bawah/sembunyikan).
- **Tampil di perangkat**: semua, hanya desktop, atau hanya HP.
- Jumlah kolom, bentuk foto, perataan teks.

**Blok data otomatis** menampilkan isi dari menu lain. Isinya diubah di menu asalnya:

- kartu sub-brand, produk satu lini, produk per kategori, menu lengkap
- testimoni, FAQ, pilar, nilai, artikel terbaru, info kontak

**Membuat halaman baru:**

1. **Halaman** → isi judul → **Buat halaman**.
2. Tambahkan bagian-bagian.
3. **Terbitkan**. Halaman hidup di `/alamat-halaman`.

Untuk menyembunyikan halaman baru lagi, klik **Batal terbitkan**.

> Jika alamat (slug) sebuah halaman diubah setelah tayang, alamat lama **otomatis dialihkan** ke alamat baru.

## 7. Menambah produk

1. **Produk & harga** → **+ Produk baru**.
2. Isi isian berikut:
   - **Nama**, **Lini (sub-brand)**, **Kategori**
   - **Kalimat singkat**: tampil di kartu menu. Hangat dan jujur, tanpa superlatif.
   - **Deskripsi lengkap**: tampil di halaman produk `/menu/nama-produk`.
3. **Foto utama** dan **galeri tambahan**.
4. **Harga**, **Ketersediaan** (Tersedia / Pre-order / Musiman / Sedang tidak tersedia), dan **ikon info** (halal, pedas, dll.).
5. Opsional: **Tombol pesan khusus**, misalnya tautan langsung ke produk ini di Shopee.
6. Ubah status di kanan atas ke **Tayang di website**, lalu klik **Simpan**.

**Di daftar produk:**

- **Gandakan** cocok untuk membuat varian.
- **↑ / ↓** mengatur urutan tampil.
- **Diarsipkan** menyembunyikan produk tanpa menghapusnya.

## 8. Mengubah harga

Cara tercepat:

1. **Produk & harga**.
2. Di kolom **Harga (Rp)**, ketik angka tanpa titik. Contoh: `85000`.
3. Klik **Simpan** di baris itu.

Harga langsung tampil sebagai "Rp 85.000" di menu dan di halaman produk.

- Kosongkan harga jika belum ingin ditampilkan.
- **Keterangan harga** (mis. "/ porsi", "mulai dari") diisi di halaman edit produk.

## 9. Menulis artikel Catatan Dapur

1. **Catatan Dapur** → isi judul → **Buat artikel**.
2. Isi **Ringkasan**, lalu tulis **Isi artikel**. Alat yang tersedia:
   - **Judul bagian** (H2) dan **sub-judul** (H3)
   - tebal, miring, daftar, kutipan
   - **Tautan**: untuk halaman lain di website, tulis `/menu`
   - **Sisipkan foto**: dengan deskripsi (alt), lalu ketik **keterangan foto** di bawahnya
3. Di kanan, isi:
   - **Tanggal**, **Penulis**, **Kategori**
   - **Tag** (pisahkan dengan koma)
   - **Foto sampul**
   - **Artikel terkait** (opsional)
4. **Pratinjau**, lalu **Terbitkan**.

Artikel tampil di `/catatan-dapur`, masuk sitemap, dan bisa dibaca Google. Kategori artikel dikelola di bagian bawah halaman **Catatan Dapur**.

## 10. Mengubah warna & tampilan

**Tampilan & warna**:

- **Warna**: warna utama (Deep Teal), warna kedua (Terracotta), aksen (Gold), latar (Cream), teks (Deep Brown), lembut (Blush Rose), perayaan. Klik kotak warna atau ketik kodenya, mis. `#1F4D4D`.
  - Jika kombinasi warna sulit dibaca, muncul **peringatan kuning**. Sangat disarankan untuk diikuti.
- **Huruf** judul dan isi (pilihan yang serasi dengan brand).
- **Bentuk tombol**, **sudut kartu**, **jarak antar bagian**, **lebar konten**.
- **Header** terang/gelap, tetap terlihat atau tidak saat digulir. **Footer** gelap/terang.

Lihat **Contoh tampilan** di kanan, klik **Pratinjau** untuk melihat seluruh website, lalu **Terbitkan**.

**Kembalikan ke warna asli DAMA** mengembalikan semuanya ke identitas brand. Hasilnya tersimpan sebagai draf, jadi tetap perlu diterbitkan.

> Ubah identitas brand (warna dan huruf) hanya dengan persetujuan pemilik brand.

## 11. Mengubah menu & footer

**Menu & footer**:

- **Menu atas**: ubah tulisan, alamat, urutan (↑ / ↓), tambah atau hapus. Jenis menu yang tersedia:
  - **Tautan**
  - **Menu turun (dropdown)**: berisi beberapa tautan
  - **Daftar sub-brand**: otomatis berisi semua lini yang tampil
- **Tombol utama** di menu (default "Pesan" → `/pesan`).
- **Footer**: judul kolom, tautan, kalimat bawah, tampil/sembunyikan kolom sub-brand dan media sosial.

Lalu **Terbitkan**. Kontak, alamat, dan media sosial di footer diambil dari **Pengaturan situs**.

## 12. Pengaturan situs: WhatsApp, kontak, kanal

**Pengaturan situs**:

- **Identitas**: nama, tagline, deskripsi.
- **Logo**: logo header, logo terang untuk footer gelap, monogram, dan gambar saat dibagikan di media sosial.
- **Nomor WhatsApp**: format `62812…` tanpa `+`. Semua tombol WhatsApp dan formulir katering/hadiah otomatis memakai nomor ini. Juga di sini: **pesan pembuka WhatsApp**, email, telepon, alamat, jam operasional, area layanan.
- **Kanal belanja**: nyalakan atau matikan Shopee, TikTok Shop, GoFood, GrabFood, isi **tautan toko** asli, dan ubah tulisan tombol. Kanal yang dimatikan hilang dari seluruh website.
- **Media sosial**: Instagram, TikTok, Threads, Facebook, YouTube.
- **SEO bawaan Beranda**, **Banner perayaan** (Lebaran/Natal), dan **Teks halaman lini**.

Lalu **Terbitkan**.

## 13. SEO (tampilan di Google)

Setiap halaman, produk, artikel, dan sub-brand punya bagian **SEO**:

- **Judul SEO**: ±60 karakter, dan **Deskripsi SEO**: ±160 karakter. Ada **pratinjau Google**-nya. Jika dikosongkan, dipakai judul dan deskripsi bawaan.
- **Lanjutan** (jarang perlu diubah):
  - judul, deskripsi, dan gambar saat dibagikan di media sosial;
  - **URL kanonis**: biarkan kosong;
  - **Sembunyikan dari Google**: halaman juga keluar dari sitemap.

Sitemap (`/sitemap.xml`) diperbarui otomatis dan hanya berisi konten yang tayang.

## 14. Sub-brand, testimoni, FAQ

**Sub-brand**: nama, emosi lini, kalimat utama, tentang, cara memesan, warna penanda, foto hero, urutan kanal, tanya jawab, lini yang disarankan, dan **bagian tambahan** di halaman lini.

- Matikan **Tampil di website** untuk menyembunyikan sebuah lini dari seluruh situs (seperti HIDANG BASAMO saat ini).
- **Jangan menukar emosi antar lini.**

**Testimoni, FAQ & nilai**:

- Ubah, tambah, urutkan, dan tampil/sembunyikan, lalu klik **Simpan**.
- **Testimoni hanya dari pelanggan sungguhan yang sudah memberi izin.**
- Testimoni contoh (Rina, Pak Hendra, Sari) **perlu diganti atau disembunyikan** sebelum website resmi tayang.

## 15. Cadangan (backup) & pemulihan

**Cadangan** (hanya pemilik):

1. **Unduh cadangan sekarang**. Anda mendapat satu file `.json.gz` berisi semua teks, produk, artikel, pengaturan, akun, dan foto.
   - **Simpan di luar server**, misalnya Google Drive dan laptop.
   - Lakukan **minimal seminggu sekali** dan **sebelum perubahan besar**.
2. **Pulihkan**: jika terjadi kesalahan besar:
   1. Pilih file cadangan.
   2. Ketik `PULIHKAN`.
   3. Klik **Pulihkan sekarang**.

   Seluruh isi website diganti dengan isi cadangan. Prosesnya dilakukan sekaligus: jika gagal di tengah jalan, tidak ada yang berubah.

> Tips: sebelum memulihkan, unduh dulu cadangan kondisi saat ini.

Hostinger juga membuat cadangan otomatis (hPanel → Files → Backups). Lihat `DAMA_DATABASE_AND_BACKUP_GUIDE.md` untuk detail teknis.

## 16. Akun, kata sandi & keamanan

**Akun & pengguna**:

- Ganti kata sandi Anda.
- **Keluar dari semua perangkat** jika curiga ada yang memakai akun Anda.
- **Tambah pengguna** (khusus pemilik):
  - **Editor** bisa mengubah semua konten.
  - **Pemilik** juga bisa mengelola pengguna dan cadangan.
- Atur ulang kata sandi atau nonaktifkan pengguna.

**Aturan keamanan:**

- Jangan berbagi kata sandi lewat chat grup. Setiap orang punya akun sendiri.
- Gunakan kata sandi panjang dan unik, mis. kalimat: `Rendang-Sabar-Enam-Jam!`.
- Hapus `ADMIN_SETUP_TOKEN` dari hPanel setelah dipakai.

**Lupa kata sandi:**

1. Minta pemegang hPanel memasang lagi `ADMIN_SETUP_TOKEN`.
2. Buka `/admin/setup`, isi token, email Anda, dan kata sandi baru.
3. Setelah itu, hapus lagi tokennya.

## 17. Jika ada masalah

| Masalah | Coba ini |
|---|---|
| Perubahan tidak muncul di website | Sudah klik **Terbitkan**, atau untuk produk: **Simpan** dengan status **Tayang**? Lalu refresh keras (Ctrl/Cmd + Shift + R). |
| Pita kuning "Mode pratinjau" tidak hilang | Klik **Keluar pratinjau** pada pita itu. |
| Pesan merah "Belum bisa diterbitkan" | Baca daftar di bawahnya, mis. tautan tidak valid atau isian wajib kosong. Perbaiki, lalu terbitkan lagi. |
| "Terlalu banyak percobaan" saat masuk | Tunggu 15 menit. |
| Foto gagal diunggah | Pastikan JPG/PNG/WebP di bawah 8 MB. Kecilkan dulu jika lebih besar. |
| Halaman tampil seperti desain lama | Semua bagian halaman itu sedang disembunyikan. Tampilkan minimal satu bagian. |
| Website error setelah perubahan | Pulihkan cadangan terakhir (bab 15), lalu hubungi pengembang. |

**Aturan menulis (voice DAMA):** hangat, tulus, jujur. Hindari:

- superlatif ("ternikmat", "nomor satu")
- HURUF KAPITAL dan tanda seru beruntun
- diskon palsu
- emoji berlebihan (maksimal satu)

Ajak, jangan mengejar.
