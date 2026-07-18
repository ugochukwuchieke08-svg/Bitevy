import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <LoginForm
      redirect={params.redirect ?? "/"}
    />
  );
}