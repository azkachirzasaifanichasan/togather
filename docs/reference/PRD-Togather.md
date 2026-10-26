# Product Requirements Document (PRD)

## Togather

**Tagline kerja:** Temukan komunitas dan event yang sesuai, mulai dari sekitarmu.

| Atribut | Nilai |
|---|---|
| Nama produk | Togather |
| Jenis produk | Platform web discovery komunitas dan event |
| Cakupan awal | Seluruh Daerah Istimewa Yogyakarta (DIY) |
| Target pengguna | Semua orang yang ingin menemukan atau mengikuti komunitas dan event |
| Referensi produk | Meetup.com |
| Status dokumen | PRD v1.3 - keputusan MVP dikunci |
| Fokus dokumen | Inti produk, kebutuhan sistem, data, hak akses, dan prioritas fitur |
| Di luar fokus | Detail visual UI/UX |

> **Catatan sumber keputusan:** PRD ini menggunakan nama dan keputusan terbaru dari tim. Jika terdapat perbedaan dengan dokumen lama atau screenshot, keputusan terbaru yang ditulis dalam PRD ini menjadi acuan. Fase fitur mengikuti daftar prioritas yang telah dikonfirmasi oleh pemilik produk. Beberapa fitur Fase 2/Fase 3 memiliki versi minimal untuk demo MVP; hal ini tidak mengubah prioritas pengembangan versi lengkapnya.

---

## 1. Ringkasan Produk

Togather adalah platform web yang membantu pengguna menemukan komunitas dan event berdasarkan minat serta lokasi. Fokus awalnya adalah seluruh DIY, dengan dukungan untuk komunitas online maupun offline dan berbagai kategori aktivitas.

Togather hadir sebagai lapisan discovery. Informasi komunitas dan event yang sebelumnya tersebar di Instagram, Discord, WhatsApp, Facebook, dan kanal lain dapat ditemukan melalui satu katalog yang terstruktur. Togather tidak bertujuan menggantikan seluruh kanal komunikasi komunitas yang sudah digunakan.

Pengguna dapat menjelajah tanpa login. Login diperlukan ketika pengguna melakukan aksi yang membutuhkan identitas atau jejak aktivitas, seperti bergabung ke komunitas, mendaftar event, atau menggunakan chat.

---

## 2. Latar Belakang dan Masalah

### 2.1 Konteks

Seseorang dapat memiliki minat dan kemauan untuk bergaul, tetapi tetap tidak menemukan komunitas atau event yang sesuai. Informasi yang tersedia biasanya tersebar di banyak platform, tidak selalu terstruktur, dan tidak selalu menyertakan konteks lokasi.

Contoh hasil observasi yang menjadi dasar ide:

- Seseorang ingin mengikuti fun run, tetapi tidak tahu event atau komunitas mana yang berada di dekatnya.
- Seseorang ingin bergabung dengan komunitas cybersecurity secara online, tetapi kesulitan menemukan komunitas yang aktif dan relevan.

### 2.2 Pernyataan masalah

> Orang yang ingin mengikuti kegiatan atau membangun relasi sosial belum memiliki cara yang terpusat dan andal untuk menemukan komunitas atau event yang sesuai dengan minat dan lokasinya di DIY.

### 2.3 Akar masalah

| Akar masalah | Dampak pada pengguna |
|---|---|
| Informasi tersebar di banyak kanal | Pengguna harus mencari di banyak tempat secara manual |
| Data tidak terstruktur | Sulit membandingkan komunitas berdasarkan minat, tipe, aktivitas, atau lokasi |
| Konteks lokasi tidak konsisten | Pengguna tidak tahu apakah kegiatan dapat dijangkau dari lokasinya |
| Komunitas dan event sulit ditemukan | Komunitas yang membutuhkan anggota dan orang yang mencari komunitas tidak saling bertemu |
| Tidak ada katalog yang dikurasi | Data yang tidak valid, tidak aktif, atau dibuat sembarangan berisiko muncul di platform |

### 2.4 Keterbatasan solusi yang sudah ada

| Kanal/platform | Kegunaan utama | Kesenjangan yang ingin dijawab Togather |
|---|---|---|
| Instagram | Publikasi konten dan promosi kegiatan | Informasi cepat tenggelam dan tidak disusun sebagai katalog komunitas berdasarkan lokasi |
| WhatsApp/Discord | Komunikasi internal komunitas | Tidak dirancang sebagai tempat discovery komunitas baru |
| Facebook Groups | Menampung grup komunitas | Pencarian dan penyaringan berdasarkan lokasi serta minat tidak menjadi fokus utama |
| Google Search | Menemukan informasi berbasis kata kunci | Hasil tidak selalu terstruktur, aktif, atau relevan secara lokasi |
| Meetup.com | Discovery event dan komunitas | Togather difokuskan terlebih dahulu pada ekosistem komunitas dan event di DIY |

---

## 3. Tujuan Produk

### 3.1 Tujuan utama

1. Menyediakan satu tempat untuk menemukan komunitas dan event di seluruh DIY.
2. Membantu pengguna menemukan aktivitas yang relevan berdasarkan minat dan lokasi.
3. Memberikan akses discovery untuk komunitas online dan offline.
4. Menjaga kualitas katalog melalui pengelolaan dan konfirmasi oleh Admin Togather.
5. Membangun jejak aktivitas pengguna yang dapat mendukung rekomendasi pada fase berikutnya.
6. Membentuk fondasi data yang saling terhubung antara pengguna, komunitas, event, lokasi, dan riwayat aktivitas.

### 3.2 Tujuan untuk kompetisi

Togather diarahkan untuk mendukung tema **Engineering Interconnected Web Solutions to Empower Digital Ecosystems** melalui hubungan data berikut:

```text
Pengguna ↔ Minat ↔ Komunitas ↔ Event ↔ Lokasi
             ↘ Riwayat aktivitas ↗
```

Produk harus menunjukkan bahwa fitur-fitur tersebut merupakan satu ekosistem yang terhubung, bukan kumpulan halaman yang berdiri sendiri.

### 3.3 Bukan tujuan produk

- Menggantikan WhatsApp, Discord, Instagram, atau kanal komunikasi lain yang sudah digunakan komunitas.
- Membuka pembuatan komunitas secara bebas tanpa konfirmasi admin.
- Membuka penambahan event oleh semua pengguna pada tahap awal.
- Menjangkau skala nasional pada tahap awal.
- Membuat fitur live sharing lokasi.
- Menentukan detail visual UI/UX dalam dokumen ini.

