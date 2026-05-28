---
name: environment-setup
description: Panduan setup environment development dari zero — install semua tools yang dibutuhkan sebelum bisa mulai coding. Dijalankan SEKALI di awal, tidak perlu diulang untuk project berikutnya. Dirancang untuk user dengan latar belakang non-technical sekalipun, dengan penjelasan "apa ini dan kenapa dibutuhkan" untuk setiap tool.
---

# Skill 00: Environment Setup

Skill ini dijalankan **sekali saja** di komputer kamu — tidak perlu diulang untuk project berikutnya. Tujuannya: memastikan semua tools yang dibutuhkan sudah terinstall dan berfungsi sebelum kita mulai membangun apapun.

**Estimasi waktu:** 30–60 menit (tergantung kecepatan internet dan OS)

---

## Sebelum Mulai: Cek Sistem Operasi

Beberapa instruksi berbeda tergantung OS. Cek dulu kamu pakai apa:

**Windows:**
- Klik tombol Start → Settings → System → About
- Lihat bagian "Edition" — pastikan Windows 10 versi 2004 ke atas, atau Windows 11

**Mac:**
- Klik ikon Apple () di pojok kiri atas → "About This Mac"
- Catat dua hal: versi macOS dan jenis chip (Intel atau Apple Silicon/M1/M2/M3)
- Cara cek chip: di jendela "About This Mac", lihat bagian "Processor" atau "Chip"

Konfirmasi ke AI agent: OS apa yang kamu pakai dan versinya.

---

## Tool 1: VS Code (Code Editor)

**Apa ini?**
VS Code adalah aplikasi untuk membaca dan menulis kode — seperti Microsoft Word tapi untuk programmer. Kamu akan menggunakannya untuk melihat file project, dan Claude Code bisa dijalankan langsung di dalamnya.

**Install:**
1. Buka https://code.visualstudio.com
2. Klik tombol download besar di halaman utama — otomatis mendeteksi OS kamu
3. Jalankan installer yang terdownload, ikuti langkah default
4. Setelah install, buka VS Code — pastikan muncul jendela editor

**Verifikasi:**
Buka VS Code → pastikan muncul tanpa error.

---

## Tool 2: Terminal

**Apa ini?**
Terminal adalah aplikasi teks yang memungkinkan kamu memberi perintah ke komputer secara langsung — seperti berbicara dengan komputer menggunakan teks. Semua langkah coding akan menggunakan terminal.

**Cara membuka terminal:**

**Windows (pilih salah satu):**
- Cara 1: Di VS Code → menu View → Terminal. Ini cara paling mudah karena terminal langsung terhubung ke VS Code.
- Cara 2: Tekan tombol `Windows + R` → ketik `powershell` → Enter
- Cara 3: Cari "PowerShell" di Start Menu → klik kanan → "Run as Administrator"

> ⚠️ Di Windows, gunakan **PowerShell**, bukan Command Prompt (cmd). PowerShell lebih modern dan kompatibel.

**Mac:**
- Cara 1: Di VS Code → menu View → Terminal. Ini cara paling mudah.
- Cara 2: Tekan `Command + Spasi` → ketik "terminal" → Enter
- Cara 3: Finder → Applications → Utilities → Terminal

**Verifikasi terminal bekerja:**
Ketik perintah berikut lalu tekan Enter:
```
echo "terminal bekerja"
```
Jika muncul tulisan `terminal bekerja` → terminal berfungsi normal.

---

## Tool 3: Node.js

**Apa ini?**
Node.js adalah "mesin" yang menjalankan kode JavaScript/TypeScript di komputer kamu — termasuk backend aplikasi yang akan kita bangun. Seperti mesin mobil: tidak terlihat tapi dibutuhkan agar semuanya berjalan.

**Install:**

**Semua OS:**
1. Buka https://nodejs.org
2. Download versi **LTS** (Long Term Support) — ada dua tombol di halaman utama, pilih yang bertuliskan "LTS", bukan "Current"
3. Jalankan installer, ikuti semua langkah default, klik Next terus hingga selesai

