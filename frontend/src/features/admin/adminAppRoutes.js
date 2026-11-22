import AdminAuditPage from './AdminAuditPage.jsx'
import AdminDashboardPage from './AdminDashboardPage.jsx'
import AdminOrganizationsPage from './AdminOrganizationsPage.jsx'
import AdminScholarshipBandsPage from './AdminScholarshipBandsPage.jsx'
import AdminUsersPage from './AdminUsersPage.jsx'

export const adminAppRoutes = [
  { path: '/admin', group: 'Panel', title: 'Resumen', component: AdminDashboardPage },
  { path: '/admin/organizaciones', group: 'Supervisión', title: 'Organizaciones', component: AdminOrganizationsPage },
  { path: '/admin/usuarios', group: 'Supervisión', title: 'Usuarios', component: AdminUsersPage },
  { path: '/admin/becas', group: 'Supervisión', title: 'Revisión de becas', component: AdminScholarshipBandsPage },
  { path: '/admin/auditoria', group: 'Supervisión', title: 'Auditoría', component: AdminAuditPage },
]

export function findAdminAppRoute(pathname) {
  return adminAppRoutes.find((route) => route.path === pathname) ?? adminAppRoutes[0]
}
