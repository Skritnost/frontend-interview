import { NavLink, Link } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/todo-lists', label: 'Todo Lists' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm text-white border-b border-white/10">
      <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-10">
        <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          TodoApp
        </Link>
        <ul className="flex gap-1">
          {navItems.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `relative px-4 py-4 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
