import { useEffect, useState } from "react";

const InstallPWAToast = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        console.log("🎯 InstallPWAToast mounted");

        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;
        console.log("📱 Is Standalone:", isStandalone);

        // Force show toast for testing (remove this later)
        console.log("✅ Setting showToast to TRUE for testing");
        setShowToast(true);

        const handler = (e) => {
            console.log("🚀 beforeinstallprompt event fired!");
            e.preventDefault();
            setDeferredPrompt(e);
            setShowToast(true);
        };

        window.addEventListener("beforeinstallprompt", handler);
        console.log("👂 Listening for beforeinstallprompt event");

        return () => {
            console.log("🔌 Removing beforeinstallprompt listener");
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstall = async () => {
        console.log("📥 Install button clicked");
        if (!deferredPrompt) {
            console.log("⚠️ No deferredPrompt available - beforeinstallprompt hasn't fired");
            console.log("💡 User needs to use browser's manual install option");
            return;
        }

        console.log("🎉 Showing native install dialog!");
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        console.log("📊 User choice:", outcome);
        if (outcome === "accepted") {
            console.log("✅ User installed the app");
        }

        setDeferredPrompt(null);
        setShowToast(false);
    };

    const handleDismiss = () => {
        console.log("❌ Toast dismissed");
        setShowToast(false);
    };

    console.log("🔍 Render - showToast:", showToast, "deferredPrompt:", !!deferredPrompt);

    if (!showToast) {
        console.log("⛔ Not showing toast");
        return null;
    }

    console.log("✅ Showing toast!");

    return (
        <div className="fixed bottom-[50px] left-1/2 -translate-x-1/2 bg-yellow-50 shadow-lg rounded-xl px-4 py-3 flex items-center gap-4 border border-gray-200 z-50 max-w-sm w-[90%] animate-slide-up">
            <div className="flex-1">
                <p className="font-semibold text-sm">Install this app?</p>
                <p className="text-xs text-gray-600">
                    Get quick access from your home screen.
                </p>
            </div>
            <button
                onClick={handleInstall}
                className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
            >
                Install
            </button>
            <button
                onClick={handleDismiss}
                className="text-gray-400 text-sm hover:text-black"
                aria-label="Close"
            >
                ✕
            </button>
        </div>
    );
};

export default InstallPWAToast;

