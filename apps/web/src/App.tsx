import Routes from "./routes";
import AuthProvider from "./provider/authProvider";
import ToastProvider from "@/components/ui/ToastProvider";

function App() {
  return (
    <AuthProvider>
      <Routes />
      <ToastProvider />
    </AuthProvider>
  );
}

export default App;
