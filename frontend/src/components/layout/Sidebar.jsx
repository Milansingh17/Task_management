import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  PlusCircleIcon, 
  ChartBarIcon, 
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Create Task', path: '/tasks/create', icon: PlusCircleIcon },
    { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
    { name: 'Activity Log', path: '/activity-log', icon: ClockIcon },
  ];

  if (user?.is_staff) {
    navItems.push({ name: 'Admin Panel', path: '/admin-panel', icon: ShieldCheckIcon });
  }

  return (
    <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 shadow-md min-h-screen">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`mr-3 h-6 w-6 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;