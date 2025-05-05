"use client";

import { ThemeProvider } from "./providers/ThemeProvider";
import { LayoutProvider } from "./providers/LayoutProvider";
import { DataProvider } from "./providers/DataProvider";
import MainLayout from "./components/layout/MainLayout";

function App() {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <DataProvider>
          <MainLayout />
        </DataProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}

export default App;
