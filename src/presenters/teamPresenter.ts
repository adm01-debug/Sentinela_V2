export const teamPresenter = {
  toView: (t: any) => ({ id: t.id, name: t.name, description: t.description, leaderName: t.leader?.name, memberCount: t.member_count || 0, memberLabel: (t.member_count || 0) === 1 ? 'membro' : 'membros' }),
  toList: (teams: any[]) => teams.map(t => teamPresenter.toView(t)),
  toSelect: (teams: any[]) => teams.map(t => ({ value: t.id, label: t.name })),
};
