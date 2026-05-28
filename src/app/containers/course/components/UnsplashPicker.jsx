import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, TextInput, Button, Image, Paper, Text, Group, Stack, Loader, Grid } from '@mantine/core';
import { Check, ImageIcon, Search, X } from 'lucide-react';
import { searchUnsplash } from '@/app/services/unsplashService';

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
      if (p === 1) { setResults(data.results); } else { setResults(prev => [...prev, ...data.results]); }
      setTotalPages(data.total_pages || 1);
      setPage(p);
    } catch (err) { setError(err.message || 'Failed to search images.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery || 'education'); setSelectedId(null); setSelectedUrl(null);
      setResults([]); setError(null);
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
    <Modal opened={open} onClose={onClose} title="Select Cover ImageIcon from Unsplash" size="lg" className='unsplash-picker-modal'>
      <form onSubmit={handleSearch} className='unsplash-search-bar'>
        <TextInput
          ref={inputRef}
          placeholder='Search photos (e.g., technology, nature, business)...'
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          leftSection={<Search size={16} />}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(e); } }}
          className='unsplash-search-input'
        />
      </form>

      {error && (
        <Paper p="sm" mb="sm" className='unsplash-error' withBorder>
          <Text size="sm" c="red">{error}</Text>
        </Paper>
      )}

      {results.length > 0 && (
        <div className='unsplash-grid' style={{ maxHeight: 400, overflowY: 'auto' }}>
          <Grid gutter="sm">
            {results.map((photo) => (
              <Grid.Col key={photo.id} span={3}>
                <div className={`unsplash-grid-item ${selectedId === photo.id ? 'selected' : ''}`} onClick={() => handleSelect(photo)} style={{ position: 'relative', cursor: 'pointer' }}>
                  <ImageIcon src={photo.thumb} alt={photo.alt} className='unsplash-thumb' radius="sm" />
                  {selectedId === photo.id && (
                    <div className='unsplash-selected-badge' style={{ position: 'absolute', top: 4, right: 4 }}>
                      <Check size={20} color="green" />
                    </div>
                  )}
                </div>
              </Grid.Col>
            ))}
          </Grid>
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className='unsplash-empty' ta="center" p="xl">
          <ImageIcon size={48} color="#999" />
          <Text mt="sm">Search for images above to get started.</Text>
        </div>
      )}

      {loading && <Group justify="center" p="md"><Loader size="sm" /><Text size="sm">Searching Unsplash...</Text></Group>}

      {results.length > 0 && page < totalPages && !loading && (
        <div className='unsplash-load-more' ta="center" mt="sm">
          <Button variant="default" leftSection={<Search size={14} />} onClick={handleLoadMore}>Load More</Button>
        </div>
      )}

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose} leftSection={<X size={14} />}>Cancel</Button>
        <Button onClick={handleConfirm} disabled={!selectedUrl} leftSection={<Check size={14} />}>Use Selected ImageIcon</Button>
      </Group>
    </Modal>
  );
};

export default UnsplashPicker;
