import { Injectable, inject } from '@angular/core';
// 👇 Asegúrate de que doc y updateDoc estén importados aquí
import { Firestore, collection, addDoc, query, orderBy, onSnapshot, where, getDocs, Timestamp, doc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore = inject(Firestore);

  constructor() { }

  // 1️⃣ BUSCAR O CREAR LA SALA DE CHAT
  async obtenerIdChat(uid1: string, uid2: string): Promise<string> {
    const chatsRef = collection(this.firestore, 'chats');
    
    // Buscamos salas donde uid1 sea participante
    const q = query(chatsRef, where('participantes', 'array-contains', uid1));
    const snapshot = await getDocs(q);

    let chatIdEncontrado = null;

    // Filtramos para asegurar que uid2 también esté en esa misma sala
    snapshot.forEach(documento => {
      const participantes = documento.data()['participantes'];
      if (participantes.includes(uid2)) {
        chatIdEncontrado = documento.id;
      }
    });

    // Si ya habían chateado, devolvemos esa sala
    if (chatIdEncontrado) return chatIdEncontrado;

    // Si es la primera vez que hablan, creamos una sala nueva
    const nuevoChat = await addDoc(chatsRef, {
      participantes: [uid1, uid2],
      creadoEn: Timestamp.now()
    });

    return nuevoChat.id;
  }

  // 2️⃣ ENVIAR UN MENSAJE
  async enviarMensaje(chatId: string, texto: string, emisorId: string) {
    const mensajesRef = collection(this.firestore, `chats/${chatId}/mensajes`);
    await addDoc(mensajesRef, {
      texto: texto,
      emisorId: emisorId,
      fecha: Timestamp.now()
    });
  }

  // 3️⃣ ESCUCHAR MENSAJES EN TIEMPO REAL
  escucharMensajes(chatId: string, callback: (mensajes: any[]) => void) {
    const mensajesRef = collection(this.firestore, `chats/${chatId}/mensajes`);
    // Ordenamos por fecha para que los más viejos salgan arriba y los nuevos abajo
    const q = query(mensajesRef, orderBy('fecha', 'asc'));

    // onSnapshot es la magia: se dispara automáticamente cada vez que alguien escribe
    return onSnapshot(q, (snapshot) => {
      const mensajes = snapshot.docs.map(documento => {
        const data = documento.data();
        return {
          id: documento.id,
          ...data,
          // Convertimos el tiempo de Firebase a formato JavaScript
          fecha: data['fecha'] ? data['fecha'].toDate() : new Date() 
        };
      });
      callback(mensajes);
    });
  }

  // 👇 4️⃣ AVISA A FIREBASE QUE ESTÁS ESCRIBIENDO
  actualizarEscribiendo(chatId: string, uid: string, estado: boolean) {
    const chatRef = doc(this.firestore, `chats/${chatId}`);
    updateDoc(chatRef, {
      [`escribiendo_${uid}`]: estado
    }).catch(() => {}); // Ignoramos el error si la sala acaba de nacer y aún no tiene este campo
  }

  // 👇 5️⃣ ESCUCHA SI EL OTRO USUARIO ESTÁ ESCRIBIENDO
  escucharEstadoChat(chatId: string, callback: (data: any) => void) {
    const chatRef = doc(this.firestore, `chats/${chatId}`);
    return onSnapshot(chatRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    });
  }
}