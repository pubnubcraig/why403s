import React from 'react';
import {
  Paper,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Box,
} from '@mui/material';
import { AnalysisSettings } from '../types';

interface SettingsPanelProps {
  settings: AnalysisSettings;
  onSettingsChange: (settings: AnalysisSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  const handleSubkeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({
      ...settings,
      subscribeKey: event.target.value,
    });
  };

  const handleDebugToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({
      ...settings,
      debugMode: event.target.checked,
    });
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Analysis Settings
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="PubNub Subscribe Key"
          value={settings.subscribeKey}
          onChange={handleSubkeyChange}
          fullWidth
          required
          helperText="Enter your PubNub subscribe key for token analysis"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.debugMode}
              onChange={handleDebugToggle}
            />
          }
          label="Enable Debug Mode"
        />
      </Box>
    </Paper>
  );
};