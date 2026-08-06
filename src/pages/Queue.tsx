import { useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Button,
  Stack,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material';
import { Delete as DeleteIcon, DeleteSweep as ClearAllIcon } from '@mui/icons-material';
import { useQueue, useRemoveQueueItem, useClearQueue } from '../api/hooks/useQueue';
import { useNotification } from '../contexts/NotificationContext';
import { onSignalREvent } from '../services/signalr';
import { booksApi } from '../api/endpoints/books';
import type { QueueItemDto } from '../api/types';

function getStatusColor(status: string): 'default' | 'primary' | 'success' | 'error' | 'warning' {
  switch (status) {
    case 'Completed': return 'success';
    case 'Failed': return 'error';
    case 'Working': return 'primary';
    case 'Queued': return 'warning';
    default: return 'default';
  }
}

function QueueItemCard({ item, onRemove }: { item: QueueItemDto; onRemove: (asin: string) => void }) {
  return (
    <Card sx={{ mb: 1 }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
         <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar
            variant="rounded"
            src={booksApi.getCoverUrl(item.asin)}
            sx={{ width: 48, height: 48 }}
          >
            {item.title?.[0]}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>{item.title || item.asin}</Typography>
             <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip label={item.status} size="small" color={getStatusColor(item.status)} />
              {item.statusMessage && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {item.statusMessage}
                </Typography>
              )}
            </Stack>
            {item.status === 'Working' && (
              <Box sx={{ mt: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={item.progressPercent}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {item.progressPercent.toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {new Date(item.queuedAt).toLocaleTimeString()}
          </Typography>

          {(item.status === 'Queued' || item.status === 'Working') && (
            <Tooltip title="Remove from queue">
              <IconButton size="small" onClick={() => onRemove(item.asin)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Queue() {
  const { data: queue, isLoading } = useQueue();
  const removeItem = useRemoveQueueItem();
  const clearQueue = useClearQueue();
  const { notify } = useNotification();

  useEffect(() => {
    return onSignalREvent((event) => {
      if (event.type === 'BookCompleted') {
        notify(`Unlocked: ${event.data.title || event.data.asin}`, 'success');
      } else if (event.type === 'BookFailed') {
        notify(`Failed: ${event.data.title || event.data.asin} - ${event.data.statusMessage}`, 'error');
      }
    });
  }, [notify]);

  const handleRemove = (asin: string) => {
    removeItem.mutate(asin, {
      onSuccess: () => notify('Removed from queue', 'info'),
    });
  };

  const handleClearAll = () => {
    clearQueue.mutate(undefined, {
      onSuccess: () => notify('Queue cleared', 'info'),
    });
  };

  const working = queue?.filter((q) => q.status === 'Working') || [];
  const queued = queue?.filter((q) => q.status === 'Queued') || [];
  const completed = queue?.filter((q) => q.status === 'Completed') || [];
  const failed = queue?.filter((q) => q.status === 'Failed') || [];

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Process Queue</Typography>
        <Stack direction="row" spacing={1}>
          <Chip label={`${working.length} working`} color="primary" size="small" />
          <Chip label={`${queued.length} queued`} color="warning" size="small" />
          <Chip label={`${completed.length} done`} color="success" size="small" />
          {failed.length > 0 && <Chip label={`${failed.length} failed`} color="error" size="small" />}
          <Button
            size="small"
            startIcon={<ClearAllIcon />}
            onClick={handleClearAll}
            disabled={!queue?.length}
          >
            Clear All
          </Button>
        </Stack>
      </Stack>

      {isLoading && <LinearProgress />}

      {!isLoading && (!queue || queue.length === 0) && (
        <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          No items in the queue. Liberate books from the Library page to see them here.
        </Typography>
      )}

      {working.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>In Progress</Typography>
          {working.map((item) => <QueueItemCard key={item.asin} item={item} onRemove={handleRemove} />)}
        </Box>
      )}

      {queued.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Queued</Typography>
          {queued.map((item) => <QueueItemCard key={item.asin} item={item} onRemove={handleRemove} />)}
        </Box>
      )}

      {completed.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Completed</Typography>
          {completed.map((item) => <QueueItemCard key={item.asin} item={item} onRemove={handleRemove} />)}
        </Box>
      )}

      {failed.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Failed</Typography>
          {failed.map((item) => <QueueItemCard key={item.asin} item={item} onRemove={handleRemove} />)}
        </Box>
      )}
    </Box>
  );
}
