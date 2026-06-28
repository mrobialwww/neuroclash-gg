# Formula Gameplay Neuroclash.gg

Dokumen ini berisi seluruh rumus dan mekanisme yang digunakan dalam permainan Neuroclash.gg.

---

## 1. Damage (Kerusakan HP)

### 1.1 Damage Dasar

Damage yang diterima pemain bertambah seiring berjalannya ronde (soal semakin sulit).

```
Damage = 5 + (n / N) * 20
```

| Variabel | Keterangan                          |
| -------- | ----------------------------------- |
| `n`      | Nomor urut soal saat ini (1-based)  |
| `N`      | Total jumlah soal dalam permainan   |

**Contoh:**
- Ronde 1 dari 20 soal: `5 + (1/20) * 20 = 6` damage
- Ronde 10 dari 20 soal: `5 + (10/20) * 20 = 15` damage
- Ronde 20 dari 20 soal: `5 + (20/20) * 20 = 25` damage

> **Konstanta:** `ROUND_DAMAGE_MIN = 5`, `ROUND_DAMAGE_SCALE = 20`

### 1.2 Aturan Pemberian Damage

| Skenario                           | Akibat                                                   |
| ---------------------------------- | -------------------------------------------------------- |
| Kedua pemain benar                 | Pemain **tercepat** memberikan damage ke lawan            |
| Satu benar, satu salah             | Pemain **benar** memberikan damage ke lawan               |
| Keduanya salah                     | **Keduanya** menerima damage                             |
| Tidak menjawab (timeout)           | Pemain **menerima damage**                               |

### 1.3 Attack Buff (Ability ID: 2)

Jika pemain memiliki buff **Attack** aktif saat menjawab benar dan menjadi yang tercepat, damage yang diberikan ke semua lawan bertambah **+10**.

```
Damage_akhir = Damage_dasar + 10
```

**Sumber:** StarBox — "Kitab Pengetahuan"

### 1.4 Shield Buff (Ability ID: 4)

Buff **Shield** mengurangi damage yang diterima sebesar **-20**, baik dari lawan maupun damage diri sendiri (salah jawab / timeout).

```
Damage_diterima = max(0, Damage_dasar - 20)
```

**Sumber:** StarBox — "Perisai Kokoh"

---

## 2. Trophy & Coin (Hadiah Akhir Permainan)

### 2.1 Faktor Efisiensi (Ef)

Efisiensi memberikan bonus reward jika permainan memiliki total ronde lebih dari 15.

```
Ef = 1 + max(0, totalRonde - 15) * 0.01
```

| Total Ronde | Ef  |
| ----------- | --- |
| ≤ 15        | 1.0 |
| 20          | 1.05 |
| 40          | 1.25 |

### 2.2 Mode Solo

```
Koin  = (jumlah_menang * 15) + (jumlah_kalah * 5)
Trofi = max(0, (jumlah_menang * 1.2) - (jumlah_kalah * 0.5))
```

### 2.3 Mode Multiplayer

#### Formula Koin

```
BaseCoin = 200 + (600 * (totalPemain - peringkat)) / max(1, totalPemain - 1)
Koin_akhir = round(BaseCoin * Ef)
```

| Variabel          | Keterangan                                |
| ----------------- | ----------------------------------------- |
| `peringkat`       | Posisi akhir pemain (1 = juara)           |
| `totalPemain`     | Jumlah pemain dalam permainan             |

**Contoh** (15 ronde, 10 pemain):
- Peringkat 1: `200 + (600 * 9/9) = 800` koin
- Peringkat 5: `200 + (600 * 5/9) = 533` koin
- Peringkat 10: `200 + (600 * 0/9) = 200` koin

#### Formula Trofi

```
boundary     = floor(totalPemain / 2)
dynamicScale = max(2, 10 - floor(totalPemain / 5))

Jika peringkat <= boundary:
    TrophyBase = 20 + (boundary - peringkat) * dynamicScale
Jika peringkat > boundary:
    TrophyBase = -(15 + (peringkat - boundary - 1) * dynamicScale)

Trofi_akhir = round(TrophyBase * Ef)
```

