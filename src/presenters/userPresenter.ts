export const userPresenter = {
  toView: (user: any) => ({ id: user.id, name: user.full_name || user.name, email: user.email, role: user.role, avatar: user.avatar_url, initials: (user.full_name || user.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) }),
  toList: (users: any[]) => users.map(u => userPresenter.toView(u)),
  toSelect: (users: any[]) => users.map(u => ({ value: u.id, label: u.full_name || u.name || u.email })),
};
