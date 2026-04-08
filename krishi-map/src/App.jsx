import { useEffect } from "react";

useEffect(() => {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/service-worker.js");
    }
}, []);