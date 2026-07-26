'use client'

import { signOut } from 'next-auth/react'
import { LogOut, Bell } from 'lucide-react'

export default function AdminHeader({ user }: { user: any }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-primary leading-tight">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400">{user?.role || 'Administrator'}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
