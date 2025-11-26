import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "WaveGuard Dashboard",
    description: "Wi-Fi Motion Detection System",
};

const RootLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen bg-background text-foreground antialiased">
                <div className="relative flex min-h-screen flex-col">
                    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="container flex h-14 max-w-screen-2xl items-center">
                            <div className="mr-4 flex">
                                <a className="mr-6 flex items-center space-x-2" href="/">
                                    <span className="font-bold sm:inline-block">WaveGuard</span>
                                </a>
                                <nav className="flex items-center gap-6 text-sm font-medium">
                                    <a className="transition-colors hover:text-foreground/80 text-foreground" href="/">Dashboard</a>
                                    <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/events">Events</a>
                                    <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/settings">Settings</a>
                                </nav>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 container max-w-screen-2xl py-6">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}

export default RootLayout;
