import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  CloudDone as ConnectedIcon,
  CloudOff as DisconnectedIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import {
  useAbsStatus,
  useAbsLibraries,
  useAbsScanLibrary,
  useAbsSettings,
  useUpdateAbsSettings,
} from '../api/hooks/useAudiobookshelf';
import { useBookStats } from '../api/hooks/useBooks';
import { useNotification } from '../contexts/NotificationContext';

export default function Settings() {
  const { data: stats } = useBookStats();
  const { data: absStatus, isLoading: absLoading } = useAbsStatus();
  const { data: absLibraries } = useAbsLibraries();
  const { data: absSettings } = useAbsSettings();
  const absScan = useAbsScanLibrary();
  const updateAbsSettings = useUpdateAbsSettings();
  const { notify } = useNotification();

  const [absEnabled, setAbsEnabled] = useState(false);
  const [absUrl, setAbsUrl] = useState('');
  const [absApiToken, setAbsApiToken] = useState('');

  useEffect(() => {
    if (absSettings) {
      setAbsEnabled(absSettings.enabled);
      setAbsUrl(absSettings.url);
    }
  }, [absSettings]);

  const handleAbsSettingsSave = () => {
    updateAbsSettings.mutate(
      { enabled: absEnabled, url: absUrl, apiToken: absApiToken || undefined },
      {
        onSuccess: () => {
          setAbsApiToken('');
          notify('Audiobookshelf settings saved', 'success');
        },
        onError: () => notify('Failed to save Audiobookshelf settings', 'error'),
      }
    );
  };

  const handleAbsScan = (libraryId: string) => {
    absScan.mutate(libraryId, {
      onSuccess: () => notify('Audiobookshelf library scan triggered', 'success'),
      onError: () => notify('Failed to trigger scan', 'error'),
    });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Settings</Typography>

      <Stack spacing={3}>
        {/* Library Stats */}
        <Card>
          <CardHeader title="Library Statistics" />
          <CardContent>
            {stats ? (
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                <Chip label={`Total Books: ${stats.totalBooks}`} />
                <Chip label={`Unlocked: ${stats.liberated}`} color="success" />
                <Chip label={`Locked: ${stats.notLiberated}`} color="warning" />
                <Chip label={`In Error: ${stats.inError}`} color="error" />
                <Chip label={`In Queue: ${stats.inQueue}`} color="info" />
                <Chip label={`Podcasts: ${stats.podcasts}`} />
              </Stack>
            ) : (
              <CircularProgress size={24} />
            )}
          </CardContent>
        </Card>

        {/* Audiobookshelf Integration */}
        <Card>
          <CardHeader
            title="Audiobookshelf Integration"
            action={
              absLoading ? (
                <CircularProgress size={20} />
              ) : absStatus?.connected ? (
                <Chip icon={<ConnectedIcon />} label="Connected" color="success" size="small" />
              ) : (
                <Chip icon={<DisconnectedIcon />} label="Disconnected" color="error" size="small" />
              )
            }
          />
          <CardContent>
            {absStatus?.enabled && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Audiobookshelf integration is enabled. Liberated books are automatically uploaded.
                </Typography>

                {absLibraries && absLibraries.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Libraries</Typography>
                    <List dense>
                      {absLibraries.map((lib) => (
                        <ListItem
                          key={lib.id}
                          secondaryAction={
                            <Button
                              size="small"
                              startIcon={<SyncIcon />}
                              onClick={() => handleAbsScan(lib.id)}
                              disabled={absScan.isPending}
                            >
                              Scan
                            </Button>
                          }
                        >
                          <ListItemText
                            primary={lib.name}
                            secondary={lib.folders?.map((f) => f.fullPath).join(', ')}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                <Divider sx={{ my: 2 }} />
              </>
            )}

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch checked={absEnabled} onChange={(e) => setAbsEnabled(e.target.checked)} />
                }
                label="Enable Audiobookshelf integration"
              />
              <TextField
                label="Server URL"
                placeholder="http://192.168.1.100:13378"
                value={absUrl}
                onChange={(e) => setAbsUrl(e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="API Key"
                type="password"
                placeholder={absSettings?.hasApiToken ? 'Leave blank to keep existing key' : ''}
                value={absApiToken}
                onChange={(e) => setAbsApiToken(e.target.value)}
                size="small"
                fullWidth
              />
              <Box>
                <Button
                  variant="contained"
                  onClick={handleAbsSettingsSave}
                  disabled={updateAbsSettings.isPending}
                >
                  Save
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Configuration Info */}
        <Card>
          <CardHeader title="Configuration" />
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Server configuration is managed via environment variables and appsettings.json.
              The following settings can be configured:
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              <ListItem>
                <ListItemText
                  primary="API Keys"
                  secondary="Configure via ApiKeys__0, ApiKeys__1, etc. environment variables"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Books Directory"
                  secondary="BooksDirectory environment variable — where downloaded books are stored"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="App Config"
                  secondary="LibationFiles environment variable — application configuration directory"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Database"
                  secondary="ConnectionStrings__Postgres — PostgreSQL connection string"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="CORS Origins"
                  secondary="Cors__Origins__0, Cors__Origins__1, etc. — allowed frontend origins"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* API Info */}
        <Card>
          <CardHeader title="API Documentation" />
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The full API documentation is available via Swagger UI.
            </Typography>
            <Button
              variant="outlined"
              href={`${import.meta.env.VITE_API_URL || ''}/swagger`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Swagger UI
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
