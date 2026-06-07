# Panduan Mengelola Konten (Sanity Studio)

Panduan singkat untuk mengubah isi website DAMA KITCHEN tanpa menyentuh kode.
Editor konten ada di **`/studio`** (mis. `https://damakitchen.vercel.app/studio`).

> Analogi WordPress: `/studio` = `wp-admin`. Bedanya, di Sanity perubahan baru
> tayang setelah Anda klik **Publish** (mirip tombol "Publish/Update" di WP).

---

## A. Pertama kali: menyambungkan Studio (sekali saja)

Jika `/studio` menampilkan pesan **CORS** atau project `placeholder`, lakukan ini:

1. **Buat project** di [sanity.io/manage](https://www.sanity.io/manage) → *Create project*.
   - Dataset: **`production`**, visibilitas **Public**.
   - Catat **Project ID** (mis. `a1b2c3d4`).
2. **Isi env di Vercel** → Settings → Environment Variables (centang Production, Preview, Development):
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID = <Project ID asli>
   NEXT_PUBLIC_SANITY_DATASET    = production
   NEXT_PUBLIC_SANITY_API_VERSION = 2024-10-01
   ```
3. **Redeploy** di Vercel (wajib, agar env terpasang).
4. Buka `/studio` → **Add CORS origin** → masukkan `https://<domain-anda>` (tanpa `/studio`),
   centang **Allow credentials**. Tambahkan juga `http://localhost:3000` untuk pengembangan.
5. (Opsional) Isi konten awal: buat **write token** (API → Tokens → Editor),
   taruh di `.env.local` sebagai `SANITY_API_WRITE_TOKEN`, lalu jalankan `pnpm seed:sanity`.

> Pesan "Content Agent perlu Studio 5.1.0" boleh **diabaikan** — itu fitur AI opsional,
> tidak diperlukan untuk mengelola konten.

---

## B. Konsep dasar

- **Autosave** → tiap ketikan tersimpan sebagai *Draft* (belum tayang).
- **Publish** (tombol hijau, kanan bawah) → menayangkan ke website.
- **History** (ikon jam) → lihat & kembalikan versi lama.
- **⋮ (titik tiga)** → Duplicate / Delete.
- Kolom wajib yang kosong ditandai merah dan memblok Publish.

---

## C. Tugas sehari-hari

### Mengubah teks sub-brand
**Sub-brand** → pilih lini → edit *Pesan utama / Tentang / FAQ / Kanal* → **Publish**.
> Jangan menukar **Emosi** antar lini. Warna penanda lini diatur dari kode (tidak ada di Studio).

### Menambah / mengubah produk menu
**Produk / Menu** → pilih atau **＋ Create** → isi *Nama, Slug (Generate), Deskripsi, Lini,
Info, Harga (opsional), Foto* → **Publish**.

### Upload & atur foto
Di kolom gambar → **Upload** → klik gambar → **Edit hotspot** (atur fokus/crop) → **Publish**.
Foto otomatis menggantikan placeholder.

### Menulis artikel (Catatan Dapur)
**Catatan Dapur** → **＋ Create** → isi *Judul, Slug, Ringkasan, Gambar sampul, Tanggal* →
tulis di **Isi artikel** (teks kaya: judul, tebal, poin, kutipan, gambar) → **Publish**.
Muncul di `/catatan-dapur` dan `/catatan-dapur/<slug>`.

### Membuat HALAMAN baru
**Halaman** → **＋ Create** → *Judul* → *Slug* (Generate) → isi *Eyebrow, Pengantar, Foto hero,
Isi halaman, Deskripsi SEO* → **Publish**. Halaman hidup di **`/<slug>`**.

### Pilar & Nilai
**Pilar Brand** / **Nilai Brand** → edit *Judul/Deskripsi*, atur *Urutan* → **Publish**.

---

## D. Setelah Publish, kapan tayang?

- Bila **webhook instant publish** aktif → **beberapa detik**.
- Bila belum → maksimal **±1 jam** (ISR) atau langsung saat redeploy.
- Cek dengan **refresh keras** (Ctrl/Cmd + Shift + R).

---

## E. Aturan menulis (voice DAMA)

Hangat, tulus, jujur. **Hindari**: superlatif ("ternikmat/nomor satu"), HURUF KAPITAL &
tanda seru beruntun, diskon palsu, emoji berlebihan (maksimal satu). Ajak, jangan mengejar.

---

## F. Catatan jujur

- **"Pengaturan Situs"** & **"Testimoni"** sudah ada di Studio tetapi **belum tampil di situs**
  (bisa disambungkan kapan saja bila diperlukan).
- **`pnpm seed:sanity`** menimpa dokumen hasil seed dengan teks awal — **jalankan sekali saja**;
  setelah mulai mengedit di Studio, jangan dijalankan lagi.

---

## G. Kalau bermasalah

- Perubahan tak muncul → pastikan sudah **Publish**, lalu refresh keras / tunggu.
- Studio tak terbuka / "not a member" → `NEXT_PUBLIC_SANITY_PROJECT_ID` belum benar atau belum redeploy.
- Pesan CORS → tambahkan origin situs di sanity.io/manage (Allow credentials).
- Foto tak muncul → pastikan sudah **Upload** (bukan menautkan) dan **Publish**.
