import { useState } from 'react'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  
  const students = [
    { name: 'Mahmoud Galal', id: '192100124' },
    { name: 'Abdelshafy Ayman', id: '192100092' },
    { name: 'Amr Amawy', id: '192100136' },
    { name: 'Daniel Ehab', id: '192100133' },
    { name: 'Mazen Mohsen', id: '192100158' },
  ]

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-16 left-3 z-50 bg-primary text-white p-2 rounded-md shadow-lg hover:bg-teal-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-primary text-white w-64 min-h-screen p-5 flex-shrink-0 fixed lg:static z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="sticky top-5">
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-2 border-b-2 border-teal-400 pb-2">Supervisor</h2>
            <p className="text-teal-200 text-base sm:text-lg">DR. Mostafa Ashour</p>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-3 border-b-2 border-teal-400 pb-2">Team Members</h2>
            <ul className="space-y-2 sm:space-y-3">
              {students.map((student, index) => (
                <li key={index} className="bg-teal-800/30 p-2 sm:p-3 rounded-lg border-l-4 border-teal-400">
                  <p className="font-semibold text-teal-100 text-sm sm:text-base">{student.name}</p>
                  <p className="text-xs sm:text-sm text-teal-300">ID: {student.id}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

