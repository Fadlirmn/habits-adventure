import type { Quest, ShopItem, KanjiItem } from './types';

export const DEFAULT_QUESTS: Quest[] = [
  // Fase 1: Kesehatan & Hidrasi
  {
    id: 'sys-f1-pagi',
    title: 'Hidrasi Pagi (Minum Air Putih)',
    duration: '5 Menit',
    time_of_day: 'Pagi',
    phase: 'Fase 1',
    tools: 'Gelas / Botol Air',
    details: 'Minum 500ml air putih hangat sesaat setelah bangun tidur untuk merehidrasi tubuh.',
    is_custom: false
  },
  {
    id: 'sys-f1-siang',
    title: 'Peregangan & Jalan Kaki Ringan',
    duration: '20 Menit',
    time_of_day: 'Siang',
    phase: 'Fase 1',
    tools: 'Sepatu Nyaman',
    details: 'Berjalan kaki di luar ruangan untuk melancarkan sirkulasi darah dan mendapat vitamin D.',
    is_custom: false
  },
  {
    id: 'sys-f1-malam',
    title: 'Merapikan Kamar & Ruang Kerja',
    duration: '15 Menit',
    time_of_day: 'Malam',
    phase: 'Fase 1',
    tools: 'Alat Kebersihan',
    details: 'Merapikan meja kerja dan merapikan kamar untuk kualitas tidur terbaik.',
    is_custom: false
  },

  // Fase 2: Produktivitas & Belajar
  {
    id: 'sys-f2-pagi',
    title: 'Perencanaan Target & Prioritas Hari Ini',
    duration: '10 Menit',
    time_of_day: 'Pagi',
    phase: 'Fase 2',
    tools: 'Buku Catatan / To-Do App',
    details: 'Menentukan 3 tugas terpenting (MIT) yang wajib diselesaikan hari ini.',
    is_custom: false
  },
  {
    id: 'sys-f2-siang',
    title: 'Deep Work Session (Fokus Penuh)',
    duration: '60 Menit',
    time_of_day: 'Siang',
    phase: 'Fase 2',
    tools: 'Timer Pomodoro / Laptop',
    details: 'Bekerja atau belajar tanpa gangguan handphone/media sosial untuk produktivitas maksimal.',
    is_custom: false
  },
  {
    id: 'sys-f2-malam',
    title: 'Membaca Buku Non-Fiksi',
    duration: '30 Menit',
    time_of_day: 'Malam',
    phase: 'Fase 2',
    tools: 'Buku Fisik / E-Reader',
    details: 'Membaca minimal 10 halaman buku pengembangan diri atau ilmu pengetahuan baru.',
    is_custom: false
  },

  // Fase 3: Olahraga & Kebugaran
  {
    id: 'sys-f3-pagi',
    title: 'Sesi Peregangan Tubuh (Stretching)',
    duration: '10 Menit',
    time_of_day: 'Pagi',
    phase: 'Fase 3',
    tools: 'Matras Yoga',
    details: 'Melakukan peregangan tubuh secara dinamis untuk memperlancar sirkulasi darah pagi hari.',
    is_custom: false
  },
  {
    id: 'sys-f3-siang',
    title: 'Olahraga Intensitas Sedang',
    duration: '45 Menit',
    time_of_day: 'Siang',
    phase: 'Fase 3',
    tools: 'Sepatu Olahraga / Dumbbell',
    details: 'Melakukan latihan kekuatan (push-up, squat) atau kardio untuk membakar kalori.',
    is_custom: false
  },
  {
    id: 'sys-f3-malam',
    title: 'Mandi Air Hangat & Relaksasi Otot',
    duration: '20 Menit',
    time_of_day: 'Malam',
    phase: 'Fase 3',
    tools: 'Shower / Sabun Aroma Terapi',
    details: 'Mandi air hangat untuk merelaksasikan otot-otot yang tegang setelah seharian beraktivitas.',
    is_custom: false
  },

  // Fase 4: Refleksi & Mental Health
  {
    id: 'sys-f4-pagi',
    title: 'Meditasi / Latihan Pernapasan',
    duration: '10 Menit',
    time_of_day: 'Pagi',
    phase: 'Fase 4',
    tools: 'Tempat Tenang / Timer',
    details: 'Melakukan pernapasan dalam (box breathing) untuk memenangkan pikiran sebelum mulai bekerja.',
    is_custom: false
  },
  {
    id: 'sys-f4-siang',
    title: 'Digital Detox Saat Istirahat',
    duration: '60 Menit',
    time_of_day: 'Siang',
    phase: 'Fase 4',
    tools: 'Mode Jangan Ganggu (DND)',
    details: 'Mematikan semua notifikasi HP saat jam istirahat siang untuk mengurangi kecemasan digital.',
    is_custom: false
  },
  {
    id: 'sys-f4-malam',
    title: 'Jurnal Syukur & Evaluasi Harian',
    duration: '15 Menit',
    time_of_day: 'Malam',
    phase: 'Fase 4',
    tools: 'Jurnal / Pulpen',
    details: 'Menuliskan 3 hal baik yang terjadi hari ini dan mengevaluasi pencapaian harian.',
    is_custom: false
  },

  // Fase 5: Hobi & Kreativitas
  {
    id: 'sys-f5-pagi',
    title: 'Latihan Keterampilan Baru',
    duration: '30 Menit',
    time_of_day: 'Pagi',
    phase: 'Fase 5',
    tools: 'Kursus Online / Sandbox Coding',
    details: 'Belajar skill baru secara konsisten seperti pemrograman, bahasa baru, atau seni.',
    is_custom: false
  },
  {
    id: 'sys-f5-siang',
    title: 'Mendengarkan Podcast Edukatif',
    duration: '30 Menit',
    time_of_day: 'Siang',
    phase: 'Fase 5',
    tools: 'Spotify / YouTube',
    details: 'Mendengarkan bahasan menarik seputar finansial, sains, atau sejarah saat istirahat siang.',
    is_custom: false
  },
  {
    id: 'sys-f5-malam',
    title: 'Eksperimen Projek Sampingan Kreatif',
    duration: '60 Menit',
    time_of_day: 'Malam',
    phase: 'Fase 5',
    tools: 'VS Code / Desain Tool / Canvas',
    details: 'Meluangkan waktu untuk mengerjakan projek sampingan (side project) kreatif pribadi.',
    is_custom: false
  },

  // Alternatif
  {
    id: 'sys-alt-air',
    title: 'Minum Air 2 Liter Harian',
    duration: '5 Menit',
    time_of_day: 'Bebas',
    phase: 'Alternatif',
    tools: 'Tumblr Air 2L',
    details: 'Memastikan konsumsi air minum harian tercapai minimal 2 liter.',
    is_custom: false
  },
  {
    id: 'sys-alt-bed',
    title: 'Merapikan Tempat Tidur',
    duration: '5 Menit',
    time_of_day: 'Bebas',
    phase: 'Alternatif',
    tools: 'Tangan Sendiri',
    details: 'Merapikan sprei, bantal, dan selimut segera setelah bangun tidur pagi.',
    is_custom: false
  },
  {
    id: 'sys-alt-read',
    title: 'Membaca Artikel Menarik',
    duration: '15 Menit',
    time_of_day: 'Bebas',
    phase: 'Alternatif',
    tools: 'Browser / Medium',
    details: 'Membaca satu artikel edukatif atau berita teknologi terbaru.',
    is_custom: false
  },
  {
    id: 'sys-alt-walk',
    title: 'Jalan Santai Sore Hari',
    duration: '15 Menit',
    time_of_day: 'Bebas',
    phase: 'Alternatif',
    tools: 'Taman / Kompleks Rumah',
    details: 'Berjalan santai 1000 langkah di sore hari untuk melepas penat.',
    is_custom: false
  },
  {
    id: 'sys-alt-sleep',
    title: 'Mempersiapkan Tidur Berkualitas',
    duration: '10 Menit',
    time_of_day: 'Bebas',
    phase: 'Alternatif',
    tools: 'Kamar Tidur Nyaman',
    details: 'Mematikan layar gawai 30 menit sebelum tidur dan meredupkan lampu.',
    is_custom: false
  }
];

