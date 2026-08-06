import { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  HelpOutlined as HelpIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  Download as DownloadIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import BooksGrid from '../components/BooksGrid';
import BookDetailsDialog from '../components/BookDetailsDialog';
import { useBooks, useBookSearch } from '../api/hooks/useBooks';
import { useLiberate, useBulkLiberate } from '../api/hooks/useLiberate';
import { useScanLibrary, useScanStatus, useExportLibrary } from '../api/hooks/useLibrary';
import { useNotification } from '../contexts/NotificationContext';
import type { BookDto } from '../api/types';

interface QuickFilter {
  name: string;
  query: string;
}

function getQuickFilters(): QuickFilter[] {
  try {
    return JSON.parse(localStorage.getItem('quickFilters') || '[]');
  } catch {
    return [];
  }
}

function saveQuickFilters(filters: QuickFilter[]) {
  localStorage.setItem('quickFilters', JSON.stringify(filters));
}

export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BookDto | null>(null);
  const [selectedAsins, setSelectedAsins] = useState<string[]>([]);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [filterEditorOpen, setFilterEditorOpen] = useState(false);
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>(getQuickFilters);
  const [newFilterName, setNewFilterName] = useState('');

  const { notify } = useNotification();

  // Data fetching
  const booksQuery = useBooks();
  const searchResult = useBookSearch(activeQuery);
  const { data: scanStatus } = useScanStatus();

  // Mutations
  const scanLibrary = useScanLibrary();
  const liberate = useLiberate();
  const bulkLiberate = useBulkLiberate();
  const exportLibrary = useExportLibrary();

  const books = activeQuery ? searchResult.data?.books : booksQuery.data;
  const isLoading = activeQuery ? searchResult.isLoading : booksQuery.isLoading;

  const handleSearch = () => {
    setActiveQuery(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') handleClearSearch();
  };

  const handleScan = () => {
    scanLibrary.mutate(undefined, {
      onSuccess: (data) => {
        notify(`Scan complete: ${data.totalCount} total, ${data.newCount} new`, 'success');
      },
      onError: (err) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Scan failed';
        notify(msg, 'error');
      },
    });
  };

  const handleLiberate = useCallback((asin: string) => {
    liberate.mutate(asin, {
      onSuccess: (data) => notify(`Queued: ${data.title || data.asin}`, 'success'),
      onError: () => notify('Failed to queue book', 'error'),
    });
  }, [liberate, notify]);

  const handleBulkLiberate = () => {
    if (selectedAsins.length === 0) return;
    bulkLiberate.mutate({ asins: selectedAsins }, {
      onSuccess: (data) => notify(`Queued ${data.length} books`, 'success'),
      onError: () => notify('Bulk unlock failed', 'error'),
    });
  };

  const handleExport = () => {
    exportLibrary.mutate('json', {
      onSuccess: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `library-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        notify('Library exported', 'success');
      },
    });
  };

  const handleApplyQuickFilter = (filter: QuickFilter) => {
    setSearchQuery(filter.query);
    setActiveQuery(filter.query);
    setFilterMenuAnchor(null);
  };

  const handleAddQuickFilter = () => {
    if (!newFilterName || !searchQuery) return;
    const updated = [...quickFilters, { name: newFilterName, query: searchQuery }];
    setQuickFilters(updated);
    saveQuickFilters(updated);
    setNewFilterName('');
  };

  const handleDeleteQuickFilter = (index: number) => {
    const updated = quickFilters.filter((_, i) => i !== index);
    setQuickFilters(updated);
    saveQuickFilters(updated);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Toolbar */}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search library (Lucene syntax)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ minWidth: 300, flexGrow: 1, maxWidth: 600 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }
          }}
        />

        <Button variant="contained" onClick={handleSearch} disabled={isLoading}>
          Search
        </Button>

        <Tooltip title="Quick Filters">
          <IconButton onClick={(e) => setFilterMenuAnchor(e.currentTarget)}>
            <FilterIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Search syntax help">
          <IconButton onClick={() => setHelpOpen(true)}>
            <HelpIcon />
          </IconButton>
        </Tooltip>

        <Box sx={{ flexGrow: 1 }} />

        {selectedAsins.length > 0 && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={handleBulkLiberate}
          >
            Unlock {selectedAsins.length} Selected
          </Button>
        )}

        <Button
          variant="outlined"
          startIcon={<SyncIcon />}
          onClick={handleScan}
          disabled={scanLibrary.isPending || scanStatus?.scanning}
        >
          {scanStatus?.scanning ? 'Scanning...' : 'Scan Library'}
        </Button>

        <Tooltip title="Export library as JSON">
          <IconButton onClick={handleExport}>
            <ExportIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Active filter indicator */}
      {activeQuery && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Filter:
          </Typography>
          <Chip
            label={activeQuery}
            onDelete={handleClearSearch}
            color="primary"
            size="small"
          />
          {searchResult.data && (
            <Typography variant="body2" color="text.secondary">
              {searchResult.data.totalCount} results
            </Typography>
          )}
        </Stack>
      )}

      {/* Books Grid */}
      <Box sx={{ flexGrow: 1, minHeight: 400 }}>
        <BooksGrid
          books={books || []}
          loading={isLoading}
          onBookClick={setSelectedBook}
          onLiberate={handleLiberate}
          onSelectionChange={setSelectedAsins}
        />
      </Box>

      {/* Quick Filters Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        {quickFilters.length === 0 && (
          <MenuItem disabled>No quick filters saved</MenuItem>
        )}
        {quickFilters.map((filter, index) => (
          <MenuItem key={index} onClick={() => handleApplyQuickFilter(filter)}>
            {filter.name}
          </MenuItem>
        ))}
        <MenuItem divider />
        <MenuItem onClick={() => { setFilterMenuAnchor(null); setFilterEditorOpen(true); }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit Filters...
        </MenuItem>
      </Menu>

      {/* Search Syntax Help Dialog */}
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Search Syntax Help</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            The search uses Lucene query syntax. Here are some examples:
          </Typography>
          <Box component="pre" sx={{ fontSize: 13, bgcolor: 'action.hover', p: 2, borderRadius: 1, overflow: 'auto' }}>
{`# Search by title
title:hobbit

# Search by author
author:"Brandon Sanderson"

# Search by narrator
narrator:kramer

# Search by series
series:stormlight

# Search by tag
tags:favorites

# Search by status
-liberatedstatus:Liberated  (locked)

# Combine queries
author:sanderson AND series:stormlight
title:hobbit OR title:"lord of the rings"

# Wildcard
title:harry*`}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Quick Filter Editor Dialog */}
      <Dialog open={filterEditorOpen} onClose={() => setFilterEditorOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Quick Filters</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1} sx={{ mb: 2, mt: 1 }}>
            <TextField
              size="small"
              label="Filter name"
              value={newFilterName}
              onChange={(e) => setNewFilterName(e.target.value)}
            />
            <TextField
              size="small"
              label="Query"
              value={searchQuery}
              disabled
              sx={{ flexGrow: 1 }}
            />
            <IconButton onClick={handleAddQuickFilter} disabled={!newFilterName || !searchQuery}>
              <AddIcon />
            </IconButton>
          </Stack>
          <List>
            {quickFilters.map((filter, index) => (
              <ListItemButton key={index} onClick={() => handleApplyQuickFilter(filter)}>
                <ListItemText primary={filter.name} secondary={filter.query} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleDeleteQuickFilter(index)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterEditorOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Book Details Dialog */}
      <BookDetailsDialog
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </Box>
  );
}
