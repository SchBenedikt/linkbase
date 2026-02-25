'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpen, Settings, BarChart2, Link2, FileText } from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pages', label: 'Pages', icon: FileText },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/links', label: 'Links', icon: Link2 },
    { href: '/analytics', label: 'Analytics', icon: BarChart2 },
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
                            || (item.href === '/pages' && pathname.startsWith('/pages'))
                            || (item.href === '/analytics' && pathname.startsWith('/analytics'))
                            || (item.href === '/links' && pathname.startsWith('/links'))
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