export const PHASE_LABELS = {
  'Fase 1': 'Fase 1: Kesehatan & Hidrasi',
  'Fase 2': 'Fase 2: Produktivitas & Belajar',
  'Fase 3': 'Fase 3: Olahraga & Kebugaran',
  'Fase 4': 'Fase 4: Refleksi & Mental Health',
  'Fase 5': 'Fase 5: Hobi & Kreativitas',
  'Alternatif': 'Alternatif: Rutinitas Harian Ringkas'
};

// RPG static assets and configurations
export const DEFAULT_AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuAbQuzn1JFpBsgZKibxmiLzyhBkwSMb3xvl66KK66V7rFKUFhmPg4IqjaDosBRlOIxj7nmRpp0Jne8fNjZY-JqiHQznwiDfEQY7IZv91eyvzoYlo5Z7CflmtseaBzOyJySWQsxL6ufftv_Ve-csi62H7Y07eFFVS901KLgVoKjFLHnzVFMq-aDFQ0w7oY7qnlxvY8Z9Lqhi8x-BjgjTEmKSL3HpbILGUP_3e_V1hEkrBV0FAmwSuFk3uIWxU-AyG_ae_M55g-x_fuM";

export const SENSEI_AVATAR_URL = "https://api.dicebear.com/7.x/pixel-art/svg?seed=Kenji";

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'hp_potion', name: 'Ramuan HP', price: 40, desc: 'Memulihkan 30 Health Points.', icon: 'local_hospital', type: 'hp', amount: 30 },
  { id: 'mp_potion', name: 'Ramuan Mana', price: 40, desc: 'Memulihkan 30 Mana Points.', icon: 'bolt', type: 'mp', amount: 30 },
  { id: 'xp_elixir', name: 'Elixir XP', price: 120, desc: 'Mendapatkan +200 XP secara instan.', icon: 'star', type: 'xp', amount: 200 },
  { id: 'kanji_scroll', name: 'Rune Sihir Kuno', price: 180, desc: 'Membuka 1 Rune Sihir Kuno acak di Tas.', icon: 'menu_book', type: 'kanji', amount: 1 }
];

