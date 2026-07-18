import React, { useState, useEffect } from 'react';
import type { Quest, QuestCompletion, ShopItem } from './types';
import { 
  DEFAULT_QUESTS, 
  SHOP_ITEMS, 
  KANJI_POOL, 
  DEFAULT_AVATAR_URL, 
  SENSEI_AVATAR_URL 
} from './constants';
import { 
  getSupabaseConfig, 
  getSupabaseClient, 
  saveSupabaseConfig
} from './supabaseClient';
import type { SupabaseConfig } from './supabaseClient';

// Helper for generating UUIDs locally
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Get today's local date string as YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Generate list of last N days
const getLastNDays = (n: number) => {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    // Label as short day name, e.g. "Sen", "Sel", "Rab"
    const label = d.toLocaleDateString('id-ID', { weekday: 'short' });
    const dateNum = d.getDate();
    
    days.push({
      dateStr: `${year}-${month}-${day}`,
      dayLabel: label,
      dateNum: dateNum,
      isToday: i === 0
    });
  }
  return days;
};

// Helper to assign RPG values to raw Quests
const enrichQuest = (q: Quest): Quest => {
  if (q.xp_reward && q.gold_reward && q.rank) return q;
  let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'C';
  let xp = 50;
  let gold = 30;
  
  const durVal = parseInt(q.duration) || 0;
  const isTryOut = q.title.toLowerCase().includes('try out') || q.details.toLowerCase().includes('try out');
  const isAlternate = q.phase === 'Alternatif';
  
  if (isTryOut || durVal >= 60) {
    rank = 'S';
    xp = 150;
    gold = 100;
  } else if (durVal >= 30) {
    rank = 'A';
    xp = 100;
    gold = 70;
  } else if (durVal >= 20 || isAlternate) {
    rank = 'B';
    xp = 75;
    gold = 50;
  } else if (durVal >= 10) {
    rank = 'C';
    xp = 50;
    gold = 30;
  } else {
    rank = 'D';
    xp = 30;
    gold = 15;
  }

  return {
    ...q,
    rank,
    xp_reward: xp,
    gold_reward: gold
  };
};

