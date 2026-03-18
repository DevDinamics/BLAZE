import { Injectable, inject } from '@angular/core';
import { 
  Firestore, collection, query, where, getDocs, doc, addDoc, updateDoc, 
  arrayUnion, getDoc, orderBy, limit, increment, onSnapshot 
} from '@angular/fire/firestore';

// 👇 1. IMPORTAR STORAGE (Faltaba esto)
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private firestore = inject(Firestore);
  
  // 👇 2. INYECTAR STORAGE (Faltaba esto para usar this.storage)
  private storage = inject(Storage);

  constructor() { }

  // ==========================================
  // 1. UNIRSE A UN EQUIPO
  // ==========================================
  async unirseAEquipo(codigo: string, uidAlumno: string) {
    const q = query(collection(this.firestore, 'equipos'), where('codigo', '==', codigo));
    const snapshot = await getDocs(q);

    if (snapshot.empty) throw new Error('Código no válido 🚫');

    const equipoDoc = snapshot.docs[0];
    const equipoData = equipoDoc.data();

    if (equipoData['miembros'].length >= equipoData['limite']) {
      throw new Error('El equipo está lleno 😱 Dile a tu coach que aumente su plan.');
    }

    if (equipoData['miembros'].includes(uidAlumno)) {
      throw new Error('¡Ya eres parte de este equipo! 😎');
    }

    await updateDoc(doc(this.firestore, 'equipos', equipoDoc.id), {
      miembros: arrayUnion(uidAlumno)
    });

    await updateDoc(doc(this.firestore, 'usuarios', uidAlumno), {
      equipoId: equipoDoc.id,
      coachId: equipoData['coachId'],
      nombreEquipo: equipoData['nombre']
    });

    return equipoData;
  }

  // ==========================================
  // 2. OBTENER MI PERFIL
  // ==========================================
  async obtenerMiPerfil(uid: string) {
    const docRef = doc(this.firestore, 'usuarios', uid);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  }

  // ==========================================
  // 3. OBTENER RUTINA
  // ==========================================
  async obtenerRutinaActual(uidAlumno: string, equipoId: string) {
    console.log('--- DIAGNÓSTICO DE RUTINA ---');
    const qIndividual = query(
      collection(this.firestore, 'rutinas'),
      where('alumnoId', '==', uidAlumno),
      orderBy('fechaCreacion', 'desc'),
      limit(1)
    );

    try {
      const snapIndividual = await getDocs(qIndividual);
      if (!snapIndividual.empty) {
        return { id: snapIndividual.docs[0].id, ...snapIndividual.docs[0].data() };
      }
    } catch (error) {
      console.error('❌ ERROR CRÍTICO:', error);
    }
    return null;
  }

  // ==========================================
  // 4. OBTENER DATOS DEL COACH
  // ==========================================
  async obtenerCoach(coachId: string) {
    const docRef = doc(this.firestore, 'usuarios', coachId);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : { nombre: 'Tu Coach', foto: '' };
  }

  // ==========================================
  // 5. ESCUCHAR PERFIL EN TIEMPO REAL 📡
  // ==========================================
  escucharPerfil(uid: string, callback: (perfil: any) => void) {
    const docRef = doc(this.firestore, 'usuarios', uid);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      }
    });
  }

  // ==========================================
  // 6. GUARDAR ENTRENO
  // ==========================================
  async registrarTerminoRutina(uid: string, datosRutina: any) {
    const userRef = doc(this.firestore, 'usuarios', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    
    const userData = userSnap.data();
    const hoy = new Date().toISOString().split('T')[0];
    
    if (userData['ultimoEntrenoFecha'] === hoy) {
      throw new Error('¡Ya registraste tu entreno de hoy! 🛑 Vuelve mañana.');
    }

    await updateDoc(userRef, { ultimoEntrenoFecha: hoy });

    await addDoc(collection(this.firestore, 'solicitudes_aprobacion'), {
      coachId: userData['coachId'], 
      alumnoId: uid,
      nombreAlumno: userData['nombre'],
      fotoAlumno: userData['foto'] || '',
      nombreRutina: datosRutina.nombreRutina,
      xpReclamada: datosRutina.xpGanada,
      totalKilos: datosRutina.totalKilos,
      fecha: new Date(),
      estado: 'pendiente'
    });
  }

  calcularNivel(xp: number): number {
    return Math.floor(xp / 1000) + 1;
  }

  async actualizarPerfil(uid: string, datos: any) {
    const userRef = doc(this.firestore, 'usuarios', uid);
    await updateDoc(userRef, datos);
  }

  // ==========================================
  // 📸 7. HISTORIAS (STORIES)
  // ==========================================
  
  async subirHistoria(archivo: Blob, usuario: any) {
    // 1. Referencia única en Storage
    const ruta = `stories/${usuario.equipoId}/${usuario.uid}/${Date.now()}.jpg`;
    const storageRef = ref(this.storage, ruta);
    
    // 2. Subir el Blob
    await uploadBytes(storageRef, archivo);
    const url = await getDownloadURL(storageRef);

    // 3. Guardar en Firestore
    const historia = {
      uidUsuario: usuario.uid,
      nombreUsuario: usuario.nombre,
      fotoUsuario: usuario.foto,
      equipoId: usuario.equipoId,
      imgUrl: url,
      fecha: new Date(),
      vistoPor: [] 
    };

    await addDoc(collection(this.firestore, 'historias'), historia);
  }

  // 👇 AGREGUÉ ESTO PARA QUE PUEDAS VER LAS HISTORIAS EN EL DASHBOARD
  obtenerHistoriasDelTeam(equipoId: string, callback: (historias: any[]) => void) {
    const ayer = new Date();
    ayer.setHours(ayer.getHours() - 24); // 👈 Calculamos hace 24h
  
    const q = query(
      collection(this.firestore, 'historias'),
      where('equipoId', '==', equipoId),
      where('fecha', '>', ayer), // 👈 ESTA ES LA MAGIA
      orderBy('fecha', 'asc')
    );
  }
}