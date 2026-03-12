export interface Profile {
  id?: number;
  name: string;
  avatar: string;
  coins?: number;
}

export interface ProfileContextType {
  profiles: Profile[];
  addProfile: (profile: Profile) => Promise<void>;
  removeProfile: (name: string) => Promise<void>;
  selectedProfile: Profile | null;
  selectProfile: (name: string) => void;
}
