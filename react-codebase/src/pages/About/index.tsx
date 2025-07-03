import { Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function About(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <div className="text-4xl font-bold text-center">About</div>
      <div className="text-2xl text-center">This is about page</div>
      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        sx={{
          backgroundColor: "#4f4f4f",
          color: "#FFF",
          px: 3,
          "&:hover": {
            backgroundColor: "#3f3f3f",
          },
        }}
      >
        Go back
      </Button>
    </div>
  );
}
