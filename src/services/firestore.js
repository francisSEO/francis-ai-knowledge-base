import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

const URLS_COLLECTION = 'urls';

export async function saveUrl(urlData) {
    try {
        const docRef = await addDoc(collection(db, URLS_COLLECTION), {
            ...urlData,
            createdAt: Timestamp.now()
        });
        return { id: docRef.id, ...urlData };
    } catch (error) {
        console.error('Error al guardar URL:', error);
        throw new Error('No se pudo guardar la URL en Firestore');
    }
}

export async function getAllUrls() {
    try {
        const q = query(
            collection(db, URLS_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const urls = [];
        querySnapshot.forEach((doc) => {
            urls.push({ id: doc.id, ...doc.data() });
        });
        return urls;
    } catch (error) {
        console.error('Error al obtener URLs:', error);
        throw new Error('No se pudieron obtener las URLs de Firestore');
    }
}

export async function getUrlsByCategory(category) {
    try {
        const q = query(
            collection(db, URLS_COLLECTION),
            where('category', '==', category),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const urls = [];
        querySnapshot.forEach((doc) => {
            urls.push({ id: doc.id, ...doc.data() });
        });
        return urls;
    } catch (error) {
        console.error('Error al obtener URLs por categoría:', error);
        throw new Error('No se pudieron obtener las URLs filtradas');
    }
}

export async function deleteUrl(urlId) {
    try {
        await deleteDoc(doc(db, URLS_COLLECTION, urlId));
    } catch (error) {
        console.error('Error al eliminar URL:', error);
        throw new Error('No se pudo eliminar la URL');
    }
}

export async function searchUrls(searchTerm) {
    try {
        const allUrls = await getAllUrls();
        const searchLower = searchTerm.toLowerCase();
        return allUrls.filter(url =>
            url.title?.toLowerCase().includes(searchLower) ||
            url.url?.toLowerCase().includes(searchLower) ||
            url.content?.toLowerCase().includes(searchLower) ||
            url.category?.toLowerCase().includes(searchLower)
        );
    } catch (error) {
        console.error('Error al buscar URLs:', error);
        throw new Error('No se pudo realizar la búsqueda');
    }
}
