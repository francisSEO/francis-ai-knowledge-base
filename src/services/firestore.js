// src/services/firestore.js
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    updateDoc,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const URLS_COLLECTION = 'urls';

/** Save a new URL document */
export async function saveUrl(urlData) {
    try {
        const docRef = await addDoc(collection(db, URLS_COLLECTION), {
            ...urlData,
            createdAt: Timestamp.now(),
        });
        return { id: docRef.id, ...urlData };
    } catch (error) {
        console.error('Error al guardar URL:', error);
        throw new Error('No se pudo guardar la URL en Firestore');
    }
}

/** Get all URLs ordered by newest */
export async function getAllUrls() {
    try {
        const q = query(collection(db, URLS_COLLECTION), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const urls = [];
        querySnapshot.forEach((doc) => urls.push({ id: doc.id, ...doc.data() }));
        return urls;
    } catch (error) {
        console.error('Error al obtener URLs:', error);
        throw new Error('No se pudieron obtener las URLs de Firestore');
    }
}

/** Get URLs filtered by a specific category */
export async function getUrlsByCategory(category) {
    try {
        const q = query(
            collection(db, URLS_COLLECTION),
            where('category', '==', category),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const urls = [];
        querySnapshot.forEach((doc) => urls.push({ id: doc.id, ...doc.data() }));
        return urls;
    } catch (error) {
        console.error('Error al obtener URLs por categoría:', error);
        throw new Error('No se pudieron obtener las URLs filtradas');
    }
}

/** Delete a URL document */
export async function deleteUrl(urlId) {
    try {
        await deleteDoc(doc(db, URLS_COLLECTION, urlId));
    } catch (error) {
        console.error('Error al eliminar URL:', error);
        throw new Error('No se pudo eliminar la URL');
    }
}

/** Update fields of a URL document (e.g., category) */
export async function updateUrl(urlId, data) {
    try {
        await updateDoc(doc(db, URLS_COLLECTION, urlId), data);
    } catch (error) {
        console.error('Error al actualizar URL:', error);
        throw new Error('No se pudo actualizar la URL');
    }
}

/** Search URLs by a free‑text term */
export async function searchUrls(searchTerm) {
    try {
        const allUrls = await getAllUrls();
        const lower = searchTerm.toLowerCase();
        return allUrls.filter(
            (url) =>
                url.title?.toLowerCase().includes(lower) ||
                url.url?.toLowerCase().includes(lower) ||
                url.content?.toLowerCase().includes(lower) ||
                url.category?.toLowerCase().includes(lower)
        );
    } catch (error) {
        console.error('Error al buscar URLs:', error);
        throw new Error('No se pudo realizar la búsqueda');
    }
}
