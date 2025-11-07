// src/components/accounts/AccountsFilter.tsx
import { useState, useEffect } from "react";
import Switch from "../../components/form/switch/Switch";

interface Filters {
  search: string;
  hasUnread: boolean;
  groupsMin: string;
  groupsMax: string;
}

interface AccountsFilterProps {
  onFilter: (filters: Filters) => void;
}

export default function AccountsFilter({ onFilter }: AccountsFilterProps) {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    hasUnread: false,
    groupsMin: "",
    groupsMax: "",
  });

  // Дебонсинг для пошуку (опціонально, для продуктивності)
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilter(filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, onFilter]);

  const handleChange = (key: keyof Filters, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-lg">
      <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Пошук */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Пошук
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              placeholder="Ім'я, групи..."
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-800"
            />
            {filters.search && (
              <button
                onClick={() => handleChange("search", "")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Є непрочитані */}
        <div className="flex items-center justify-start md:justify-center lg:justify-start">
          <Switch
            label="Є непрочитані"
            checked={filters.hasUnread}
            onChange={(checked) => handleChange("hasUnread", checked)}
            size="md"
          />
        </div>

        {/* Групи: від */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Груп від
          </label>
          <input
            type="number"
            value={filters.groupsMin}
            onChange={(e) => handleChange("groupsMin", e.target.value)}
            placeholder="0"
            min="0"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-800"
          />
        </div>

        {/* Групи: до */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Груп до
          </label>
          <input
            type="number"
            value={filters.groupsMax}
            onChange={(e) => handleChange("groupsMax", e.target.value)}
            placeholder="∞"
            min="0"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-800"
          />
        </div>
      </div>
    </div>
  );
}