**Contoh** (10 pemain, boundary = 5, dynamicScale = max(2, 10-2) = 8):
- Peringkat 1: `20 + (5-1)*8 = 52` trofi
- Peringkat 5: `20 + (5-5)*8 = 20` trofi
- Peringkat 6: `-(15 + (6-5-1)*8) = -15` trofi
- Peringkat 10: `-(15 + (10-5-1)*8) = -47` trofi

### 2.4 Penerapan Boost Trophy & Koin

Boost didapat dari ability StarBox:

| Ability                    | ID | Efek                        |
| -------------------------- | -- | --------------------------- |
| Piala Kejayaan (Trophy)    | 5  | +5% trofi per stok          |
| Kantong Harta (Coin)       | 6  | +5% koin per stok           |

Jika base bernilai **positif** (menang trofi):

```
Final = round(Base * (1 + boost / 100))
```

Jika base bernilai **negatif** (kehilangan trofi):

```
Final = round(Base + abs(Base * boost / 100))
```

Boost mengurangi jumlah trofi yang hilang, tetapi tidak menambah.

### 2.5 Update Stats Pengguna

Saat permainan selesai, data pengguna diupdate dengan:

```
total_trophy      += trophy_won
coin              += coins_earned
total_match       += 1
total_rank_1      += (placement === 1 ? 1 : 0)
placement_ratio   += (placement / total_players)
```

Statistik turunan:

```
winrate        = (total_rank_1 / total_match) * 100
average_rank   = (placement_ratio / total_match) * 100
```

---

## 3. StarBox (Sistem Comeback)

### 3.1 Trigger

StarBox muncul setiap **5 ronde** sekali (`round % 5 === 0`).

### 3.2 Prioritas Pemilihan

Pemain dengan **HP terendah** mendapatkan prioritas memilih power-up terlebih dahulu.

### 3.3 Daftar Power-Up

| Power-Up              | ID | Efek                                               |
| --------------------- | -- | -------------------------------------------------- |
| Kitab Pengetahuan     | 2  | **Attack:** +10 damage ke lawan selama 3 ronde     |
| Ramuan Penyembuh      | 3  | **Heal:** Memulihkan 30 HP                         |
| Perisai Kokoh         | 4  | **Shield:** Blokir 50% damage (20 poin) 2 ronde    |
| Piala Kejayaan        | 5  | **Trophy Boost:** +5% trofi per stok               |
| Kantong Harta         | 6  | **Coin Boost:** +5% koin per stok                  |

---

## 4. Battle Room (Sistem 1v1 / 1v1v1)

### 4.1 Alur Battle Room

1. **Fase 1 — Tampil Soal:** Timer 10 detik dimulai
2. **Fase 2 — Submit Jawaban:** Pemain menjawab
3. **Fase 3 — Pertarungan:**
   - Jawaban pertama yang **benar** = pemenang ronde
   - Pemenang memberikan damage ke lawan di battle room yang sama
   - Yang kalah / salah menerima damage
4. **Fase 4 — Finalisasi:**
   - Semua battle room selesai → lanjut ke ronde berikutnya
   - Cek kondisi game over

### 4.2 Kondisi Game Over

Permainan berakhir ketika hanya tersisa **1 pemain** (atau semua pemain sudah tidak memiliki HP).

---

## 5. Bot (Solo Mode)

| Properti         | Nilai                      |
| ---------------- | -------------------------- |
| ID               | `prof-bubu`                |
| Nama             | Prof. Bubu                 |
| Kesulitan        | Adaptive (menyesuaikan)    |
| Waktu Respon     | Random antara 3-7 detik    |

---

## Referensi Kode

| File                    | Lokasi                                           |
| ----------------------- | ------------------------------------------------ |
| Konstanta Game          | `lib/game/gameConstants.ts`                      |
| Kalkulator Reward       | `lib/game/rewardCalculator.ts`                   |
| Manajemen Damage (lama) | `modules/gamePlayers/gamePlayers.service.ts`     |
| Manajemen Damage (baru) | `services/roundManagementService.ts`             |
| Manajemen Akhir Game    | `modules/games/game.service.ts`                  |
| Reward di Repository    | `modules/gamePlayers/gamePlayers.repository.ts`  |
