import BlockPage from "@/features/block/BlockPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlockPage blockId={id} />;
}
