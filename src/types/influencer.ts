export type SocialChannel = "instagram" | "youtube" | "tiktok";

export type FollowerCounts = Partial<Record<SocialChannel, number>>;

export type Influencer = {
  id: string;
  name: string;
  email: string;
  /** Active channels with their follower counts. */
  socials: FollowerCounts;
};

export type PendingInfluencer = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  /** Active social channels mapped to handle / username. */
  channels: Partial<Record<SocialChannel, string>>;
};

export type PageQuery = {
  offset: number;
  limit: number;
  /** Trimmed search query; matched against name and email (case-insensitive). */
  search?: string;
};

export type PageResult<T> = {
  items: T[];
  total: number;
};