> ⚠️ **Windows:** Setelah install selesai, **restart komputer dulu** sebelum lanjut. Ini penting agar Node.js bisa dikenali oleh terminal.

**Verifikasi (buka terminal BARU setelah install/restart):**
```bash
node --version
# Harus muncul: v20.x.x atau lebih baru

npm --version
# Harus muncul: v9.x.x atau lebih baru
```

Jika muncul angka versi → Node.js berhasil terinstall.
Jika muncul error "not found" atau "not recognized":
- Windows: pastikan sudah restart komputer
- Mac: coba tutup terminal dan buka baru, lalu cek lagi

---

## Tool 4: Git

**Apa ini?**
Git adalah sistem untuk melacak perubahan kode dari waktu ke waktu — seperti "history" atau "undo" yang sangat canggih untuk kode. GitHub adalah layanan online untuk menyimpan kode yang menggunakan Git.

**Bedanya Git dan GitHub:**
- **Git** = software di komputermu (seperti Microsoft Word)
- **GitHub** = layanan online untuk menyimpan file Git (seperti OneDrive/Google Drive)

**Install Git:**

**Windows:**
1. Buka https://git-scm.com/download/win
2. Download installer (otomatis terdeteksi)
3. Jalankan installer — di halaman "Choosing the default editor", pilih "Use Visual Studio Code as Git's default editor"
4. Semua pilihan lain biarkan default, klik Next terus

**Mac:**
Mac biasanya sudah punya Git. Cek dulu di terminal:
```bash
git --version
```
Jika muncul versi → sudah ada, skip ke langkah Setup Identity.
Jika muncul error → install via Homebrew:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install git
```

**Setup Identity (wajib, semua OS):**
Buka terminal dan jalankan dua perintah ini — ganti dengan nama dan email kamu yang sebenarnya:
```bash
git config --global user.name "Nama Lengkap Kamu"
git config --global user.email "email@kamu.com"
```

Gunakan email yang sama dengan akun GitHub yang akan dibuat di langkah berikutnya.

**Verifikasi:**
```bash
git --version
# Harus muncul: git version 2.x.x

