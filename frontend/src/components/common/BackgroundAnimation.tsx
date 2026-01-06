

export const BackgroundAnimation = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[#0a0a0a] pointer-events-none">
            {/* Primary Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950" />

            {/* Rich Gradient Orbs */}
            <div className="absolute top-[-10%] right-[-5%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 blur-[100px] transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tr from-blue-600/20 via-teal-600/20 to-emerald-600/20 blur-[100px] transform -translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-[30%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 blur-[120px]" />

            {/* Noise Texture for Matte Finish */}
            <div
                className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
                }}
            />
        </div>
    );
};
