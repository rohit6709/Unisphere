import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Bell, MessageSquare, LogOut,
  ShieldCheck, BookOpen, ClipboardList, UserCog, UserCheck,
  Megaphone, ListOrdered, BarChart3, ClipboardCheck, BookMarked,
  GraduationCap, CalendarClock, BellRing, UserCircle, Trophy,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';

// ─── Navigation Config by Role ────────────────────────────────────────────────
const NAV_CONFIG = {
  student: [
    {
      group: 'Overview',
      links: [
        { name: 'Dashboard', path: '/dashboard/student', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Campus Life',
      links: [
        { name: 'Events', path: '/events', icon: Calendar },
        { name: 'Clubs', path: '/clubs', icon: Users },
        { name: 'My Clubs', path: '/my-clubs', icon: BookMarked },
        { name: 'My Registrations', path: '/my-registrations', icon: ClipboardList },
      ],
    },
    {
      group: 'Communication',
      links: [
        { name: 'Messages', path: '/messages', icon: MessageSquare },
        { name: 'Notices', path: '/notices', icon: Bell },
        { name: 'Notifications', path: '/notifications', icon: BellRing },
      ],
    },
    {
      group: 'Account',
      links: [
        { name: 'My Profile', path: '/profile/student', icon: UserCircle },
      ],
    },
  ],

  faculty: [
    {
      group: 'Overview',
      links: [
        { name: 'Dashboard', path: '/dashboard/faculty', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Club Advising',
      links: [
        { name: 'My Clubs', path: '/faculty/clubs', icon: Users },
        { name: 'Event Review', path: '/faculty/events', icon: ClipboardCheck },
      ],
    },
    {
      group: 'Content',
      links: [
        { name: 'Notice Board', path: '/faculty/notices', icon: Megaphone },
        { name: 'Events', path: '/events', icon: Calendar },
      ],
    },
    {
      group: 'Account',
      links: [
        { name: 'My Profile', path: '/profile/faculty', icon: UserCircle },
      ],
    },
  ],

  admin: [
    {
      group: 'Overview',
      links: [
        { name: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Approvals', path: '/admin/approvals', icon: ShieldCheck },
      ],
    },
    {
      group: 'User Management',
      links: [
        { name: 'Students', path: '/admin/students', icon: GraduationCap },
        { name: 'Faculty', path: '/admin/faculty', icon: BookOpen },
      ],
    },
    {
      group: 'Platform',
      links: [
        { name: 'Clubs', path: '/admin/clubs', icon: Users },
        { name: 'Leadership', path: '/admin/club-leadership', icon: Trophy },
        { name: 'Events', path: '/admin/events', icon: CalendarClock },
        { name: 'Notices', path: '/admin/notices', icon: Megaphone },
        { name: 'Registrations', path: '/admin/registrations', icon: ListOrdered },
        { name: 'Integration Health', path: '/admin/integration-health', icon: ClipboardCheck },
      ],
    },
    {
      group: 'Global',
      links: [
        { name: 'Browse Events', path: '/events', icon: Calendar },
        { name: 'Browse Clubs', path: '/clubs', icon: UserCheck },
        { name: 'Messages', path: '/messages', icon: MessageSquare },
      ],
    },
  ],

  superadmin: [
    {
      group: 'Overview',
      links: [
        { name: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Approvals', path: '/admin/approvals', icon: ShieldCheck },
      ],
    },
    {
      group: 'User Management',
      links: [
        { name: 'Students', path: '/admin/students', icon: GraduationCap },
        { name: 'Faculty', path: '/admin/faculty', icon: BookOpen },
        { name: 'Admins', path: '/admin/admins', icon: UserCog },
      ],
    },
    {
      group: 'Platform',
      links: [
        { name: 'Clubs', path: '/admin/clubs', icon: Users },
        { name: 'Leadership', path: '/admin/club-leadership', icon: Trophy },
        { name: 'Events', path: '/admin/events', icon: CalendarClock },
        { name: 'Notices', path: '/admin/notices', icon: Megaphone },
        { name: 'Registrations', path: '/admin/registrations', icon: ListOrdered },
      ],
    },
    {
      group: 'Analytics',
      links: [
        { name: 'Platform Stats', path: '/admin/stats', icon: BarChart3 },
        { name: 'Integration Health', path: '/admin/integration-health', icon: ClipboardCheck },
      ],
    },
  ],
};

// ─── Single NavItem ────────────────────────────────────────────────────────────
const NavItem = ({ link, onClick }) => {
  return (
    <NavLink
      to={link.path}
      end={link.path.includes('/dashboard')}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative',
          isActive
            ? 'bg-[var(--primary-glow)] text-[var(--primary)] font-semibold'
            : 'text-[var(--text)] hover:bg-[var(--bg-card-alt)] hover:text-[var(--text-h)]'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary)] rounded-r-full" />
          )}
          <link.icon
            className={cn(
              'h-4 w-4 flex-shrink-0 transition-colors',
              isActive ? 'text-[var(--primary)]' : 'text-[var(--text)] group-hover:text-[var(--text-h)]'
            )}
            aria-hidden="true"
          />
          <span className="truncate">{link.name}</span>
          {link.badge != null && link.badge > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {link.badge > 99 ? '99+' : link.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

// ─── Nav Group ────────────────────────────────────────────────────────────────
const NavGroup = ({ group, links, onLinkClick }) => (
  <div className="mb-4">
    <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text)] opacity-60 select-none">
      {group}
    </p>
    <div className="space-y-0.5">
      {links.map((link) => (
        <NavItem key={link.path} link={link} onClick={onLinkClick} />
      ))}
    </div>
  </div>
);

// ─── Role Badge ───────────────────────────────────────────────────────────────
const ROLE_BADGE_STYLE = {
  student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  club_president: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  club_vice_president: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  faculty: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  admin: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  superadmin: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export const Sidebar = ({ isOpen, setOpen }) => {
  const { role, user, logout } = useAuth();

  const navGroups = useMemo(() => {
    const fallback = NAV_CONFIG[role] || NAV_CONFIG.student || [];
    const isClubLeader = ['club_president', 'club_vice_president'].includes(role);

    if (!isClubLeader) {
      return fallback;
    }

    return fallback.map((group) => {
      if (group.group !== 'Campus Life') {
        return group;
      }

      const createEventLink = { name: 'Create Event', path: '/events/create', icon: CalendarClock };
      const submittedEventsLink = { name: 'My Submitted Events', path: '/events/my-submitted', icon: ClipboardList };
      const hasCreateEvent = group.links.some((link) => link.path === createEventLink.path);
      const hasSubmittedEvents = group.links.some((link) => link.path === submittedEventsLink.path);

      return {
        ...group,
        links: [
          ...group.links,
          ...(hasCreateEvent ? [] : [createEventLink]),
          ...(hasSubmittedEvents ? [] : [submittedEventsLink]),
        ],
      };
    });
  }, [role]);

  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div
            key="overlay"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={handleClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 flex flex-col',
          'border-r border-[var(--border)] bg-[var(--bg-card)]',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:flex'
        )}
        aria-label="Primary navigation"
      >
        {/* Logo Header */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 px-5 border-b border-[var(--border)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] shadow-sm">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-heading font-extrabold text-[var(--text-h)] tracking-tight">
            Unisphere
          </span>
        </div>

        {/* User Chip */}
        <div className="mx-3 mt-4 mb-3 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card-alt)] px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-purple-600 text-sm font-bold text-white shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--text-h)] leading-tight">
              {user?.name || 'User'}
            </p>
            <span
              className={cn(
                'mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                ROLE_BADGE_STYLE[role] || 'bg-gray-100 text-gray-600'
              )}
            >
              {role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin" aria-label="Sidebar navigation">
          {navGroups.map(({ group, links }) => (
            <NavGroup
              key={group}
              group={group}
              links={links}
              onLinkClick={handleClose}
            />
          ))}
        </nav>

        {/* Logout Footer */}
        <div className="shrink-0 border-t border-[var(--border)] p-3">
          <button
            onClick={logout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--red)] transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
