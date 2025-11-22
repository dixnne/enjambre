export const Skeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
        <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full mr-4"></div>
            <div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-32"></div>
            </div>
        </div>
    </div>
);

export const NearbyPinsDrawerSkeleton = () => (
    <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
            <Skeleton key={i} />
        ))}
    </div>
);

export const MyPinsScreenSkeleton = () => (
    <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
            <Skeleton key={i} />
        ))}
    </div>
);

export const AttendingPinsScreenSkeleton = () => (
    <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
            <Skeleton key={i} />
        ))}
    </div>
);