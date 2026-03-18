import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/auth/registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: 'auth/registro',
    loadComponent: () => import('./pages/auth/registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: 'login/unirse-equipo',
    loadComponent: () => import('./pages/login/unirse-equipo/unirse-equipo.page').then( m => m.UnirseEquipoPage)
  },

  // ==========================================
  // 👨‍🏫 ZONA DEL COACH
  // ==========================================
  {
    path: 'coach/dashboard',
    loadComponent: () => import('./pages/coach/dashboard/dashboard.page').then( m => m.CoachDashboardPage)
  }, 
  {
    path: 'ejercicios',
    loadComponent: () => import('./pages/coach/ejercicios/ejercicios.page').then( m => m.EjerciciosPage)
  },
  {
    path: 'coach/ejercicios',
    loadComponent: () => import('./pages/coach/ejercicios/ejercicios.page').then( m => m.EjerciciosPage)
  },
  {
    path: 'coach/rutinas',
    loadComponent: () => import('./pages/coach/rutinas/rutinas.page').then( m => m.RutinasPage)
  },
  {
    path: 'coach/crear-rutina',
    loadComponent: () => import('./pages/coach/crear-rutina/crear-rutina.page').then( m => m.CrearRutinaPage)
  },
  {
    path: 'coach/equipos',
    loadComponent: () => import('./pages/coach/equipos/equipos.page').then( m => m.EquiposPage)
  },
  {
    path: 'coach/dietas',
    loadComponent: () => import('./pages/coach/dietas/dietas.page').then( m => m.DietasPage)
  },
  {
    path: 'coach/alumno-detalle',
    loadComponent: () => import('./pages/coach/alumno-detalle/alumno-detalle.page').then( m => m.AlumnoDetallePage)
  },
  {
    path: 'coach/crear-dieta',
    loadComponent: () => import('./pages/coach/crear-dieta/crear-dieta.page').then( m => m.CrearDietaPage)
  },
  {
    path: 'coach/perfil-coach',
    loadComponent: () => import('./pages/coach/perfil-coach/perfil-coach.page').then( m => m.PerfilCoachPage)
  },

  // ==========================================
  // 🏃‍♂️ ZONA DEL ALUMNO (NUEVA ESTRUCTURA TABS)
  // ==========================================
  {
    path: 'entreno',
    // 1. Cargamos el contenedor (La barra inferior)
    loadComponent: () => import('./pages/entreno/tabs/tabs.page').then( m => m.TabsPage),
    // 2. Metemos las páginas adentro de la barra
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/entreno/dashboard/dashboard.page').then( m => m.EntrenoDashboardPage)
      },
      {
        path: 'nutricion',
        loadComponent: () => import('./pages/nutricion/dashboard/dashboard.page').then( m => m.NutricionPage)
      },
      {
        path: 'progreso',
        loadComponent: () => import('./pages/entreno/progreso/progreso.page').then( m => m.ProgresoPage)
      },
      {
        path: 'mi-rutina',
        loadComponent: () => import('./pages/entreno/mi-rutina/mi-rutina.page').then( m => m.MiRutinaPage)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/entreno/perfil/perfil.page').then( m => m.PerfilPage)
      },
      {
        // Si alguien pone solo '/entreno', lo forzamos a ir al dashboard
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  // La página de resumen queda FUERA de los tabs para que abarque toda la pantalla al terminar
  {
    path: 'entreno/resumen',
    loadComponent: () => import('./pages/entreno/resumen/resumen.page').then( m => m.ResumenPage)
  },
  {
    path: 'nuevo-entreno',
    loadComponent: () => import('./pages/entreno/nuevo-entreno/nuevo-entreno.page').then( m => m.NuevoEntrenoPage)
  },

  // ==========================================
  // ⚙️ OTROS Y MODALES
  // ==========================================
  {
    path: 'nutricion/dashboard',
    loadComponent: () => import('./pages/nutricion/dashboard/dashboard.page').then( m => m.NutricionPage)
  },
  {
    path: 'perfil/ajustes',
    loadComponent: () => import('./pages/perfil/ajustes/ajustes.page').then( m => m.AjustesPage)
  },
  {
    path: 'modals/selector-ejercicios',
    loadComponent: () => import('./modals/selector-ejercicios/selector-ejercicios.page').then( m => m.SelectorEjerciciosPage)
  },
  {
    path: 'modals/upload-preview',
    loadComponent: () => import('./modals/upload-preview/upload-preview.page').then( m => m.UploadPreviewPage)
  },
  {
    path: 'modals/story-viewer',
    loadComponent: () => import('./modals/story-viewer/story-viewer.page').then( m => m.StoryViewerPage)
  },
  {
    path: 'progreso',
    loadComponent: () => import('./pages/entreno/progreso/progreso.page').then( m => m.ProgresoPage)
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding.page').then( m => m.OnboardingPage)
  },
  {
    path: 'coach/mis-alumnos',
    loadComponent: () => import('./pages/coach/mis-alumnos/mis-alumnos.page').then( m => m.MisAlumnosPage)
  }
];