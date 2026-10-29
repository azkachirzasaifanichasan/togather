"use client";

import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { LocationDisplay } from "./LocationDisplay";
import { UserProfileCard } from "./UserProfileCard";
import { DoingSavedSection } from "./DoingSavedSection";
import { FilterBar } from "./FilterBar";
import { CommunityList } from "./CommunityList";
import { InterestCategory, Area } from "@prisma/client";

export interface SidebarCommunity {
  id: string;
  name: string;
  description?: string | null;
  memberCount?: number | null;
  area?: string | null;
}

export interface SidebarMembership {
  id: string;
  community?: { name?: string | null; category?: string | null } | null;
}

export interface SidebarSavedItem {
  id: string;
  name?: string | null;
}

interface SidebarProps {
  communities: SidebarCommunity[];
  onSearchChange: (query: string) => void;
  selectedCategories: InterestCategory[];
  selectedArea: Area | null;
  onCategoriesChange: (categories: InterestCategory[]) => void;
  onAreaChange: (area: Area | null) => void;
  memberships?: SidebarMembership[];
  savedItems?: SidebarSavedItem[];
  isAuthenticated?: boolean;
}

export function Sidebar({
  communities,
  onSearchChange,
  selectedCategories,
  selectedArea,
  onCategoriesChange,
  onAreaChange,
  memberships,
  savedItems,
  isAuthenticated,
}: SidebarProps) {
  return (
    <aside className="flex w-80 flex-col overflow-hidden border-r border-gray-200 bg-white">
      <div className="space-y-4 border-b border-gray-200 p-6">
        <Logo />
        <SearchBar onSearch={onSearchChange} />
        <LocationDisplay />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4">
          <UserProfileCard />

          {isAuthenticated && (
            <DoingSavedSection memberships={memberships} savedItems={savedItems} />
          )}

          <FilterBar
            selectedCategories={selectedCategories}
            selectedArea={selectedArea}
            onCategoriesChange={onCategoriesChange}
            onAreaChange={onAreaChange}
          />

          <CommunityList communities={communities} />
        </div>
      </div>
    </aside>
  );
}
