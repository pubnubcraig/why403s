import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Collapse,
  Box,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { AnalysisResult } from '../types';
import { TokenDetails } from './TokenDetails';

interface ResultsTableProps {
  results: AnalysisResult[];
}

interface ExpandableRowProps {
  result: AnalysisResult;
}

const ExpandableRow: React.FC<ExpandableRowProps> = ({ result }) => {
  const [open, setOpen] = useState(false);

  const getRootCauseColor = (rootCause: string) => {
    if (rootCause.includes('Token expired')) return 'error';
    if (rootCause.includes('UUID mismatch')) return 'warning';
    if (rootCause.includes('Missing')) return 'secondary';
    if (rootCause.includes('Token appears valid')) return 'success';
    if (rootCause.includes('parse error')) return 'error';
    return 'default';
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
          </IconButton>
        </TableCell>
        <TableCell>{result.logRow.api?.toUpperCase()}</TableCell>
        <TableCell>{new Date(result.logRow.log_ts).toLocaleString()}</TableCell>
        <TableCell>{result.logRow.uuid}</TableCell>
        <TableCell>{result.logRow.channels}</TableCell>
        <TableCell>{result.logRow.channel_groups}</TableCell>
        <TableCell>
          <Chip
            label={result.rootCause}
            color={getRootCauseColor(result.rootCause) as any}
            size="small"
            variant="outlined"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <TokenDetails result={result} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedResults = results.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ mt: 3 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">
          Analysis Results ({results.length} entries)
        </Typography>
      </Box>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell><strong>API</strong></TableCell>
              <TableCell><strong>Timestamp</strong></TableCell>
              <TableCell><strong>UUID</strong></TableCell>
              <TableCell><strong>Channels</strong></TableCell>
              <TableCell><strong>Channel Groups</strong></TableCell>
              <TableCell><strong>Root Cause</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedResults.map((result, index) => (
              <ExpandableRow key={index} result={result} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={results.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};