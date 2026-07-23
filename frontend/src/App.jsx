import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <>
      <Toaster position="top-right" />

      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </>
  );
}

export default App;