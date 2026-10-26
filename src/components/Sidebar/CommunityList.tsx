import Link from "next/link";

interface Community {
  id: string;
  name: string;
  description?: string;
  categories?: string[];
  memberCount: number;
  distance?: number;
  area?: string;
  type?: string;
}

interface CommunityListProps {
  communities: Community[];
  title?: string;
  showAll?: boolean;
}

export function CommunityList({ communities, title = "Community", showAll = false }: CommunityListProps) {
  const displayedCommunities = showAll ? communities : communities.slice(0, 10);

  if (communities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-[#6B7280]">No communities found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#1F2937]">{title}</h3>
        {communities.length > 10 && !showAll && (
          <Link href="/komunitas" className="text-sm text-[#7960D7] hover:underline">
            See all
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {displayedCommunities.map((community) => (
          <Link
            key={community.id}
            href={`/komunitas/${community.id}`}
            className="block bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#7960D7] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {community.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[#1F2937] truncate">
                  {community.name}
                </h4>
                <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
                  {community.description}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-[#6B7280]">
                  <span>{community.memberCount} members</span>
                  {community.distance && (
                    <>
                      <span>•</span>
                      <span>{community.distance.toFixed(1)} km</span>
                    </>
                  )}
                  {community.area && (
                    <>
                      <span>•</span>
                      <span>{community.area}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!showAll && communities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-[#6B7280] mb-4">Find your people!</p>
          <p className="text-xs text-[#9CA3AF] mb-4">
            Groups that share your passions and keep you connected IRL.
          </p>
          <Link
            href="/komunitas"
            className="inline-block w-full bg-[#1F2937] hover:bg-[#111827] text-white px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            Explore community
          </Link>
        </div>
      )}
    </div>
  );
}
