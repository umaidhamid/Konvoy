export interface TeamPerson {
  user: {
    _id: string;
    fullname?: string;
    email: string;
    profileImage?: string;
  };
  projects: { _id: string; name: string; slug: string }[];
}

export interface MyTeamResponse {
  myTeam: TeamPerson[];
  sharedWithMe: TeamPerson[];
}
