import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'LCG' },
    { path: '/midsquare', label: 'Middle-Square' },
    { path: '/single-server', label: 'Queue Simulation' },
    { path: '/multi-server', label: 'Queue Simulation (Multi server)' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/queuing-calc', label: 'Queuing theory' },
    { path: '/ks-test', label: 'uniformity test' },
    { path: '/autocorrelation', label: 'Dependency test' },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className="bg-primary overflow-x-auto px-2 sm:px-3 md:px-5 py-2 sm:py-3 flex items-center gap-1 sm:gap-2">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-white text-center no-underline text-xs sm:text-sm md:text-base lg:text-lg rounded transition-colors whitespace-nowrap flex-shrink-0 ${
            isActive(item.path)
              ? 'bg-teal-700 font-bold'
              : 'hover:bg-teal-500'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export default Navbar

