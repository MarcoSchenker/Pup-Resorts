import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

type LoaderProps = {
    open: boolean;
};

export default function Loader({open}: LoaderProps) {

    return (
        <Backdrop
            sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
            open={open}
        >
            <CircularProgress
                sx={{
                    '& .MuiCircularProgress-circle': {
                        stroke: '#F8BB0A'
                    }
                }}
            />
        </Backdrop>

    );
}
