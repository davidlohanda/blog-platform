# UI Design System Reference
## Tailwind CSS + shadcn/ui

Dokumen ini digunakan oleh AI agent saat mengimplementasikan frontend — baik dari hasil Claude Design maupun langsung dari briefing. Tujuannya: memastikan UI yang dihasilkan konsisten, production-quality, dan tidak terlihat "generic AI".

---

## Prinsip Desain

### 1. Konten adalah Raja
UI harus "mundur" dan membiarkan konten tampil di depan. Tidak ada elemen dekoratif yang tidak punya fungsi.

### 2. Hierarchy yang Jelas
Setiap halaman punya satu elemen yang paling penting. Mata user harus tahu harus melihat ke mana dulu.

### 3. Whitespace adalah Fitur
Jangan takut ruang kosong. Padding yang cukup membuat UI terasa premium.

### 4. Konsistensi di Atas Segalanya
Gunakan token yang sama di seluruh aplikasi. Jangan hardcode nilai warna atau spacing.

---

## Color System

### Pendekatan: CSS Variables via shadcn/ui

shadcn/ui sudah menyediakan sistem warna berbasis CSS variables yang support dark mode otomatis. Selalu gunakan semantic color names, bukan hardcode nilai hex.

```css
/* Yang BENAR — pakai semantic tokens */
bg-background        /* background halaman */
bg-card              /* background card/panel */
bg-primary           /* primary action (button, link) */
bg-secondary         /* secondary/muted */
bg-muted             /* subtle background */
bg-accent            /* highlight */
bg-destructive       /* error/danger */

text-foreground      /* teks utama */
text-muted-foreground /* teks sekunder/caption */
text-primary         /* teks warna primary */
text-destructive     /* teks error */

border-border        /* border standar */
border-input         /* border form input */
ring-ring            /* focus ring */

/* Yang SALAH — jangan hardcode */
bg-[#3B82F6]        ← hindari
text-gray-500       ← hindari, pakai text-muted-foreground
```

### Jika Project Punya Brand Color Sendiri

Tambahkan di `globals.css` sebagai CSS variable:
```css
:root {
  --brand: [hsl value];
  --brand-foreground: [hsl value];
}

.dark {
  --brand: [hsl value dark];
  --brand-foreground: [hsl value dark];
}
```

Lalu daftarkan di `tailwind.config.ts`:
```typescript
colors: {
  brand: 'hsl(var(--brand))',
  'brand-foreground': 'hsl(var(--brand-foreground))',
}
```

---

## Typography System

### Font Stack

Default shadcn/ui pakai sistem font. Untuk konten artikel/reading-heavy, tambahkan serif font:

```typescript
// app/layout.tsx
import { Inter, Lora } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-serif',
})
```

```css
/* globals.css */
:root {
  --font-sans: var(--font-inter);
  --font-serif: var(--font-lora);
}
```

### Type Scale (Tailwind)

```
text-xs     — 12px — caption, label kecil
text-sm     — 14px — body small, helper text
text-base   — 16px — body utama
text-lg     — 18px — body large, lead paragraph
text-xl     — 20px — heading kecil
text-2xl    — 24px — heading section
text-3xl    — 30px — heading halaman
text-4xl    — 36px — hero heading
text-5xl    — 48px — headline besar
```

### Panduan Penggunaan

**Halaman artikel/reading:**
```tsx
<article className="prose prose-lg prose-neutral dark:prose-invert max-w-2xl mx-auto">
  {/* konten */}
</article>
```

Install `@tailwindcss/typography` untuk prose classes:
```bash
npm install @tailwindcss/typography
```

**Line height untuk readability:**
```
leading-relaxed   — untuk body text (1.625)
leading-snug      — untuk heading
leading-none      — untuk single-line display text
```

---

## Spacing System

Selalu gunakan Tailwind spacing scale — jangan hardcode pixel.

```
Micro  : p-1 (4px), p-2 (8px)
Small  : p-3 (12px), p-4 (16px)
Medium : p-6 (24px), p-8 (32px)
Large  : p-12 (48px), p-16 (64px)
XL     : p-20 (80px), p-24 (96px)
```

### Panduan Konsistensi Spacing

