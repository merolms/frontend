import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, ImageIcon, Search, X, Loader } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchUnsplash } from '@/app/services/unsplashService';
import { t } from '@/styles/theme';

const UnsplashPicker = ({ open, onClose, onSelect, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery || 'education');
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
      if (p === 1) { setResults(data.results); }
      else { setResults((prev) => [...prev, ...data.results]); }
      setTotalPages(data.total_pages || 1);
      setPage(p);
    } catch (err) { setError(err.message || 'Failed to search images.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery || 'education');
      setSelectedId(null);
      setSelectedUrl(null);
      setResults([]);
      setError(null);
      setTimeout(() => doSearch(initialQuery || 'education', 1), 100);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => { e.preventDefault(); setResults([]); doSearch(query, 1); };

  const handleInputChange = (val) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setResults([]); doSearch(val, 1); }, 500);
  };

  const handleLoadMore = () => { if (page < totalPages && !loading) doSearch(query, page + 1); };
  const handleSelect = (photo) => { setSelectedId(photo.id); setSelectedUrl(photo.url); };
  const handleConfirm = () => { if (selectedUrl) { onSelect(selectedUrl); onClose(); } };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {open && (
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Cover Image from Unsplash</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
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
            <div className="rounded-lg border border-error/30 bg-error/5 p-3 text-sm text-error">{error}</div>
          )}

          {results.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-4 gap-2">
                {results.map((photo) => (
                  <div
                    key={photo.id}
                    className={`relative cursor-pointer rounded-md overflow-hidden border-2 ${selectedId === photo.id ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => handleSelect(photo)}
                  >
                    <img src={photo.thumb} alt={photo.alt} className="aspect-square w-full object-cover" />
                    {selectedId === photo.id && (
                      <div className="absolute top-1 right-1 rounded-full bg-success p-1">
                        <Check size={12} className="text-white" />
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
              <p className="text-sm text-text-muted mt-2">Search for images above to get started.</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader size={14} className="animate-spin text-text-muted" />
              <span className="text-sm text-text-muted">Searching Unsplash...</span>
            </div>
          )}

          {results.length > 0 && page < totalPages && !loading && (
            <div className="text-center">
              <Button variant="default" size="sm" onClick={handleLoadMore}>
                <Search size={14} /> Load More
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="default" onClick={onClose}><X size={14} /> Cancel</Button>
            <Button onClick={handleConfirm} disabled={!selectedUrl}><Check size={14} /> Use Selected Image</Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default UnsplashPicker;
