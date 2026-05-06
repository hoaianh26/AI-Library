// backend/middleware/ensureActiveMembership.js
export const ensureActiveMembership = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // If membership is explicitly disabled, block access
  if (user.isMembershipActive === false) {
    return res.status(403).json({
      message: 'Membership disabled. Please contact support.',
      code: 'MEMBERSHIP_DISABLED',
    });
  }

  // If user has a membership that has an expiry date, check if it's expired
  // If membershipExpiresAt is null, it means they are a free user (bronze by default)
  // and their access will be determined by book's allowedTiers and isBookLockedForUser.
  if (user.membershipExpiresAt) {
    const now = new Date();
    const expiresAt = new Date(user.membershipExpiresAt);

    if (expiresAt < now) {
      // If it's expired, we could either block or just let it pass 
      // and let the book-level check handle it. 
      // Given the name 'ensureActiveMembership', it should probably block.
      return res.status(403).json({
        message: 'Your premium membership has expired. Please renew to access premium content.',
        code: 'MEMBERSHIP_EXPIRED',
      });
    }
  }
  // If membershipExpiresAt is null, or if it's active, proceed.
  next();
};