---

## 4. Cakupan Produk

### 4.1 Wilayah

Cakupan awal Togather adalah seluruh DIY:

- Kota Yogyakarta
- Kabupaten Sleman
- Kabupaten Bantul
- Kabupaten Kulon Progo
- Kabupaten Gunungkidul

### 4.2 Jenis komunitas

Togather menerima berbagai kategori komunitas. Kategori tidak dibatasi hanya pada olahraga atau teknologi. Pengguna harus dapat menemukan komunitas yang sesuai dengan minatnya melalui penyaringan dan rekomendasi.

Tipe komunitas:

- **Komunitas online:** aktivitas utama dilakukan secara daring. Lokasi fisik dapat tidak tersedia.
- **Komunitas offline:** memiliki aktivitas atau pertemuan fisik. Pengurus dapat menentukan lokasi umum.

Satu komunitas dapat memiliki konteks online dan offline sesuai data yang dimasukkan pengurus.

### 4.3 Kategori awal

Kategori awal yang digunakan untuk seed dan filter adalah:

- Olahraga.
- Teknologi.
- Pendidikan.
- Seni dan hiburan.
- Sosial.
- Lingkungan.
- Bisnis dan karier.
- Hobi.
- Keagamaan.
- Lainnya.

Daftar ini bersifat kategori awal dan dapat diperluas setelah kebutuhan katalog dievaluasi.

### 4.4 Lokasi

- Lokasi komunitas ditentukan oleh pengurus.
- Lokasi yang ditampilkan kepada pengguna adalah lokasi umum, bukan kewajiban titik presisi.
- Untuk komunitas offline, lokasi dapat berupa tempat tetap atau area pertemuan.
- Untuk komunitas online, field lokasi tetap diisi menggunakan penanda `online` atau `tidak ada lokasi fisik`; komunitas online tidak wajib memiliki titik lokasi fisik.
- Pengurus menentukan apakah komunitas memiliki tempat pertemuan atau tidak.

### 4.5 Event

- Event berdiri sendiri dan tidak wajib memiliki komunitas induk.
- Event boleh memiliki relasi opsional dengan komunitas.
- Pada tahap awal, event hanya dapat ditambahkan oleh Admin Togather.
- Event yang sudah tersedia dapat dimasukkan ke katalog Togather oleh admin.
- Detail event ditampilkan secara terpisah dari profil komunitas.

---

## 5. Target Pengguna dan Peran

### 5.1 Target pengguna

Target Togather adalah semua orang yang ingin menemukan atau mengikuti kegiatan dan komunitas, tanpa pembatasan usia atau profesi. Cakupan luas ini tetap dilayani melalui kategori, filter, lokasi, dan rekomendasi agar hasil tidak menjadi daftar yang terlalu umum.

### 5.2 Peran dan status akun

Guest bukan jenis akun. Guest adalah status akses sebelum pengguna login. Jenis akun utama terdiri dari Admin Togather dan akun user. Status user dibedakan berdasarkan kelengkapan profil.

| Peran/status | Deskripsi |
|---|---|
| Guest | Belum login. Dapat menjelajah informasi publik dan fitur discovery yang tersedia untuk guest. |
| User belum melengkapi profil | Sudah login, tetapi belum menyelesaikan profil dan aktivasi nomor HP. |
| User terverifikasi | Sudah login, profil telah dilengkapi, dan nomor HP telah diaktivasi. |
| Pengurus komunitas | Peran tambahan yang diberikan kepada user terverifikasi untuk mengelola komunitas. Ini bukan jenis akun baru. |
| Admin Togather | Pengelola platform yang memvalidasi dan mengelola data komunitas serta event. |

### 5.3 Aturan akun

1. User harus login untuk bergabung ke komunitas, mendaftar event, atau menggunakan chat.
2. User yang belum melengkapi profil tidak dapat mengajukan pembuatan komunitas.
3. User yang dapat mengajukan pembuatan komunitas harus sudah melengkapi profil dan melakukan aktivasi nomor HP.
4. Pengajuan komunitas tetap harus dikonfirmasi oleh Admin Togather.
5. User yang membuat komunitas menjadi pengurus komunitas setelah komunitas disetujui, sesuai aturan role yang diterapkan.
6. Pengurus komunitas adalah role tambahan pada akun user, bukan tingkat akun baru.

### 5.4 Profil dan aktivasi nomor HP

Metode login MVP adalah email dan password. Login Google dan Discord tetap menjadi provider lanjutan sesuai prioritas feature map.

Profil user dianggap lengkap apabila field berikut telah diisi:

- Nama.
- Nomor HP.
- Lokasi atau domisili.
- Minat, bidang, atau role.
- Bio singkat.

Aktivasi nomor HP dilakukan melalui WhatsApp. User yang belum melengkapi profil atau belum menyelesaikan aktivasi nomor HP tetap dapat menjelajah dan melakukan aksi user yang hanya mensyaratkan login, tetapi belum dapat mengajukan komunitas.

### 5.5 Sumber lokasi pengguna

1. Saat fitur membutuhkan lokasi, browser meminta izin akses GPS.
2. Jika user memberikan izin, sistem menggunakan lokasi tersebut sebagai konteks pencarian terdekat.
3. Jika user menolak izin GPS, sistem meminta user memilih atau menginput lokasi manual, minimal kabupaten/kota atau wilayah administratif yang tersedia.
4. User tidak boleh dipaksa memberikan GPS untuk tetap menggunakan discovery.
5. Lokasi pengguna tidak ditampilkan sebagai lokasi publik pengguna lain.

### 5.6 Matriks akses ringkas

| Aksi | Guest | User belum lengkap | User terverifikasi | Pengurus | Admin |
|---|---:|---:|---:|---:|---:|
| Menjelajah komunitas/event | Ya | Ya | Ya | Ya | Ya |
| Memakai discovery map | Ya | Ya | Ya | Ya | Ya |
| Bergabung komunitas | Tidak | Ya, setelah login | Ya | Ya | Ya |
| Mendaftar event | Tidak | Ya, setelah login | Ya | Ya | Ya |
| Menggunakan chat | Tidak | Ya, setelah login | Ya | Ya | Ya |
| Mengajukan komunitas | Tidak | Tidak | Ya | Ya | Ya |
| Menyetujui pengajuan komunitas | Tidak | Tidak | Tidak | Tidak | Ya |
| Menambahkan event katalog | Tidak | Tidak | Tidak | Tidak | Ya |
| Mengelola komunitas | Tidak | Tidak | Tidak | Ya | Ya |
| Mengelola anggota komunitas | Tidak | Tidak | Tidak | Ya | Ya |

