import React from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material';
import { AnalysisResult } from '../types';

interface TokenDetailsProps {
  result: AnalysisResult;
}

export const TokenDetails: React.FC<TokenDetailsProps> = ({ result }) => {
  const { tokenDetails, logRow } = result;

  const formatPermissions = (perms: Record<string, any>) => {
    return Object.entries(perms).map(([resource, permissions]) => (
      <Box key={resource} sx={{ mb: 1 }}>
        <Typography variant="body2" component="span" fontWeight="bold">
          {resource}:
        </Typography>
        {' '}
        {Object.entries(permissions as Record<string, boolean>).map(([perm, allowed]) => (
          <Chip
            key={perm}
            label={`${perm}: ${allowed ? '✅' : '❌'}`}
            size="small"
            color={allowed ? 'success' : 'error'}
            variant="outlined"
            sx={{ ml: 0.5, mb: 0.5 }}
          />
        ))}
      </Box>
    ));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Token Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>TTL:</strong> {tokenDetails.ttl} minutes
                </Typography>
                <Typography variant="body2">
                  <strong>Issued At:</strong> {tokenDetails.issuedAt}
                </Typography>
                <Typography variant="body2">
                  <strong>Expires At:</strong> {tokenDetails.expiresAt}
                </Typography>
                <Typography variant="body2">
                  <strong>Authorized UUID:</strong> {tokenDetails.authorized_uuid || 'None'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Request Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>API:</strong> {logRow.api?.toUpperCase()}
                </Typography>
                <Typography variant="body2">
                  <strong>Request UUID:</strong> {logRow.uuid}
                </Typography>
                <Typography variant="body2">
                  <strong>Requested Channels:</strong> {logRow.channels || 'None'}
                </Typography>
                <Typography variant="body2">
                  <strong>Requested Groups:</strong> {logRow.channel_groups || 'None'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {(Object.keys(tokenDetails.channels).length > 0 || Object.keys(tokenDetails.groups).length > 0) && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {Object.keys(tokenDetails.channels).length > 0 && (
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Channel Permissions
                  </Typography>
                  {formatPermissions(tokenDetails.channels)}
                </CardContent>
              </Card>
            </Box>
          )}

          {Object.keys(tokenDetails.groups).length > 0 && (
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Channel Group Permissions
                  </Typography>
                  {formatPermissions(tokenDetails.groups)}
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      )}

      <Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          <strong>Auth Token:</strong> {logRow.authToken}
        </Typography>
      </Box>
    </Box>
  );
};