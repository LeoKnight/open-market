"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bike, Heart } from "lucide-react";

interface DashboardTabsProps {
  currentTab: string;
  listingsLabel: string;
  favoritesLabel: string;
}

export function DashboardTabs({ currentTab, listingsLabel, favoritesLabel }: DashboardTabsProps) {
  return (
    <Tabs value={currentTab} className="mb-6">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="listings" asChild>
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <Bike className="w-4 h-4" />
            {listingsLabel}
          </Link>
        </TabsTrigger>
        <TabsTrigger value="favorites" asChild>
          <Link href="/dashboard?tab=favorites" className="flex items-center gap-1.5">
            <Heart className="w-4 h-4" />
            {favoritesLabel}
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
