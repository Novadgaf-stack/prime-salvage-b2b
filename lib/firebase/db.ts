import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firebase-error';

export type ComponentStatus = 'AVAILABLE' | 'SOLD';
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';

export interface UserDoc {
  uid: string;
  email: string;
  shopName: string;
  verifiedTech: boolean;
  createdAt: string;
}

export interface ComponentDoc {
  id?: string;
  sellerId: string;
  sellerName: string;
  partName: string;
  compatibility: string;
  serialNumber: string;
  price: number;
  condition: string;
  status: ComponentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDoc {
  id?: string;
  buyerId: string;
  sellerId: string;
  componentId: string;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export async function getUser(uid: string): Promise<UserDoc | null> {
  try {
    const d = await getDoc(doc(db, 'users', uid));
    if (!d.exists()) return null;
    return d.data() as UserDoc;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    return null;
  }
}

export async function createUser(uid: string, data: Omit<UserDoc, 'uid'>): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid), { ...data, uid });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${uid}`);
  }
}

export function subscribeToComponents(filters: { brand?: string; condition?: string }, callback: (components: ComponentDoc[]) => void) {
  let q = query(collection(db, 'components'), where('status', '==', 'AVAILABLE'));
  if (filters.condition) {
    q = query(q, where('condition', '==', filters.condition));
  }
  // Optional: add more advanced filter client-side since Firestore doesn't easily support multiple "in" or text search without a dedicated search service.
  // We'll return everything AVAILABLE and let client sort/filter the rest.
  return onSnapshot(q, (snap) => {
    let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as ComponentDoc));
    // Filter local for brand/compatibility string matching
    if (filters.brand) {
       const b = filters.brand.toLowerCase();
       results = results.filter(r => r.compatibility.toLowerCase().includes(b));
    }
    callback(results);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'components');
  });
}

export async function createComponent(data: Omit<ComponentDoc, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'components'), data);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'components');
    return '';
  }
}

export function subscribeToUserListings(sellerId: string, callback: (components: ComponentDoc[]) => void) {
  const q = query(collection(db, 'components'), where('sellerId', '==', sellerId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as ComponentDoc)));
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'components');
  });
}

export function subscribeToIncomingRequests(sellerId: string, callback: (transactions: TransactionDoc[]) => void) {
  const q = query(collection(db, 'transactions'), where('sellerId', '==', sellerId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as TransactionDoc)));
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'transactions');
  });
}

export async function createTransaction(data: Omit<TransactionDoc, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), data);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'transactions');
    return '';
  }
}

export async function updateTransactionStatus(transactionId: string, status: TransactionStatus): Promise<void> {
  try {
    const now = new Date().toISOString();
    await updateDoc(doc(db, 'transactions', transactionId), { status, updatedAt: now });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `transactions/${transactionId}`);
  }
}
