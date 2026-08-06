import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Link,
  InputAdornment,
} from '@mui/material';
import { ContentCopy, OpenInNew } from '@mui/icons-material';
import { useLocales, useStartLogin, useCompleteLogin, useCancelLogin } from '../hooks/useLogin';
import { useNotification } from '../contexts/NotificationContext';

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

const steps = ['Account Details', 'Sign In with Amazon', 'Complete'];

export default function LoginDialog({ open, onClose }: LoginDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [accountId, setAccountId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [locale, setLocale] = useState('us');
  const [sessionId, setSessionId] = useState('');
  const [loginUrl, setLoginUrl] = useState('');
  const [responseUrl, setResponseUrl] = useState('');
  const [error, setError] = useState('');

  const { data: locales } = useLocales();
  const startLogin = useStartLogin();
  const completeLogin = useCompleteLogin();
  const cancelLogin = useCancelLogin();
  const { notify } = useNotification();

  const handleReset = useCallback(() => {
    setActiveStep(0);
    setAccountId('');
    setAccountName('');
    setLocale('us');
    setSessionId('');
    setLoginUrl('');
    setResponseUrl('');
    setError('');
    startLogin.reset();
    completeLogin.reset();
  }, [startLogin, completeLogin]);

  const handleClose = useCallback(() => {
    if (sessionId && activeStep === 1) {
      cancelLogin.mutate(sessionId);
    }
    handleReset();
    onClose();
  }, [sessionId, activeStep, cancelLogin, handleReset, onClose]);

  const handleStartLogin = async () => {
    setError('');
    try {
      const result = await startLogin.mutateAsync({
        accountId: accountId.trim(),
        locale,
        accountName: accountName.trim() || undefined,
      });

      if ('alreadyAuthenticated' in result) {
        notify('Account already has valid tokens!', 'success');
        handleReset();
        onClose();
        return;
      }

      setSessionId(result.sessionId);
      setLoginUrl(result.loginUrl);
      setActiveStep(1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start login';
      setError(message);
    }
  };

  const handleCompleteLogin = async () => {
    setError('');
    try {
      await completeLogin.mutateAsync({
        sessionId,
        responseUrl: responseUrl.trim(),
      });
      setActiveStep(2);
      notify('Account authenticated successfully!', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to complete login';
      setError(message);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(loginUrl);
    notify('Login URL copied to clipboard', 'info');
  };

  const handleOpenUrl = () => {
    window.open(loginUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Audible Account</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3, mt: 1 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Account ID (email)"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              fullWidth
              autoFocus
              placeholder="your-email@example.com"
            />
            <TextField
              label="Account Name (optional)"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              fullWidth
              placeholder="Friendly name for this account"
            />
            <TextField
              select
              label="Marketplace"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              fullWidth
            >
              {(locales ?? [{ name: 'us', label: 'United States' }]).map((loc) => (
                <MenuItem key={loc.name} value={loc.name}>
                  {loc.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2">
              Sign in to your Amazon/Audible account by opening the link below.
              After you complete login, you will be redirected to a page.
              Copy the <strong>full URL</strong> from the address bar and paste it below.
            </Typography>

            <Alert severity="info">
              Look for a URL that contains <code>/ap/maplanding</code> after you sign in.
              Copy the entire URL from the address bar.
            </Alert>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<OpenInNew />}
                onClick={handleOpenUrl}
              >
                Open Login Page
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={handleCopyUrl}
              >
                Copy URL
              </Button>
            </Box>

            <TextField
              label="Response URL"
              value={responseUrl}
              onChange={(e) => setResponseUrl(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Paste the full redirect URL here after signing in..."
              slotProps={{
                input: {
                  endAdornment: completeLogin.isPending ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />

            <Typography variant="caption" color="text.secondary">
              Having trouble? Try opening the URL in a{' '}
              <Link href="#" onClick={(e) => { e.preventDefault(); handleCopyUrl(); }}>
                private/incognito window
              </Link>.
            </Typography>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              Authentication Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your Audible account has been connected. You can now scan your library.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {activeStep === 0 && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleStartLogin}
              disabled={!accountId.trim() || startLogin.isPending}
              startIcon={startLogin.isPending ? <CircularProgress size={16} /> : undefined}
            >
              {startLogin.isPending ? 'Connecting...' : 'Next'}
            </Button>
          </>
        )}

        {activeStep === 1 && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCompleteLogin}
              disabled={!responseUrl.trim() || completeLogin.isPending}
              startIcon={completeLogin.isPending ? <CircularProgress size={16} /> : undefined}
            >
              {completeLogin.isPending ? 'Verifying...' : 'Complete Login'}
            </Button>
          </>
        )}

        {activeStep === 2 && (
          <Button variant="contained" onClick={handleClose}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
