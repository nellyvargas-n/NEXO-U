import SummaryPage from '../features/summary/SummaryPage.jsx'
import ProfilePage from '../features/profile/ProfilePage.jsx'
import OpportunitiesPage from '../features/opportunities/OpportunitiesPage.jsx'
import ScholarshipsPage from '../features/scholarships/ScholarshipsPage.jsx'
import InternshipsPage from '../features/internships/InternshipsPage.jsx'
import CredentialsPage from '../features/credentials/CredentialsPage.jsx'
import LearningPathsPage from '../features/learning-paths/LearningPathsPage.jsx'
import CourseDetailPage from '../features/course-detail/CourseDetailPage.jsx'
import CoursesPage from '../features/courses/CoursesPage.jsx'
import WalletPage from '../features/wallet/WalletPage.jsx'
import SavedPage from '../features/saved/SavedPage.jsx'
import NotificationsPage from '../features/notifications/NotificationsPage.jsx'
import PrivacyPage from '../features/privacy/PrivacyPage.jsx'
import SettingsPage from '../features/settings/SettingsPage.jsx'

export const studentAppRoutes = [
  {
    path: '/app',
    group: 'Tu espacio',
    title: 'Resumen',
    activePath: '/app',
    component: SummaryPage,
  },
  {
    path: '/app/perfil',
    group: 'Tu espacio',
    title: 'Mi perfil',
    activePath: '/app/perfil',
    component: ProfilePage,
  },
  {
    path: '/app/oportunidades',
    group: 'Oportunidades',
    title: 'Explorar oportunidades',
    activePath: '/app/oportunidades',
    component: OpportunitiesPage,
  },
  {
    path: '/app/oportunidades/becas',
    group: 'Oportunidades',
    title: 'Becas',
    activePath: '/app/oportunidades/becas',
    component: ScholarshipsPage,
  },
  {
    path: '/app/oportunidades/pasantias',
    group: 'Oportunidades',
    title: 'Pasantías',
    activePath: '/app/oportunidades/pasantias',
    component: InternshipsPage,
  },
  {
    path: '/app/credenciales',
    group: 'Preparación',
    title: 'Credenciales',
    activePath: '/app/credenciales',
    component: CredentialsPage,
  },
  {
    path: '/app/rutas',
    group: 'Preparación',
    title: 'Rutas de aprendizaje',
    activePath: '/app/rutas',
    component: LearningPathsPage,
  },
  {
    path: '/app/rutas/ingles-b1',
    group: 'Preparación',
    title: 'Ruta de Inglés B1',
    activePath: '/app/rutas',
    component: CourseDetailPage,
  },
  {
    path: '/app/cursos',
    group: 'Preparación',
    title: 'Cursos',
    activePath: '/app/cursos',
    component: CoursesPage,
  },
  { path: '/app/guardados', group: 'Cuenta', title: 'Guardados', activePath: '/app/guardados', component: SavedPage },
  { path: '/app/notificaciones', group: 'Cuenta', title: 'Notificaciones', activePath: '/app/notificaciones', component: NotificationsPage },
  {
    path: '/app/billetera',
    group: 'Cuenta',
    title: 'Mi billetera',
    activePath: '/app/billetera',
    component: WalletPage,
  },
  {
    path: '/app/privacidad',
    group: 'Cuenta',
    title: 'Privacidad',
    activePath: '/app/privacidad',
    component: PrivacyPage,
  },
  {
    path: '/app/configuracion',
    group: 'Cuenta',
    title: 'Configuración',
    activePath: '/app/configuracion',
    component: SettingsPage,
  },
]

export function findStudentAppRoute(pathname) {
  return studentAppRoutes.find((route) => route.path === pathname) ?? studentAppRoutes[0]
}
