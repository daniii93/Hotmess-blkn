export const getMutualIds = (leftIds: readonly string[], rightIds: readonly string[]): string[] => {
  const right = new Set(rightIds);
  return leftIds.filter((id) => right.has(id));
};

export const getMutualFriendIds = (
  viewerFollowingIds: readonly string[],
  profileFollowerIds: readonly string[],
): string[] => getMutualIds(viewerFollowingIds, profileFollowerIds);

export const getMutualEventIds = (
  viewerEventIds: readonly string[],
  profileEventIds: readonly string[],
): string[] => getMutualIds(viewerEventIds, profileEventIds);
