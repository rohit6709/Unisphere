export const getDashboardPath = (role) => {
  if (role === 'superadmin') return '/dashboard/admin';
  if (role === 'hod') return '/dashboard/faculty';
  if (role === 'club_president' || role === 'club_vice_president') return '/dashboard/student';
  if (role) return `/dashboard/${role}`;
  return '/login';
};

export const getProfilePath = (role) => {
  if (role === 'student' || role === 'club_president' || role === 'club_vice_president') {
    return '/profile/student';
  }

  if (role === 'faculty' || role === 'hod') {
    return '/profile/faculty';
  }

  // Admin and superadmin don't have a dedicated profile page yet.
  return '/change-password';
};
