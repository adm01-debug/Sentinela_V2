// Comment types for Sentinela v17

export interface Comment {
  id: string;
  resourceType: CommentResourceType;
  resourceId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  contentHtml?: string;
  mentions: CommentMention[];
  attachments: CommentAttachment[];
  reactions: CommentReaction[];
  reactionCounts: Record<string, number>;
  replyCount: number;
  isEdited: boolean;
  isPinned: boolean;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type CommentResourceType =
  | "employee"
  | "activity"
  | "screenshot"
  | "alert"
  | "report"
  | "project"
  | "task";

export interface CommentMention {
  userId: string;
  userName: string;
  startIndex: number;
  endIndex: number;
}

export interface CommentAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface CommentReaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface CommentThread {
  comment: Comment;
  replies: Comment[];
  hasMore: boolean;
  totalReplies: number;
}

export interface CommentCreateInput {
  resourceType: CommentResourceType;
  resourceId: string;
  parentId?: string;
  content: string;
  mentions?: string[];
  attachmentIds?: string[];
}

export interface CommentUpdateInput {
  content?: string;
  isPinned?: boolean;
  isResolved?: boolean;
}

export interface CommentFilters {
  resourceType?: CommentResourceType;
  resourceId?: string;
  authorId?: string;
  isPinned?: boolean;
  isResolved?: boolean;
  hasReplies?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CommentStats {
  total: number;
  resolved: number;
  pinned: number;
  byResource: Record<CommentResourceType, number>;
  topContributors: { userId: string; count: number }[];
}

export interface ReactionInput {
  commentId: string;
  emoji: string;
}
