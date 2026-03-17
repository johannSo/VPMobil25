import ClientViewer from '@/components/ClientViewer';

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { date } = await searchParams;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 dark:bg-zinc-950">
      <ClientViewer currentDateStr={date} />
    </div>
  );
}
