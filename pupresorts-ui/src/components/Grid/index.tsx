import './index.css';
import Box from '@mui/material/Box';
import { DataGrid, type GridColDef, type GridValidRowModel } from '@mui/x-data-grid';
import React from 'react';

interface GridProps {
    rows: GridValidRowModel[];
    columns: GridColDef[];
    loading?: boolean;
    NoRowsOverlay?: React.ComponentType;
}

export const Grid = ({ rows, columns, loading = false, NoRowsOverlay }: GridProps) => {
    const compatProps: any = {};
    if (NoRowsOverlay) {
        compatProps.slots = { noRowsOverlay: NoRowsOverlay };
        compatProps.components = { NoRowsOverlay: NoRowsOverlay as any };
    }

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 10 },
                    },
                }}
                pageSizeOptions={[10]}
                disableColumnMenu
                disableRowSelectionOnClick
                checkboxSelection={false}
                disableColumnResize
                disableColumnSorting
                sx={{
                    '& .MuiDataGrid-main': { overflow: 'hidden' },
                    '& .MuiTablePagination-displayedRows': { fontFamily: 'inherit' },
                }}
                {...compatProps}
            />
        </Box>
    );
};

export default Grid;

export const CardsGrid: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className }) => {
    return (
        <div className={className ? `cards-grid ${className}` : 'cards-grid'} >
            {children}
        </div>
    );
};

