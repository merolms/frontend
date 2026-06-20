import { Check, ImageIcon, Loader, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { searchUnsplash } from "@/app/services/unsplashService";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const UnsplashPicker = ({ open, onClose, onSelect, initialQuery = "" }) => {
  const [query, setQuery] = useState(initialQuery || "education");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const doSearch = useCallback(async (q, p = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchUnsplash(q, p);
      if (p === 1) {
        setResults(data.results);
      } else {
        setResults((prev) => [...prev, ...data.results]);
      }
      setTotalPages(data.total_pages || 1);
      setPage(p);
    } catch (err) {
      setError(err.message || "Failed to search images.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery || "education");
      setSelectedId(null);
      setSelectedUrl(null);
      setResults([]);
      setError(null);
      setTimeout(() => doSearch(initialQuery || "education", 1), 100);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    setResults([]);
    doSearch(query, 1);
  };

  const handleInputChange = (val) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setResults([]);
      doSearch(val, 1);
    }, 500);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) doSearch(query, page + 1);
  };
  const handleSelect = (photo) => {
    setSelectedId(photo.id);
    setSelectedUrl(photo.url);
  };
  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {open && (
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Cover Image from Unsplash</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search
                size={14}
                className="text-text-muted absolute top-1/2 left-2.5 -translate-y-1/2"
              />
              <Input
                ref={inputRef}
                placeholder="Search photos (e.g., technology, nature, business)..."
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                className="pl-8"
              />
            </div>
          </form>

          {error && (
            <div className="border-error/30 bg-error/5 text-error rounded-lg border p-3 text-sm">
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-4 gap-2">
                {results.map((photo) => (
                  <div
                    key={photo.id}
                    className={`relative cursor-pointer overflow-hidden rounded-md border-2 ${selectedId === photo.id ? "border-primary" : "border-transparent"}`}
                    onClick={() => handleSelect(photo)}
                  >
                    <img
                      src={photo.thumb}
                      alt={photo.alt}
                      className="aspect-square w-full object-cover"
                    />
                    {selectedId === photo.id && (
                      <div className="bg-success absolute top-1 right-1 rounded-full p-1">
                        <Check size={12} className="text-secondary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && results.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon size={48} className="text-text-muted" />
              <p className="text-text-muted mt-2 text-sm">
                Search for images above to get started.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader size={14} className="text-text-muted animate-spin" />
              <span className="text-text-muted text-sm">Searching Unsplash...</span>
            </div>
          )}

          {results.length > 0 && page < totalPages && !loading && (
            <div className="text-center">
              <Button variant="default" size="sm" onClick={handleLoadMore}>
                <Search size={14} /> Load More
              </Button>
            </div>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="default" onClick={onClose}>
              <X size={14} /> Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedUrl}>
              <Check size={14} /> Use Selected Image
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default UnsplashPicker;
