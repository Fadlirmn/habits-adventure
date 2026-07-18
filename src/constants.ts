import type { Quest, ShopItem, KanjiItem } from './types';

export const DEFAULT_QUESTS: Quest[] = [
  // Fase 1
  {
    id: 'sys-f1-pagi',
    title: 'Kanji & Radikal Baru serta Peninjauan Ulang',
    duration: '30 Menit',
    time_of_day: 'Pagi',
    phase: 'Fase 1',
    tools: 'WaniKani (Target: Level 1-5)',
    details: 'Mempelajari 5-10 kanji baru per hari menggunakan cerita asosiasi radikal.',
    is_custom: false
  },
  {
    id: 'sys-f1-siang',
    title: 'Pembiasaan Auditori Pasif Pasca-Kana',
    duration: '30 Menit',
    time_of_day: 'Siang',
    phase: 'Fase 1',
    tools: 'YouTube (Japanese with Shun / Slow Japanese)',
    details: 'Mendengarkan klip audio tanpa teks untuk melatih pengenalan batas kata fonetis.',
    is_custom: false
  },
  {
    id: 'sys-f1-malam',
    title: 'Studi Tata Bahasa Terstruktur & Latihan Penulisan',
    duration: '90 Menit',
    time_of_day: 'Malam',
    phase: 'Fase 1',
    tools: 'LingoDeer / Jepang.org (Dasar Bunpou)',
    details: 'Mempelajari satu poin tata bahasa baru dan membuat 3 kalimat kustom.',
    is_custom: false
  },

  // Fase 2
  {
    id: 'sys-f2-pagi',
    title: 'Ekspansi Kanji & Tinjauan Kosakata Harian',
    duration: '45 Menit',
    time_of_day: 'Pagi',
    phase: 'Fase 2',
    tools: 'WaniKani (Target: Level 6-12)',
    details: 'Melakukan review kartu lama sebelum mempelajari 8-12 kosakata baru.',
    is_custom: false
  },
  {
    id: 'sys-f2-siang',
    title: 'Pengkondisian Pendengaran Aktif-Pasif',
    duration: '45 Menit',
    time_of_day: 'Siang',
    phase: 'Fase 2',
    tools: 'Podcast Nihongo con Teppei for Beginners',
    details: 'Mendengarkan monolog pendek dan menangkap partikel penanda.',
    is_custom: false
  },
  {
    id: 'sys-f2-malam',
    title: 'Asimilasi Tata Bahasa N4 & Analisis Kalimat',
    duration: '90 Menit',
    time_of_day: 'Malam',
    phase: 'Fase 2',
    tools: 'Bunpro N4 & YouTube (Genki ToKini Andy)',
    details: 'Mempelajari 2 pola kalimat baru dan menjawab kuis interaktif.',
    is_custom: false
  },

  // Fase 3
  {
    id: 'sys-f3-pagi',
    title: 'Konsolidasi Kanji Menengah Atas & Leksikal',
    duration: '45 Menit',
    time_of_day: 'Pagi',
    phase: 'Fase 3',
    tools: 'WaniKani (Target: Level 13-22)',
    details: 'Menjaga kestabilan streak dan memprioritaskan bacaan kanji majemuk (onyomi).',
    is_custom: false
  },
  {
    id: 'sys-f3-siang',
    title: 'Sinkronisasi Pendengaran Tingkat Menengah',
    duration: '45 Menit',
    time_of_day: 'Siang',
    phase: 'Fase 3',
    tools: 'Podcast Bite Sized Japanese / Sayuri Saying',
    details: 'Mendengarkan monolog natural dengan transkrip untuk konfirmasi kata.',
    is_custom: false
  },
  {
    id: 'sys-f3-malam',
    title: 'Imersi Aktif & Analisis Teks Naratif',
    duration: '120 Menit',
    time_of_day: 'Malam',
    phase: 'Fase 3',
    tools: 'Netflix/YouTube + Migaku / Satori Reader',
    details: 'Menonton 1 episode dengan teks Jepang & membedah 2 cerita pendek.',
    is_custom: false
  },

  // Fase 4
  {
    id: 'sys-f4-pagi',
    title: 'Penguasaan Kanji & Kosakata Kompleks N2',
    duration: '60 Menit',
    time_of_day: 'Pagi',
    phase: 'Fase 4',
    tools: 'Anki (Dek Core 6k) & WaniKani (Level 23-35)',
    details: 'Pembelajaran cepat kosakata abstrak dan fokus pada perbedaan kata sinonim.',
    is_custom: false
  },
  {
    id: 'sys-f4-siang',
    title: 'Imersi Auditoris Tingkat Tinggi',
    duration: '60 Menit',
    time_of_day: 'Siang',
    phase: 'Fase 4',
    tools: 'Podcast YUYU Nihongo / 4989 American Life',
    details: 'Mendengarkan diskusi topik kompleks dengan kecepatan asli tanpa visual.',
    is_custom: false
  },
  {
    id: 'sys-f4-malam',
    title: 'Studi Dokkai (Membaca) Berita & Tata Bahasa',
    duration: '120 Menit',
    time_of_day: 'Malam',
    phase: 'Fase 4',
    tools: 'Todaii Easy Japanese / Bunpro N2',
    details: 'Membaca 3 artikel berita dengan teknik pemindaian struktural (skimming).',
    is_custom: false
  },

  // Fase 5
  {
    id: 'sys-f5-pagi',
    title: 'Pemantapan Kosakata & Kanji Lemah',
    duration: '60 Menit',
    time_of_day: 'Pagi',
    phase: 'Fase 5',
    tools: 'Dek Anki Pribadi (Kesalahan Simulasi)',
    details: 'Meninjau khusus pada kata-kata yang sering salah dijawab saat simulasi.',
    is_custom: false
  },
  {
    id: 'sys-f5-siang',
    title: 'Pemantapan Pendengaran Format Ujian',
    duration: '60 Menit',
    time_of_day: 'Siang',
    phase: 'Fase 5',
    tools: 'Aplikasi Star JLPT / YouTube Choukai Practice',
    details: 'Melatih taktik mencatat informasi kunci (note-taking) secara instan.',
    is_custom: false
  },
  {
    id: 'sys-f5-malam',
    title: 'Pengerjaan Paket Soal Ujian Riil',
    duration: '120 Menit',
    time_of_day: 'Malam',
    phase: 'Fase 5',
    tools: 'Migii JLPT / Nihon GO! Practice Test',
    details: 'Menyelesaikan satu bundel soal tes riil dalam batas waktu ketat.',
    is_custom: false
  },

  // Alternatif
  {
    id: 'sys-alt-kanji',
    title: 'Kanji',
    duration: '15 Menit',
    time_of_day: 'Bebas',
    phase: 'Alternatif',
    tools: 'WaniKani',
    details: 'Mempelajari dan melatih Kanji harian.',
    is_custom: false
  },
  {
    id: 'sys-alt-kosakata',
    title: 'Kosakata',
    duration: '20 Menit',
    time_of_day: 'Bebas',
    phase: 'Alternatif',
    tools: 'Anki / MochiVocab',
    details: 'Melatih ingatan kosakata baru dan mengulang kosakata lama.',
    is_custom: false
  },
  {
    id: 'sys-alt-tatabahasa',
    title: 'Tata Bahasa',
    duration: '20 Menit',
    time_of_day: 'Bebas',
    phase: 'Alternatif',
    tools: 'Bunpro / Tae Kim',
    details: 'Mempelajari tata bahasa baru dan meninjau pemahaman kalimat.',
    is_custom: false
  },
  {
    id: 'sys-alt-dengar',
    title: 'Mendengarkan / Shadowing',
    duration: '15 Menit',
    time_of_day: 'Bebas',
    phase: 'Alternatif',
    tools: 'Podcast',
    details: 'Mendengarkan podcast bahasa Jepang aktif sambil menirukan pengucapan (shadowing).',
    is_custom: false
  },
  {
    id: 'sys-alt-tulis',
    title: 'Latihan Menulis atau Mengetik',
    duration: '5 Menit',
    time_of_day: 'Bebas',
    phase: 'Alternatif',
    tools: 'Buku Catatan / Keyboard Jepang',
    details: 'Menulis jurnal singkat atau melatih kecepatan mengetik hiragana/katakana/kanji.',
    is_custom: false
  }
];

