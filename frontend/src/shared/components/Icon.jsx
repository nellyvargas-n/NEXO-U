import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Lock,
  Plus,
  RotateCcw,
  Search,
  Wallet,
} from 'lucide-react'

const icons = {
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'book-open': BookOpen,
  briefcase: Briefcase,
  building: Building2,
  calendar: CalendarDays,
  check: Check,
  'chevron-down': ChevronDown,
  lock: Lock,
  plus: Plus,
  'rotate-ccw': RotateCcw,
  search: Search,
  wallet: Wallet,
}

function Icon({ name, className = 'size-5' }) {
  const IconComponent = icons[name] ?? ArrowRight

  return <IconComponent className={className} strokeWidth={1.75} aria-hidden="true" focusable="false" />
}

export default Icon
