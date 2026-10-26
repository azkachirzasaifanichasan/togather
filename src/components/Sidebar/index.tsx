import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { LocationDisplay } from "./LocationDisplay";
import { UserProfileCard } from "./UserProfileCard";
import { DoingSavedSection } from "./DoingSavedSection";
import { FilterBar } from "./FilterBar";
import { CommunityList } from "./CommunityList";
import { InterestCategory, Area } from "@prisma/client";

interface SidebarProps {
  communities: any[];
  onSearchChange: (query: string) => void;
  selectedCategories: InterestCategory[];
  selectedAreas: Area[];
  onCategoriesChange: (categories: InterestCategory[]) => void;
  onAreasChange: (areas: Area[]) => void;
  memberships?: any[];
  savedItems?: any[];
  isAuthenticated?: boolean;
}

export async function Sidebar({
  communities,
  onSearchChange,
  selectedCategories,
  selectedAreas,
  onCategoriesChange,
  onAreasChange,
  memberships,
  savedItems,
  isAuthenticated,
}: SidebarProps) {
  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Fixed Header Section */}
      <div className="p-6 border-b border-gray-200 space-y-4">
        <Logo />
        <SearchBar onSearch={onSearchChange} />
        <LocationDisplay />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* User Profile Card */}
          <UserProfileCard />

          {/* Doing | Saved Section - Only for authenticated users */}
          {isAuthenticated && (
            <DoingSavedSection memberships={memberships} savedItems={savedItems} />
          )}

          {/* Filter Bar */}
          <FilterBar
            selectedCategories={selectedCategories}
            selectedAreas={selectedAreas}
            onCategoriesChange={onCategoriesChange}
            onAreasChange={onAreasChange}
          />

          {/* Community List */}
          <CommunityList communities={communities} />
        </div>
      </div>
    </aside>
  );
}
