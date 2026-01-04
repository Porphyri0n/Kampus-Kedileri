import { User, UserRole, Cat, CatStatus, CampusZone, MapMarker, NewsItem } from '../types';

// Initial Mock Data
const MOCK_CATS: Cat[] = [
  {
    id: '1',
    name: 'Pamuk',
    imageUrl: 'https://picsum.photos/id/40/400/400',
    status: CatStatus.ALIVE,
    zone: CampusZone.LIBRARY,
    description: 'Beyaz, uzun tüylü, insan canlısı.',
    color: 'Beyaz',
    features: 'Sol kulağında küçük bir kesik var.',
    isApproved: true,
    votes: { 'Pamuk': 15, 'Bulut': 4 },
    feedingLogs: [],
    createdAt: Date.now() - 10000000
  },
  {
    id: '2',
    name: 'Duman',
    imageUrl: 'https://picsum.photos/id/219/400/400',
    status: CatStatus.ALIVE,
    zone: CampusZone.HANGAR,
    description: 'Gri, oyuncu ama biraz çekingen.',
    color: 'Gri',
    features: 'Yeşil gözlü.',
    isApproved: true,
    votes: { 'Duman': 10 },
    feedingLogs: [],
    createdAt: Date.now() - 5000000
  },
  {
    id: '3',
    name: 'Zeytin',
    imageUrl: 'https://picsum.photos/id/237/400/400',
    status: CatStatus.ADOPTED,
    zone: CampusZone.RECTORATE,
    description: 'Siyah yavru kedi.',
    color: 'Siyah',
    features: 'Çok hızlı koşuyor.',
    isApproved: true,
    votes: {},
    feedingLogs: [],
    createdAt: Date.now() - 20000000
  }
];

const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Kış Hazırlıkları Başladı',
    content: 'Kampüs kedileri için kışlık kedi evleri yapımına başlıyoruz. Desteklerinizi bekliyoruz.',
    date: Date.now(),
    imageUrl: 'https://picsum.photos/id/102/800/400'
  }
];

// Local Storage Keys
const KEYS = {
  CATS: 'thk_cats',
  MARKERS: 'thk_markers',
  NEWS: 'thk_news',
  USER: 'thk_user'
};

// Helper to simulate delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const MockService = {
  // Auth
  login: async (email: string, password: string): Promise<User> => {
    await delay(800);
    const role = email === 'eb.baser@gmail.com' ? UserRole.ADMIN : UserRole.STUDENT;
    const user: User = {
      id: email, // simple id
      email,
      role,
      name: email.split('@')[0]
    };
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    return user;
  },

  logout: async () => {
    localStorage.removeItem(KEYS.USER);
  },

  getCurrentUser: (): User | null => {
    const u = localStorage.getItem(KEYS.USER);
    return u ? JSON.parse(u) : null;
  },

  // Cats
  getCats: async (): Promise<Cat[]> => {
    await delay(500);
    const stored = localStorage.getItem(KEYS.CATS);
    if (!stored) {
      localStorage.setItem(KEYS.CATS, JSON.stringify(MOCK_CATS));
      return MOCK_CATS;
    }
    return JSON.parse(stored);
  },

  addCat: async (cat: Omit<Cat, 'id' | 'createdAt' | 'feedingLogs' | 'votes' | 'isApproved'>): Promise<Cat> => {
    await delay(800);
    const newCat: Cat = {
      ...cat,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      feedingLogs: [],
      votes: {},
      isApproved: false // Requires admin approval
    };
    const cats = await MockService.getCats();
    cats.push(newCat);
    localStorage.setItem(KEYS.CATS, JSON.stringify(cats));
    return newCat;
  },

  updateCat: async (catId: string, updates: Partial<Cat>): Promise<void> => {
    await delay(400);
    const cats = await MockService.getCats();
    const index = cats.findIndex(c => c.id === catId);
    if (index !== -1) {
      cats[index] = { ...cats[index], ...updates };
      localStorage.setItem(KEYS.CATS, JSON.stringify(cats));
    }
  },

  deleteCat: async (catId: string): Promise<void> => {
    await delay(400);
    let cats = await MockService.getCats();
    cats = cats.filter(c => c.id !== catId);
    localStorage.setItem(KEYS.CATS, JSON.stringify(cats));
  },

  logFeeding: async (catId: string, amount: number, user: User): Promise<void> => {
    await delay(300);
    const cats = await MockService.getCats();
    const index = cats.findIndex(c => c.id === catId);
    if (index !== -1) {
      cats[index].feedingLogs.unshift({
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        userName: user.name || 'Öğrenci',
        timestamp: Date.now(),
        amountGrams: amount
      });
      localStorage.setItem(KEYS.CATS, JSON.stringify(cats));
    }
  },

  // Markers
  getMarkers: async (): Promise<MapMarker[]> => {
    const stored = localStorage.getItem(KEYS.MARKERS);
    return stored ? JSON.parse(stored) : [];
  },

  addMarker: async (marker: Omit<MapMarker, 'id' | 'timestamp'>): Promise<MapMarker> => {
    await delay(200);
    const newMarker: MapMarker = {
      ...marker,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    const markers = await MockService.getMarkers();
    markers.push(newMarker);
    localStorage.setItem(KEYS.MARKERS, JSON.stringify(markers));
    return newMarker;
  },

  // News
  getNews: async (): Promise<NewsItem[]> => {
    const stored = localStorage.getItem(KEYS.NEWS);
    if (!stored) {
      localStorage.setItem(KEYS.NEWS, JSON.stringify(MOCK_NEWS));
      return MOCK_NEWS;
    }
    return JSON.parse(stored);
  },

  addNews: async (news: Omit<NewsItem, 'id' | 'date'>): Promise<void> => {
    const allNews = await MockService.getNews();
    const newItem: NewsItem = {
      ...news,
      id: Math.random().toString(36).substr(2, 9),
      date: Date.now()
    };
    allNews.unshift(newItem);
    localStorage.setItem(KEYS.NEWS, JSON.stringify(allNews));
  }
};
