import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
} from '@mui/material';
import {
  RestoreFromTrash as RestoreIcon,
} from '@mui/icons-material';
import BooksGrid from '../components/BooksGrid';
import BookDetailsDialog from '../components/BookDetailsDialog';
import { useBooks, useRestoreBook } from '../api/hooks/useBooks';
import { useNotification } from '../contexts/NotificationContext';
import type { BookDto } from '../api/types';

export default function TrashBin() {
  const [selectedBook, setSelectedBook] = useState<BookDto | null>(null);
  const [selectedAsins, setSelectedAsins] = useState<string[]>([]);
  const { notify } = useNotification();

  const { data: allBooks, isLoading } = useBooks({ includeDeleted: true });
  const restoreBook = useRestoreBook();
  // Filter to only deleted books
  const deletedBooks = allBooks?.filter((b) => b.libraryInfo?.isDeleted) || [];

  const handleBulkRestore = () => {
    selectedAsins.forEach((asin) => {
      restoreBook.mutate(asin);
    });
    notify(`Restoring ${selectedAsins.length} books`, 'info');
    setSelectedAsins([]);
  };

  const handleLiberate = useCallback((_asin: string) => {
    notify('Restore the book first before liberating', 'warning');
  }, [notify]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography variant="h5">Trash Bin</Typography>
          <Chip label={`${deletedBooks.length} deleted books`} size="small" />
        </Stack>

        {selectedAsins.length > 0 && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="success"
              startIcon={<RestoreIcon />}
              onClick={handleBulkRestore}
            >
              Restore {selectedAsins.length} Selected
            </Button>
          </Stack>
        )}
      </Stack>

      {deletedBooks.length === 0 && !isLoading ? (
        <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          No deleted books. Items you remove from the library will appear here.
        </Typography>
      ) : (
        <Box sx={{ flexGrow: 1, minHeight: 400 }}>
          <BooksGrid
            books={deletedBooks}
            loading={isLoading}
            onBookClick={setSelectedBook}
            onLiberate={handleLiberate}
            onSelectionChange={setSelectedAsins}
          />
        </Box>
      )}

      <BookDetailsDialog
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </Box>
  );
}