> Matriks ini mengikuti aturan produk yang telah disepakati. Detail izin per aksi perlu diterjemahkan ke authorization rules pada tahap teknis.

---

## 6. Feature Map dan Prioritas

### 6.1 Arti prioritas

- **MVP:** prioritas paling tinggi dan menjadi dasar produk yang harus dapat berjalan.
- **Fase 2:** dikerjakan setelah MVP dan berada di bawah prioritas MVP.
- **Fase 3:** dikerjakan setelah Fase 2 dan berada di bawah prioritas Fase 2.
- **Tidak digunakan:** tidak menjadi bagian dari scope Togather saat ini.

### 6.2 Feature map utama

| No. | Modul/fitur | Subfitur atau cakupan | Prioritas |
|---:|---|---|---|
| 1 | Jelajah peta komunitas dan event | Peta, marker komunitas/event, akses discovery | MVP |
| 2 | Filter minat dan jarak | Penyaringan berdasarkan minat dan jarak | Fase 2 |
| 3 | Daftar komunitas sekitar | Daftar hasil komunitas di sekitar pengguna | Fase 2 |
| 4 | Profil komunitas | Informasi detail komunitas | Fase 3 |
| 5 | Rekomendasi komunitas | Hasil komunitas yang disarankan | Fase 2 |
| 6 | Skor kecocokan dan alasan rekomendasi | Skor match dan penjelasan alasan | Fase 3 |
| 7 | Event | Katalog event yang dikelola admin | Fase 2 |
| 8 | Pendaftaran event | Aksi daftar event | Fase 3 |
| 9 | Catatan kehadiran event | Pencatatan kehadiran pengguna | Fase 3 |
| 10 | Akun dan login | Fondasi akun dan sesi pengguna | MVP |
| 11 | Login email | Provider/login menggunakan email | Fase 2 |
| 12 | Login Google | OAuth Google | Fase 2 |
| 13 | Login Discord | OAuth Discord | Fase 2 |
| 14 | Komunitasku | Daftar komunitas yang diikuti dan aktivitas terkait | Fase 3 |
| 15 | Gabung dan keluar komunitas | Membership komunitas public/private | Fase 2 |
| 16 | Kelola komunitas | Pengajuan, pengelolaan profil, dan data komunitas | Fase 3 |
| 17 | Kelola event dan kehadiran | Pengelolaan event dan data kehadiran | Fase 2 |
| 18 | Chat komunitas | Kanal percakapan komunitas | Fase 2 |
| 19 | Filter konten terlarang di chat | Penyaringan konten sesuai aturan platform | Fase 3 |
| 20 | Collaborative Lists | Daftar tempat, catatan, dan voting bersama | Fase 3 |
| 21 | Mutual atau follow | Relasi antaruser sebagai konteks kepercayaan | Fase 2 |
| 22 | Verifikasi komunitas | Badge/status komunitas yang telah diverifikasi | Fase 3 |
| 23 | Skor kesehatan komunitas | Indikator aktivitas komunitas | Fase 3 |
| 24 | Peringatan komunitas sepi | Peringatan untuk komunitas dengan aktivitas rendah | Fase 3 |
| 25 | Live sharing lokasi | Berbagi lokasi real-time | Tidak digunakan |

### 6.3 Catatan prioritas

- Screenshot feature map digunakan sebagai struktur pengelompokan modul.
- Status prioritas di atas mengikuti koreksi terakhir: status nomor 11 dan 12 adalah dua status `Fase 2` yang terpisah.
- Fitur admin untuk seed dan pengelolaan data diperlukan agar produk dapat didemonstrasikan menggunakan data dummy, walaupun sebagian fitur pengelolaan user berada pada fase berikutnya.

### 6.4 Scope demo MVP

Untuk kebutuhan demo awal, alur berikut harus dapat dicoba menggunakan data dummy dan implementasi minimal. Daftar ini adalah scope demo yang dikonfirmasi, bukan perubahan terhadap prioritas pengembangan penuh pada tabel sebelumnya:

- Data komunitas dummy.
- Data event dummy.
- Profil komunitas.
- Filter minat dan jarak.
- Daftar komunitas sekitar.
- Akun dan login menggunakan email/password.
- Gabung dan keluar komunitas.
- Pendaftaran event.

Peta menjadi wadah discovery yang mendukung data komunitas dan event tersebut. Rekomendasi dan fitur lain tetap mengikuti prioritas pengembangan pada feature map.

Scope demo MVP tidak mengubah prioritas pengembangan penuh. Prioritas tetap menjadi acuan urutan pengerjaan, sedangkan scope demo menentukan alur minimum yang harus terlihat pada prototipe/versi kompetisi.

---

## 7. Kebutuhan Fungsional

### 7.1 Discovery dan peta

**Tujuan:** memungkinkan pengguna menemukan komunitas dan event dari satu tempat.

Kebutuhan:

- Sistem menampilkan peta discovery Togather.
- Sistem dapat menampilkan marker komunitas dan event yang memiliki data lokasi.
- Pengguna dapat membuka informasi terkait dari marker yang dipilih.
- Pengguna guest dapat menjelajah data yang bersifat publik tanpa login.
- Event atau komunitas tanpa lokasi fisik tetap dapat tersedia melalui daftar atau katalog ketika fitur terkait sudah aktif.
- Jika GPS ditolak, sistem menyediakan fallback lokasi manual berdasarkan kabupaten/kota atau wilayah administratif.

Kriteria penerimaan:

- Peta dapat dibuka tanpa akun.
- Marker komunitas dan event dapat dibedakan secara jelas melalui data atau tipe objeknya.
- Marker yang dipilih mengarah ke informasi objek yang benar.
- Data yang belum disetujui admin tidak tampil sebagai data publik.

### 7.2 Filter dan daftar komunitas

**Prioritas:** Fase 2.

Kebutuhan:

- Pengguna dapat menyaring komunitas berdasarkan minat.
- Pengguna dapat menyaring komunitas berdasarkan jarak ketika data lokasi tersedia.
- Sistem menampilkan daftar komunitas yang sesuai dengan filter.
- Hasil kosong harus tetap memiliki status yang jelas kepada pengguna.
- Filter minat dan jarak harus tersedia dalam scope demo MVP menggunakan data dummy.

