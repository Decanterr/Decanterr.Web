import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Rating,
  TextField,
  Stack,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
} from '@mui/material';
import { booksApi } from '../api/endpoints/books';
import { useUpdateTags, useUpdateRating, useUpdateStatus, useDeleteBook } from '../api/hooks/useBooks';
import { useLiberate } from '../api/hooks/useLiberate';
import { useNotification } from '../contexts/NotificationContext';
import type { BookDto } from '../api/types';

interface BookDetailsDialogProps {
  book: BookDto | null;
  onClose: () => void;
}

export default function BookDetailsDialog({ book, onClose }: BookDetailsDialogProps) {
  const [tags, setTags] = useState('');
  const [userRating, setUserRating] = useState<number | null>(null);
  const [status, setStatus] = useState('');

  const { notify } = useNotification();
  const updateTags = useUpdateTags();
  const updateRating = useUpdateRating();
  const updateStatus = useUpdateStatus();
  const deleteBook = useDeleteBook();
  const liberate = useLiberate();

  // Reset form when book changes
  const handleEnter = () => {
    if (book) {
      setTags(book.userData?.tags || '');
      setUserRating(book.userData?.userRating || null);
      setStatus(book.userData?.bookStatus || '');
    }
  };

  if (!book) return null;

  const handleSaveTags = () => {
    updateTags.mutate(
      { asin: book.audibleProductId, dto: { tags } },
      { onSuccess: () => notify('Tags updated', 'success') }
    );
  };

  const handleSaveRating = () => {
    if (userRating !== null) {
      updateRating.mutate(
        { asin: book.audibleProductId, dto: { rating: userRating } },
        { onSuccess: () => notify('Rating updated', 'success') }
      );
    }
  };

  const handleSaveStatus = () => {
    updateStatus.mutate(
      { asin: book.audibleProductId, dto: { status } },
      { onSuccess: () => notify('Status updated', 'success') }
    );
  };

  const handleDelete = () => {
    deleteBook.mutate(book.audibleProductId, {
      onSuccess: () => {
        notify('Book removed from library', 'success');
        onClose();
      },
    });
  };

  const handleLiberate = () => {
    liberate.mutate(book.audibleProductId, {
      onSuccess: (data) => notify(`Queued: ${data.title || data.asin}`, 'success'),
    });
  };

  return (
    <Dialog
      open={!!book}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      onTransitionEnter={handleEnter}
    >
      <DialogTitle>{book.titleWithSubtitle}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Left: Cover */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Avatar
              variant="rounded"
              src={booksApi.getCoverUrl(book.audibleProductId)}
              sx={{ width: '100%', height: 'auto', aspectRatio: '1', fontSize: 48 }}
            >
              {book.title?.[0]}
            </Avatar>

            <Stack spacing={1} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleLiberate}
                disabled={book.userData?.bookStatus === 'Liberated'}
              >
                {book.userData?.bookStatus === 'Liberated' ? 'Already Unlocked' : 'Unlock'}
              </Button>
              <Button variant="outlined" color="error" fullWidth onClick={handleDelete}>
                Remove from Library
              </Button>
            </Stack>
          </Grid>

          {/* Right: Details */}
          <Grid size={{ xs: 12, sm: 8 }}>
            <Stack spacing={2}>
              {/* Metadata */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Authors</Typography>
                <Typography>{book.authors.join(', ') || 'Unknown'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Narrators</Typography>
                <Typography>{book.narrators.join(', ') || 'Unknown'}</Typography>
              </Box>

              {book.series.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Series</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {book.series.map((s, i) => <Chip key={i} label={s} size="small" />)}
                  </Box>
                </Box>
              )}

              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Length</Typography>
                  <Typography>
                    {book.lengthInMinutes ? `${Math.floor(book.lengthInMinutes / 60)} hr ${book.lengthInMinutes % 60} min` : 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Typography>{book.contentType}</Typography>
                </Box>
                {book.publisher && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Publisher</Typography>
                    <Typography>{book.publisher}</Typography>
                  </Box>
                )}
              </Stack>

              {book.categories.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Categories</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {book.categories.map((c, i) => <Chip key={i} label={c} size="small" variant="outlined" />)}
                  </Box>
                </Box>
              )}

              {book.communityRating && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Community Rating</Typography>
                  <Stack direction="row" spacing={2}>
                    <Box>
                      <Typography variant="caption">Overall</Typography>
                      <Rating value={book.communityRating.overallRating} precision={0.5} size="small" readOnly />
                    </Box>
                    <Box>
                      <Typography variant="caption">Performance</Typography>
                      <Rating value={book.communityRating.performanceRating} precision={0.5} size="small" readOnly />
                    </Box>
                    <Box>
                      <Typography variant="caption">Story</Typography>
                      <Rating value={book.communityRating.storyRating} precision={0.5} size="small" readOnly />
                    </Box>
                  </Stack>
                </Box>
              )}

              {book.description && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body2" sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {book.description}
                  </Typography>
                </Box>
              )}

              <Divider />

              {/* Editable fields */}
              <Typography variant="h6">Edit</Typography>

              <TextField
                label="Tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                size="small"
                fullWidth
                helperText="Comma-separated tags"
                slotProps={{
                  input: {
                    endAdornment: (
                      <Button size="small" onClick={handleSaveTags} disabled={updateTags.isPending}>
                        Save
                      </Button>
                    ),
                  }
                }}
              />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>My Rating</Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Rating
                    value={userRating}
                    precision={0.5}
                    onChange={(_, newValue) => setUserRating(newValue)}
                  />
                  <Button size="small" onClick={handleSaveRating} disabled={updateRating.isPending}>
                    Save
                  </Button>
                </Stack>
              </Box>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Book Status</InputLabel>
                  <Select
                    value={status}
                    label="Book Status"
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="NotLiberated">Locked</MenuItem>
                    <MenuItem value="Liberated">Unlocked</MenuItem>
                    <MenuItem value="Error">Error</MenuItem>
                  </Select>
                </FormControl>
                <Button size="small" onClick={handleSaveStatus} disabled={updateStatus.isPending}>
                  Save
                </Button>
              </Stack>

              {/* Info section */}
              <Divider />
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                <Chip label={`ASIN: ${book.audibleProductId}`} size="small" />
                {book.locale && <Chip label={`Locale: ${book.locale}`} size="small" />}
                {book.isAbridged && <Chip label="Abridged" size="small" color="warning" />}
                {book.libraryInfo?.isAudiblePlus && <Chip label="Audible Plus" size="small" color="info" />}
                {book.datePublished && <Chip label={`Published: ${new Date(book.datePublished).toLocaleDateString()}`} size="small" />}
                {book.libraryInfo?.dateAdded && <Chip label={`Added: ${new Date(book.libraryInfo.dateAdded).toLocaleDateString()}`} size="small" />}
                {book.libraryInfo?.account && <Chip label={`Account: ${book.libraryInfo.account}`} size="small" />}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
