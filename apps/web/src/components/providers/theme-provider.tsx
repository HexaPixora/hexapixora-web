"use client"

import * as React from "react"

export function ThemeProvider({
  children,
  ...props
}: any) {
  // Temporary bypass for the next-themes <script> React 19 crash
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  
  return <>{children}</>;
}
