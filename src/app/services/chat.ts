import { Injectable, inject } from '@angular/core';
// 👇 Agregamos 'increment' a las importaciones
import { Firestore, collection, addDoc, query, orderBy, onSnapshot, where, getDocs, Timestamp, doc, updateDoc, increment } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore = inject(Firestore);

  constructor() { }

  async obtenerIdChat(uid1: string, uid2: string): Promise<string> {
    // ... (Mantén tu código actual de obtenerIdChat tal como estaba)
    const chatsRef = collection(this.firestore, 'chats');
    const q = query(chatsRef, where('participantes', 'array-contains', uid1));
    const snapshot = await getDocs(q);
    let chatIdEncontrado = null;
    snapshot.forEach(documento => {
      if (documento.data()['participantes'].includes(uid2)) chatIdEncontrado = documento.id;
    });
    if (chatIdEncontrado) return chatIdEncontrado;
    const nuevoChat = await addDoc(chatsRef, { participantes: [uid1, uid2], creadoEn: Timestamp.now() });
    return nuevoChat.id;
  }

  // 👇 ACTUALIZADO: Ahora recibe quién es el RECEPTOR para subirle su contador
  async enviarMensaje(chatId: string, texto: string, emisorId: string, receptorId: string) {
    const mensajesRef = collection(this.firestore, `chats/${chatId}/mensajes`);
    
    // 1. Guardamos el mensaje
    await addDoc(mensajesRef, { texto, emisorId, fecha: Timestamp.now() });

    // 2. Le sumamos +1 a las notificaciones del que lo recibe
    const chatRef = doc(this.firestore, `chats/${chatId}`);
    await updateDoc(chatRef, {
      [`notificaciones_${receptorId}`]: increment(1)
    }).catch(() => {});
  }

  // 👇 NUEVO: Pone el contador en 0 cuando entras a la sala
  async limpiarNotificaciones(chatId: string, miUid: string) {
    const chatRef = doc(this.firestore, `chats/${chatId}`);
    await updateDoc(chatRef, {
      [`notificaciones_${miUid}`]: 0
    }).catch(() => {});
  }

  // 👇 NUEVO: Suma todas tus notificaciones de todos tus chats (para los Tabs)
  escucharTotalSinLeer(miUid: string, callback: (total: number) => void) {
    const chatsRef = collection(this.firestore, 'chats');
    const q = query(chatsRef, where('participantes', 'array-contains', miUid));
    
    return onSnapshot(q, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach(doc => {
        // Buscamos cuántas notificaciones tienes en esta sala y las sumamos
        const sinLeer = doc.data()[`notificaciones_${miUid}`] || 0;
        total += sinLeer;
      });
      callback(total);
    });
  }

  // ... (Mantén tus funciones escucharMensajes, actualizarEscribiendo y escucharEstadoChat igual)
  escucharMensajes(chatId: string, callback: (mensajes: any[]) => void) {
    const mensajesRef = collection(this.firestore, `chats/${chatId}/mensajes`);
    const q = query(mensajesRef, orderBy('fecha', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const mensajes = snapshot.docs.map(documento => {
        const data = documento.data();
        return { id: documento.id, ...data, fecha: data['fecha'] ? data['fecha'].toDate() : new Date() };
      });
      callback(mensajes);
    });
  }

  actualizarEscribiendo(chatId: string, uid: string, estado: boolean) {
    const chatRef = doc(this.firestore, `chats/${chatId}`);
    updateDoc(chatRef, { [`escribiendo_${uid}`]: estado }).catch(() => {}); 
  }

  escucharEstadoChat(chatId: string, callback: (data: any) => void) {
    const chatRef = doc(this.firestore, `chats/${chatId}`);
    return onSnapshot(chatRef, (docSnap) => {
      if (docSnap.exists()) callback(docSnap.data());
    });
  }
}