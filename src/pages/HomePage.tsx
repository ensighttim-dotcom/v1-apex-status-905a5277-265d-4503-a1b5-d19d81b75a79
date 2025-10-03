import { Header } from '@/components/layout/Header';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { StatusDashboard } from '@/components/dashboard/StatusDashboard';
import { Toaster } from '@/components/ui/sonner';
export function HomePage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-muted/40">
      <Header />
      <PageWrapper>
        <StatusDashboard />
      </PageWrapper>
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        Built with ❤️ at Cloudflare
      </footer>
      <Toaster richColors closeButton />
    </div>
  );
}