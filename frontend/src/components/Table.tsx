import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { GridRowsProp } from '@mui/x-data-grid';
import { useColorMode, Box } from '@chakra-ui/react';
import { itIT } from '@mui/x-data-grid/locales';

interface DataGridTableProps {
  rows: GridRowsProp;
  columns: GridColDef[];
}




export default function DataGridTable({ rows, columns }: DataGridTableProps) {
  const { colorMode } = useColorMode();

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
    },
  });

  return (
    <ThemeProvider theme={colorMode === "light" ? lightTheme : darkTheme}>
      <Box sx={{
        height: 'auto',
        width: '100%',
        '& .super-app-theme--header': {
          backgroundColor: colorMode === "light" ? '#ffffff' : '#feb2b2',
          color:'black'
        },
      }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
            sorting: {
              sortModel: [{ field: 'dateMod', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
          localeText={itIT.components.MuiDataGrid.defaultProps.localeText}
        />
      </Box>
    </ThemeProvider>
  );
}