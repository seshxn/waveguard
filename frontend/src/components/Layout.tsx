import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="min-h-screen bg-background text-foreground antialiased">
            <div className="relative flex min-h-screen flex-col">
                <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-14 max-w-screen-2xl items-center px-4">
                        <div className="mr-4 flex">
                            <Link className="mr-6 flex items-center space-x-2" to="/">
                                <span className="font-bold sm:inline-block">WaveGuard</span>
                            </Link>
                            <nav className="flex items-center gap-6 text-sm font-medium">
                                <Link className="transition-colors hover:text-foreground/80 text-foreground" to="/">Dashboard</Link>
                                <Link className="transition-colors hover:text-foreground/80 text-foreground/60" to="/events">Events</Link>
                                <Link className="transition-colors hover:text-foreground/80 text-foreground/60" to="/settings">Settings</Link>
                            </nav>
                        </div>
                    </div>
                </header>
                <main className="flex-1 container max-w-screen-2xl py-6 px-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;
