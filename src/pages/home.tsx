import { useState, useRef, useEffect } from "react";
import {
  DataTable,
  DataTableSelectionMultipleChangeEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Artwork, ApiResponse } from "@shared/schema";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const ROWS_PER_PAGE = 12;

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [selectCount, setSelectCount] = useState<number | null>(null);
  const [globalSelectedIds, setGlobalSelectedIds] = useState<Set<number>>(
    new Set()
  );
  const [selectRowsUpTo, setSelectRowsUpTo] = useState<number>(0);
  const [bulkOverrideDeselect, setBulkOverrideDeselect] = useState<Set<number>>(
    new Set()
  );
  const [bulkRangeIds, setBulkRangeIds] = useState<Set<number>>(new Set());
  const overlayRef = useRef<OverlayPanel>(null);
  const { toast } = useToast();

  const {
    data: apiData,
    isLoading,
    error,
    isFetching,
  } = useQuery<ApiResponse>({
    queryKey: ["/api/artworks", currentPage],
    queryFn: async () => {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${ROWS_PER_PAGE}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch artworks");
      }
      return response.json();
    },
    placeholderData: (previousData) => previousData,
  });

  const artworks = apiData?.data || [];
  const totalPages = apiData?.pagination?.total_pages || 1;

  useEffect(() => {
    if (artworks.length > 0) {
      const selected: Artwork[] = [];
      const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
      const newBulkRangeIds = new Set(bulkRangeIds);

      artworks.forEach((artwork, index) => {
        const globalRowIndex = startIndex + index + 1;
        const isInBulkRange =
          selectRowsUpTo > 0 && globalRowIndex <= selectRowsUpTo;

        if (isInBulkRange) {
          newBulkRangeIds.add(artwork.id);
        }

        const isExplicitlyDeselected = bulkOverrideDeselect.has(artwork.id);
        const isExplicitlySelected = globalSelectedIds.has(artwork.id);

        const shouldBeSelected =
          (isInBulkRange && !isExplicitlyDeselected) || isExplicitlySelected;

        if (shouldBeSelected) {
          selected.push(artwork);
        }
      });

      setBulkRangeIds(newBulkRangeIds);
      setSelectedArtworks(selected);
    }
  }, [
    artworks,
    globalSelectedIds,
    selectRowsUpTo,
    bulkOverrideDeselect,
    currentPage,
  ]);

  const handleSelectionChange = (
    e: DataTableSelectionMultipleChangeEvent<Artwork[]>
  ) => {
    const newSelection = e.value as Artwork[];
    const newSelectedIds = new Set(newSelection.map((a) => a.id));

    const newGlobalSelected = new Set(globalSelectedIds);
    const newBulkOverrides = new Set(bulkOverrideDeselect);

    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;

    artworks.forEach((artwork, index) => {
      const globalRowIndex = startIndex + index + 1;
      const isSelected = newSelectedIds.has(artwork.id);
      const isInBulkRange =
        selectRowsUpTo > 0 && globalRowIndex <= selectRowsUpTo;

      if (isSelected) {
        newGlobalSelected.add(artwork.id);
        newBulkOverrides.delete(artwork.id);
      } else {
        if (isInBulkRange) {
          newBulkOverrides.add(artwork.id);
        }
        newGlobalSelected.delete(artwork.id);
      }
    });

    setGlobalSelectedIds(newGlobalSelected);
    setBulkOverrideDeselect(newBulkOverrides);
    setSelectedArtworks(newSelection);
  };

  const handleCustomSelection = () => {
    if (!selectCount || selectCount <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number greater than 0",
        variant: "destructive",
      });
      return;
    }

    setSelectRowsUpTo(selectCount);
    setBulkOverrideDeselect(new Set());
    setBulkRangeIds(new Set());

    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const newGlobalSelected = new Set(globalSelectedIds);
    const newBulkRangeIds = new Set<number>();

    artworks.forEach((artwork, index) => {
      const globalRowIndex = startIndex + index + 1;
      if (globalRowIndex <= selectCount) {
        newGlobalSelected.add(artwork.id);
        newBulkRangeIds.add(artwork.id);
      }
    });

    setGlobalSelectedIds(newGlobalSelected);
    setBulkRangeIds(newBulkRangeIds);

    const selected = artworks.filter((_, index) => {
      const globalRowIndex = startIndex + index + 1;
      return globalRowIndex <= selectCount;
    });

    setSelectedArtworks(selected);

    overlayRef.current?.hide();
    setSelectCount(null);

    toast({
      title: "Selection updated",
      description: `First ${selectCount} rows will be selected as you navigate pages`,
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1) {
      setCurrentPage(newPage);
    }
  };

  const getSelectionCount = () => {
    if (selectRowsUpTo === 0) {
      return globalSelectedIds.size;
    }

    const idsOutsideBulk = Array.from(globalSelectedIds).filter(
      (id) => !bulkRangeIds.has(id)
    );

    return selectRowsUpTo - bulkOverrideDeselect.size + idsOutsideBulk.length;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-destructive text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Failed to load artworks
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Unable to fetch data from the Art Institute of Chicago API. Please
            try again later.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="default"
            data-testid="button-retry"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1
            className="text-2xl font-semibold text-foreground mb-2"
            data-testid="text-page-title"
          >
            Art Institute of Chicago Collection
          </h1>
          <p
            className="text-sm text-muted-foreground"
            data-testid="text-page-description"
          >
            Explore artworks from the museum's collection with server-side
            pagination and persistent selection
          </p>
        </div>

        {getSelectionCount() > 0 && (
          <div className="mb-4 bg-card border border-card-border rounded-md px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <span
              className="text-sm font-medium text-card-foreground"
              data-testid="text-selection-count"
            >
              {getSelectionCount()} {getSelectionCount() === 1 ? "row" : "rows"}{" "}
              selected
            </span>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => overlayRef.current?.toggle(e)}
                data-testid="button-custom-select"
              >
                Custom Selection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGlobalSelectedIds(new Set());
                  setSelectRowsUpTo(0);
                  setBulkOverrideDeselect(new Set());
                  setBulkRangeIds(new Set());
                  setSelectedArtworks([]);
                }}
                data-testid="button-deselect-all"
              >
                Deselect All
              </Button>
            </div>
          </div>
        )}

        <div className="bg-card border border-card-border rounded-md overflow-hidden">
          {isLoading && !apiData ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Loading artworks...
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable
                value={artworks}
                selection={selectedArtworks}
                onSelectionChange={handleSelectionChange}
                dataKey="id"
                stripedRows
                className="artwork-table"
                selectionMode="multiple"
                data-testid="table-artworks"
              >
                <Column
                  selectionMode="multiple"
                  headerStyle={{ width: "3.5rem" }}
                  data-testid="column-checkbox"
                />
                <Column
                  field="title"
                  header="Title"
                  style={{ minWidth: "250px" ,  }}
                  body={(rowData: Artwork) => (
                    <span
                      className="font-medium text-foreground"
                      data-testid={`text-title-${rowData.id}`}
                    >
                      {rowData.title || "Untitled"}
                    </span>
                  )}
                />
                <Column
                  field="place_of_origin"
                  header="Place of Origin"
                  style={{ minWidth: "150px" }}
                  body={(rowData: Artwork) => (
                    <span
                      className="text-foreground"
                      data-testid={`text-origin-${rowData.id}`}
                    >
                      {rowData.place_of_origin || "—"}
                    </span>
                  )}
                />
                <Column
                  field="artist_display"
                  header="Artist"
                  style={{ minWidth: "200px" }}
                  body={(rowData: Artwork) => (
                    <span
                      className="text-foreground"
                      data-testid={`text-artist-${rowData.id}`}
                    >
                      {rowData.artist_display || "Unknown"}
                    </span>
                  )}
                />
                <Column
                  field="inscriptions"
                  header="Inscriptions"
                  style={{ minWidth: "200px" }}
                  body={(rowData: Artwork) => (
                    <span
                      className="text-muted-foreground text-sm"
                      data-testid={`text-inscriptions-${rowData.id}`}
                    >
                      {rowData.inscriptions || "—"}
                    </span>
                  )}
                />
                <Column
                  field="date_start"
                  header="Date Start"
                  style={{ minWidth: "100px", textAlign: "right" }}
                  body={(rowData: Artwork) => (
                    <span
                      className="text-foreground tabular-nums"
                      data-testid={`text-date-start-${rowData.id}`}
                    >
                      {rowData.date_start ?? "—"}
                    </span>
                  )}
                />
                <Column
                  field="date_end"
                  header="Date End"
                  style={{ minWidth: "100px", textAlign: "right" }}
                  body={(rowData: Artwork) => (
                    <span
                      className="text-foreground tabular-nums"
                      data-testid={`text-date-end-${rowData.id}`}
                    >
                      {rowData.date_end ?? "—"}
                    </span>
                  )}
                />
              </DataTable>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div
            className="text-sm text-muted-foreground"
            data-testid="text-page-info"
          >
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              data-testid="button-previous"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={
                isLoading || (totalPages > 0 && currentPage >= totalPages)
              }
              data-testid="button-next"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        <OverlayPanel ref={overlayRef} className="custom-overlay">
          <div className="p-6 max-w-md">
            <h3
              className="text-xl font-semibold text-foreground mb-2"
              data-testid="text-overlay-title"
            >
              Select Rows
            </h3>
            <p
              className="text-sm text-muted-foreground mb-4"
              data-testid="text-overlay-description"
            >
              Enter the number of rows to select across all pages
            </p>
            <div className="mb-4">
              <InputNumber
                value={selectCount}
                onValueChange={(e) => setSelectCount(e.value ?? null)}
                placeholder="e.g., 50"
                min={1}
                className="w-full"
                inputClassName="w-full px-4 py-3 border border-input rounded-md bg-background text-foreground"
                data-testid="input-select-count"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="default"
                className="flex-1"
                onClick={handleCustomSelection}
                data-testid="button-submit-selection"
              >
                Submit
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  overlayRef.current?.hide();
                  setSelectCount(null);
                }}
                data-testid="button-cancel-selection"
              >
                Cancel
              </Button>
            </div>
          </div>
        </OverlayPanel>
      </div>
      <style>{`
        .p-checkbox-box {
          border: 2px solid black !important;
          width: 18px;
          height: 18px;
          border-radius: 4px;
        }

        .p-checkbox-box.p-highlight {
          border: 2px solid black !important;
        }

        .p-checkbox-icon {
          color: black !important;
          font-size: 12px;
        }
            .artwork-table .p-datatable-tbody > tr {
    background: hsl(var(--background)) !important;
    border-bottom: 1px solid hsl(var(--border)) !important;
  }

  .artwork-table .p-datatable-tbody > tr:hover {
    background: hsl(var(--accent)) !important;
  }

  .artwork-table .p-datatable-tbody > tr.p-highlight {
    background: hsl(var(--accent)) !important;
    color: hsl(var(--accent-foreground)) !important;
  }

  .artwork-table .p-datatable-tbody > tr > td {
    padding: 0.75rem 1rem !important;
    color: hsl(var(--foreground)) !important;
    border: none !important;
  }

      `}</style>
    </div>
  );
}
