import CategoryForm from '../../../../../components/categories/CategoryForm';

interface EditCategoryPageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const resolvedParams = await params;
  return <CategoryForm categoryId={resolvedParams.id} />; 
}
