import { FiActivity, FiAward, FiGrid, FiShield, FiUsers } from 'react-icons/fi'
import WorkspaceSidebar from '../../navigation/components/WorkspaceSidebar.jsx'

const groups = [
  { label: 'Inicio', items: [{ label: 'Resumen', href: '/admin', icon: FiGrid }] },
  {
    label: 'Supervisión',
    items: [
      { label: 'Organizaciones', href: '/admin/organizaciones', icon: FiShield },
      { label: 'Usuarios y accesos', href: '/admin/usuarios', icon: FiUsers },
      { label: 'Revisión de becas', href: '/admin/becas', icon: FiAward },
      { label: 'Auditoría', href: '/admin/auditoria', icon: FiActivity },
    ],
  },
]

function AdminSidebar({ pathname, isOpen, onClose }) {
  return (
    <WorkspaceSidebar
      id="admin-sidebar"
      ariaLabel="Navegación administrativa"
      homeHref="/admin"
      sectionLabel="ADMINISTRACIÓN"
      identity="Panel administrativo"
      groups={groups}
      pathname={pathname}
      isOpen={isOpen}
      onClose={onClose}
    />
  )
}

export default AdminSidebar
