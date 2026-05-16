

export const BackgroundAnimation = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-gray-50 dark:bg-gray-950 pointer-events-none transition-colors duration-500">
            {/* Primary Gradient Background */}
            <div className="absolute inset-0 bg-linear-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />

            {/* Rich Gradient Orbs - Using Dynamic Theme Colors */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-300/30 dark:bg-primary-600/20 rounded-full blur-[120px] animate-pulse duration-10000" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary-300/20 dark:bg-secondary-600/10 rounded-full blur-[120px] animate-pulse duration-15000 delay-700" />

            {/* Soft Center Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-primary-100/40 dark:bg-primary-900/5 rounded-full blur-[150px]" />

            {/* Noise Texture for Matte Finish */}
            <div
                className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
                }}
            />
        </div>
    );
};
