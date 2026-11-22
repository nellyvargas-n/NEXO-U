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
import PrivacyPage from '../features/privacy/PrivacyPage.jsx'
import SettingsPage from '../features/settings/SettingsPage.jsx'

export const studentAppRoutes = [
  {
    path: '/app',
    group: 'Tu espacio',
    title: 'Resumen',
    description: 'Tus oportunidades compatibles y el requisito que puedes completar a continuación.',
    activePath: '/app',
    component: SummaryPage,
  },
  {
    path: '/app/perfil',
    group: 'Tu espacio',
    title: 'Mi perfil',
    description: 'Completa y actualiza los datos que se usan para calcular la compatibilidad con cada oportunidad.',
    activePath: '/app/perfil',
    component: ProfilePage,
  },
  {
    path: '/app/oportunidades',
    group: 'Oportunidades',
    title: 'Explorar oportunidades',
    description: 'Convocatorias con requisitos visibles y un match que puedes revisar criterio por criterio.',
    activePath: '/app/oportunidades',
    component: OpportunitiesPage,
  },
  {
    path: '/app/oportunidades/becas',
    group: 'Oportunidades',
    title: 'Becas',
    description: 'Simula una banda orientativa con tu perfil escolar y umbrales oficiales aprobados.',
    activePath: '/app/oportunidades/becas',
    component: ScholarshipsPage,
  },
  {
    path: '/app/oportunidades/pasantias',
    group: 'Oportunidades',
    title: 'Pasantías',
    description: 'Revisa la convocatoria de ejemplo y los requisitos que pide.',
    activePath: '/app/oportunidades/pasantias',
    component: InternshipsPage,
  },
  {
    path: '/app/credenciales',
    group: 'Preparación',
    title: 'Credenciales',
    description: 'Registra habilidades, idiomas y certificados; un emisor autorizado confirma las credenciales verificadas.',
    activePath: '/app/credenciales',
    component: CredentialsPage,
  },
  {
    path: '/app/rutas',
    group: 'Preparación',
    title: 'Rutas de aprendizaje',
    description: 'Cursos públicos sugeridos para cubrir requisitos pendientes de tus oportunidades.',
    activePath: '/app/rutas',
    component: LearningPathsPage,
  },
  {
    path: '/app/rutas/ingles-b1',
    group: 'Preparación',
    title: 'Ruta de Inglés B1',
    description: 'Consulta un curso público de Inglés B1 y gestiona tu inscripción.',
    activePath: '/app/rutas',
    component: CourseDetailPage,
  },
  {
    path: '/app/cursos',
    group: 'Preparación',
    title: 'Cursos',
    description: 'Catálogo público con credenciales ofrecidas, fechas y estado de inscripción.',
    activePath: '/app/cursos',
    component: CoursesPage,
  },
  {
    path: '/app/billetera',
    group: 'Cuenta',
    title: 'Mi billetera',
    description: 'El módulo financiero es opcional y no se conecta a una cuenta bancaria en esta demo.',
    activePath: '/app/billetera',
    component: WalletPage,
  },
  {
    path: '/app/privacidad',
    group: 'Cuenta',
    title: 'Privacidad',
    description: 'Qué datos usa el prototipo y cuáles son los límites de esta demostración.',
    activePath: '/app/privacidad',
    component: PrivacyPage,
  },
  {
    path: '/app/configuracion',
    group: 'Cuenta',
    title: 'Configuración',
    description: 'Las preferencias de cuenta todavía no se guardan en este prototipo.',
    activePath: '/app/configuracion',
    component: SettingsPage,
  },
]

export function findStudentAppRoute(pathname) {
  return studentAppRoutes.find((route) => route.path === pathname) ?? studentAppRoutes[0]
}
