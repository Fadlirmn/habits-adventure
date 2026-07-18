export interface Quest {
  id: string;
  title: string;
  duration: string;
  time_of_day: 'Pagi' | 'Siang' | 'Malam' | 'Bebas';
  phase: 'Fase 1' | 'Fase 2' | 'Fase 3' | 'Fase 4' | 'Fase 5' | 'Alternatif';
  tools: string;
  details: string;
  is_custom: boolean;
  xp_reward?: number;
  gold_reward?: number;
  rank?: 'S' | 'A' | 'B' | 'C' | 'D';
  created_at?: string;
}

export interface QuestCompletion {
  id?: string;
  quest_id: string;
  completed_date: string; // YYYY-MM-DD
  completed_at?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  desc: string;
  icon: string;
  type: 'hp' | 'mp' | 'xp' | 'kanji';
  amount: number;
}

export interface KanjiItem {
  char: string;
  onyomi: string;
  kunyomi: string;
  meaning: string;
}

