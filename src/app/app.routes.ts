import { Routes } from '@angular/router';
// 👇 Importamos el Guardia de Seguridad que creaste
import { authGuard } from './guards/auth-guard'; 

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
  
  // ==========================================
  // 🔓 ZONA PÚBLICA (SIN GUARDIA)
  // ==========================================
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
  // 👨‍🏫 ZONA DEL COACH (PROTEGIDA)
  // ==========================================
  {
    path: 'coach/dashboard',
    loadComponent: () => import('./pages/coach/dashboard/dashboard.page').then( m => m.CoachDashboardPage),
    canActivate: [authGuard] // 🛡️ Guardia activado
  }, 
  {
    path: 'coach/ejercicios',
    loadComponent: () => import('./pages/coach/ejercicios/ejercicios.page').then( m => m.EjerciciosPage),
    canActivate: [authGuard]
  },
  {
    path: 'coach/rutinas',
    loadComponent: () => import('./pages/coach/rutinas/rutinas.page').then( m => m.RutinasPage),
    canActivate: [authGuard]
  },
  {
    path: 'coach/crear-rutina',
    loadComponent: () => import('./pages/coach/crear-rutina/crear-rutina.page').then( m => m.CrearRutinaPage),
    canActivate: [authGuard]
  },
  {
    path: 'coach/equipos',
    loadComponent: () => import('./pages/coach/equipos/equipos.page').then( m => m.EquiposPage),
    canActivate: [authGuard]
  },
  {
    path: 'coach/dietas',
    loadComponent: () => import('./pages/coach/dietas/dietas.page').then( m => m.DietasPage),
    canActivate: [authGuard]
  },
  {
    path: 'coach/alumno-detalle',
    loadComponent: () => import('./pages/coach/alumno-detalle/alumno-detalle.page').then( m => m.AlumnoDetallePage),
    canActivate: [authGuard]
  },
  {
    path: 'coach/crear-dieta',
    loadComponent: () => import('./pages/coach/crear-dieta/crear-dieta.page').then( m => m.CrearDietaPage),
    canActivate: [authGuard]
  },
  {
    path: 'coach/perfil-coach',
    loadComponent: () => import('./pages/coach/perfil-coach/perfil-coach.page').then( m => m.PerfilCoachPage),
    canActivate: [authGuard]
  },
  {
    path: 'coach/mis-alumnos',
    loadComponent: () => import('./pages/coach/mis-alumnos/mis-alumnos.page').then( m => m.MisAlumnosPage),
    canActivate: [authGuard]
  },

  // ==========================================
  // 🏃‍♂️ ZONA DEL ALUMNO (PROTEGIDA)
  // ==========================================
  {
    path: 'entreno',
    loadComponent: () => import('./pages/entreno/tabs/tabs.page').then( m => m.TabsPage),
    canActivate: [authGuard], // 🛡️ Protegemos la ruta padre. Automáticamente protege a todos los "children"
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
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'entreno/resumen',
    loadComponent: () => import('./pages/entreno/resumen/resumen.page').then( m => m.ResumenPage),
    canActivate: [authGuard]
  },
  {
    path: 'nuevo-entreno',
    loadComponent: () => import('./pages/entreno/nuevo-entreno/nuevo-entreno.page').then( m => m.NuevoEntrenoPage),
    canActivate: [authGuard]
  },

  // ==========================================
  // ⚙️ OTROS Y MODALES (PROTEGIDOS SI APLICAN)
  // ==========================================
  {
    path: 'onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding.page').then( m => m.OnboardingPage),
    canActivate: [authGuard] // 🛡️ Solo usuarios registrados pueden hacer el onboarding
  },
  {
    path: 'perfil/ajustes',
    loadComponent: () => import('./pages/perfil/ajustes/ajustes.page').then( m => m.AjustesPage),
    canActivate: [authGuard]
  },
  
  // Las rutas duplicadas o innecesarias fueron limpiadas para mantener el código ordenado
];