```
Card padding        : p-6 (desktop), p-4 (mobile)
Section padding     : py-12 (desktop), py-8 (mobile)
Gap antar elemen    : gap-4 atau gap-6
Max width konten    : max-w-2xl (artikel), max-w-4xl (halaman lebar)
Max width container : max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

---

## shadcn/ui Component Guidelines

### Komponen yang Sering Dipakai

```tsx
// Button variants
<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// Card
<Card>
  <CardHeader>
    <CardTitle>Judul</CardTitle>
    <CardDescription>Deskripsi</CardDescription>
  </CardHeader>
  <CardContent>Konten</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>

// Form elements (selalu dengan React Hook Form)
<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input placeholder="email@contoh.com" {...field} />
        </FormControl>
        <FormMessage />  {/* error message otomatis */}
      </FormItem>
    )}
  />
</Form>

// Dialog / Modal
<Dialog>
  <DialogTrigger asChild>
    <Button>Buka</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Judul</DialogTitle>
    </DialogHeader>
    {/* konten */}
  </DialogContent>
</Dialog>
```

### Aturan Penggunaan shadcn/ui

```
✅ Selalu pakai shadcn/ui untuk: button, input, form, dialog, dropdown, table, tabs, badge, toast
✅ Extend dengan className untuk customisasi — jangan modifikasi file component-nya
✅ Pakai cn() helper untuk conditional classes

❌ Jangan buat komponen UI dari scratch jika shadcn/ui sudah punya
❌ Jangan hardcode warna di className — pakai semantic tokens
❌ Jangan import langsung dari radix-ui — selalu lewat shadcn/ui wrapper
```

---

## Layout Patterns

### Page Layout Standar

```tsx
// Layout halaman dengan sidebar
<div className="min-h-screen bg-background">
  <Navbar />
  <div className="flex">
    <Sidebar className="hidden lg:block w-64 shrink-0" />
    <main className="flex-1 min-w-0 p-6">
      {children}
    </main>
  </div>
</div>

// Layout konten terpusat (artikel, auth)
<div className="min-h-screen bg-background">
  <Navbar />
  <main className="max-w-2xl mx-auto px-4 py-12">
    {children}
  </main>
</div>

// Layout landing page
<div className="min-h-screen bg-background">
  <Navbar />
  <main>
    <HeroSection />
    <FeaturesSection />
    <CTASection />
  </main>
  <Footer />
</div>
```

### Responsive Pattern

```
Mobile first: default styles untuk mobile
sm: (640px+) — tablet portrait
md: (768px+) — tablet landscape
lg: (1024px+) — desktop
xl: (1280px+) — wide desktop

Contoh:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## Component Patterns yang Sering Dibutuhkan

### Loading State

```tsx
// Skeleton loading (lebih baik dari spinner untuk konten)
import { Skeleton } from '@/components/ui/skeleton'

function ArticleCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}
```

### Empty State

```tsx
function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-muted-foreground mb-4">[icon]</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  )
}
```

### Error State

```tsx
function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-destructive mb-4">{message}</p>
      <Button variant="outline" onClick={onRetry}>Coba Lagi</Button>
    </div>
  )
}
```

### Toast Notifications

```tsx
import { useToast } from '@/components/ui/use-toast'

const { toast } = useToast()

// Success
toast({ title: "Berhasil", description: "Artikel berhasil dipublish" })

// Error
toast({ 
  title: "Gagal", 
  description: "Terjadi kesalahan. Coba lagi.",
  variant: "destructive" 
})
```

---

## Dark Mode

shadcn/ui sudah support dark mode via CSS variables. Pastikan:

```tsx
// app/layout.tsx — tambahkan ThemeProvider
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## Anti-Patterns — Yang Harus Dihindari

```
❌ Hardcode warna:     className="bg-blue-500"   → pakai bg-primary
❌ Hardcode spacing:   style={{ padding: '24px' }} → pakai className="p-6"
❌ Inline styles:      style={{ color: 'gray' }}  → pakai className="text-muted-foreground"
❌ !important:         className="!text-red-500"  → redesign component-nya
❌ Fixed height:       className="h-[347px]"      → pakai min-h atau auto height
❌ Magic numbers:      className="mt-[13px]"      → pakai spacing scale terdekat
❌ Nested ternary di className — pisahkan ke variabel atau cn() helper
```

---

## cn() Helper — Selalu Gunakan untuk Conditional Classes

```tsx
import { cn } from '@/lib/utils'

// Contoh penggunaan
<div className={cn(
  "base-classes here",
  isActive && "active-classes",
  variant === "primary" && "primary-classes",
  className  // allow override dari parent
)}>
```
