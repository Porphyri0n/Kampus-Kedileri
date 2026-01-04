import { auth, db, storage } from './firebase';
import imageCompression from 'browser-image-compression';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  User as FirebaseUser
} from 'firebase/auth';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  setDoc,
  getDoc,
  arrayUnion,
  runTransaction
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { User, UserRole, Cat, CatStatus, MapMarker, NewsItem, FeedingLog } from '../types';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export const ApiService = {
  // Auth
  subscribeToAuth: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extra user details from Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        let userData: User;

        if (userSnap.exists()) {
          userData = { id: firebaseUser.uid, ...userSnap.data() } as User;
        } else {
          // Fallback if doc doesn't exist (legacy users)
          const role = firebaseUser.email === ADMIN_EMAIL ? UserRole.ADMIN : UserRole.STUDENT;
          userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: role,
            name: firebaseUser.email?.split('@')[0] || 'Kullanıcı'
          };
          await setDoc(userRef, userData);
        }

        // Attach the realtime emailVerified status from Firebase Auth
        userData.emailVerified = firebaseUser.emailVerified;

        callback(userData);
      } else {
        callback(null);
      }
    });
  },

  login: async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  },

  register: async (data: any): Promise<void> => {
    // Create Auth User with Personal Email
    const cred = await createUserWithEmailAndPassword(auth, data.personalEmail, data.password);

    // Determine Role
    let role = UserRole.STUDENT;
    if (data.personalEmail === ADMIN_EMAIL) {
      role = UserRole.ADMIN;
    } else if (data.roleType === 'ACADEMIC') {
      role = UserRole.ACADEMIC;
    }

    // Prepare User Object for Firestore
    const user: User = {
      id: cred.user.uid,
      email: data.personalEmail,
      role: role,
      name: data.fullName,
      schoolEmail: data.schoolEmail,
      department: data.department,
    };

    if (role === UserRole.STUDENT) {
      user.studentId = data.studentId;
      user.grade = data.grade;
    }

    // Save to Firestore
    await setDoc(doc(db, 'users', cred.user.uid), user);

    // Send Verification Email (Goes to the Personal Login Email)
    await sendEmailVerification(cred.user);
  },

  resendVerification: async (): Promise<void> => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  },

  updateUserProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  },

  logout: async () => {
    await signOut(auth);
  },

  // Cats
  getCats: async (): Promise<Cat[]> => {
    const q = query(collection(db, 'cats'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cat));
  },

  addCat: async (cat: Omit<Cat, 'id' | 'createdAt' | 'feedingLogs' | 'votes' | 'votedUserIds' | 'isApproved' | 'imageUrl'>, imageFile?: File): Promise<Cat> => {
    let imageUrl = 'https://picsum.photos/400/400'; // Default

    if (imageFile) {
      // Compress image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };

      try {
        const compressedFile = await imageCompression(imageFile, options);

        // Check size after compression (1MB = 1048576 bytes)
        if (compressedFile.size > 1024 * 1024) {
          throw new Error("Sıkıştırılmasına rağmen dosya boyutu 1MB'dan büyük. Lütfen daha küçük bir fotoğraf yükleyin.");
        }

        const storageRef = ref(storage, `cats/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, compressedFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      } catch (error) {
        console.error("Compression/Upload error:", error);
        throw error;
      }
    }

    const newCatData = {
      ...cat,
      imageUrl,
      createdAt: Date.now(),
      feedingLogs: [],
      votes: {},
      votedUserIds: [],
      isApproved: false
    };

    const docRef = await addDoc(collection(db, 'cats'), newCatData);
    return { id: docRef.id, ...newCatData } as Cat;
  },

  updateCat: async (catId: string, updates: Partial<Cat>): Promise<void> => {
    const catRef = doc(db, 'cats', catId);
    await updateDoc(catRef, updates);
  },

  deleteCat: async (catId: string): Promise<void> => {
    await deleteDoc(doc(db, 'cats', catId));
  },

  logFeeding: async (catId: string, amount: number, user: User): Promise<void> => {
    const catRef = doc(db, 'cats', catId);
    const newLog: FeedingLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name || 'Kullanıcı',
      timestamp: Date.now(),
      amountGrams: amount
    };
    // Use arrayUnion to add to the list
    await updateDoc(catRef, {
      feedingLogs: arrayUnion(newLog)
    });
  },

  voteForCatName: async (catId: string, name: string, userId: string): Promise<void> => {
    const catRef = doc(db, 'cats', catId);

    await runTransaction(db, async (transaction) => {
      const catDoc = await transaction.get(catRef);
      if (!catDoc.exists()) {
        throw new Error("Kedi bulunamadı.");
      }

      const catData = catDoc.data() as Cat;
      const votedUserIds = catData.votedUserIds || [];

      if (votedUserIds.includes(userId)) {
        throw new Error("Bu kedi için zaten oy kullandınız.");
      }

      const currentVotes = catData.votes || {};
      const newCount = (currentVotes[name] || 0) + 1;

      transaction.update(catRef, {
        [`votes.${name}`]: newCount,
        votedUserIds: arrayUnion(userId)
      });
    });
  },

  // Markers
  getMarkers: async (): Promise<MapMarker[]> => {
    const snapshot = await getDocs(collection(db, 'markers'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MapMarker));
  },

  addMarker: async (marker: Omit<MapMarker, 'id' | 'timestamp'>): Promise<MapMarker> => {
    const newMarker = {
      ...marker,
      timestamp: Date.now()
    };
    const docRef = await addDoc(collection(db, 'markers'), newMarker);
    return { id: docRef.id, ...newMarker } as MapMarker;
  },

  // Settings & Map


  // News
  getNews: async (): Promise<NewsItem[]> => {
    const q = query(collection(db, 'news'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
  },

  addNews: async (news: Omit<NewsItem, 'id' | 'date'>): Promise<void> => {
    const newItem = {
      ...news,
      date: Date.now()
    };
    await addDoc(collection(db, 'news'), newItem);
  }
};