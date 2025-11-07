// src/pages/Accounts.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import AccountsFilter from "../../components/accounts/AccountsFilter";
import AccountsTable from "../../components/accounts/AccountsTable";
import Pagination from "../../components/accounts/Pagination";

// Mock data with avatar
const mockAccounts = [
  { id: 1, name: "Олександр Петренко", groupsCount: 5, unreadMessages: 3, registrationDate: "2023-01-15", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "Марія Коваленко", groupsCount: 8, unreadMessages: 0, registrationDate: "2023-02-20", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 3, name: "Іван Сидоренко", groupsCount: 2, unreadMessages: 12, registrationDate: "2023-03-10", avatar: "https://randomuser.me/api/portraits/men/56.jpg" },
  { id: 4, name: "Анна Мороз", groupsCount: 15, unreadMessages: 7, registrationDate: "2023-04-05", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
  { id: 5, name: "Сергій Литвин", groupsCount: 3, unreadMessages: 0, registrationDate: "2023-05-12", avatar: "https://randomuser.me/api/portraits/men/78.jpg" },
  { id: 6, name: "Олена Шевчук", groupsCount: 9, unreadMessages: 5, registrationDate: "2023-06-18", avatar: "https://randomuser.me/api/portraits/women/23.jpg" },
  { id: 7, name: "Дмитро Бойко", groupsCount: 4, unreadMessages: 1, registrationDate: "2023-07-22", avatar: "https://randomuser.me/api/portraits/men/91.jpg" },
  { id: 8, name: "Тетяна Грищенко", groupsCount: 11, unreadMessages: 0, registrationDate: "2023-08-30", avatar: "https://randomuser.me/api/portraits/women/12.jpg" },
  { id: 9, name: "Віталій Ткач", groupsCount: 6, unreadMessages: 9, registrationDate: "2023-09-14", avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
  { id: 10, name: "Юлія Зінченко", groupsCount: 7, unreadMessages: 2, registrationDate: "2023-10-01", avatar: "https://randomuser.me/api/portraits/women/89.jpg" },
];

const ITEMS_PER_PAGE = 5;

export default function Accounts() {
  const [accounts, setAccounts] = useState<typeof mockAccounts>([]);
  const [filtered, setFiltered] = useState<typeof mockAccounts>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAccounts(mockAccounts);
      setFiltered(mockAccounts);
      setLoading(false);
    };
    fetchAccounts();
  }, []);

  const handleFilter = (filters: {
    search: string;
    hasUnread: boolean;
    groupsMin: string;
    groupsMax: string;
  }) => {
    const result = accounts.filter((acc) => {
      const matchesSearch =
        !filters.search ||
        acc.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        acc.groupsCount.toString().includes(filters.search) ||
        acc.unreadMessages.toString().includes(filters.search);

      const matchesUnread = !filters.hasUnread || acc.unreadMessages > 0;

      const min = filters.groupsMin ? parseInt(filters.groupsMin) : 0;
      const max = filters.groupsMax ? parseInt(filters.groupsMax) : Infinity;
      const matchesGroups = acc.groupsCount >= min && acc.groupsCount <= max;

      return matchesSearch && matchesUnread && matchesGroups;
    });

    setFiltered(result);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleProfileClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${id}`);
  };

  const handleMessagesClick = (id: number) => {
    navigate(`/accounts/${id}/messages`);
  };

  return (
    <div>
      <PageMeta title="Акаунти | TailAdmin" description="Список акаунтів з фільтрацією" />
      <PageBreadcrumb pageTitle="Акаунти" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-5xl">
          <AccountsFilter onFilter={handleFilter} />

          <div className="mt-6">
            <AccountsTable
              accounts={paginated}
              loading={loading}
              onRowClick={handleMessagesClick}
              onAvatarClick={handleProfileClick}
            />
          </div>

          {!loading && filtered.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}