Kriteria penerimaan:

- Hasil tidak menampilkan komunitas yang tidak memenuhi filter yang dipilih.
- Komunitas online yang tidak memiliki lokasi fisik tidak dipaksa masuk ke hasil berbasis jarak.
- Perubahan filter memperbarui hasil tanpa mencampur data dari filter sebelumnya.

### 7.3 Profil komunitas

**Prioritas:** Fase 3.

Profil komunitas setidaknya perlu menyediakan struktur untuk:

- Nama komunitas
- Deskripsi
- Kategori/minat
- Tipe komunitas: online atau offline
- Lokasi umum, jika tersedia
- Status public atau private
- Informasi pengurus
- Informasi aktivitas atau jadwal, jika tersedia
- Status verifikasi, jika fitur verifikasi sudah aktif
- Tautan kanal eksternal, jika disediakan pengurus

Field wajib pada data komunitas:

- Nama komunitas.
- Deskripsi.
- Kategori.
- Tipe komunitas: online atau offline.
- Status akses: public atau private.
- Lokasi umum atau penanda `online/tidak ada lokasi fisik` untuk komunitas online.

Field opsional pada data komunitas:

- Tautan kanal eksternal.
- Nama pengurus.
- Jadwal kegiatan.
- Foto atau logo.
- Status verifikasi.

Kriteria penerimaan:

- Pengguna dapat membedakan komunitas online dan offline.
- Profil menunjukkan apakah komunitas public atau private.
- Lokasi yang ditampilkan menggunakan tingkat ketepatan yang dipilih pengurus.
- Informasi yang belum tersedia tidak ditampilkan sebagai informasi palsu.

### 7.4 Rekomendasi komunitas

**Prioritas:** Fase 2.

Sistem rekomendasi menggunakan tiga sumber utama:

1. Minat pengguna.
2. Lokasi pengguna atau konteks lokasi yang tersedia.
3. Riwayat pengguna.

Pada Fase 2, sistem memprioritaskan penyediaan hasil rekomendasi. Detail skor kecocokan dan alasan rekomendasi menjadi Fase 3.

Kriteria penerimaan:

- Rekomendasi hanya mengambil data komunitas yang tersedia dan lolos aturan publikasi.
- Perubahan minat atau lokasi dapat memengaruhi hasil rekomendasi ketika data tersebut sudah tersedia.
- Riwayat pengguna mencakup komunitas yang pernah dilihat, komunitas yang pernah diikuti, event yang pernah dibuka, event yang pernah didaftari, event yang pernah dihadiri, dan pencarian yang pernah dilakukan.
- Sistem menangani user baru yang belum memiliki riwayat dengan menggunakan minat dan lokasi yang tersedia.
- Sistem tidak menampilkan seolah-olah terdapat skor pasti jika mekanisme scoring belum aktif.

### 7.5 Skor kecocokan dan alasan rekomendasi

**Prioritas:** Fase 3.

Fitur ini harus menjelaskan dasar rekomendasi, bukan hanya memberikan urutan hasil. Bobot atau formula final belum ditetapkan dalam PRD ini.

Kriteria penerimaan:

- Setiap skor memiliki sumber data yang dapat ditelusuri.
- Alasan rekomendasi menggunakan data yang benar-benar tersedia.
- Sistem tidak menampilkan angka kecocokan yang tidak dapat dijelaskan.

### 7.6 Akun dan login

**Prioritas fondasi:** MVP.

Kebutuhan:

- Sistem menyediakan fondasi akun dan sesi login.
- Sistem dapat membedakan guest, user belum melengkapi profil, user terverifikasi, pengurus, dan admin.
- Sistem memeriksa status akun sebelum aksi yang membutuhkan login.
- Sistem menyimpan status kelengkapan profil dan aktivasi nomor HP.
- Sistem menerapkan otorisasi di sisi server, bukan hanya menyembunyikan tombol di frontend.

Provider login MVP:

- Login email dan password.

Provider login lanjutan:

- Login Google: Fase 2.
- Login Discord: Fase 2.

### 7.7 Gabung dan keluar komunitas

**Prioritas:** Fase 2.

Aturan membership:

- Komunitas public: user dapat bergabung dan keluar sesuai aturan sistem.
- Komunitas private: user harus meminta bergabung atau menerima undangan.
- Pengurus komunitas menyetujui permintaan join komunitas private.
- Pengurus dapat mengundang user ke komunitas private.
- Pengurus dapat mengeluarkan anggota sesuai kewenangan yang diberikan.
- Riwayat membership dapat menjadi bagian dari riwayat pengguna.

Kriteria penerimaan:

- User guest tidak dapat menjadi anggota.
- User dapat melihat status permintaan join private.
- User tidak otomatis menjadi anggota private tanpa persetujuan atau undangan.
- User tidak dapat melakukan aksi pengurus tanpa role yang sah.

### 7.8 Komunitas dan pengajuan komunitas

**Prioritas pengelolaan:** Fase 3.

Alur yang telah disepakati:

```text
User login
→ melengkapi profil
→ aktivasi nomor HP
→ mengisi pengajuan komunitas
→ pengajuan masuk ke Admin Togather
→ admin menyetujui atau menolak
→ komunitas tampil jika disetujui
```

Aturan:

- User belum melengkapi profil tidak dapat mengajukan komunitas.
- User terverifikasi dapat mengajukan komunitas.
- Admin Togather melakukan konfirmasi sebelum komunitas dipublikasikan.
- Target waktu konfirmasi sekitar 5 menit merupakan gambaran operasional, bukan SLA yang dijamin.
- Pengurus komunitas adalah user yang diberi role pengelolaan komunitas.

Kriteria penerimaan:

- Pengajuan memiliki status minimal: menunggu, disetujui, atau ditolak.
- Komunitas berstatus menunggu tidak muncul pada discovery publik.
- Hanya admin yang dapat mengubah status konfirmasi pada tahap ini.
- Pengajuan menyimpan identitas pengaju dan data komunitas yang diajukan.

### 7.9 Event

**Prioritas:** Fase 2.

Aturan event:

- Event dapat berdiri tanpa komunitas.
- Event dapat memiliki relasi opsional dengan komunitas.
- Event hanya dapat ditambahkan oleh Admin Togather pada tahap awal.
- Event dapat memiliki lokasi umum atau lokasi yang relevan dengan pelaksanaan event.
- Event tampil sebagai objek discovery terpisah dari komunitas.

