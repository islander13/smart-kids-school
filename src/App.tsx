import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <Suspense fallback={null}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