export const PHASE_LABELS = {
  'Fase 1': 'Fase 1 (Bulan 1 - 2): Peletakan Fondasi N5',
  'Fase 2': 'Fase 2 (Bulan 3 - 5): Akselerasi N4',
  'Fase 3': 'Fase 3 (Bulan 6 - 8): Transisi Menengah N3',
  'Fase 4': 'Fase 4 (Bulan 9 - 10): Penetrasi N2',
  'Fase 5': 'Fase 5 (Bulan 11 - 12): Simulasi & Otomatisasi',
  'Alternatif': 'Alternatif: Rutinitas Harian Ringkas (75 Menit)'
};

// RPG static assets and configurations
export const DEFAULT_AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuAbQuzn1JFpBsgZKibxmiLzyhBkwSMb3xvl66KK66V7rFKUFhmPg4IqjaDosBRlOIxj7nmRpp0Jne8fNjZY-JqiHQznwiDfEQY7IZv91eyvzoYlo5Z7CflmtseaBzOyJySWQsxL6ufftv_Ve-csi62H7Y07eFFVS901KLgVoKjFLHnzVFMq-aDFQ0w7oY7qnlxvY8Z9Lqhi8x-BjgjTEmKSL3HpbILGUP_3e_V1hEkrBV0FAmwSuFk3uIWxU-AyG_ae_M55g-x_fuM";

