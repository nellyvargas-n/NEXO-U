import {
  FiArrowRight,
  FiArrowUpRight,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiCreditCard,
  FiHome,
  FiList,
  FiLock,
  FiPlus,
  FiRotateCcw,
  FiSearch,
  FiUser,
} from 'react-icons/fi'

const icons = {
  'arrow-right': FiArrowRight,
  'arrow-up-right': FiArrowUpRight,
  'book-open': FiBookOpen,
  briefcase: FiBriefcase,
  building: FiHome,
  calendar: FiCalendar,
  check: FiCheck,
  'chevron-down': FiChevronDown,
  'credit-card': FiCreditCard,
  list: FiList,
  lock: FiLock,
  plus: FiPlus,
  'rotate-ccw': FiRotateCcw,
  search: FiSearch,
  user: FiUser,
  wallet: FiCreditCard,
}

function Icon({ name, className = 'size-5' }) {
  const IconComponent = icons[name] ?? FiArrowRight

  return <IconComponent className={className} strokeWidth={1.6} aria-hidden="true" focusable="false" />
}

export default Icon
