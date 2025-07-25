import React, { useState, useCallback } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Alert,
  Snackbar,
  Button,
} from '@mui/material';
import { Security, GetApp } from '@mui/icons-material';
import { FileUpload } from './components/FileUpload';
import { SettingsPanel } from './components/SettingsPanel';
import { SummaryChart } from './components/SummaryChart';
import { ResultsTable } from './components/ResultsTable';
import { PubNubAnalyzer } from './utils/analyzer';
import { LogRow, AnalysisResult, SummaryCount, AnalysisSettings } from './types';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

function App() {
  const [settings, setSettings] = useState<AnalysisSettings>({
    subscribeKey: '',
    debugMode: false,
  });
  
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [summary, setSummary] = useState<SummaryCount>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleFileUpload = useCallback(
    async (logData: LogRow[]) => {
      if (!settings.subscribeKey) {
        setError('Please enter a PubNub Subscribe Key before uploading a file');
        return;
      }

      setIsAnalyzing(true);
      setError('');

      try {
        const analyzer = new PubNubAnalyzer(settings.subscribeKey);
        const { results: analysisResults, summary: summaryData } = analyzer.analyzeLogRows(logData);
        
        setResults(analysisResults);
        setSummary(summaryData);
        setSuccessMessage(`Successfully analyzed ${analysisResults.length} log entries`);
      } catch (err) {
        setError(`Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [settings.subscribeKey]
  );

  const handleExportResults = useCallback(() => {
    if (results.length === 0) return;

    const csvContent = [
      // Header
      'api,log_ts,ts,channels,channel_groups,uuid,authToken,rootCause',
      // Data rows
      ...results.map((result) => {
        const row = result.logRow;
        return [
          row.api,
          row.log_ts,
          row.ts,
          `"${row.channels}"`,
          `"${row.channel_groups}"`,
          row.uuid,
          `"${row.authToken}"`,
          `"${result.rootCause}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '403_analysis_results.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [results]);

  const handleCloseError = () => setError('');
  const handleCloseSuccess = () => setSuccessMessage('');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Security sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Why403s - PubNub Log Analyzer
          </Typography>
          {results.length > 0 && (
            <Button
              color="inherit"
              startIcon={<GetApp />}
              onClick={handleExportResults}
            >
              Export Results
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          PubNub 403 Error Analysis Dashboard
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Upload your PubNub server logs to analyze 403 authentication failures and identify root causes
        </Typography>

        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
        />

        <FileUpload
          onFileUpload={handleFileUpload}
          isLoading={isAnalyzing}
        />

        {Object.keys(summary).length > 0 && (
          <Box sx={{ mt: 4, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 500px', minWidth: '300px' }}>
              <SummaryChart summary={summary} />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  📊 Summary Statistics
                </Typography>
                {Object.entries(summary)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cause, count]) => (
                    <Box key={cause} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{cause}</Typography>
                      <Typography variant="body2" fontWeight="bold">{count}</Typography>
                    </Box>
                  ))}
              </Box>
            </Box>
          </Box>
        )}

        {results.length > 0 && <ResultsTable results={results} />}

        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar open={!!successMessage} autoHideDuration={4000} onClose={handleCloseSuccess}>
          <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
