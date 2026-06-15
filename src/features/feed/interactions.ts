export type LikeState = {
  postId: string;
  userId: string;
  liked: boolean;
};

export type CommentInput = {
  postId: string;
  userId: string;
  content: string;
};

export const toggleLike = (state: LikeState): LikeState => ({
  ...state,
  liked: !state.liked,
});

export const canCreateComment = (input: CommentInput): boolean =>
  Boolean(input.postId && input.userId && input.content.trim().length > 0);
