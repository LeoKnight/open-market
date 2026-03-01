"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  Menu,
  Plus,
  LayoutDashboard,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Navigation() {
  const { data: session, status } = useSession();
  const t = useTranslations("Navigation");

  const primaryLinks = [
    { href: "/compare", label: t("compare") },
    { href: "/coe-trends", label: t("coeTrends") },
    { href: "/depreciation-calculator", label: t("depreciation") },
  ];

  const moreLinks = [
    { href: "/motorcycle-cost-calculator", label: t("costCalculator") },
    { href: "/power-to-weight", label: t("powerToWeight") },
    { href: "/fuel-consumption", label: t("fuelConverter") },
    { href: "/regulations", label: t("regulations") },
  ];

  const allLinks = [...primaryLinks, ...moreLinks];

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center min-w-0">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                Open-Market
              </h1>
            </Link>

            <nav className="hidden lg:ml-8 lg:flex items-center space-x-1">
              {primaryLinks.map((link) => (
                <Button key={link.href} variant="ghost" size="sm" asChild>
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    {t("more")}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {moreLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link href={link.href}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />

            {status === "loading" ? (
              <Skeleton className="h-9 w-20" />
            ) : session?.user ? (
              <>
                <Button asChild size="sm">
                  <Link href="/listings/new">
                    <Plus className="h-4 w-4" />
                    {t("sell")}
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={session.user.image || undefined} alt="" />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[100px] truncate">
                        {session.user.name || session.user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        {t("myListings")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">{t("signIn")}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">{t("signUp")}</Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-primary">Open-Market</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1 mt-6">
                  {allLinks.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Button variant="ghost" className="justify-start" asChild>
                        <Link href={link.href}>{link.label}</Link>
                      </Button>
                    </SheetClose>
                  ))}

                  <Separator className="my-2" />

                  {session?.user ? (
                    <>
                      <SheetClose asChild>
                        <Button variant="ghost" className="justify-start" asChild>
                          <Link href="/listings/new">
                            <Plus className="h-4 w-4" />
                            {t("sellMotorcycle")}
                          </Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="justify-start" asChild>
                          <Link href="/dashboard">
                            <LayoutDashboard className="h-4 w-4" />
                            {t("myListings")}
                          </Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="justify-start text-destructive hover:text-destructive"
                          onClick={() => signOut({ callbackUrl: "/" })}
                        >
                          <LogOut className="h-4 w-4" />
                          {t("signOut")}
                        </Button>
                      </SheetClose>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 pt-2">
                      <SheetClose asChild>
                        <Button variant="outline" className="flex-1" asChild>
                          <Link href="/auth/signin">{t("signIn")}</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button className="flex-1" asChild>
                          <Link href="/auth/signup">{t("signUp")}</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
