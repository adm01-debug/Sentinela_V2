export class TeamService {
  private static instance: TeamService;
  
  static getInstance() {
    if (!this.instance) this.instance = new TeamService();
    return this.instance;
  }
  
  async init() { console.log('team service initialized'); }
}

export const teamService = TeamService.getInstance();