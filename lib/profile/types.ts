export interface PlatformEntry {
  platform: string;
  handle: string;
  followers: string;
  engagementRate: string;
}

export interface Audience {
  age: string;
  geo: string;
  gender: string;
}

export interface CreatorProfileData {
  niche: string;
  bio: string;
  platforms: PlatformEntry[];
  audience: Audience;
  tone: string;
  pastDeals: string;
  rateFloor: string;
}

export const EMPTY_PROFILE: CreatorProfileData = {
  niche: "",
  bio: "",
  platforms: [],
  audience: { age: "", geo: "", gender: "" },
  tone: "",
  pastDeals: "",
  rateFloor: "",
};