Field wajib event:

- Nama event.
- Deskripsi.
- Kategori.
- Tanggal.
- Waktu.
- Lokasi.
- Penyelenggara.
- Kuota peserta.
- Kontak penyelenggara.

Field opsional event:

- Link pendaftaran eksternal.
- Biaya.
- Komunitas terkait.

Kriteria penerimaan:

- Admin dapat menambahkan event dummy untuk kebutuhan demo.
- Event tanpa komunitas tetap dapat ditampilkan.
- Event dengan komunitas terkait menampilkan relasi tersebut tanpa menjadikan komunitas sebagai prasyarat event.
- Guest dapat melihat event yang telah dipublikasikan.

### 7.10 Pendaftaran dan kehadiran event

**Prioritas:** Fase 3.

Kebutuhan:

- User login dapat mendaftar pada event yang membuka pendaftaran.
- Sistem mencatat relasi user dan event.
- Sistem menyediakan dasar pencatatan kehadiran.
- Data kehadiran dapat menjadi bagian dari riwayat pengguna dan metrik aktivitas.
- Versi demo menggunakan alur pendaftaran dan pencatatan kehadiran minimal yang dapat diuji dengan data dummy.

### 7.11 Komunitasku

**Prioritas:** Fase 3.

Komunitasku menjadi pusat aktivitas personal yang menampilkan komunitas yang diikuti dan aktivitas terkait. Fitur ini bukan feed sosial umum.

Kriteria penerimaan:

- User hanya melihat data yang berkaitan dengan akunnya atau akses yang diberikan kepadanya.
- Daftar komunitas menunjukkan status membership yang benar.
- Data event terkait dapat ditampilkan ketika modul event dan pendaftaran telah tersedia.

### 7.12 Kelola event dan kehadiran

**Prioritas:** Fase 2.

Pada tahap awal, Admin Togather mengelola event yang masuk ke katalog. Pengelolaan event komunitas oleh pengurus dapat diterapkan sesuai otorisasi yang tersedia pada tahap implementasi.

Kriteria penerimaan:

- Hanya admin atau role yang diberi izin yang dapat mengubah data event.
- Perubahan data event tidak boleh dilakukan oleh guest atau user tanpa izin.
- Status event dan data publikasinya dapat ditelusuri.

### 7.13 Chat komunitas

**Prioritas:** Fase 2.

Kebutuhan:

- Setiap komunitas yang mengaktifkan chat memiliki kanal komunitas.
- Chat hanya dapat digunakan oleh user yang memenuhi aturan akses komunitas.
- Chat menjadi kanal kontekstual untuk komunikasi komunitas, bukan pengganti seluruh kanal eksternal.
- Kanal eksternal dapat tetap digunakan jika pengurus menyediakannya.

Kriteria penerimaan:

- Guest tidak dapat mengirim pesan.
- User yang bukan anggota tidak dapat mengakses chat internal komunitas yang mensyaratkan membership.
- Pesan memiliki identitas pengirim dan waktu pengiriman.
- Hak akses chat diperiksa di server.

### 7.14 Filter konten terlarang

**Prioritas:** Fase 3.

Kebutuhan:

- Sistem menyaring konten chat sesuai kebijakan Togather.
- Pesan yang terindikasi melanggar dapat ditahan atau ditandai untuk moderasi sesuai aturan implementasi.
- Sistem menyimpan data moderasi secukupnya untuk penanganan admin.

Daftar kategori pelanggaran dan mekanisme penanganan perlu dikunci sebelum fitur ini dibangun.

### 7.15 Mutual atau follow

**Prioritas:** Fase 2.

Fitur ini menjadi sinyal konteks kepercayaan, bukan pembangunan sosial media mini.

Kriteria penerimaan:

- Relasi tidak boleh membuka data privat yang tidak diizinkan.
- Relasi dapat digunakan sebagai konteks pada fitur produk ketika sudah diaktifkan.
- Sistem memiliki aturan yang jelas untuk membuat dan menghapus relasi.

### 7.16 Collaborative Lists

**Prioritas:** Fase 3.

Collaborative Lists adalah daftar tempat bersama yang berkaitan dengan komunitas atau grup kegiatan. Cakupan yang direncanakan:

- Menambah lokasi.
- Menambahkan catatan.
- Memberikan voting berbasis emoji.

Fitur ini tidak menggantikan peta discovery utama dan tidak mencakup live sharing lokasi.

### 7.17 Verifikasi komunitas

**Prioritas:** Fase 3.

Verifikasi komunitas digunakan untuk memberikan status kepercayaan setelah proses pemeriksaan admin. Detail dokumen yang diperlukan dan kriteria verifikasi belum ditetapkan.

### 7.18 Skor kesehatan dan peringatan komunitas sepi

**Prioritas:** Fase 3.

Sistem dapat menggabungkan sinyal aktivitas komunitas untuk menghasilkan indikator kesehatan. Peringatan harus mempertimbangkan ritme komunitas agar komunitas dengan kegiatan bulanan tidak dianggap sepi hanya karena tidak aktif setiap minggu.

Bobot sinyal dan ambang batas belum ditetapkan. Sistem harus memberikan peringatan internal kepada pengurus sebelum konsekuensi publik diterapkan.

### 7.19 Live sharing lokasi

**Status:** Tidak digunakan.

Live sharing lokasi tidak termasuk scope Togather saat ini. Fitur ini tidak boleh menjadi dependensi modul MVP, Fase 2, atau Fase 3 pada PRD ini.

---

## 8. Alur Pengguna Utama

### 8.1 Discovery sebagai guest

```text
Guest membuka Togather
→ melihat peta discovery
→ memilih komunitas atau event
→ membaca informasi publik
→ mencoba aksi yang membutuhkan akun
→ diarahkan untuk login atau membuat akun
```

### 8.2 Bergabung komunitas public

```text
User login
→ membuka komunitas public
→ memilih Bergabung
→ membership tercatat
→ user dapat mengakses fitur anggota sesuai fase yang tersedia
```

### 8.3 Bergabung komunitas private

```text
User login
→ membuka komunitas private
→ memilih Minta Bergabung atau menerima undangan
→ pengurus meninjau permintaan
→ disetujui atau ditolak
→ membership aktif jika disetujui
```

