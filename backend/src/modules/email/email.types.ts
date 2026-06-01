export type EmailJobName =
  | 'send-verification'
  | 'send-reset-password'
  | 'send-subscription-confirmed'
  | 'send-subscription-expiring'
  | 'send-subscription-expiring-1day'
  | 'send-subscription-expired'
  | 'send-new-article'
  | 'send-author-invite'
  | 'send-owner-invite'
  | 'send-google-account-info';

export interface VerificationEmailData {
  to: string;
  name: string;
  verifyUrl: string;
}

export interface ResetPasswordEmailData {
  to: string;
  name: string;
  resetUrl: string;
}

export interface SubscriptionConfirmedEmailData {
  to: string;
  name: string;
  publicationName: string;
  planDurationMonths: number;
  expiresAt: string;
}

export interface SubscriptionExpiringEmailData {
  to: string;
  name: string;
  publicationName: string;
  expiresAt: string;
  renewUrl: string;
}

export interface SubscriptionExpiredEmailData {
  to: string;
  name: string;
  publicationName: string;
  resubscribeUrl: string;
}

export interface NewArticleEmailData {
  to: string;
  name: string;
  publicationName: string;
  articleTitle: string;
  articleExcerpt: string;
  articleUrl: string;
  coverImageUrl?: string;
  unsubscribeUrl: string;
}

export interface AuthorInviteEmailData {
  to: string;
  publicationName: string;
  invitedBy: string;
  role: string;
  inviteUrl: string;
}

export interface OwnerInviteEmailData {
  to: string;
  ownerName: string;
  publicationName: string;
  inviteUrl: string;
}

export interface GoogleAccountInfoEmailData {
  to: string;
  name: string;
}

export type EmailJobData =
  | { name: 'send-verification'; data: VerificationEmailData }
  | { name: 'send-reset-password'; data: ResetPasswordEmailData }
  | { name: 'send-subscription-confirmed'; data: SubscriptionConfirmedEmailData }
  | { name: 'send-subscription-expiring'; data: SubscriptionExpiringEmailData }
  | { name: 'send-subscription-expiring-1day'; data: SubscriptionExpiringEmailData }
  | { name: 'send-subscription-expired'; data: SubscriptionExpiredEmailData }
  | { name: 'send-new-article'; data: NewArticleEmailData }
  | { name: 'send-author-invite'; data: AuthorInviteEmailData }
  | { name: 'send-owner-invite'; data: OwnerInviteEmailData }
  | { name: 'send-google-account-info'; data: GoogleAccountInfoEmailData };
