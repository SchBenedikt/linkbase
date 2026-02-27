'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpen, Settings, BarChart2, Link2, FileText, Menu, X } from 'lucide-react';
import { useState } from 'react';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
                {navItems.map(item => (
                    <Button
                        key={item.href}
                        asChild
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "hover:bg-accent hover:text-accent-foreground transition-colors",
                            (pathname === item.href 
                                || (item.href === '/blog' && pathname.startsWith('/blog'))
                                || (item.href === '/pages' && pathname.startsWith('/pages'))
                                || (item.href === '/analytics' && pathname.startsWith('/analytics'))
                                || (item.href === '/links' && pathname.startsWith('/links'))
                            ) && "bg-accent text-accent-foreground font-medium"
                        )}
                    >
                        <Link href={item.href}>
                            <item.icon className="mr-0 sm:mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">{item.label}</span>
                        </Link>
                    </Button>
                ))}
            </nav>

            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="sm"
                className="sm:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                ) : (
                    <Menu className="h-5 w-5" />
                )}
            </Button>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-background border-b z-50 sm:hidden">
                    <nav className="container mx-auto px-4 py-4">
                        <div className="flex flex-col space-y-2">
                            {navItems.map(item => (
                                <Button
                                    key={item.href}
                                    asChild
                                    variant="ghost"
                                    size="lg"
                                    className={cn(
                                        "justify-start hover:bg-accent hover:text-accent-foreground transition-colors w-full",
                                        (pathname === item.href 
                                            || (item.href === '/blog' && pathname.startsWith('/blog'))
                                            || (item.href === '/pages' && pathname.startsWith('/pages'))
                                            || (item.href === '/analytics' && pathname.startsWith('/analytics'))
                                            || (item.href === '/links' && pathname.startsWith('/links'))
                                        ) && "bg-accent text-accent-foreground font-medium"
                                    )}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Link href={item.href} className="flex items-center gap-3">
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </nav>
                </div>
            )}
        </>
    );
}