### 8.4 Pengajuan komunitas oleh user terverifikasi

```text
User login
→ melengkapi profil
→ aktivasi nomor HP
→ mengisi data komunitas
→ mengirim pengajuan
→ status menunggu konfirmasi admin
→ admin menyetujui atau menolak
→ komunitas dipublikasikan jika disetujui
```

### 8.5 Penambahan event oleh admin

```text
Admin login
→ membuka pengelolaan event
→ mengisi data event
→ memilih komunitas terkait secara opsional
→ menyimpan dan mempublikasikan event
→ event muncul pada discovery
```

### 8.6 Rekomendasi

```text
User menyediakan minat dan konteks lokasi
→ sistem membaca data komunitas yang tersedia
→ sistem mempertimbangkan riwayat pengguna
→ sistem menampilkan rekomendasi
→ skor dan alasan rekomendasi tersedia pada Fase 3
```

---

## 9. Model Data Konseptual

Model berikut adalah dasar hubungan data, bukan rancangan skema database final.

| Entitas | Tanggung jawab |
|---|---|
| User | Identitas akun, status, dan relasi pengguna |
| UserProfile | Profil, minat, dan data yang diperlukan untuk aktivasi |
| PhoneActivation | Status aktivasi nomor HP |
| Community | Data inti komunitas, tipe, status, dan visibilitas |
| CommunityCategory | Kategori/minat komunitas |
| CommunityLocation | Lokasi umum komunitas, bersifat opsional untuk komunitas online |
| CommunityOrganizer | Relasi role pengurus dengan komunitas |
| CommunityMembership | Relasi user dengan komunitas |
| CommunityJoinRequest | Permintaan bergabung ke komunitas private |
| CommunityInvitation | Undangan ke komunitas private |
| CommunitySubmission | Pengajuan pembuatan komunitas oleh user |
| CommunityApproval | Status keputusan Admin Togather terhadap pengajuan |
| Event | Data event yang berdiri sendiri |
| EventCommunity | Relasi opsional event dengan komunitas |
| EventRegistration | Relasi user dengan event saat pendaftaran aktif |
| EventAttendance | Catatan kehadiran event |
| UserActivityHistory | Riwayat aktivitas yang tersedia untuk rekomendasi |
| Recommendation | Hasil rekomendasi yang ditampilkan kepada user |
| UserRelation | Relasi mutual/follow jika fitur aktif |
| ChatChannel | Kanal chat komunitas |
| ChatMessage | Pesan pada kanal chat |
| ModerationRecord | Catatan moderasi konten bila fitur filter aktif |
| CollaborativeList | Daftar tempat bersama |
| CollaborativeListItem | Tempat atau item dalam daftar bersama |
| CommunityVerification | Data proses/status verifikasi komunitas |
| CommunityHealth | Data indikator kesehatan komunitas |

Relasi inti:

```text
User ──< UserProfile
User ──< UserActivityHistory
User ──< CommunityMembership >── Community
User ──< CommunitySubmission
Community ──< CommunityOrganizer >── User
Community ──< CommunityJoinRequest >── User
Community ──< EventCommunity >── Event
User ──< EventRegistration >── Event
EventRegistration ── EventAttendance
Community ── ChatChannel ──< ChatMessage
User ──< Recommendation >── Community/Event
```

---

## 10. Kebutuhan Non-Fungsional

### 10.1 Keamanan

- Semua input dari user dan admin harus divalidasi.
- Authorization harus diperiksa di server untuk setiap aksi sensitif.
- User tidak boleh mengubah role atau status verifikasi dari sisi client.
- Data akun, nomor HP, dan data relasi harus dilindungi sesuai kebutuhan akses.
- Endpoint yang menerima data publikasi, membership, atau moderasi harus memiliki kontrol akses.
- Sistem tidak boleh menyimpan rahasia atau credential di repository.

### 10.2 Privasi lokasi

- Lokasi komunitas ditampilkan sebagai lokasi umum sesuai pilihan pengurus.
- Sistem tidak menyediakan live sharing lokasi.
- Lokasi personal pengguna tidak boleh dipublikasikan tanpa izin.
- Data lokasi yang digunakan untuk rekomendasi harus mengikuti kebutuhan fitur dan izin yang tersedia.

### 10.3 Kualitas dan integritas data

- Data komunitas publik harus melewati proses konfirmasi admin.
- Data event awal hanya dapat ditambahkan oleh admin.
- Status pending, approved, dan rejected harus dapat dibedakan.
- Data yang tidak lengkap tidak boleh ditampilkan seolah-olah lengkap.
- Relasi event-komunitas bersifat opsional.

### 10.4 Performa dan skalabilitas

- Arsitektur harus memisahkan logika discovery, akun, komunitas, event, dan komunikasi secara modular.
- Query berbasis lokasi harus memanfaatkan kemampuan geospasial database yang dipilih.
- Peta dan daftar harus menggunakan data yang relevan dengan wilayah dan filter aktif.
- Sistem harus dapat dikembangkan dari data dummy menuju data komunitas nyata.
- Target performa numerik perlu ditetapkan setelah lingkungan demo dan pola data uji tersedia.

### 10.5 Ketersediaan dan pemulihan

- Aplikasi harus dapat dijalankan secara konsisten melalui konfigurasi environment yang terdokumentasi.
- Proses deployment dan pengisian data dummy harus dapat diulang.
- Error pada satu modul tidak boleh menyebabkan data modul lain berubah secara tidak valid.

### 10.6 Usability dan accessibility dasar

- Alur guest menuju discovery tidak boleh membutuhkan login.
- Pesan error dan status proses harus dapat dipahami pengguna.
- Kontrol utama harus dapat digunakan pada perangkat desktop dan mobile.
- Kontras, label, fokus keyboard, dan struktur semantik perlu diperiksa pada implementasi UI.

---

## 11. Tech Stack yang Dikunci

Tech stack berikut mengikuti dokumen teknis yang telah ditetapkan. Teknologi tambahan tidak menjadi kewajiban pada PRD ini.

| Area | Teknologi |
|---|---|
| Full-stack framework | Next.js |
| Frontend styling | Tailwind CSS |
| Peta | Leaflet dengan OpenStreetMap |
| Backend API | Next.js API Routes |
| Komunikasi real-time | Socket.IO |
| Autentikasi | Auth.js |
| ORM | Prisma |
| Database | PostgreSQL dengan PostGIS |
| Container | Docker |
| Orkestrasi lokal | Docker Compose |
| Version control | Git |
| Repository dan kolaborasi | GitHub |

