export interface PlanPricingOption {
  durationMonths: number;
  priceLabel: string;
}

export interface Plan {
  _id: string;
  name: string;
  priceLabel: string;
  priceSuffix: string;
  description: string;
  features: string[];
  maxFileSizeBytes: number;
  maxProjectsPerUser: number;
  maxStorageBytes: number;
  maxMembersPerProject: number;
  pricingOptions: PlanPricingOption[];
  isHidden: boolean;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPlan extends Plan {
  userCount: number;
}

export interface PlanLimits {
  maxFileSizeBytes: number;
  maxProjectsPerUser: number;
  maxStorageBytes: number;
  maxMembersPerProject: number;
}

export interface MyPlanResponse {
  plans: Plan[];
  currentPlanId: string | null;
  currentPlanExpiresAt: string | null;
  currentPlanLimits: PlanLimits;
  usage: {
    projectCount: number;
    storageUsedBytes: number;
  };
}

export type PlanFormValues = Pick<
  Plan,
  | "name"
  | "priceLabel"
  | "priceSuffix"
  | "description"
  | "features"
  | "maxFileSizeBytes"
  | "maxProjectsPerUser"
  | "maxStorageBytes"
  | "maxMembersPerProject"
  | "pricingOptions"
  | "isHidden"
  | "isDefault"
  | "isActive"
>;
