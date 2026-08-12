import { useMemo } from 'react';
import { Box, Chip, IconButton, Rating, Tooltip, Avatar } from '@mui/material';
import { DataGrid, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid';
import { Download as DownloadIcon, CheckCircle, Error as ErrorIcon, HourglassEmpty, Cancel } from '@mui/icons-material';
import { booksApi } from '../api/endpoints/books';
import { useAbsStatus, useAbsUploadBook } from '../api/hooks/useAudiobookshelf';
import { useNotification } from '../contexts/NotificationContext';
import AbsIcon from './AbsIcon';
import type { BookDto } from '../api/types';

interface BooksGridProps {
  books: BookDto[];
  loading: boolean;
  onBookClick: (book: BookDto) => void;
  onLiberate: (asin: string) => void;
  onSelectionChange: (asins: string[]) => void;
}

function formatDuration(minutes: number): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

function getStatusIcon(status?: string) {
  switch (status) {
    case 'Liberated':
      return <CheckCircle color="success" fontSize="small" />;
    case 'NotLiberated':
      return <HourglassEmpty color="warning" fontSize="small" />;
    case 'Error':
      return <ErrorIcon color="error" fontSize="small" />;
    case 'Cancelled':
      return <Cancel color="disabled" fontSize="small" />;
    default:
      return <HourglassEmpty color="disabled" fontSize="small" />;
  }
}

export default function BooksGrid({ books, loading, onBookClick, onLiberate, onSelectionChange }: BooksGridProps) {
  const { data: absStatus } = useAbsStatus();
  const absUpload = useAbsUploadBook();
  const { notify } = useNotification();
  const absAvailable = !!absStatus?.enabled && !!absStatus?.connected;

  const handleAbsUpload = (asin: string) => {
    absUpload.mutate(asin, {
      onSuccess: () => notify('Book added to Audiobookshelf', 'success'),
      onError: () => notify('Failed to add book to Audiobookshelf', 'error'),
    });
  };

  const columns = useMemo<GridColDef<BookDto>[]>(() => [
    {
      field: 'liberate',
      headerName: 'Unlock',
      width: 100,
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const status = params.row.userData?.bookStatus;
        if (status === 'Liberated') {
          return (
            <Tooltip title="Already unlocked">
              <CheckCircle color="success" fontSize="small" />
            </Tooltip>
          );
        }
        return (
          <Tooltip title="Unlock this book">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => { e.stopPropagation(); onLiberate(params.row.audibleProductId); }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      },
    },
    {
      field: 'cover',
      headerName: 'Cover',
      width: 100,
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Avatar
          variant="rounded"
          src={booksApi.getCoverUrl(params.row.audibleProductId)}
          sx={{ width: 90, height: 90 }}
        >
          {params.row.title?.[0]}
        </Avatar>
      ),
    },
    {
      field: 'titleWithSubtitle',
      headerName: 'Title',
      flex: 2,
      minWidth: 200,
      headerAlign: 'center',
      
    },
    {
      field: 'authors',
      headerName: 'Authors',
      flex: 1,
      minWidth: 150,
      valueGetter: (_value, row) => row.authors?.join(', ') || '',
    },
    {
      field: 'narrators',
      headerName: 'Narrators',
      flex: 1,
      minWidth: 150,
      valueGetter: (_value, row) => row.narrators?.join(', ') || '',
    },
    {
      field: 'lengthInMinutes',
      headerName: 'Length',
      width: 110,
      valueFormatter: (value: number) => formatDuration(value),
    },
    {
      field: 'series',
      headerName: 'Series',
      flex: 1,
      minWidth: 120,
      valueGetter: (_value, row) => row.series?.join(', ') || '',
    },
    {
      field: 'categories',
      headerName: 'Category',
      width: 120,
      valueGetter: (_value, row) => row.categories?.join(', ') || '',
    },
    {
      field: 'communityRating',
      headerName: 'Rating',
      width: 130,
      renderCell: (params) => (
        <Rating
          value={params.row.communityRating?.overallRating || 0}
          precision={0.5}
          size="small"
          readOnly
        />
      ),
      sortComparator: (v1, v2) => {
        const r1 = (v1 as BookDto['communityRating'])?.overallRating || 0;
        const r2 = (v2 as BookDto['communityRating'])?.overallRating || 0;
        return r1 - r2;
      },
    },
    {
      field: 'dateAdded',
      headerName: 'Date Added',
      width: 130,
      type: 'date',
      valueGetter: (_value, row) => row.libraryInfo?.dateAdded
        ? new Date(row.libraryInfo.dateAdded)
        : null,
    },
    {
      field: 'userData',
      headerName: 'Status',
      align: 'center',
      width: 80,
      renderCell: (params) => getStatusIcon(params.row.userData?.bookStatus),
      sortComparator: (v1, v2) => {
        const s1 = (v1 as BookDto['userData'])?.bookStatus || '';
        const s2 = (v2 as BookDto['userData'])?.bookStatus || '';
        return s1.localeCompare(s2);
      },
    },
    {
      field: 'abs',
      headerName: 'ABS',
      align: 'center',
      headerAlign: 'center',
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const isUnlocked = params.row.userData?.bookStatus === 'Liberated';

        if (!absAvailable) {
          return (
            <Tooltip title="Audiobookshelf integration is off or disconnected">
              <span><AbsIcon variant="disabled" /></span>
            </Tooltip>
          );
        }

        if (params.row.inAudiobookshelf) {
          return (
            <Tooltip title="In Audiobookshelf">
              <span><AbsIcon variant="solid" /></span>
            </Tooltip>
          );
        }

        return (
          <Tooltip title={isUnlocked ? 'Add to Audiobookshelf' : 'Unlock this book first'}>
            <span>
              <IconButton
                size="small"
                disabled={!isUnlocked || absUpload.isPending}
                onClick={(e) => { e.stopPropagation(); handleAbsUpload(params.row.audibleProductId); }}
                sx={{ opacity: isUnlocked ? 1 : 0.4 }}
              >
                <AbsIcon variant="hollow" />
              </IconButton>
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 140,
      valueGetter: (_value, row) => row.userData?.tags || '',
      renderCell: (params) => {
        const tags = params.row.userData?.tags;
        if (!tags) return null;
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {tags.split(',').map((tag, i) => (
              <Chip key={i} label={tag.trim()} size="small" variant="outlined" />
            ))}
          </Box>
        );
      },
    },
    {
      field: 'account',
      headerName: 'Account',
      headerAlign: 'center',
      width: 200,
      valueGetter: (_value, row) => row.libraryInfo?.account || '',
    },
  ], [onLiberate, absAvailable, absUpload.isPending]);

  const handleRowSelection = (model: GridRowSelectionModel) => {
    onSelectionChange(model.ids ? Array.from(model.ids).map(String) : (model as unknown as string[]));
  };

  return (
    <DataGrid
      rows={books}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.audibleProductId}
      checkboxSelection
      disableRowSelectionOnClick
      onRowSelectionModelChange={handleRowSelection}
      onRowClick={(params) => onBookClick(params.row as BookDto)}
      pageSizeOptions={[25, 50, 100]}
      initialState={{
        pagination: { paginationModel: { pageSize: 25 } },
        sorting: { sortModel: [{ field: 'dateAdded', sort: 'desc' }] },
        columns: { columnVisibilityModel: { categories: false, tags: false, communityRating: false } },
      }}
      density="comfortable"
      getRowHeight={() => 'auto'}
      getEstimatedRowHeight={() => 116}
      sx={{
        height: '100%',
        '& .MuiDataGrid-row': {
          cursor: 'pointer',
          maxHeight: '116px !important',
        },
        '& .MuiDataGrid-cell': {
          py: 1,
          display: 'flex',
          alignItems: 'center',
        },
      }}
    />
  );
}
