interface Account {
  id: number;
  name: string;
  groupsCount: number;
  unreadMessages: number;
  registrationDate: string;
  avatar: string;
}

interface AccountsTableProps {
  accounts: Account[];
  loading: boolean;
  onRowClick: (id: number) => void;
  onAvatarClick: (id: number, e: React.MouseEvent) => void;
}

export default function AccountsTable({ accounts, loading, onRowClick, onAvatarClick }: AccountsTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return <p className="text-center text-gray-500">Акаунтів не знайдено</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Користувач
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Групи
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Непрочитані
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Реєстрація
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {accounts.map((account) => (
            <tr
              key={account.id}
              onClick={() => onRowClick(account.id)}
              className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => onAvatarClick(account.id, e)}
                    className="group relative"
                    title="Перейти до профілю"
                  >
                    <img
                      src={account.avatar}
                      alt={account.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white transition-transform group-hover:scale-110 dark:ring-gray-800"
                    />
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-10 transition"></div>
                  </button>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {account.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {account.groupsCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {account.unreadMessages > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                    {account.unreadMessages}
                  </span>
                ) : (
                  <span className="text-gray-400">0</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {new Date(account.registrationDate).toLocaleDateString("uk-UA")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}