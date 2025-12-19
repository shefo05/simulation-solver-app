import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'LCG' },
    { path: '/midsquare', label: 'Mid-Sq' },
    { path: '/single-server', label: 'Single' },
    { path: '/multi-server', label: 'Multi' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/queuing-calc', label: 'Calc' },
    { path: '/ks-test', label: 'KS-Test' },
    { path: '/autocorrelation', label: 'Independence' },
  ]

  return (
    <nav className="bg-primary overflow-hidden px-3 sm:px-5 py-3 flex items-center flex-wrap gap-2">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`px-3 sm:px-4 py-2 sm:py-3 text-white text-center no-underline text-sm sm:text-lg rounded transition-colors ${
            location.pathname === item.path
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

