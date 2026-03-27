import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { useVenueStore } from "../store/venueStore";
import { Venue, VenueStatus } from "../types/venue";
import { StatusBadge } from "../components/StatusBadge";
import { ScraperModal } from "../components/ScraperModal";

function contactScore(venue: Venue): number {
  return (
    (venue.instagram ? 1 : 0) + (venue.email ? 1 : 0) + (venue.facebook ? 1 : 0)
  );
}

const STATUS_OPTIONS: VenueStatus[] = [
  "to_contact",
  "contacted",
  "discussion",
  "booked",
  "no_response",
  "not_interested",
];

export const VenuesTable: React.FC = () => {
  const {
    venues,
    loading,
    filters,
    fetchVenues,
    setFilters,
    updateVenue,
    deleteVenue,
  } = useVenueStore();
  const [searchParams] = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showScraper, setShowScraper] = useState(false);

  useEffect(() => {
    const status = searchParams.get("status") || undefined;
    const followup = searchParams.get("followup") === "true";
    setFilters({ status, followup });
    fetchVenues();
  }, [searchParams]);

  const columns = useMemo<ColumnDef<Venue>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nom",
        cell: ({ row }) => (
          <Link
            to={`/venues/${row.original.id}`}
            className="text-primary-400 hover:underline font-medium"
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "city", header: "Ville" },
      { accessorKey: "category", header: "Catégorie" },
      {
        id: "instagram",
        header: "Instagram",
        cell: ({ row }) =>
          row.original.instagram ? (
            <a
              href={row.original.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-pink-400 hover:underline text-sm"
            >
              📷 Instagram
            </a>
          ) : (
            <span className="text-gray-600">—</span>
          ),
      },
      {
        id: "email",
        header: "Email",
        cell: ({ row }) =>
          row.original.email ? (
            <a
              href={`mailto:${row.original.email}`}
              className="text-blue-400 hover:underline text-sm"
            >
              ✉ {row.original.email}
            </a>
          ) : (
            <span className="text-gray-600">—</span>
          ),
      },
      {
        id: "facebook",
        header: "Facebook",
        cell: ({ row }) =>
          row.original.facebook ? (
            <a
              href={row.original.facebook}
              target="_blank"
              rel="noreferrer"
              className="text-blue-300 hover:underline text-sm"
            >
              fb
            </a>
          ) : (
            <span className="text-gray-600">—</span>
          ),
      },
      {
        id: "contact_score",
        header: "Score contacts",
        accessorFn: (row) => contactScore(row),
        cell: ({ getValue }) => {
          const score = getValue() as number;
          return (
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${score >= i ? "bg-green-400" : "bg-gray-700"}`}
                />
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => (
          <select
            value={row.original.status}
            onChange={(e) =>
              updateVenue(row.original.id, {
                status: e.target.value as VenueStatus,
              })
            }
            className="bg-transparent border-0 text-sm cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ),
      },
      {
        accessorKey: "last_contact_date",
        header: "Dernier contact",
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? (
            <span className="text-sm text-gray-400">
              {new Date(val).toLocaleDateString("fr-FR")}
            </span>
          ) : (
            <span className="text-gray-600">—</span>
          );
        },
      },
      {
        accessorKey: "next_followup_date",
        header: "Prochaine relance",
        cell: ({ getValue }) => {
          const val = getValue() as string;
          if (!val) return <span className="text-gray-600">—</span>;
          const date = new Date(val);
          const isOverdue = date < new Date();
          return (
            <span
              className={`text-sm ${isOverdue ? "text-red-400" : "text-gray-400"}`}
            >
              {date.toLocaleDateString("fr-FR")}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await fetch(`/api/venues/${row.original.id}/reenrich`, {
                    method: "POST",
                  });
                  fetchVenues();
                } catch (err) {
                  console.error("Erreur reenrich:", err);
                }
              }}
              className="text-gray-400 hover:text-yellow-400 transition-colors text-sm"
              title="Re-enrichir les données"
            >
              🔄
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Supprimer ce lieu ?"))
                  deleteVenue(row.original.id);
              }}
              className="text-gray-600 hover:text-red-400 transition-colors text-sm"
              title="Supprimer"
            >
              🗑
            </button>
          </div>
        ),
      },
    ],
    [updateVenue, deleteVenue, fetchVenues],
  );

  const table = useReactTable({
    data: venues,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lieux</h1>
          <p className="text-gray-400 text-sm mt-1">{venues.length} lieux</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowScraper(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span>🔍</span> Scraper
          </button>

          <button
            onClick={async () => {
              try {
                await fetch("/api/venues/reenrich-incomplete", {
                  method: "POST",
                });
                fetchVenues();
                alert("Ré-enrichissement lancé !");
              } catch (err) {
                console.error(err);
              }
            }}
            className="btn-secondary flex items-center gap-2"
          >
            🔄 Ré-enrichir incomplets
          </button>
        </div>
      </div>

      <div className="card mb-4 flex flex-wrap gap-3">
        <input
          placeholder="Rechercher..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="input flex-1 min-w-48"
        />
        <select
          value={filters.status || ""}
          onChange={(e) => {
            setFilters({ status: e.target.value || undefined });
            fetchVenues();
          }}
          className="input"
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          placeholder="Ville"
          value={filters.city || ""}
          onChange={(e) => {
            setFilters({ city: e.target.value || undefined });
            fetchVenues();
          }}
          className="input"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 border-b border-gray-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left px-4 py-3 text-gray-400 font-medium whitespace-nowrap cursor-pointer hover:text-white select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === "asc"
                        ? " ↑"
                        : header.column.getIsSorted() === "desc"
                          ? " ↓"
                          : ""}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-12 text-gray-500"
                  >
                    Aucun lieu trouvé. Lance un scraping pour commencer !
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showScraper && <ScraperModal onClose={() => setShowScraper(false)} />}
    </div>
  );
};