export const SENSEI_AVATAR_URL = "https://api.dicebear.com/7.x/pixel-art/svg?seed=Kenji";

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'hp_potion', name: 'Ramuan HP', price: 40, desc: 'Memulihkan 30 Health Points.', icon: 'local_hospital', type: 'hp', amount: 30 },
  { id: 'mp_potion', name: 'Ramuan Mana', price: 40, desc: 'Memulihkan 30 Mana Points.', icon: 'bolt', type: 'mp', amount: 30 },
  { id: 'xp_elixir', name: 'Elixir XP', price: 120, desc: 'Mendapatkan +200 XP secara instan.', icon: 'star', type: 'xp', amount: 200 },
  { id: 'kanji_scroll', name: 'Mantra Kanji', price: 180, desc: 'Membuka 1 Kanji N3/N2 acak di Tas.', icon: 'menu_book', type: 'kanji', amount: 1 }
];

export const KANJI_POOL: KanjiItem[] = [
  { char: '語', onyomi: 'GO', kunyomi: 'kata(ru)', meaning: 'Bahasa / Berkata' },
  { char: '強', onyomi: 'KYOU, GOU', kunyomi: 'tsuyo(i)', meaning: 'Kuat / Memaksa' },
  { char: '勉', onyomi: 'BEN', kunyomi: 'tsuto(meru)', meaning: 'Berusaha / Rajin' },
  { char: '記', onyomi: 'KI', kunyomi: 'shiru(su)', meaning: 'Mencatat / Rekam' },
  { char: '法', onyomi: 'HOU, HATSU', kunyomi: 'nori', meaning: 'Aturan / Hukum / Metode' },
  { char: '読', onyomi: 'DOKU', kunyomi: 'yo(mu)', meaning: 'Membaca' },
  { char: '聞', onyomi: 'BUN, MON', kunyomi: 'ki(ku)', meaning: 'Mendengar / Bertanya' },
  { char: '書', onyomi: 'SHO', kunyomi: 'ka(ku)', meaning: 'Menulis / Buku' },
  { char: '練', onyomi: 'REN', kunyomi: 'ne(ru)', meaning: 'Latihan / Melatih' },
  { char: '習', onyomi: 'SHUU', kunyomi: 'nara(u)', meaning: 'Belajar / Kebiasaan' },
  { char: '漢', onyomi: 'KAN', kunyomi: 'otoko', meaning: 'Cina / Karakter Kanji' },
  { char: '字', onyomi: 'JI', kunyomi: 'aza', meaning: 'Karakter / Huruf' }
];