function App() {
  // Navigation & UI tabs
  const [activeTab, setActiveTab] = useState<'quest' | 'tas' | 'gilda' | 'toko'>('quest');

  // Authentication & Loading States
  const [user, setUser] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  // Core stats states (with LocalStorage initializers)
  const [hp, setHp] = useState<number>(() => {
    const v = localStorage.getItem('benkyou_rpg_hp');
    return v ? parseInt(v) : 100;
  });
  const [mp, setMp] = useState<number>(() => {
    const v = localStorage.getItem('benkyou_rpg_mp');
    return v ? parseInt(v) : 50;
  });
  const [xp, setXp] = useState<number>(() => {
    const v = localStorage.getItem('benkyou_rpg_xp');
    return v ? parseInt(v) : 0;
  });
  const [level, setLevel] = useState<number>(() => {
    const v = localStorage.getItem('benkyou_rpg_level');
    return v ? parseInt(v) : 1;
  });
  const [gold, setGold] = useState<number>(() => {
    const v = localStorage.getItem('benkyou_rpg_gold');
    return v ? parseInt(v) : 100;
  });
  const [inventory, setInventory] = useState<{ id: string; count: number }[]>(() => {
    const v = localStorage.getItem('benkyou_rpg_inventory');
    return v ? JSON.parse(v) : [];
  });
  const [unlockedKanji, setUnlockedKanji] = useState<string[]>(() => {
    const v = localStorage.getItem('benkyou_rpg_kanji');
    return v ? JSON.parse(v) : [];
  });

  // Base app states
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completions, setCompletions] = useState<QuestCompletion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<string>('Fase 1');
  const [dbConfig, setDbConfig] = useState<SupabaseConfig>({ url: '', key: '', isConfigured: false, source: 'none' });
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState<boolean>(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<string | null>(null);

  // Form states (Quest Add/Edit)
  const [qTitle, setQTitle] = useState<string>('');
  const [qDuration, setQDuration] = useState<string>('');
  const [qTimeOfDay, setQTimeOfDay] = useState<'Pagi' | 'Siang' | 'Malam' | 'Bebas'>('Bebas');
  const [qPhase, setQPhase] = useState<'Fase 1' | 'Fase 2' | 'Fase 3' | 'Fase 4' | 'Fase 5' | 'Alternatif'>('Fase 1');
  const [qTools, setQTools] = useState<string>('');
  const [qDetails, setQDetails] = useState<string>('');
  const [qRank, setQRank] = useState<'S' | 'A' | 'B' | 'C' | 'D'>('C');
  const [qXp, setQXp] = useState<number>(50);
  const [qGold, setQGold] = useState<number>(30);

  // Form states (Settings)
  const [sUrl, setSUrl] = useState<string>('');
  const [sKey, setSKey] = useState<string>('');

  // Notification state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Kanji Flip Card tracking
  const [flippedKanji, setFlippedKanji] = useState<string | null>(null);

  // 1. Debounced local saving and cloud saving of RPG Stats (Race-condition protected)
  useEffect(() => {
    localStorage.setItem('benkyou_rpg_hp', hp.toString());
    localStorage.setItem('benkyou_rpg_mp', mp.toString());
    localStorage.setItem('benkyou_rpg_xp', xp.toString());
    localStorage.setItem('benkyou_rpg_level', level.toString());
    localStorage.setItem('benkyou_rpg_gold', gold.toString());
    localStorage.setItem('benkyou_rpg_inventory', JSON.stringify(inventory));
    localStorage.setItem('benkyou_rpg_kanji', JSON.stringify(unlockedKanji));

    const syncTimeout = setTimeout(() => {
      if (user && !isProfileLoading) {
        syncProfileToCloud(hp, mp, xp, level, gold, inventory, unlockedKanji);
      }
    }, 1500);

    return () => clearTimeout(syncTimeout);
  }, [hp, mp, xp, level, gold, inventory, unlockedKanji, user, isProfileLoading]);

  const syncProfileToCloud = async (h: number, m: number, x: number, lvl: number, gld: number, invArr: any[], kanjiArr: any[]) => {
    const client = getSupabaseClient();
    if (!client || !user) return;
    try {
      await client
        .from('profiles')
        .update({
          hp: h,
          mp: m,
          xp: x,
          level: lvl,
          gold: gld,
          inventory: invArr,
          unlocked_kanji: kanjiArr,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
    } catch (err) {
      console.error('Error syncing profile to cloud:', err);
    }
  };

  // 2. Startup-only useEffect for Daily Lazy-Monster Damage Check
  useEffect(() => {
    const today = getTodayDateString();
    const lastActive = localStorage.getItem('benkyou_last_active_date');
    if (lastActive && lastActive !== today) {
      const lastDateObj = new Date(lastActive);
      const todayObj = new Date(today);
      const diffTime = Math.abs(todayObj.getTime() - lastDateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        const totalDamage = diffDays * 15;
        setHp(prev => {
          const nextHp = prev - totalDamage;
          if (nextHp <= 0) {
            setLevel(lvl => Math.max(1, lvl - 1));
            setGold(g => Math.floor(g * 0.5));
            showNotification(`GAME OVER! Kamu absen selama ${diffDays} hari. Level turun, Gold berkurang 50%.`, 'error');
            return 100;
          } else {
            showNotification(`Oh tidak! Kamu melewatkan ${diffDays} hari belajar. Terkena -${totalDamage} HP damage dari monster malas!`, 'error');
            return nextHp;
          }
        });
      }
    }
    localStorage.setItem('benkyou_last_active_date', today);
  }, []);

  // 3. Load DB config and listen to Auth Session
  useEffect(() => {
    const config = getSupabaseConfig();
    setDbConfig(config);
    setSUrl(config.url);
    setSKey(config.key);

    const savedPhase = localStorage.getItem('benkyou_current_phase');
    if (savedPhase) {
      setCurrentPhase(savedPhase);
    }

    const client = getSupabaseClient();
    if (client) {
      client.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
      });

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          loadFromLocalStorage();
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [dbConfig.isConfigured]);

  // Fetch data whenever user session or dbConfig updates
  useEffect(() => {
    fetchData();
  }, [dbConfig, user]);

  const fetchProfile = async (userId: string) => {
    const client = getSupabaseClient();
    if (!client) return;
    setIsProfileLoading(true);
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setHp(data.hp);
        setMp(data.mp);
        setXp(data.xp);
        setLevel(data.level);
        setGold(data.gold);
        setInventory(data.inventory || []);
        setUnlockedKanji(data.unlocked_kanji || []);
      } else {
        // Handle default profile configuration
        setHp(100);
        setMp(50);
        setXp(0);
        setLevel(1);
        setGold(100);
        setInventory([]);
        setUnlockedKanji([]);

        const newProf = {
          id: userId,
          hp: 100,
          mp: 50,
          xp: 0,
          level: 1,
          gold: 100,
          inventory: [],
          unlocked_kanji: []
        };
        await client.from('profiles').insert(newProf);
      }
    } catch (err) {
      console.error('Error fetching profile, resetting to local defaults:', err);
      loadFromLocalStorage();
    } finally {
      setIsProfileLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    const client = getSupabaseClient();

    if (client) {
      try {
        const { data: dbQuests, error: qError } = await client
          .from('quests')
          .select('*')
          .order('created_at', { ascending: true });

        if (qError) throw qError;

        let activeQuests = dbQuests || [];

        if (activeQuests.length === 0) {
          setSyncing(true);
          const enrichedDefaults = DEFAULT_QUESTS.map(enrichQuest).map(q => ({
            ...q,
            user_id: user ? user.id : null
          }));
          const { error: seedError } = await client
            .from('quests')
            .insert(enrichedDefaults);

          if (seedError) {
            console.error('Failed to seed Supabase database:', seedError);
            showNotification('Gagal mengisi database Supabase otomatis', 'error');
          } else {
            showNotification('Database Supabase berhasil di-seed otomatis!', 'success');
            const { data: reQuests } = await client.from('quests').select('*').order('created_at', { ascending: true });
            activeQuests = reQuests || enrichedDefaults;
          }
          setSyncing(false);
        }

        setQuests(activeQuests.map(enrichQuest));

        const { data: dbCompletions, error: cError } = await client
          .from('quest_completions')
          .select('*');

        if (cError) throw cError;
        setCompletions(dbCompletions || []);
        
      } catch (err: any) {
        console.error('Supabase query error, falling back to local storage:', err);
        showNotification('Gagal memuat dari Supabase. Menggunakan Local Storage.', 'error');
        loadFromLocalStorage();
      }
    } else {
      loadFromLocalStorage();
    }
    setLoading(false);
  };

  const loadFromLocalStorage = () => {
    const localQuestsStr = localStorage.getItem('benkyou_quests');
    let activeQuests = [];
    if (localQuestsStr) {
      try {
        activeQuests = JSON.parse(localQuestsStr);
      } catch {
        activeQuests = DEFAULT_QUESTS.map(enrichQuest);
        localStorage.setItem('benkyou_quests', JSON.stringify(activeQuests));
      }
    } else {
      activeQuests = DEFAULT_QUESTS.map(enrichQuest);
      localStorage.setItem('benkyou_quests', JSON.stringify(activeQuests));
    }
    setQuests(activeQuests.map(enrichQuest));

    const localCompletionsStr = localStorage.getItem('benkyou_completions');
    if (localCompletionsStr) {
      try {
        setCompletions(JSON.parse(localCompletionsStr));
      } catch {
        setCompletions([]);
      }
    } else {
      setCompletions([]);
    }
  };

  // Toggle completion of a quest
  const handleToggleQuest = async (questId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const today = getTodayDateString();
    const isCompleted = completions.some(c => c.quest_id === questId && c.completed_date === today);
    const client = getSupabaseClient();

    setSyncing(true);

    const targetQuest = quests.find(q => q.id === questId);
    const xpGained = targetQuest?.xp_reward || 50;
    const goldGained = targetQuest?.gold_reward || 30;

    if (isCompleted) {
      // Uncheck / Remove completion
      if (client) {
        try {
          const matchObj: any = { quest_id: questId, completed_date: today };
          if (user) matchObj.user_id = user.id;

          const { error } = await client
            .from('quest_completions')
            .delete()
            .match(matchObj);

          if (error) throw error;
          setCompletions(prev => prev.filter(c => !(c.quest_id === questId && c.completed_date === today)));
          
          setXp(prev => Math.max(0, prev - xpGained));
          setGold(prev => Math.max(0, prev - goldGained));
          setHp(prev => Math.max(0, prev - 5));

          showNotification('Quest ditandai belum selesai.', 'info');
        } catch (err) {
          console.error(err);
          showNotification('Gagal menyimpan ke Supabase', 'error');
        }
      } else {
        const newCompletions = completions.filter(c => !(c.quest_id === questId && c.completed_date === today));
        setCompletions(newCompletions);
        localStorage.setItem('benkyou_completions', JSON.stringify(newCompletions));

        setXp(prev => Math.max(0, prev - xpGained));
        setGold(prev => Math.max(0, prev - goldGained));
        setHp(prev => Math.max(0, prev - 5));

        showNotification('Quest ditandai belum selesai (Lokal).', 'info');
      }
    } else {
      // Check / Add completion
      const newCompletion: any = {
        quest_id: questId,
        completed_date: today
      };
      if (user) newCompletion.user_id = user.id;

      if (client) {
        try {
          const { data, error } = await client
            .from('quest_completions')
            .insert(newCompletion)
            .select();

          if (error) throw error;
          setCompletions(prev => [...prev, data[0]]);

          setXp(prev => {
            const nextXp = prev + xpGained;
            if (nextXp >= 1000) {
              setLevel(l => l + 1);
              setHp(100);
              setMp(m => Math.min(100, m + 50));
              setShowLevelUp(true);
              return nextXp - 1000;
            }
            return nextXp;
          });
          setGold(prev => prev + goldGained);
          setHp(prev => Math.min(100, prev + 5));

          showNotification(`Quest selesai! +${xpGained} XP, +${goldGained} Gold! 🎉`, 'success');
        } catch (err) {
          console.error(err);
          showNotification('Gagal menyimpan ke Supabase', 'error');
        }
      } else {
        const localCompletion = { ...newCompletion, id: generateUUID() };
        const newCompletions = [...completions, localCompletion];
        setCompletions(newCompletions);
        localStorage.setItem('benkyou_completions', JSON.stringify(newCompletions));

        setXp(prev => {
          const nextXp = prev + xpGained;
          if (nextXp >= 1000) {
            setLevel(l => l + 1);
            setHp(100);
            setMp(m => Math.min(100, m + 50));
            setShowLevelUp(true);
            return nextXp - 1000;
          }
          return nextXp;
        });
        setGold(prev => prev + goldGained);
        setHp(prev => Math.min(100, prev + 5));

        showNotification(`Quest selesai (Lokal)! +${xpGained} XP, +${goldGained} Gold! 🎉`, 'success');
      }
    }
    setSyncing(false);
  };

  // Add / Edit Quest Save Logic
  const handleSaveQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle || !qDuration) {
      showNotification('Judul dan Durasi wajib diisi!', 'error');
      return;
    }

    const client = getSupabaseClient();
    setSyncing(true);

    const questData: any = {
      title: qTitle.trim(),
      duration: qDuration.trim(),
      time_of_day: qTimeOfDay,
      phase: qPhase,
      tools: qTools.trim(),
      details: qDetails.trim(),
      is_custom: true,
      rank: qRank,
      xp_reward: qXp,
      gold_reward: qGold
    };
    if (user) questData.user_id = user.id;

    if (editingQuest) {
      // Update
      const updatedData = { ...editingQuest, ...questData } as Quest;
      if (client) {
        try {
          const { error } = await client
            .from('quests')
            .update(questData)
            .eq('id', editingQuest.id);

          if (error) throw error;
          setQuests(prev => prev.map(q => q.id === editingQuest.id ? updatedData : q));
          showNotification('Quest berhasil diperbarui!', 'success');
        } catch (err) {
          console.error(err);
          showNotification('Gagal memperbarui quest di Supabase', 'error');
        }
      } else {
        const updatedQuests = quests.map(q => q.id === editingQuest.id ? updatedData : q);
        setQuests(updatedQuests);
        localStorage.setItem('benkyou_quests', JSON.stringify(updatedQuests));
        showNotification('Quest diperbarui (Lokal)!', 'success');
      }
    } else {
      // Create
      const newQuest = { ...questData, id: generateUUID() } as Quest;
      if (client) {
        try {
          const { error } = await client
            .from('quests')
            .insert(newQuest);

          if (error) throw error;
          setQuests(prev => [...prev, newQuest]);
          showNotification('Quest Baru ditambahkan!', 'success');
        } catch (err) {
          console.error(err);
          showNotification('Gagal menambahkan quest ke Supabase', 'error');
        }
      } else {
        const updatedQuests = [...quests, newQuest];
        setQuests(updatedQuests);
        localStorage.setItem('benkyou_quests', JSON.stringify(updatedQuests));
        showNotification('Quest Baru ditambahkan (Lokal)!', 'success');
      }
    }

    setSyncing(false);
    setIsQuestModalOpen(false);
    setEditingQuest(null);
    resetQuestForm();
  };

  const handleEditQuestClick = (quest: Quest, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingQuest(quest);
    setQTitle(quest.title);
    setQDuration(quest.duration);
    setQTimeOfDay(quest.time_of_day);
    setQPhase(quest.phase);
    setQTools(quest.tools);
    setQDetails(quest.details);
    setQRank(quest.rank || 'C');
    setQXp(quest.xp_reward || 50);
    setQGold(quest.gold_reward || 30);
    setIsQuestModalOpen(true);
  };

  // Delete Quest Logic
  const handleDeleteQuest = async (questId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm('Apakah Anda yakin ingin menghapus quest ini?')) return;

    const client = getSupabaseClient();
    setSyncing(true);

    if (client) {
      try {
        const { error } = await client
          .from('quests')
          .delete()
          .eq('id', questId);

        if (error) throw error;
        setQuests(prev => prev.filter(q => q.id !== questId));
        setCompletions(prev => prev.filter(c => c.quest_id !== questId));
        showNotification('Quest berhasil dihapus!', 'info');
      } catch (err) {
        console.error(err);
        showNotification('Gagal menghapus quest dari Supabase', 'error');
      }
    } else {
      const updatedQuests = quests.filter(q => q.id !== questId);
      setQuests(updatedQuests);
      localStorage.setItem('benkyou_quests', JSON.stringify(updatedQuests));

      const updatedCompletions = completions.filter(c => c.quest_id !== questId);
      setCompletions(updatedCompletions);
      localStorage.setItem('benkyou_completions', JSON.stringify(updatedCompletions));

      showNotification('Quest dihapus (Lokal).', 'info');
    }
    setSyncing(false);
  };

  // Reset all study completions back to zero
  const handleResetData = async () => {
    if (!window.confirm('PERINGATAN: Ini akan menghapus seluruh progres quest harian Anda hari ini. Lanjutkan?')) return;
    const today = getTodayDateString();
    const client = getSupabaseClient();
    setSyncing(true);

    if (client) {
      try {
        const query: any = { completed_date: today };
        if (user) query.user_id = user.id;

        const { error } = await client
          .from('quest_completions')
          .delete()
          .match(query);

        if (error) throw error;
        setCompletions(prev => prev.filter(c => c.completed_date !== today));
        showNotification('Progres hari ini telah direset!', 'info');
      } catch (err) {
        console.error(err);
        showNotification('Gagal mereset di Supabase', 'error');
      }
    } else {
      const newCompletions = completions.filter(c => c.completed_date !== today);
      setCompletions(newCompletions);
      localStorage.setItem('benkyou_completions', JSON.stringify(newCompletions));
      showNotification('Progres hari ini direset (Lokal).', 'info');
    }
    setSyncing(false);
  };

  // Settings Save Logic
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(sUrl, sKey);
    const newConfig = getSupabaseConfig();
    setDbConfig(newConfig);
    setIsSettingsOpen(false);
    showNotification('Konfigurasi Supabase berhasil diperbarui!', 'success');
  };

  const handleClearSettings = () => {
    if (window.confirm('Hapus konfigurasi Supabase dan kembali ke Local Storage?')) {
      saveSupabaseConfig('', '');
      setSUrl('');
      setSKey('');
      const newConfig = getSupabaseConfig();
      setDbConfig(newConfig);
      setUser(null);
      setIsSettingsOpen(false);
      showNotification('Konfigurasi Supabase dihapus. Beralih ke Local Storage.', 'info');
    }
  };

  const resetQuestForm = () => {
    setQTitle('');
    setQDuration('');
    setQTimeOfDay('Bebas');
    setQPhase(currentPhase as any);
    setQTools('');
    setQDetails('');
    setQRank('C');
    setQXp(50);
    setQGold(30);
  };

  const handleOpenAddQuest = () => {
    setEditingQuest(null);
    resetQuestForm();
    setIsQuestModalOpen(true);
  };

  // RPG Logic: Shop Purchase
  const handleBuyItem = (item: ShopItem) => {
    if (gold < item.price) {
      showNotification('Gold tidak mencukupi untuk membeli item ini!', 'error');
      return;
    }

    setGold(prev => prev - item.price);
    
    setInventory(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], count: next[idx].count + 1 };
        return next;
      }
      return [...prev, { id: item.id, count: 1 }];
    });

    showNotification(`Berhasil membeli ${item.name}! Masuk ke Tas.`, 'success');
  };

  // RPG Logic: Use Item from Inventory
  const handleUseItem = (itemId: string) => {
    const itemSpec = SHOP_ITEMS.find(i => i.id === itemId);
    if (!itemSpec) return;

    if (itemSpec.type === 'hp') {
      setHp(prev => Math.min(100, prev + itemSpec.amount));
      showNotification(`Menggunakan ${itemSpec.name}. HP bertambah +${itemSpec.amount}!`, 'success');
    } else if (itemSpec.type === 'mp') {
      setMp(prev => Math.min(100, prev + itemSpec.amount));
      showNotification(`Menggunakan ${itemSpec.name}. MP bertambah +${itemSpec.amount}!`, 'success');
    } else if (itemSpec.type === 'xp') {
      setXp(prev => {
        const nextXp = prev + itemSpec.amount;
        if (nextXp >= 1000) {
          setLevel(l => l + 1);
          setHp(100);
          setMp(m => Math.min(100, m + 50));
          setShowLevelUp(true);
          return nextXp - 1000;
        }
        return nextXp;
      });
      showNotification(`Menggunakan ${itemSpec.name}. XP bertambah +${itemSpec.amount}!`, 'success');
    } else if (itemSpec.type === 'kanji') {
      const lockedKanji = KANJI_POOL.filter(k => !unlockedKanji.includes(k.char));
      if (lockedKanji.length === 0) {
        showNotification('Semua mantra Kanji telah dipelajari!', 'info');
        return;
      }
      const randomK = lockedKanji[Math.floor(Math.random() * lockedKanji.length)];
      setUnlockedKanji(prev => [...prev, randomK.char]);
      showNotification(`Mantra terbuka! Kamu mempelajari Kanji Baru: [ ${randomK.char} ]!`, 'success');
    }

    setInventory(prev => {
      return prev.map(i => {
        if (i.id === itemId) {
          return { ...i, count: i.count - 1 };
        }
        return i;
      }).filter(i => i.count > 0);
    });

    setSelectedInventoryItem(null);
  };

  // Google OAuth Login Trigger
  const handleGoogleLogin = async () => {
    const client = getSupabaseClient();
    if (!client) {
      showNotification('Hubungkan Supabase terlebih dahulu di Pengaturan!', 'error');
      return;
    }
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      showNotification(`Gagal masuk Google: ${err.message}`, 'error');
    }
  };

  // Logout Trigger
  const handleLogout = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.auth.signOut();
      setUser(null);
      showNotification('Berhasil keluar!', 'info');
    } catch (err) {
      console.error(err);
      showNotification('Gagal keluar', 'error');
    }
  };

  // Sensei Kenji dynamic dialogue messages
  const getSenseiDialogue = () => {
    if (hp < 30) return 'Darahmu menipis! Kunjungi Toko untuk membeli Ramuan HP sebelum kena Game Over!';
    if (mp < 20) return 'Energi belajarmu habis (MP rendah). Belilah Ramuan Mana di Toko untuk memulihkannya!';
    
    const today = getTodayDateString();
    const todayQuests = quests.filter(q => q.phase === currentPhase);
    const todayCompleted = todayQuests.filter(q => completions.some(c => c.quest_id === q.id && c.completed_date === today));
    
    if (todayQuests.length > 0 && todayCompleted.length === todayQuests.length) {
      return 'Luar biasa, Adventurer! Semua quest harian Fase ini sudah selesai. Kamu siap menempuh tantangan baru besok!';
    }
    
    return 'Selamat belajar, Adventurer! Selesaikan quest harianmu agar mendapatkan XP dan Gold melimpah.';
  };

  const activePhaseQuests = quests.filter(q => q.phase === currentPhase);

  const last14Days = getLastNDays(14);
  const streakDays = last14Days.map(day => {
    const dayQuests = quests.filter(q => q.phase === currentPhase);
    const dayCompleted = completions.filter(c => c.completed_date === day.dateStr);
    const isSuccess = dayQuests.length > 0 && dayCompleted.length >= Math.ceil(dayQuests.length * 0.5);
    return { ...day, isSuccess };
  });

  // Calculate current streak
  let currentStreak = 0;
  for (let i = last14Days.length - 1; i >= 0; i--) {
    const day = last14Days[i];
    const dayQuests = quests.filter(q => q.phase === currentPhase);
    const dayCompleted = completions.filter(c => c.completed_date === day.dateStr);
    const isSuccess = dayQuests.length > 0 && dayCompleted.length >= Math.ceil(dayQuests.length * 0.5);
    
    if (isSuccess) {
      currentStreak++;
    } else {
      if (day.isToday) continue;
      break;
    }
  }

  const morningQuests = activePhaseQuests.filter(q => q.time_of_day === 'Pagi');
  const afternoonQuests = activePhaseQuests.filter(q => q.time_of_day === 'Siang');
  const eveningQuests = activePhaseQuests.filter(q => q.time_of_day === 'Malam');
  const normalQuests = activePhaseQuests.filter(q => q.time_of_day === 'Bebas');

  return (
    <>
      {/* Toast Notification */}
      {notification && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1100,
            padding: '1rem 1.25rem',
            borderRadius: '0px',
            background: notification.type === 'success' ? '#113a1a' : notification.type === 'error' ? '#5a1111' : '#11253a',
            border: `2px solid ${notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ff4e4e' : '#ffd700'}`,
            color: '#fff',
            boxShadow: '4px 4px 0px 0px #000',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'levelUpPop 0.15s ease-out'
          }}
        >
          <span className="material-symbols-outlined" style={{ color: notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ff4e4e' : '#ffd700' }}>
            {notification.type === 'success' ? 'check_circle' : notification.type === 'error' ? 'error' : 'info'}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{notification.message}</span>
        </div>
      )}

      {/* Main Game Header */}
      <header className="game-header">
        <div className="game-title">
          <span className="material-symbols-outlined spin text-primary-fixed" style={{ fontSize: '2rem' }}>swords</span>
          ISEKAI NIHONGO
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div 
                className="game-avatar-container" 
                title={user.email}
                style={{ cursor: 'pointer' }}
                onClick={handleLogout}
              >
                <img 
                  className="game-avatar-img" 
                  src={user.user_metadata?.avatar_url || DEFAULT_AVATAR_URL} 
                  alt="User Avatar" 
                />
              </div>
            </div>
          ) : (
            <button 
              className="pixel-btn pixel-btn-primary" 
              onClick={handleGoogleLogin}
              style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
              disabled={!dbConfig.isConfigured}
              title={!dbConfig.isConfigured ? "Hubungkan Supabase terlebih dahulu" : "Login Google"}
            >
              Google Login
            </button>
          )}
          <button 
            className="pixel-btn pixel-btn-icon"
            onClick={() => setIsSettingsOpen(true)}
            title="Database Cloud Settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      {/* Stats Dashboard Bars */}
      <div style={{ marginTop: '4.5rem' }}>
        <div className="status-panel">
          {/* HP Bar */}
          <div className="status-bar-row">
            <span className="status-label hp">HP</span>
            <div className="status-bar-bg">
              <div className="status-bar-fill hp hp-bar-segment" style={{ width: `${hp}%` }}></div>
            </div>
            <span className="status-value">{hp}/100</span>
          </div>

          {/* MP Bar */}
          <div className="status-bar-row">
            <span className="status-label mp">MP</span>
            <div className="status-bar-bg">
              <div className="status-bar-fill mp mp-bar-segment" style={{ width: `${mp}%` }}></div>
            </div>
            <span className="status-value">{mp}/100</span>
          </div>

          {/* EXP Bar */}
          <div className="status-bar-row">
            <span className="status-label xp">XP</span>
            <div className="status-bar-bg">
              <div className="status-bar-fill xp exp-bar-segment" style={{ width: `${(xp / 1000) * 100}%` }}></div>
            </div>
            <span className="status-value">LVL {level}</span>
          </div>

          {/* Virtual Wallet row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: 'JetBrains Mono', borderTop: '1px dashed #333', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
            <span style={{ color: 'var(--primary-container)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>payments</span> {gold} GOLD
            </span>
            <span style={{ color: 'var(--success-green)', fontWeight: 'bold' }}>
              🔥 STREAK: {currentStreak} HARI
            </span>
          </div>
        </div>

        {/* Dialogue Box (Sensei Kenji) */}
        <div className="dialogue-box">
          <img 
            className="dialogue-avatar" 
            src={SENSEI_AVATAR_URL} 
            alt="Sensei Kenji Avatar" 
          />
          <div className="dialogue-content">
            <span className="dialogue-speaker">Sensei Kenji</span>
            <span className="dialogue-text">{getSenseiDialogue()}</span>
          </div>
        </div>
      </div>

      {/* Main Tab Renderings */}
      <main style={{ minHeight: '50vh' }}>
        
        {activeTab === 'quest' && (
          <div>
            {/* Quest Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>CURRENT OBJECTIVES</p>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--on-surface)' }}>Daftar Quest Harian</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="pixel-btn"
                  onClick={handleResetData}
                  title="Reset status hari ini"
                >
                  <span className="material-symbols-outlined">restart_alt</span>
                </button>
                <button 
                  className="pixel-btn pixel-btn-primary"
                  onClick={handleOpenAddQuest}
                >
                  <span className="material-symbols-outlined">add</span> Quest Baru
                </button>
              </div>
            </div>

            {/* Phase Navigation Tabs */}
            <div className="pixel-tabs">
              {['Fase 1', 'Fase 2', 'Fase 3', 'Fase 4', 'Fase 5', 'Alternatif'].map(phase => (
                <button
                  key={phase}
                  className={`pixel-tab ${currentPhase === phase ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentPhase(phase);
                    localStorage.setItem('benkyou_current_phase', phase);
                  }}
                >
                  {phase}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', fontFamily: 'JetBrains Mono', color: 'var(--primary-fixed)' }}>
                <span className="material-symbols-outlined spin" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>sync</span>
                <p>LOADING QUESTS...</p>
              </div>
            ) : activePhaseQuests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', border: '2px dashed var(--outline-variant)', backgroundColor: 'var(--surface-container-lowest)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--outline)', marginBottom: '1rem' }}>inbox</span>
                <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Belum ada quest di Fase ini.</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>Buat quest kustom Anda sendiri menggunakan tombol "Quest Baru".</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Morning section */}
                {morningQuests.length > 0 && (
                  <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--primary-fixed)' }}>
                      <span className="material-symbols-outlined">wb_sunny</span>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>PAGI: KANJI TRAINING</h4>
                    </div>
                    {morningQuests.map(q => renderQuestCard(q))}
                  </section>
                )}

                {/* Afternoon section */}
                {afternoonQuests.length > 0 && (
                  <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#ffb4ab' }}>
                      <span className="material-symbols-outlined">light_mode</span>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>SIANG: GRAMMAR QUEST</h4>
                    </div>
                    {afternoonQuests.map(q => renderQuestCard(q))}
                  </section>
                )}

                {/* Evening section */}
                {eveningQuests.length > 0 && (
                  <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#a4c9ff' }}>
                      <span className="material-symbols-outlined">dark_mode</span>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>MALAM: LISTENING RAID</h4>
                    </div>
                    {eveningQuests.map(q => renderQuestCard(q))}
                  </section>
                )}

                {/* Other/Bebas section */}
                {normalQuests.length > 0 && (
                  <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--on-surface-variant)' }}>
                      <span className="material-symbols-outlined">explore</span>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>BEBAS: GENERAL OBJECTIVES</h4>
                    </div>
                    {normalQuests.map(q => renderQuestCard(q))}
                  </section>
                )}

              </div>
            )}
          </div>
        )}

        {activeTab === 'tas' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-fixed)' }}>TAS INVENTARIS</h3>
            
            {/* Inventory Slots Grid */}
            <div className="inventory-grid">
              {Array.from({ length: 15 }).map((_, idx) => {
                const item = inventory[idx];
                const itemSpec = item ? SHOP_ITEMS.find(s => s.id === item.id) : null;
                
                return (
                  <div 
                    key={idx} 
                    className={`inventory-slot ${item ? 'occupied' : ''}`}
                    onClick={() => item && setSelectedInventoryItem(item.id)}
                  >
                    {itemSpec ? (
                      <>
                        <span className="material-symbols-outlined slot-icon" style={{ color: itemSpec.id === 'hp_potion' ? 'var(--health-red)' : itemSpec.id === 'mp_potion' ? 'var(--mana-blue)' : itemSpec.id === 'xp_elixir' ? 'var(--xp-gold)' : 'var(--primary-fixed)' }}>
                          {itemSpec.icon}
                        </span>
                        <span className="slot-count">x{item.count}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.65rem', color: '#2a2a2a' }}>{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Kanji Grimoire (Mantra Kanji) */}
            <div style={{ borderTop: '2px solid var(--outline-variant)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined">auto_stories</span> MANTRA KANJI YANG DIPELAJARI ({unlockedKanji.length})
              </h3>
              
              {unlockedKanji.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--outline-variant)', backgroundColor: 'var(--surface-container-lowest)', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
                  Belum ada Mantra Kanji yang dibuka. Beli "Buku Mantra Kanji" di Toko dan gunakan di Tas untuk memulainya!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
                  {unlockedKanji.map(char => {
                    const kInfo = KANJI_POOL.find(k => k.char === char);
                    const isFlipped = flippedKanji === char;
                    if (!kInfo) return null;

                    return (
                      <div 
                        key={char} 
                        className="pixel-border" 
                        style={{ 
                          height: '140px', 
                          background: 'var(--surface-container-high)',
                          borderColor: isFlipped ? 'var(--primary-fixed)' : 'var(--outline-variant)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '0.5rem',
                          textAlign: 'center',
                          transition: 'all 0.15s ease-out'
                        }}
                        onClick={() => setFlippedKanji(isFlipped ? null : char)}
                      >
                        {!isFlipped ? (
                          <>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary-fixed)' }}>{kInfo.char}</h2>
                            <span style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Click to Reveal</span>
                          </>
                        ) : (
                          <div style={{ fontSize: '0.75rem', width: '100%' }}>
                            <p style={{ fontWeight: 'bold', color: 'var(--xp-gold)', fontSize: '0.65rem' }}>ONYOMI</p>
                            <p style={{ fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>{kInfo.onyomi}</p>
                            <p style={{ fontWeight: 'bold', color: 'var(--mana-blue)', fontSize: '0.65rem' }}>KUNYOMI</p>
                            <p style={{ fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>{kInfo.kunyomi}</p>
                            <p style={{ fontWeight: 'bold', color: '#ffb4ab', fontSize: '0.65rem' }}>ARTI</p>
                            <p style={{ fontWeight: 500, fontSize: '0.7rem' }}>{kInfo.meaning}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'gilda' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-fixed)' }}>GILDA STATS & DATABASE</h3>

            {/* Streak & Consistency Matrix */}
            <div style={{ backgroundColor: 'var(--surface-container)', padding: '1rem', border: '2px solid var(--outline-variant)', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', color: 'var(--on-surface)' }}>Histori Aktivitas (14 Hari Terakhir)</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {streakDays.map((day, idx) => (
                  <div 
                    key={idx}
                    className="pixel-border"
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: day.isSuccess ? 'rgba(16, 185, 129, 0.25)' : 'var(--surface-container-lowest)',
                      borderColor: day.isSuccess ? 'var(--success-green)' : day.isToday ? 'var(--primary-fixed)' : 'var(--outline-variant)'
                    }}
                    title={`${day.dateStr}: ${day.isSuccess ? 'Berhasil' : 'Tidak Berhasil/Gagal'}`}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: day.isSuccess ? 'var(--success-green)' : 'var(--on-surface-variant)' }}>
                      {day.dateNum}
                    </span>
                    <span style={{ fontSize: '0.5rem', textTransform: 'uppercase' }}>{day.dayLabel}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textAlign: 'center' }}>
                * Kotak berwarna hijau menunjukkan Anda menyelesaikan ≥ 50% quest harian pada hari itu.
              </p>
            </div>

            {/* Account & Connection Information */}
            <div style={{ backgroundColor: 'var(--surface-container)', padding: '1rem', border: '2px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface)', marginBottom: '0.25rem' }}>Akun Pengguna</h4>
                {user ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>{user.email}</span>
                    <button className="pixel-btn pixel-btn-danger" onClick={handleLogout} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>
                      Belum masuk akun. Masuk menggunakan Google OAuth untuk menyimpan progress ke cloud.
                    </p>
                    <button 
                      className="pixel-btn pixel-btn-primary" 
                      onClick={handleGoogleLogin}
                      disabled={!dbConfig.isConfigured}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Login dengan Google
                    </button>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px dashed var(--outline-variant)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface)' }}>Status Koneksi Database</h4>
                  <span 
                    className="pixel-border" 
                    style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: 700, 
                      padding: '0.1rem 0.4rem', 
                      textTransform: 'uppercase',
                      backgroundColor: dbConfig.isConfigured ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 78, 78, 0.25)',
                      borderColor: dbConfig.isConfigured ? 'var(--success-green)' : 'var(--health-red)',
                      color: dbConfig.isConfigured ? 'var(--success-green)' : 'var(--health-red)'
                    }}
                  >
                    {dbConfig.isConfigured ? `Terhubung (${dbConfig.source})` : 'Offline (Lokal)'}
                  </span>
                </div>
                <button 
                  className="pixel-btn" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <span className="material-symbols-outlined">cloud_sync</span> Buka Konfigurasi Cloud
                </button>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'toko' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-fixed)' }}>TOKO MERCHANDISE & POTION</h3>
            
            <div className="shop-grid">
              {SHOP_ITEMS.map(item => (
                <div key={item.id} className="shop-card">
                  <span className="material-symbols-outlined item-icon" style={{ color: item.id === 'hp_potion' ? 'var(--health-red)' : item.id === 'mp_potion' ? 'var(--mana-blue)' : item.id === 'xp_elixir' ? 'var(--xp-gold)' : 'var(--primary-fixed)' }}>
                    {item.icon}
                  </span>
                  <div className="item-name">{item.name}</div>
                  <div className="item-desc">{item.desc}</div>
                  
                  <div className="item-price-row">
                    <div className="item-price">
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>payments</span>
                      {item.price} G
                    </div>
                    <button 
                      className="pixel-btn pixel-btn-primary"
                      onClick={() => handleBuyItem(item)}
                      disabled={gold < item.price}
                      style={{ opacity: gold < item.price ? 0.5 : 1, cursor: gold < item.price ? 'not-allowed' : 'pointer' }}
                    >
                      Beli
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Bottom RPG Navigation Bar */}
      <nav className="rpg-bottom-nav">
        <a 
          className={`rpg-nav-item ${activeTab === 'quest' ? 'active' : ''}`}
          onClick={() => setActiveTab('quest')}
        >
          <span className="material-symbols-outlined">swords</span>
          <span className="rpg-nav-label">Quest</span>
        </a>
        <a 
          className={`rpg-nav-item ${activeTab === 'tas' ? 'active' : ''}`}
          onClick={() => setActiveTab('tas')}
        >
          <span className="material-symbols-outlined">backpack</span>
          <span className="rpg-nav-label">Tas</span>
        </a>
        <a 
          className={`rpg-nav-item ${activeTab === 'gilda' ? 'active' : ''}`}
          onClick={() => setActiveTab('gilda')}
        >
          <span className="material-symbols-outlined">groups</span>
          <span className="rpg-nav-label">Gilda</span>
        </a>
        <a 
          className={`rpg-nav-item ${activeTab === 'toko' ? 'active' : ''}`}
          onClick={() => setActiveTab('toko')}
        >
          <span className="material-symbols-outlined">store</span>
          <span className="rpg-nav-label">Toko</span>
        </a>
      </nav>

      {/* MODAL: Level Up Overlay */}
      {showLevelUp && (
        <div className="rpg-modal-backdrop">
          <div className="level-up-toast">
            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--primary-fixed)', animation: 'blink 0.5s steps(2) infinite' }}>
              military_tech
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 900, color: 'var(--primary-fixed)', margin: '1rem 0' }}>
              LEVEL UP!
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: '#fff', marginBottom: '1.5rem' }}>
              Selamat! Kamu meningkat ke Level {level}!
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>
              HP & MP pulih sepenuhnya. Terus pertahaman ritme belajar harianmu!
            </p>
            <button 
              className="pixel-btn pixel-btn-primary"
              style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
              onClick={() => setShowLevelUp(false)}
            >
              Lanjutkan Petualangan
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Inventory Item Usage */}
      {selectedInventoryItem && (() => {
        const itemSpec = SHOP_ITEMS.find(s => s.id === selectedInventoryItem);
        if (!itemSpec) return null;
        
        return (
          <div className="rpg-modal-backdrop" onClick={() => setSelectedInventoryItem(null)}>
            <div className="rpg-modal" onClick={e => e.stopPropagation()}>
              <div className="rpg-modal-header">
                <span className="rpg-modal-title">Gunakan Item</span>
                <button onClick={() => setSelectedInventoryItem(null)} className="rpg-icon-btn">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="rpg-modal-body" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--primary-fixed)', marginBottom: '0.75rem' }}>
                  {itemSpec.icon}
                </span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{itemSpec.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                  {itemSpec.desc} Apakah kamu ingin menggunakan item ini sekarang?
                </p>
              </div>
              <div className="rpg-modal-footer">
                <button className="pixel-btn" onClick={() => setSelectedInventoryItem(null)}>
                  Batal
                </button>
                <button 
                  className="pixel-btn pixel-btn-primary"
                  onClick={() => handleUseItem(itemSpec.id)}
                >
                  Gunakan
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: Add / Edit Quest */}
      {isQuestModalOpen && (
        <div className="rpg-modal-backdrop" onClick={() => { setIsQuestModalOpen(false); setEditingQuest(null); }}>
          <div className="rpg-modal" onClick={e => e.stopPropagation()}>
            <div className="rpg-modal-header">
              <span className="rpg-modal-title">{editingQuest ? 'Edit Quest' : 'Tambah Quest Baru'}</span>
              <button onClick={() => { setIsQuestModalOpen(false); setEditingQuest(null); }} className="rpg-icon-btn">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveQuest}>
              <div className="rpg-modal-body">
                <div className="rpg-form-group">
                  <label className="rpg-label">Judul Quest</label>
                  <input 
                    type="text" 
                    className="rpg-input" 
                    value={qTitle} 
                    onChange={e => setQTitle(e.target.value)} 
                    placeholder="Contoh: Belajar Tata Bahasa N3"
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="rpg-form-group">
                    <label className="rpg-label">Durasi (Menit/Hari)</label>
                    <input 
                      type="text" 
                      className="rpg-input" 
                      value={qDuration} 
                      onChange={e => setQDuration(e.target.value)} 
                      placeholder="Contoh: 30"
                      required 
                    />
                  </div>
                  <div className="rpg-form-group">
                    <label className="rpg-label">Fase Belajar</label>
                    <select 
                      className="rpg-select" 
                      value={qPhase} 
                      onChange={e => setQPhase(e.target.value as any)}
                    >
                      <option value="Fase 1">Fase 1</option>
                      <option value="Fase 2">Fase 2</option>
                      <option value="Fase 3">Fase 3</option>
                      <option value="Fase 4">Fase 4</option>
                      <option value="Fase 5">Fase 5</option>
                      <option value="Alternatif">Alternatif</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="rpg-form-group">
                    <label className="rpg-label">Waktu Pengerjaan</label>
                    <select 
                      className="rpg-select" 
                      value={qTimeOfDay} 
                      onChange={e => setQTimeOfDay(e.target.value as any)}
                    >
                      <option value="Pagi">Pagi (05:00 - 11:59)</option>
                      <option value="Siang">Siang (12:00 - 17:59)</option>
                      <option value="Malam">Malam (18:00 - 23:59)</option>
                      <option value="Bebas">Bebas Waktu</option>
                    </select>
                  </div>
                  <div className="rpg-form-group">
                    <label className="rpg-label">Kesulitan (Quest Rank)</label>
                    <select 
                      className="rpg-select" 
                      value={qRank} 
                      onChange={e => {
                        const r = e.target.value as 'S' | 'A' | 'B' | 'C' | 'D';
                        setQRank(r);
                        if (r === 'S') { setQXp(150); setQGold(100); }
                        else if (r === 'A') { setQXp(100); setQGold(70); }
                        else if (r === 'B') { setQXp(75); setQGold(50); }
                        else if (r === 'C') { setQXp(50); setQGold(30); }
                        else { setQXp(30); setQGold(15); }
                      }}
                    >
                      <option value="S">Rank S (Legendary / Berat)</option>
                      <option value="A">Rank A (Epic / Sedang)</option>
                      <option value="B">Rank B (Rare / Ringan)</option>
                      <option value="C">Rank C (Normal)</option>
                      <option value="D">Rank D (Easy)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="rpg-form-group">
                    <label className="rpg-label">Hadiah XP</label>
                    <input 
                      type="number" 
                      className="rpg-input" 
                      value={qXp} 
                      onChange={e => setQXp(parseInt(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="rpg-form-group">
                    <label className="rpg-label">Hadiah Gold</label>
                    <input 
                      type="number" 
                      className="rpg-input" 
                      value={qGold} 
                      onChange={e => setQGold(parseInt(e.target.value) || 0)} 
                    />
                  </div>
                </div>

                <div className="rpg-form-group">
                  <label className="rpg-label">Alat / Media Pendukung</label>
                  <input 
                    type="text" 
                    className="rpg-input" 
                    value={qTools} 
                    onChange={e => setQTools(e.target.value)} 
                    placeholder="Contoh: Anki, YouTube, Jisho"
                  />
                </div>

                <div className="rpg-form-group">
                  <label className="rpg-label">Rincian / Catatan</label>
                  <textarea 
                    className="rpg-textarea" 
                    value={qDetails} 
                    onChange={e => setQDetails(e.target.value)} 
                    rows={3}
                    placeholder="Masukkan rincian quest, bahan bacaan, atau panduan materi belajar..."
                  />
                </div>
              </div>
              <div className="rpg-modal-footer">
                <button 
                  type="button" 
                  className="pixel-btn" 
                  onClick={() => { setIsQuestModalOpen(false); setEditingQuest(null); }}
                >
                  Batal
                </button>
                <button type="submit" className="pixel-btn pixel-btn-primary" disabled={syncing}>
                  {syncing ? 'Menyimpan...' : 'Simpan Quest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cloud Sync Configuration */}
      {isSettingsOpen && (
        <div className="rpg-modal-backdrop" onClick={() => setIsSettingsOpen(false)}>
          <div className="rpg-modal" onClick={e => e.stopPropagation()}>
            <div className="rpg-modal-header">
              <span className="rpg-modal-title">Pengaturan Supabase</span>
              <button onClick={() => setIsSettingsOpen(false)} className="rpg-icon-btn">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveSettings}>
              <div className="rpg-modal-body">
                <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>
                  Hubungkan ke proyek cloud Supabase Anda untuk menyimpan data quest dan penyelesaian secara permanen.
                </p>

                <div className="rpg-form-group">
                  <label className="rpg-label">SUPABASE URL</label>
                  <input 
                    type="url" 
                    className="rpg-input" 
                    value={sUrl} 
                    onChange={e => setSUrl(e.target.value)} 
                    placeholder="https://xyz.supabase.co"
                    required
                  />
                </div>

                <div className="rpg-form-group">
                  <label className="rpg-label">SUPABASE ANON KEY</label>
                  <input 
                    type="password" 
                    className="rpg-input" 
                    value={sKey} 
                    onChange={e => setSKey(e.target.value)} 
                    placeholder="eyJhbGciOi..."
                    required
                  />
                </div>

                <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '0.75rem', border: '1px solid var(--outline-variant)' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-fixed)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Skema Database</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', lineHeight: 1.3 }}>
                    Pastikan tabel <code>profiles</code>, <code>quests</code> dan <code>quest_completions</code> sudah di-setup sesuai skema SQL terbaru.
                  </p>
                </div>
              </div>
              <div className="rpg-modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>
                  {dbConfig.isConfigured && (
                    <button 
                      type="button" 
                      className="pixel-btn pixel-btn-danger"
                      onClick={handleClearSettings}
                    >
                      Putuskan Cloud
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="pixel-btn" onClick={() => setIsSettingsOpen(false)}>
                    Batal
                  </button>
                  <button type="submit" className="pixel-btn pixel-btn-primary">
                    Simpan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  // Helper renderer for each Quest Card in list
  function renderQuestCard(q: Quest) {
    const todayStr = getTodayDateString();
    const isCompleted = completions.some(c => c.quest_id === q.id && c.completed_date === todayStr);
    const isExpanded = expandedQuestId === q.id;

    return (
      <div 
        key={q.id}
        className={`quest-item-rpg ${isCompleted ? 'completed' : ''}`}
        onClick={() => setExpandedQuestId(isExpanded ? null : q.id)}
      >
        <div 
          className="rpg-checkbox"
          onClick={(e) => handleToggleQuest(q.id, e)}
        >
          {isCompleted && (
            <span className="material-symbols-outlined font-bold">check</span>
          )}
        </div>
        
        <div className="quest-rpg-body">
          <h4 className="quest-rpg-title">{q.title}</h4>
          
          <div className="quest-rpg-meta">
            <span className="rpg-badge rank">Rank {q.rank || 'C'}</span>
            <span className="rpg-badge xp">+{q.xp_reward || 50} XP</span>
            <span className="rpg-badge" style={{ color: 'var(--primary-container)' }}>+{q.gold_reward || 30} G</span>
            <span className="rpg-badge" style={{ color: 'var(--on-surface-variant)' }}>⏱ {q.duration}m</span>
          </div>

          {/* Details Drawer */}
          {isExpanded && (
            <div className="quest-rpg-details">
              {q.tools && (
                <div style={{ marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--primary-fixed)' }}>Alat:</span> {q.tools}
                </div>
              )}
              {q.details ? (
                <div>
                  <span style={{ color: 'var(--primary-fixed)' }}>Detail:</span> {q.details}
                </div>
              ) : (
                <div style={{ fontStyle: 'italic', opacity: 0.6 }}>Tidak ada catatan detail.</div>
              )}
            </div>
          )}
        </div>

        <div className="quest-rpg-actions">
          <button 
            className="rpg-icon-btn"
            onClick={(e) => handleEditQuestClick(q, e)}
            title="Edit Quest"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit</span>
          </button>
          <button 
            className="rpg-icon-btn delete"
            onClick={(e) => handleDeleteQuest(q.id, e)}
            title="Hapus Quest"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>delete</span>
          </button>
        </div>
      </div>
    );
  }
}

export default App;
