import { redirect } from 'next/navigation';

// Member settings dipindah ke konteks publication: [slug].lentera.id/settings
// Redirect ke /settings — bekerja di publication subdomain
export default function MeSettingsRedirect() {
  redirect('/settings');
}
