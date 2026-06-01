import { redirect } from 'next/navigation';

// Member subscription dipindah ke konteks publication: [slug].lentera.id/subscription
// Redirect ke /subscription — bekerja di publication subdomain
export default function MeSubscriptionRedirect() {
  redirect('/subscription');
}