Teknologi tambahan seperti Redis, plugin clustering Leaflet, library validasi khusus, test runner, observability, dan layanan media hanya boleh ditambahkan ketika ada kebutuhan fitur yang jelas dan keputusan teknis tim.

---

## 12. Data Dummy untuk MVP dan Demo

Versi awal menggunakan data dummy. Data dummy harus dirancang untuk menguji seluruh kondisi utama, bukan hanya membuat tampilan terlihat penuh.

### 12.1 Cakupan seed yang disarankan

Target awal mengikuti rencana pada dokumen ide sebelumnya:

- Seed komunitas nyata/dummy: sekitar 50–100 komunitas untuk cakupan demo satu wilayah.
- Distribusi komunitas mencakup seluruh wilayah DIY.
- Data mencakup komunitas online dan offline.
- Data mencakup komunitas public dan private.
- Data mencakup komunitas dengan lokasi umum dan komunitas tanpa lokasi fisik.
- Data event mencakup event tanpa komunitas dan event dengan relasi komunitas opsional.
- Data user mencakup guest, user belum lengkap, user terverifikasi, pengurus, dan admin.

Angka 50–100 adalah target seed awal, bukan klaim jumlah komunitas nyata yang telah diverifikasi.

### 12.2 Skenario data minimum

Data dummy harus memiliki contoh untuk:

1. Komunitas offline public dengan lokasi umum.
2. Komunitas offline private dengan lokasi umum.
3. Komunitas online public tanpa lokasi fisik.
4. Komunitas online private tanpa lokasi fisik.
5. Pengajuan komunitas berstatus menunggu.
6. Pengajuan komunitas yang disetujui.
7. Pengajuan komunitas yang ditolak.
8. Event yang berdiri sendiri.
9. Event yang memiliki komunitas terkait.
10. Event dengan pendaftaran tersedia pada fase terkait.
11. User dengan minat dan riwayat yang berbeda.
12. Data yang menghasilkan hasil discovery kosong setelah filter.

### 12.3 Aturan data dummy

- Data dummy harus diberi penanda agar tidak disamakan dengan data produksi.
- Data dummy tidak boleh menggunakan data personal nyata tanpa izin.
- Koordinat lokasi menggunakan lokasi umum, bukan alamat privat.
- Seed dapat dijalankan ulang untuk environment demo.
- Data harus mencakup relasi antarentitas yang diperlukan untuk demonstrasi.

---

## 13. Success Metrics

Angka pada bagian ini adalah **usulan awal untuk divalidasi tim**, bukan hasil pengukuran aktual.

### 13.1 Metric produk

| Metric | Definisi | Target awal/usulan |
|---|---|---|
| Ketersediaan discovery | Pengguna guest dapat membuka peta dan melihat objek publik | 100% pada skenario demo |
| Cakupan seed | Komunitas dummy tersedia di seluruh area DIY | Seluruh wilayah DIY terwakili |
| Cakupan tipe komunitas | Data mencakup online, offline, public, dan private | Semua tipe memiliki contoh |
| Keberhasilan menemukan hasil | User uji dapat menemukan minimal satu komunitas/event yang relevan pada skenario yang tersedia | Minimal 80% peserta uji |
| Relevansi filter | Hasil sesuai minat dan filter lokasi yang dipilih | Minimal 90% hasil uji sesuai filter |
| Penggunaan data dummy | Semua skenario utama dapat didemonstrasikan tanpa input manual tambahan | 100% skenario utama |
| Validasi pengajuan | Pengajuan komunitas baru tidak langsung menjadi publik sebelum keputusan admin | 100% pengajuan mengikuti status approval |
| Waktu konfirmasi admin | Waktu dari pengajuan sampai keputusan admin | Sekitar 5 menit sebagai target operasional awal |
| Kejelasan akses | Aksi yang membutuhkan akun tidak dapat dilakukan guest | 100% skenario akses diuji |

### 13.2 Metric validasi pengguna

Sebelum target angka dijadikan klaim proposal, tim perlu melakukan pengujian dengan pengguna. Data minimal yang perlu dicatat:

- Jumlah peserta uji.
- Profil umum peserta.
- Skenario yang diberikan.
- Waktu penyelesaian tugas.
- Apakah peserta berhasil menemukan komunitas/event.
- Hambatan yang dialami.
- Penilaian relevansi hasil.

---

## 14. Testing Strategy

### 14.1 Unit test

Digunakan untuk menguji logika yang dapat dipisahkan, termasuk:

- Penentuan status akun.
- Validasi aturan public/private.
- Validasi izin role.
- Penyaringan minat dan lokasi.
- Pemrosesan riwayat rekomendasi.
- Validasi status approval.

### 14.2 Integration test

Digunakan untuk menguji hubungan antar modul dan database, termasuk:

- User login dan perubahan status profil.
- Pengajuan komunitas sampai approval admin.
- Event berdiri sendiri dan event dengan komunitas opsional.
- Join public dan request join private.
- Pembatasan akses berdasarkan role.
- Penyimpanan lokasi umum dan hasil pencarian.

### 14.3 End-to-end test

Skenario kritis:

1. Guest membuka discovery.
2. Guest membuka komunitas dan event publik.
3. User login lalu mencoba bergabung ke komunitas public.
4. User meminta bergabung ke komunitas private.
5. User belum lengkap mencoba mengajukan komunitas dan ditolak oleh aturan akses.
6. User terverifikasi mengajukan komunitas.
7. Admin menyetujui atau menolak pengajuan.
8. Admin menambahkan event.
9. Aksi guest terhadap fitur yang membutuhkan akun diblokir.

### 14.4 Security test

- Pengujian authorization untuk setiap role.
- Validasi input form dan endpoint.
- Pengujian akses langsung ke endpoint yang seharusnya terbatas.
- Pengujian manipulasi status akun, membership, dan approval.
- Pengujian input chat ketika modul chat aktif.

### 14.5 User testing

Pengujian pengguna digunakan untuk memvalidasi apakah Togather benar-benar membantu orang menemukan komunitas/event, bukan hanya apakah halaman dapat dibuka.

---

