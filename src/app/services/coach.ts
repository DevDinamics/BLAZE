import { Injectable, inject } from '@angular/core';
import { 
  Firestore, collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, 
  orderBy, onSnapshot, increment, arrayUnion, limit, writeBatch 
} from '@angular/fire/firestore';

// 👇 IMPORTANTE: Importamos Storage desde su propio paquete
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class CoachService {

  private firestore = inject(Firestore);
  private storage = inject(Storage); // 👈 Inyectamos Storage correctamente

  constructor() { }

  // ==========================================
  // 1. EQUIPOS (Teams)
  // ==========================================
  async obtenerMisEquipos(uidCoach: string) {
    const q = query(collection(this.firestore, 'equipos'), where('coachId', '==', uidCoach));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async crearEquipo(nombreEquipo: string, uidCoach: string, plan: string = 'starter') {
    const limites: any = { 'starter': 5, 'pro': 50, 'elite': 999 };
    const maxAlumnos = limites[plan] || 5;
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const codigoAcceso = `TEAM-${randomCode}`;
    
    const equipoRef = doc(collection(this.firestore, 'equipos'));
    
    const nuevoEquipo = {
      id: equipoRef.id,
      coachId: uidCoach,
      nombre: nombreEquipo,
      descripcion: '',
      codigo: codigoAcceso,
      limite: maxAlumnos,
      miembros: [],
      fechaCreacion: new Date(),
      color: 'bg-blue-500'
    };

    await setDoc(equipoRef, nuevoEquipo);
    return nuevoEquipo;
  }

  async actualizarEquipo(idEquipo: string, nuevoNombre: string) {
    const equipoRef = doc(this.firestore, 'equipos', idEquipo);
    await updateDoc(equipoRef, { nombre: nuevoNombre });
  }

  async eliminarEquipo(equipoId: string, miembrosIds: string[]) {
    const batch = writeBatch(this.firestore); 
    const equipoRef = doc(this.firestore, 'equipos', equipoId);
    batch.delete(equipoRef); 

    if (miembrosIds && miembrosIds.length > 0) {
      miembrosIds.forEach(uidAlumno => {
        if (uidAlumno) {
          const alumnoRef = doc(this.firestore, 'usuarios', uidAlumno);
          batch.update(alumnoRef, { 
            equipoId: null,      
            nombreEquipo: null,  
            coachId: null        
          });
        }
      });
    }
    await batch.commit(); 
  }

  // ==========================================
  // 2. RUTINAS (Entrenamientos)
  // ==========================================
  async crearRutina(rutina: any) {
    const rutinaRef = doc(collection(this.firestore, 'rutinas'));
    const idRutina = rutinaRef.id;
    
    await setDoc(rutinaRef, {
      ...rutina,
      id: idRutina,
      active: true,
      fechaCreacion: new Date()
    });
    return idRutina;
  }

  async obtenerMisRutinas(uidCoach: string) {
    const q = query(
      collection(this.firestore, 'rutinas'), 
      where('coachId', '==', uidCoach),
      orderBy('fechaCreacion', 'desc') 
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async obtenerMisAlumnos(uidCoach: string) {
    const q = query(collection(this.firestore, 'usuarios'), where('coachId', '==', uidCoach));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async obtenerRutinaPorId(id: string) {
    const docRef = doc(this.firestore, 'rutinas', id);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  }

  async actualizarRutina(id: string, datos: any) {
    const docRef = doc(this.firestore, 'rutinas', id);
    await updateDoc(docRef, {
      ...datos,
      fechaActualizacion: new Date(),
      visto: false 
    });
  }

  async eliminarRutina(idRutina: string) {
    const docRef = doc(this.firestore, 'rutinas', idRutina);
    await deleteDoc(docRef);
  }

  // ==========================================
  // 3. APROBACIONES & RANKING
  // ==========================================
  escucharSolicitudes(coachId: string, callback: (solicitudes: any[]) => void) {
    const q = query(
      collection(this.firestore, 'solicitudes_aprobacion'),
      where('coachId', '==', coachId),
      where('estado', '==', 'pendiente'),
      orderBy('fecha', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const solicitudes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(solicitudes);
    });
  }

  async aprobarEntreno(solicitud: any) {
    const alumnoRef = doc(this.firestore, 'usuarios', solicitud.alumnoId);
    
    await updateDoc(alumnoRef, {
      xpTotal: increment(solicitud.xpReclamada || 0),
      xpSemanal: increment(solicitud.xpReclamada || 0),
      entrenamientosCompletados: increment(1),
      kilosLevantadosTotal: increment(solicitud.totalKilos || 0),
      historialRutinas: arrayUnion({
        nombre: solicitud.nombreRutina,
        fecha: solicitud.fecha, 
        xp: solicitud.xpReclamada || 0
      })
    });
    await deleteDoc(doc(this.firestore, 'solicitudes_aprobacion', solicitud.id));
  }

  async rechazarEntreno(solicitudId: string) {
    await deleteDoc(doc(this.firestore, 'solicitudes_aprobacion', solicitudId));
  }

  async obtenerRanking(uidCoach: string) {
    const q = query(
      collection(this.firestore, 'usuarios'),
      where('coachId', '==', uidCoach), 
      where('rol', '==', 'alumno'),     
      orderBy('xpTotal', 'desc'),       
      limit(20)                         
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  async obtenerMisPlantillas(uidCoach: string) {
    const q = query(
      collection(this.firestore, 'rutinas'), 
      where('coachId', '==', uidCoach),
      where('esPlantilla', '==', true),
      orderBy('nombre', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async guardarRutina(rutina: any, esPlantilla: boolean = false) {
    const rutinaRef = doc(collection(this.firestore, 'rutinas'));
    
    await setDoc(rutinaRef, {
      ...rutina,
      id: rutinaRef.id,
      esPlantilla: esPlantilla,
      alumnoId: esPlantilla ? null : rutina.alumnoId,
      fechaCreacion: new Date()
    });
  }

  async obtenerPerfilCoachPublico(uid: string) {
    try {
      const docSnap = await getDoc(doc(this.firestore, 'usuarios', uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          uid: docSnap.id,
          nombre: data['nombre'],
          foto: data['foto'] || null,
          cargo: data['cargo'] || 'Coach FitGo',
          bio: data['bio'] || 'Listo para ayudarte a alcanzar tus metas.',
          especialidad: data['especialidad'] || 'General',
          experiencia: data['experiencia'] || 'N/A',
          credenciales: data['credenciales'] || ''
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo coach:", error);
      return null;
    }
  }

  // 👇 FUNCIÓN DE STORAGE CORREGIDA
  async subirFotoPerfil(blob: Blob, uid: string): Promise<string> {
    try {
      // Usamos 'ref' importado de '@angular/fire/storage'
      const storageRef = ref(this.storage, `coaches/${uid}/perfil.jpg`);
      
      // Subimos el archivo
      await uploadBytes(storageRef, blob);
      
      // Obtenemos la URL
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error subiendo foto:', error);
      throw error;
    }
  }

  // 👇 FUNCIONES DE PERFIL
  
  async obtenerMiPerfilCoach(uid: string) {
    const docRef = doc(this.firestore, 'usuarios', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  async actualizarPerfilCoach(uid: string, datos: any) {
    const docRef = doc(this.firestore, 'usuarios', uid);
    return updateDoc(docRef, {
      nombre: datos.nombre,
      apellido: datos.apellido || '',
      titulo: datos.titulo || '', 
      cargo: datos.titulo || 'Head Coach', 
      especialidad: datos.especialidad || '',
      experiencia: datos.experiencia || '',
      certificaciones: datos.certificaciones || '', 
      credenciales: datos.certificaciones || '', 
      bio: datos.bio || '',
      foto: datos.foto // Se guarda la URL de la foto si existe
    });
  }

}