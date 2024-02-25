import "@/styles/globals.css";
import "./App.css";
import './index.css';

export default function App({ Component, pageProps }) {
  return (
    <div id="root"> 
      <Component {...pageProps} />
    </div>
  );
}

