import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import RegisterForm from '../../../components/auth/register/register-form';

export default async function RegisterPage() {
  const session = await getServerSession();

  if (session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            施設管理システム
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            新規アカウント登録
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}