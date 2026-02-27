export interface Profile {
  name: string;
  avatar: string;
}

export interface ProfileContextType {
  profiles: Profile[];
  // profilesResponse: Profile[];
  addProfile: (profile: Profile) => Promise<void>;
  removeProfile: (name: string) => void;
  selectedProfile: Profile | null;
  selectProfile: (name: string) => void;
}
