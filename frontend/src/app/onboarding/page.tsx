import { redirect } from 'next/navigation';

// Onboarding lama digantikan oleh wizard 3-step di /accept-invite
// Owner baru tidak bisa self-register — harus diundang oleh platform admin
export default function OnboardingRedirect() {
  redirect('/dashboard');
}
