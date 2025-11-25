// library-management/shared/tiers.js
export const TIERS = ['bronze', 'silver', 'gold'];

export const TIER_RANK = {
  bronze: 1,
  silver: 2,
  gold: 3,
};

export const DEFAULT_TIER = 'bronze';

// (Tuỳ chọn) Mô tả quyền lợi từng tier
export const TIER_BENEFITS = {
  bronze: {
    label: 'Bronze (Free)',
    description: 'Access free books and some basic features.',
  },
  silver: {
    label: 'Silver',
    description: 'Unlock more books, prioritize recommendations, more favorites slots.',
  },
  gold: {
    label: 'Gold',
    description: 'Full library, highest priority, full features.',
  },
};
