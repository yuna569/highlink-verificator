export type PendingBusiness = {
  id: string;
  email: string;
  submittedAt: string;
  category: string | null;
  budgetRange: string | null;
  promotionTarget: string | null;
};

export type Business = {
  id: string;
  email: string;
  category: string | null;
  budgetRange: string | null;
  promotionTarget: string | null;
};

export type PageQuery = {
  offset: number;
  limit: number;
  search?: string;
};

export type PageResult<T> = {
  items: T[];
  total: number;
};
