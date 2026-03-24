import ClientViewer from '@/components/ClientViewer';

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { date } = await searchParams;

  return (
    <main className="min-h-dvh py-6 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-bg)' }}>
      <ClientViewer currentDateStr={date} />
    </main>
  );
}