git config --global user.name
# Harus muncul nama yang kamu set
```

---

## Tool 5: Akun GitHub + Personal Access Token

**Apa ini?**
GitHub adalah tempat menyimpan kode secara online — seperti Google Drive tapi khusus untuk kode. Personal Access Token adalah "kunci digital" yang memungkinkan terminal di komputermu mengakses GitHub tanpa perlu login berulang kali.

**Buat Akun GitHub:**
1. Buka https://github.com
2. Klik "Sign Up" → isi email, password, username
3. Verifikasi email yang masuk ke inbox kamu

**Buat Personal Access Token:**

> ⚠️ GitHub tidak lagi menerima password biasa untuk operasi dari terminal sejak 2021. Kamu perlu Personal Access Token sebagai penggantinya.

1. Login ke GitHub → klik foto profil di pojok kanan atas → "Settings"
2. Scroll ke bawah → klik "Developer settings" (paling bawah di sidebar kiri)
3. Klik "Personal access tokens" → "Tokens (classic)"
4. Klik "Generate new token" → "Generate new token (classic)"
5. Isi:
   - Note: "Claude Code Development" (nama bebas, untuk ingatkan kamu token ini untuk apa)
   - Expiration: 90 days (atau "No expiration" jika mau lebih simpel)
   - Scopes: centang **"repo"** (ini sudah cukup)
6. Klik "Generate token" di bawah
7. **PENTING:** Token akan muncul sekali saja. Copy dan simpan di tempat yang aman (misalnya di aplikasi Notes di HP kamu). Token ini yang dipakai saat terminal minta "password" nanti.

**Cara pakai token saat push ke GitHub:**
Saat terminal menampilkan prompt seperti ini:
```
Username for 'https://github.com': [ketik username GitHub kamu]
Password for 'https://...': [paste token yang kamu copy tadi, bukan password GitHub]
```

Token tidak akan terlihat saat kamu paste — ini normal, langsung tekan Enter.

---

## Tool 6: Docker Desktop

**Apa ini?**
Docker menjalankan database (PostgreSQL) dan cache (Redis) di "kotak" terisolasi di komputermu — tanpa perlu install langsung ke sistem operasi. Bayangkan Docker seperti mesin virtual kecil yang berisi database.

**Kenapa perlu Docker?**
Tanpa Docker, kamu perlu install PostgreSQL dan Redis langsung ke komputer — proses yang rumit dan bisa mengotori sistem. Docker membuat semuanya terisolasi dan mudah dimatikan/dihapus.

**Buat Akun Docker Hub (diperlukan sebelum install):**
1. Buka https://hub.docker.com
2. Klik "Sign Up" → isi data → verifikasi email

**Install Docker Desktop:**

**Windows:**

> ⚠️ Docker Desktop di Windows memerlukan WSL2 (Windows Subsystem for Linux). Ini adalah layer Linux di dalam Windows. Ikuti langkah ini dengan urutan yang benar.

Langkah 1 — Install WSL2:
1. Buka PowerShell **sebagai Administrator** (klik kanan ikon PowerShell → "Run as Administrator")
2. Jalankan:
   ```powershell
   wsl --install
   ```
3. Tunggu proses selesai → restart komputer

Langkah 2 — Install Docker Desktop:
1. Buka https://docker.com/products/docker-desktop
2. Download versi Windows
3. Jalankan installer, ikuti langkah default
4. Saat diminta login, gunakan akun Docker Hub yang baru dibuat
5. Restart komputer jika diminta

**Mac:**

> ⚠️ Ada dua versi Docker Desktop untuk Mac: untuk chip Intel dan untuk chip Apple Silicon (M1/M2/M3). Pilih yang sesuai.

1. Buka https://docker.com/products/docker-desktop
2. Pilih download sesuai chip:
   - "Mac with Intel Chip" → jika prosesor Intel
   - "Mac with Apple Chip" → jika chip M1/M2/M3
3. Buka file `.dmg` yang terdownload → drag Docker ke Applications
4. Buka Docker dari Applications → login dengan akun Docker Hub

**Verifikasi Docker berjalan:**
- Windows: lihat taskbar di pojok kanan bawah — ada ikon paus kecil 🐳
- Mac: lihat menu bar di pojok kanan atas — ada ikon paus kecil 🐳
- Status ikon harus "Docker Desktop is running" (bukan "starting")

Lalu verifikasi di terminal:
```bash
docker --version
# Harus muncul: Docker version 24.x.x atau lebih baru

