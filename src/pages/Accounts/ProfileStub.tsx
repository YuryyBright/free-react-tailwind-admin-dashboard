// src/pages/ProfileStub.tsx
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function ProfileStub() {
  const { id } = useParams();

  return (
    <div>
      <PageMeta title={`Профіль користувача #${id}`} description=""/>
      <PageBreadcrumb pageTitle={`Профіль #${id}`} />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-6 mb-8">
            <img
              src={`https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${id}.jpg`}
              alt="Avatar"
              className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-800"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Користувач #{id}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Це профіль у стилі чату. Тут буде список повідомлень, статус, активність.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <p className="text-center text-gray-500">Чат-інтерфейс у розробці...</p>
          </div>
        </div>
      </div>
    </div>
  );
}