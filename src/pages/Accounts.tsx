import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Switch,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControlLabel,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  VpnKey as TokenIcon,
} from '@mui/icons-material';
import LoginDialog from '../components/LoginDialog';
import { useAccounts, useSetScanEnabled, useDeleteAccount } from '../api/hooks/useAccounts';
import { useScanAccount } from '../api/hooks/useLibrary';
import { useNotification } from '../contexts/NotificationContext';
import type { AccountDto } from '../api/types';

export default function Accounts() {
  const { data: accounts, isLoading } = useAccounts();
  const setScanEnabled = useSetScanEnabled();
  const deleteAccount = useDeleteAccount();
  const scanAccount = useScanAccount();
  const { notify } = useNotification();
  const [deleteTarget, setDeleteTarget] = useState<AccountDto | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const handleToggleScan = (account: AccountDto) => {
    setScanEnabled.mutate(
      { accountId: account.accountId, enabled: !account.libraryScan, locale: account.locale },
      {
        onSuccess: () => notify(
          `Library scan ${!account.libraryScan ? 'enabled' : 'disabled'} for ${account.accountName || account.accountId}`,
          'success'
        ),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteAccount.mutate({ accountId: deleteTarget.accountId, locale: deleteTarget.locale }, {
      onSuccess: () => {
        notify(`Account ${deleteTarget.accountName || deleteTarget.accountId} deleted`, 'success');
        setDeleteTarget(null);
      },
      onError: () => notify('Failed to delete account', 'error'),
    });
  };

  const handleScan = (account: AccountDto) => {
    scanAccount.mutate({ accountId: account.accountId, locale: account.locale }, {
      onSuccess: (data) => notify(`Scan complete: ${data.totalCount} total, ${data.newCount} new`, 'success'),
      onError: (err) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Scan failed';
        notify(msg, 'error');
      },
    });
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Accounts</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setLoginOpen(true)}>
          Add Account
        </Button>
      </Stack>

      {isLoading && (
        <Stack spacing={2}>
          {[1, 2].map((i) => <Skeleton key={i} variant="rounded" height={100} />)}
        </Stack>
      )}

      {!isLoading && (!accounts || accounts.length === 0) && (
        <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          No accounts configured. Click "Add Account" to connect your Audible account.
        </Typography>
      )}

      <Stack spacing={2}>
        {accounts?.map((account) => (
          <Card key={`${account.accountId}-${account.locale}`}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">
                    {account.accountName || account.accountId}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip label={`ID: ${account.accountId}`} size="small" variant="outlined" />
                    {account.locale && <Chip label={account.locale} size="small" />}
                    <Chip
                      icon={<TokenIcon />}
                      label={account.hasTokens ? 'Authenticated' : 'No tokens'}
                      size="small"
                      color={account.hasTokens ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={account.libraryScan}
                      onChange={() => handleToggleScan(account)}
                    />
                  }
                  label="Library Scan"
                />

                <Tooltip title="Scan this account">
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SyncIcon />}
                      onClick={() => handleScan(account)}
                      disabled={scanAccount.isPending}
                    >
                      Scan
                    </Button>
                  </span>
                </Tooltip>

                <Tooltip title="Delete account">
                  <IconButton color="error" onClick={() => setDeleteTarget(account)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete account "{deleteTarget?.accountName || deleteTarget?.accountId}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Login Dialog */}
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </Box>
  );
}