docker-compose --version
# Harus muncul: Docker Compose version v2.x.x
```

**Lifecycle Docker yang perlu kamu tahu:**
- Docker Desktop perlu **berjalan** saat kamu mau coding (database perlu aktif)
- Docker Desktop **tidak perlu berjalan** saat kamu tidak coding — bisa dimatikan untuk hemat RAM
- Cara matikan: klik ikon paus → "Quit Docker Desktop"
- Data di database **tidak hilang** saat Docker dimatikan dan dinyalakan lagi
- Data **baru hilang** jika kamu jalankan `docker-compose down -v` (flag `-v` menghapus data) — jangan lakukan ini kecuali memang mau reset

---

## Tool 7: Claude Code

**Apa ini?**
Claude Code adalah versi Claude yang bisa langsung bekerja di dalam project kamu — membuat file, menulis kode, menjalankan perintah terminal, dan commit ke Git. Ini yang akan menjalankan semua skill di plugin ini.

**Install:**
Buka terminal dan jalankan:
```bash
npm install -g @anthropic-ai/claude-code
```

Flag `-g` artinya install secara global — tersedia di seluruh komputer, tidak hanya di satu folder.

**Verifikasi:**
```bash
claude --version
# Harus muncul nomor versi
```

**Cara menggunakan Claude Code:**
1. Buka terminal
2. Masuk ke folder project kamu:
   ```bash
   cd /path/ke/folder/project
   ```
   Contoh Windows: `cd C:\Users\NamaKamu\Documents\project-saya`
   Contoh Mac: `cd ~/Documents/project-saya`
3. Jalankan Claude Code:
   ```bash
   claude
   ```
4. Login dengan akun Anthropic jika diminta
5. Kamu bisa langsung chat dengan Claude Code di terminal

**Tips penting:**
- Claude Code tidak ingat percakapan sebelumnya di sesi berbeda
- Selalu mulai sesi baru dengan memberikan konteks: "Baca docs/TECH_CONTEXT.md dulu sebelum kita mulai"
- Gunakan bahasa Indonesia atau Inggris — keduanya dipahami

---

## Verifikasi Final — Semua Tools

Setelah semua tools terinstall, jalankan checklist ini di terminal:

```bash
node --version        # harus v20.x.x ke atas
npm --version         # harus v9.x.x ke atas
git --version         # harus v2.x.x ke atas
git config user.name  # harus nama kamu
docker --version      # harus v24.x.x ke atas
claude --version      # harus muncul versi
```

Jika semua menampilkan versi tanpa error → environment siap. Lanjut ke Skill 01.

---

## Troubleshooting Umum

### "command not found" atau "not recognized"
**Penyebab:** Tool baru diinstall tapi terminal belum "tahu" tentangnya.
**Solusi:**
1. Tutup terminal yang sedang terbuka
2. Buka terminal baru
3. Coba lagi perintah yang error

Jika masih error setelah buka terminal baru:
- Windows: restart komputer
- Mac: jalankan `source ~/.zshrc` atau `source ~/.bash_profile`

### Node.js terinstall tapi `node --version` error di Windows
**Penyebab:** Installer Node.js tidak mengupdate PATH secara otomatis.
**Solusi:**
1. Restart komputer (bukan hanya tutup terminal)
2. Buka terminal baru
3. Coba lagi

### Docker Desktop tidak mau start di Windows
**Penyebab paling umum:** WSL2 belum terinstall atau tidak up to date.
**Solusi:**
1. Buka PowerShell sebagai Administrator
2. Jalankan: `wsl --update`
3. Restart komputer
4. Buka Docker Desktop lagi

### `docker-compose up -d` error "port already in use"
**Penyebab:** Ada aplikasi lain yang menggunakan port yang sama (5432 untuk PostgreSQL, 6379 untuk Redis).
**Solusi:**
1. Cek apakah PostgreSQL atau Redis sudah terinstall langsung di komputer (bukan via Docker)
2. Jika ya: matikan service tersebut, atau ganti port di `docker-compose.yml`

### Git push minta username/password berulang kali
**Penyebab:** Token belum disimpan di credential manager.
**Solusi:**
```bash
git config --global credential.helper store
```
Setelah ini, masukkan token sekali lagi saat diminta — selanjutnya akan diingat otomatis.

---

## Setelah Semua Selesai

Environment kamu sudah siap. Yang perlu diingat untuk rutinitas coding harian:

```
Sebelum mulai coding:
1. Buka Docker Desktop → tunggu sampai ikon paus berstatus "running"
2. Buka VS Code
3. Buka terminal di VS Code (View → Terminal)
4. Masuk ke folder project: cd nama-project
5. Jalankan database: docker-compose up -d
6. Jalankan Claude Code: claude

Setelah selesai coding:
1. Simpan semua file (Ctrl+S / Cmd+S)
2. Commit perubahan via Claude Code atau manual
3. Bisa matikan Docker Desktop jika tidak diperlukan
```

Lanjutkan ke **Skill 01: Idea to Problem Brief**.
