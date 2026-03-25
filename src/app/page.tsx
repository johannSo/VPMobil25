import ClientViewer from '@/components/ClientViewer';

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { date } = await searchParams;

  return (
    <main className="app-shell edge-shell">
      <ClientViewer currentDateStr={date} />
    </main>
  );
}