export const KANJI_POOL: KanjiItem[] = [
  { char: '力', onyomi: 'RYOKU, RIKI', kunyomi: 'chikara', meaning: 'Kekuatan / Power' },
  { char: '水', onyomi: 'SUI', kunyomi: 'mizu', meaning: 'Air / Water' },
  { char: '火', onyomi: 'KA', kunyomi: 'hi', meaning: 'Api / Fire' },
  { char: '風', onyomi: 'FUU', kunyomi: 'kaze', meaning: 'Angin / Wind' },
  { char: '土', onyomi: 'TO, DO', kunyomi: 'tsuchi', meaning: 'Tanah / Earth' },
  { char: '雷', onyomi: 'RAI', kunyomi: 'kaminari', meaning: 'Petir / Thunder' },
  { char: '光', onyomi: 'KOU', kunyomi: 'hika(ru)', meaning: 'Cahaya / Light' },
  { char: '闇', onyomi: 'AN', kunyomi: 'yami', meaning: 'Kegelapan / Darkness' },
  { char: '心', onyomi: 'SHIN', kunyomi: 'kokoro', meaning: 'Pikiran / Heart' },
  { char: '生', onyomi: 'SEI, SHOU', kunyomi: 'i(kiru)', meaning: 'Kehidupan / Life' },
  { char: '死', onyomi: 'SHI', kunyomi: 'shi(nu)', meaning: 'Kematian / Death' },
  { char: '空', onyomi: 'KUU', kunyomi: 'sora', meaning: 'Langit / Void / Space' }
];
