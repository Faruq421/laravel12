Perintah untuk Gemini CLI: Implementasi Tema Global TweakCN

"Pekerja" desainer (TweakCN) telah mengirimkan palet tema lengkap kita. Tugas Anda adalah menerapkannya ke file CSS global.

Tugas 1: Ganti Total Konten app.css

Buka File: resources/css/app.css

Hapus SEMUA konten yang ada di dalamnya (termasuk @tailwind lama dan variabel :root lama).

Tempel Kode Berikut sebagai konten BARU yang lengkap untuk file tersebut:

/* Arahan Tailwind (Wajib) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Tema Kustom dari TweakCN */
:root {
  --background: #ffffff;
  --foreground: #2e3338;
  --card: #f9fafa;
  --card-foreground: #2e3338;
  --popover: #ffffff;
  --popover-foreground: #2e3338;
  --primary: #ff6200;
  --primary-foreground: #ffffff;
  --secondary: #bcbfc2;
  --secondary-foreground: #2e3338;
  --muted: #f1f2f4;
  --muted-foreground: #67737e;
  --accent: #ffe6d6;
  --accent-foreground: #993b00;
  --destructive: #bc1515;
  --destructive-foreground: #ffffff;
  --border: #dde0e3;
  --input: #dde0e3;
  --ring: #ff6200;
  --chart-1: #ff6200;
  --chart-2: #269dd9;
  --chart-3: #26d962;
  --chart-4: #9d26d9;
  --chart-5: #d99d26;
  --sidebar: #f9fafa;
  --sidebar-foreground: #2e3338;
  --sidebar-primary: #ff6200;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #ffe6d6;
  --sidebar-accent-foreground: #993b00;
  --sidebar-border: #dde0e3;
  --sidebar-ring: #ff6200;
  --font-sans: Inter, sans-serif;
  --font-serif: Playfair Display, serif;
  --font-mono: JetBrains Mono, monospace;
  --radius: 0.5rem;
  --shadow-x: 0;
  --shadow-y: 0.25rem;
  --shadow-blur: 0.75rem;
  --shadow-spread: 0;
  --shadow-opacity: 0.05;
  --shadow-color: 0 0% 0%;
  --shadow-2xs: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.03);
  --shadow-xs: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.03);
  --shadow-sm: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.05), 0 1px 2px -1px hsl(0 0% 0% / 0.05);
  --shadow: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.05), 0 1px 2px -1px hsl(0 0% 0% / 0.05);
  --shadow-md: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.05), 0 2px 4px -1px hsl(0 0% 0% / 0.05);
  --shadow-lg: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.05), 0 4px 6px -1px hsl(0 0% 0% / 0.05);
  --shadow-xl: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.05), 0 8px 10px -1px hsl(0 0% 0% / 0.05);
  --shadow-2xl: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.13);
  --tracking-normal: 0;
  --spacing: 0.25rem;
}

.dark {
  --background: #171a1c;
  --foreground: #e3e6e8;
  --card: #1c1f22;
  --card-foreground: #e3e6e8;
  --popover: #171a1c;
  --popover-foreground: #e3e6e8;
  --primary: #ff6200;
  --primary-foreground: #ffffff;
  --secondary: #3d4043;
  --secondary-foreground: #e3e6e8;
  --muted: #22262a;
  --muted-foreground: #9da6af;
  --accent: #662700;
  --accent-foreground: #ffffff;
  --destructive: #bc1515;
  --destructive-foreground: #ffffff;
  --border: #394046;
  --input: #394046;
  --ring: #ff6200;
  --chart-1: #ff6200;
  --chart-2: #269dd9;
  --chart-3: #26d962;
  --chart-4: #9d26d9;
  --chart-5: #d99d26;
  --sidebar: #1c1f22;
  --sidebar-foreground: #e3e6e8;
  --sidebar-primary: #ff6200;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #662700;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: #394046;
  --sidebar-ring: #ff6200;
  --font-sans: Inter, sans-serif;
  --font-serif: Playfair Display, serif;
  --font-mono: JetBrains Mono, monospace;
  --radius: 0.5rem;
  --shadow-x: 0;
  --shadow-y: 0.25rem;
  --shadow-blur: 0.75rem;
  --shadow-spread: 0;
  --shadow-opacity: 0.2;
  --shadow-color: 0 0% 0%;
  --shadow-2xs: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.10);
  --shadow-xs: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.10);
  --shadow-sm: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.20), 0 1px 2px -1px hsl(0 0% 0% / 0.20);
  --shadow: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.20), 0 1px 2px -1px hsl(0 0% 0% / 0.20);
  --shadow-md: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.20), 0 2px 4px -1px hsl(0 0% 0% / 0.20);
  --shadow-lg: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.20), 0 4px 6px -1px hsl(0 0% 0% / 0.20);
  --shadow-xl: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.20), 0 8px 10px -1px hsl(0 0% 0% / 0.20);
  --shadow-2xl: 0 0.25rem 0.75rem 0 hsl(0 0% 0% / 0.50);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);

  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-normal: var(--tracking-normal);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
}

body {
  letter-spacing: var(--tracking-normal);
}


Tugas 2: Hapus Hard-code di SiteHeader.tsx (PENTING)

Sekarang setelah tema kita benar, kita harus membersihkan hard-code yang tersisa di SiteHeader.tsx.

Buka File: resources/js/components/layout/SiteHeader.tsx

Temukan Tombol "Minta Penawaran":

Ganti Ini: className="hidden lg:inline-flex bg-[#FF6500] hover:bg-[#C40C0C] text-white" (atau hover:bg-[#FF6500]/90)

Menjadi Ini: className="hidden lg:inline-flex" (Biarkan default variant="default" shadcn mengambil alih, yang sekarang adalah bg-primary).

Temukan Tombol "Register":

Ganti Ini: className="bg-[#C40C0C] hover:bg-[#a50a0a] text-white"

Menjadi Ini: variant="destructive" (Gunakan variant semantik yang benar).

Tugas 3: Pastikan ShopPage.tsx Menggunakan Kelas Semantik

Periksa kembali file resources/js/Pages/Features/Product/ShopPage.tsx dan pastikan semua tombol oranye menggunakan bg-primary dan bukan bg-[#FF6500].
