import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Input, Button, Icon, Image, Segment, Label, Dimmer, Loader } from 'semantic-ui-react';
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
      if (p === 1) {
        setResults(data.results);
      } else {
        setResults(prev => [...prev, ...data.results]);
      }
      setTotalPages(data.total_pages || 1);
      setPage(p);
    } catch (err) {
      setError(err.message || 'Failed to search images.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial search when modal opens
  useEffect(() => {
    if (open) {
      setQuery(initialQuery || 'education');
      setSelectedId(null);
      setSelectedUrl(null);
      setResults([]);
      setError(null);
      // Small delay so modal animation starts first
      setTimeout(() => doSearch(initialQuery || 'education', 1), 100);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    setResults([]);
    doSearch(query, 1);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    // Debounce live search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setResults([]);
      doSearch(val, 1);
    }, 500);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      doSearch(query, page + 1);
    }
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size='large' className='unsplash-picker-modal'>
      <Modal.Header>
        <Icon name='image' color='blue' />
        Select Cover Image from Unsplash
      </Modal.Header>

      <Modal.Content scrolling>
        {/* Search Bar */}
        <form onSubmit={handleSearch} className='unsplash-search-bar'>
          <Input
            ref={inputRef}
            fluid
            placeholder='Search photos (e.g., technology, nature, business)...'
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            icon={<Icon name='search' link onClick={handleSearch} />}
            className='unsplash-search-input'
          />
        </form>

        {error && (
          <Segment basic className='unsplash-error'>
            <Label color='red' icon='warning' content={error} />
          </Segment>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <div className='unsplash-grid'>
            {results.map((photo) => (
              <div
                key={photo.id}
                className={`unsplash-grid-item ${selectedId === photo.id ? 'selected' : ''}`}
                onClick={() => handleSelect(photo)}
              >
                <Image
                  src={photo.thumb}
                  alt={photo.alt}
                  className='unsplash-thumb'
                />
                {selectedId === photo.id && (
                  <div className='unsplash-selected-badge'>
                    <Icon name='check circle' color='green' size='large' />
                  </div>
                )}
                <div className='unsplash-overlay'>
                  <span className='unsplash-author'>
                    <Icon name='camera' size='mini' /> {photo.author}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && !error && (
          <div className='unsplash-empty'>
            <Icon name='search' size='huge' color='grey' />
            <p>Search for images above to get started.</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <Dimmer active inverted>
            <Loader>Searching Unsplash...</Loader>
          </Dimmer>
        )}

        {/* Load More */}
        {results.length > 0 && page < totalPages && !loading && (
          <div className='unsplash-load-more'>
            <Button onClick={handleLoadMore} basic>
              <Icon name='chevron down' /> Load More
            </Button>
          </div>
        )}
      </Modal.Content>

      <Modal.Actions>
        <Button onClick={onClose}>
          <Icon name='close' /> Cancel
        </Button>
        <Button
          primary
          disabled={!selectedUrl}
          onClick={handleConfirm}
        >
          <Icon name='check' /> Use Selected Image
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default UnsplashPicker;
