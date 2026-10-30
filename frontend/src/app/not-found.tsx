import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The requested page could not be found on UtsavAI.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 shadow-sm">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-3">404</h1>
        <h2 className="text-xl font-medium text-foreground mb-2">Page Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Return to UtsavAI Home
        </a>
      </div>
    </div>
  );
}

