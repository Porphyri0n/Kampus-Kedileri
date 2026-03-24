<div align="center">

# 🐱 THKÜ Kampüs Kedileri

**Türk Hava Kurumu Üniversitesi Kampüs Kedileri Takip ve Sosyal Sorumluluk Platformu**

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.x-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Demo](#) • [Özellikler](#-özellikler) • [Kurulum](#-kurulum) • [Dokümantasyon](#-kullanım)

</div>

---

## 📖 Hakkında

**THKÜ Kampüs Kedileri**, Türk Hava Kurumu Üniversitesi kampüsünde yaşayan sokak kedilerinin takibi, bakımı ve sahiplendirilmesi süreçlerini dijitalleştiren bir sosyal sorumluluk platformudur.

Platform sayesinde öğrenciler ve akademisyenler:
- Kampüsteki kedileri kayıt altına alabilir
- Beslenme kayıtlarını tutabilir
- Harita üzerinde kedi lokasyonlarını işaretleyebilir
- Kediler için isim önerisinde bulunup oy kullanabilir
- Duyuru ve haberleri takip edebilir

---

## ✨ Özellikler

### 👥 Kullanıcı Yönetimi
- **Çoklu Rol Desteği**: Öğrenci, Akademisyen ve Yönetici rolleri
- **E-posta Doğrulama**: Firebase Authentication ile güvenli kayıt
- **Profil Yönetimi**: Kullanıcı bilgilerini güncelleme

### 🐈 Kedi Takip Sistemi
- **Kedi Kaydı**: Fotoğraf, özellik ve konum bilgileriyle kedi ekleme
- **Durum Takibi**: Kampüste, Sahiplenildi, Melek Oldu durumları
- **Onay Mekanizması**: Yönetici onayı ile kedi kaydı yayınlama
- **İsim Oylaması**: Topluluk tarafından isim önerisi ve oylama

### 🍽️ Beslenme Takibi
- Mama bırakma kayıtları
- Kullanıcı bazlı beslenme geçmişi
- Miktar takibi (250g - 2.5kg arası)

### 🗺️ İnteraktif Harita
- Kampüs haritası üzerinde kedi konumları
- Mama noktası işaretleme
- Gerçek zamanlı güncelleme

### 🔔 Duyuru Sistemi
- Yönetici tarafından haber/duyuru paylaşımı
- Topluluk bildirimleri



---

## 🛠️ Teknoloji Yığını

| Kategori | Teknoloji |
|----------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS |
| **Build Tool** | Vite 6 |
| **Backend** | Firebase (Auth, Firestore, Storage) |
| **Icons** | Lucide React |
| **Image Processing** | browser-image-compression |
| **Testing** | Vitest, React Testing Library |

---

## 📦 Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Firebase hesabı

### Adımlar

1. **Repoyu klonlayın**
   ```bash
   git clone https://github.com/your-username/thku-kampus-kedileri.git
   cd thku-kampus-kedileri
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Ortam değişkenlerini yapılandırın**
   ```bash
   cp .env.example .env
   ```
   
   `.env` dosyasını düzenleyin:
   ```env
   VITE_ADMIN_EMAIL=admin@example.com
   ```

4. **Firebase yapılandırması**
   
   `services/firebase.ts` dosyasındaki Firebase config bilgilerini kendi projenizin bilgileriyle güncelleyin.

5. **Geliştirme sunucusunu başlatın**
   ```bash
   npm run dev
   ```
   
   Uygulama `http://localhost:3000` adresinde çalışacaktır.

---

## 🚀 Dağıtım

### Production Build

```bash
npm run build
```

### Firebase Hosting'e Deploy

```bash
# Firebase CLI kurulumu (eğer yoksa)
npm install -g firebase-tools

# Firebase'e giriş
firebase login

# Deploy
firebase deploy
```

---

## 📁 Proje Yapısı

```
thku-kampus-kedileri/
├── components/           # React bileşenleri
│   ├── AddCat.tsx       # Kedi ekleme formu
│   ├── AdminPanel.tsx   # Yönetici paneli
│   ├── Auth.tsx         # Giriş/Kayıt ekranları
│   ├── CatDetail.tsx    # Kedi detay sayfası
│   ├── Dashboard.tsx    # Ana pano
│   ├── Layout.tsx       # Sayfa düzeni
│   └── Map.tsx          # İnteraktif harita
├── services/            # Servis katmanı
│   ├── api.ts           # Firebase API servisleri
│   ├── firebase.ts      # Firebase yapılandırması
│   └── mockService.ts   # Mock data servisi
├── test/                # Test dosyaları
├── App.tsx              # Ana uygulama bileşeni
├── types.ts             # TypeScript tipleri
├── index.tsx            # Uygulama giriş noktası
├── firebase.json        # Firebase yapılandırması
├── firestore.rules      # Firestore güvenlik kuralları
├── storage.rules        # Storage güvenlik kuralları
└── vite.config.ts       # Vite yapılandırması
```

---

## 🔐 Güvenlik Kuralları

### Firestore Rules
- Herkes kedileri ve haberleri okuyabilir
- Sadece giriş yapmış kullanıcılar kedi ekleyebilir
- Sadece yöneticiler kedi onaylayabilir ve silebilir
- Kullanıcılar sadece kendi profillerini düzenleyebilir

### Storage Rules
- Herkes resimleri görüntüleyebilir
- Sadece giriş yapmış kullanıcılar resim yükleyebilir
- Maksimum dosya boyutu: 5MB
- Sadece resim dosyaları kabul edilir

---

## 🧪 Test

```bash
# Testleri çalıştır
npm run test

# Watch modunda testleri çalıştır
npm run test -- --watch
```

---

## 📱 Ekran Görüntüleri

<div align="center">

| Ana Pano | Kedi Detay | Harita |
|:--------:|:----------:|:------:|
| Dashboard görünümü | Kedi bilgileri ve beslenme | Kampüs haritası |

</div>

---

## 🤝 Katkıda Bulunma

Katkılarınızı memnuniyetle karşılıyoruz! 

1. Bu repoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Commit Mesaj Formatı

```
<type>: <description>

[optional body]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👨‍💻 Geliştiriciler

<div align="center">

**THKÜ Kampüs Kedileri Ekibi**

Türk Hava Kurumu Üniversitesi öğrencileri tarafından geliştirilmiştir.

</div>

---

## 📞 İletişim

- **Proje Sayfası**: [GitHub](https://github.com/your-username/thku-kampus-kedileri)
- **Hata Bildirimi**: [Issues](https://github.com/your-username/thku-kampus-kedileri/issues)

---

<div align="center">

**🐱 Kampüsümüzdeki dostlarımız için tek yürek! 🐱**

Developers:
Erdoğan Başer - eb.baser@gmail.com
Ziya Üre - ziyaure06@gmail.com

</div>
