'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpen, Settings, BarChart2, Link2 } from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Pages', icon: LayoutDashboard },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/dashboard/links', label: 'Links', icon: Link2 },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardNav() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map(item => (
                <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "hover:bg-accent hover:text-accent-foreground",
                        (pathname === item.href 
                            || (item.href === '/blog' && pathname.startsWith('/blog'))
                            || (item.href === '/dashboard/analytics' && pathname.startsWith('/dashboard/analytics'))
                            || (item.href === '/dashboard/links' && pathname.startsWith('/dashboard/links'))
                        ) && "bg-accent text-accent-foreground"
                    )}
                >
                    <Link href={item.href}>
                        <item.icon className="mr-0 sm:mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                </Button>
            ))}
        </nav>
    );
}
