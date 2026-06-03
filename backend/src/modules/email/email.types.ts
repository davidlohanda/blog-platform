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
  | 'send-google-account-info'
  | 'send-publication-suspended'
  | 'send-publication-unsuspended'
  | 'send-publication-deletion-requested'
  | 'send-publication-deletion-cancelled'
  | 'send-ownership-transfer-request'
  | 'send-ownership-transfer-confirmed'
  | 'send-admin-welcome';

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

export interface PublicationSuspendedEmailData {
  to: string;
  name: string;
  publicationName: string;
  reason: string;
  level: 1 | 2;
}

export interface PublicationUnsuspendedEmailData {
  to: string;
  name: string;
  publicationName: string;
}

export interface PublicationDeletionRequestedEmailData {
  to: string;
  name: string;
  publicationName: string;
  scheduledDeletionAt: string;
  cancelUrl: string;
}

export interface OwnershipTransferRequestEmailData {
  to: string;
  newOwnerName: string;
  publicationName: string;
  acceptUrl: string;
}

export interface OwnershipTransferConfirmedEmailData {
  to: string;
  name: string;
  publicationName: string;
  isNewOwner: boolean;
}

export interface AdminWelcomeEmailData {
  to: string;
  name: string;
  tempPassword: string;
  loginUrl: string;
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
  | { name: 'send-google-account-info'; data: GoogleAccountInfoEmailData }
  | { name: 'send-publication-suspended'; data: PublicationSuspendedEmailData }
  | { name: 'send-publication-unsuspended'; data: PublicationUnsuspendedEmailData }
  | { name: 'send-publication-deletion-requested'; data: PublicationDeletionRequestedEmailData }
  | { name: 'send-publication-deletion-cancelled'; data: PublicationUnsuspendedEmailData }
  | { name: 'send-ownership-transfer-request'; data: OwnershipTransferRequestEmailData }
  | { name: 'send-ownership-transfer-confirmed'; data: OwnershipTransferConfirmedEmailData }
  | { name: 'send-admin-welcome'; data: AdminWelcomeEmailData };
