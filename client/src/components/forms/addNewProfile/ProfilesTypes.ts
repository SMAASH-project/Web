export interface Profile {
  name: string;
  avatar: string;
}

export interface ProfileContextType {
  profiles: Profile[];
  addProfile: (profile: Profile) => void;
  removeProfile: (name: string) => void;
  selectedProfile: Profile | null;
  selectProfile: (name: string) => void;
}
