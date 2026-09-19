import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
<<<<<<< HEAD
import { BrowserRouter } from "react-router-dom";
=======
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
<<<<<<< HEAD
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
=======
      <App />
    </ThemeProvider>
  </StrictMode>,
)
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