## 15. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Cold start | Discovery tidak berguna jika katalog kosong | Menyiapkan seed komunitas dan event dummy/nyata untuk wilayah DIY |
| Beban validasi admin | Target konfirmasi 5 menit tidak tercapai saat pengajuan meningkat | Menjadikan 5 menit sebagai target awal dan memonitor antrean approval |
| Data komunitas tidak aktif | Hasil discovery kehilangan kepercayaan | Menyediakan status aktivitas pada fase yang relevan dan menghindari klaim aktivitas tanpa data |
| Lokasi terlalu presisi | Risiko privasi pengurus atau komunitas | Menampilkan lokasi umum dan membiarkan pengurus menentukan tingkat ketepatan |
| Scope semua kategori terlalu luas | Kualitas katalog tidak merata | Menggunakan kategori dan filter, lalu memperluas seed secara bertahap |
| Riwayat pengguna belum cukup | Rekomendasi awal kurang personal | Menggunakan data minat dan lokasi terlebih dahulu; riwayat menjadi penguat ketika tersedia |
| Event terpisah dari komunitas | Data event kehilangan konteks sosial | Menyediakan relasi komunitas opsional tanpa menjadikan komunitas sebagai syarat |
| Chat belum aktif atau sepi | Pengguna tidak mendapat nilai dari kanal internal | Menjaga fokus Togather sebagai discovery layer dan tidak memaksa chat sebagai satu-satunya kanal |
| Data dummy dianggap data nyata | Presentasi atau evaluasi menjadi menyesatkan | Memberi penanda dan dokumentasi bahwa data tersebut adalah data dummy |

---

## 16. Batasan Produk

### Always do

- Menggunakan cakupan awal seluruh DIY.
- Menjaga perbedaan antara guest, user belum lengkap, user terverifikasi, pengurus, dan admin.
- Memvalidasi pengajuan komunitas sebelum dipublikasikan.
- Menampilkan lokasi sebagai lokasi umum sesuai pilihan pengurus.
- Menjaga event tetap dapat berdiri tanpa komunitas.
- Menggunakan tech stack yang telah dikunci.
- Melakukan validasi input dan authorization di server.
- Menandai data dummy secara jelas.

### Ask first

- Mengubah urutan prioritas MVP, Fase 2, atau Fase 3.
- Menambahkan provider login selain yang telah direncanakan.
- Mengubah aturan public/private.
- Membuka penambahan event bagi user selain admin.
- Menampilkan lokasi presisi.
- Menambahkan live sharing lokasi.
- Menambahkan teknologi tambahan yang belum disepakati.
- Mengubah wilayah pilot dari DIY.

### Never do

- Mempublikasikan komunitas tanpa konfirmasi admin.
- Membiarkan user belum melengkapi profil mengajukan komunitas.
- Membiarkan guest bergabung ke komunitas, mendaftar event, atau memakai chat.
- Menganggap pengurus sebagai jenis akun baru yang terpisah dari user.
- Menampilkan lokasi pribadi atau presisi tanpa izin.
- Mengklaim hasil observasi sebagai statistik penelitian kuantitatif.
- Memasukkan fitur live sharing lokasi ke scope saat ini.
- Menyimpan credential atau data sensitif di repository.

---

## 17. Out of Scope

Fitur atau keputusan berikut tidak termasuk dalam PRD Togather saat ini:

- Live sharing lokasi.
- Discovery skala nasional di luar DIY.
- Penambahan event langsung oleh user biasa.
- Publikasi komunitas tanpa approval admin.
- Penggantian WhatsApp, Discord, Instagram, atau kanal komunikasi eksternal.
- Feed sosial umum.
- Direct message antaruser sebagai fitur utama.
- Detail desain visual UI/UX.
- Formula final skor rekomendasi sebelum data dan bobot disepakati.
- Kriteria final verifikasi komunitas sebelum aturan verifikasi disusun.
- Konsekuensi publik otomatis untuk komunitas yang dianggap sepi.

---

## 18. Kesesuaian dengan Struktur Proposal UINIC 8.0

PRD ini dapat menjadi sumber utama untuk menyusun proposal lomba, dengan pemetaan berikut:

| Kebutuhan proposal | Bagian PRD |
|---|---|
| Latar belakang masalah | Bagian 2 |
| Tujuan dan manfaat | Bagian 3 |
| Target pengguna | Bagian 5 |
| Batasan produk | Bagian 16 dan 17 |
| Platform/framework | Bagian 11 |
| Arsitektur dan hubungan data | Bagian 9 dan 11 |
| Skenario/user flow | Bagian 8 |
| Fitur unggulan | Bagian 6 dan 7 |
| Pengujian | Bagian 14 |
| Proyeksi pengembangan | Bagian 6 dan prioritas Fase 2/Fase 3 |
| Risiko | Bagian 15 |

PRD ini bukan pengganti proposal lomba. Proposal tetap perlu menyesuaikan format, batas halaman, identitas tim, lampiran, dan kebutuhan administrasi UINIC 8.0.

---

## 19. Keputusan Tertunda Non-Blocking

Pertanyaan berikut tidak menghambat scope demo MVP, tetapi harus diputuskan sebelum modul terkait dibangun secara penuh:

1. Formula dan bobot rekomendasi detail pada Fase 3.
2. Apakah event yang dimasukkan admin memerlukan status approval internal kedua atau langsung dapat dipublikasikan oleh admin.
3. Apakah pengurus komunitas dapat mengubah semua data komunitas atau sebagian data harus menunggu admin.
4. Detail mekanisme penghapusan anggota oleh pengurus.
5. Kriteria dan dokumen untuk verifikasi komunitas.
6. Aturan kategori konten terlarang dan alur moderasi chat.
7. Rumus dan periode pengukuran skor kesehatan komunitas.
8. Target metric usulan setelah pengujian pengguna nyata.

---

## 20. Definition of Done Dokumen PRD

PRD ini dianggap siap menjadi acuan awal tim setelah:

- Nama produk `Togather` disetujui seluruh anggota tim.
- Cakupan seluruh DIY disetujui.
- Daftar prioritas 25 fitur disetujui.
- Role dan aturan akses disetujui.
- Alur approval komunitas disetujui.
- Aturan event mandiri dan relasi opsional dengan komunitas disetujui.
- Target data dummy dan metric usulan ditinjau.
- Keputusan tertunda yang memengaruhi modul lanjutan dicatat dan tidak memblokir demo MVP.

Dokumen ini harus diperbarui jika keputusan produk berubah. Perubahan scope, prioritas, role, atau aturan akses harus dicatat sebelum diterapkan pada desain teknis dan kode.
