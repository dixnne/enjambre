const FILE_URL = 'https://via.placeholder.com/1.jpg'; // A small 1x1 pixel image
const FILE_SIZE_BITS = 8 * 1024; // Assuming the file is roughly 1KB

export const checkSpeed = async () => {
    const startTime = new Date().getTime();
    try {
        const response = await fetch(FILE_URL, { cache: 'no-store' });
        await response.blob();
        const endTime = new Date().getTime();
        const durationSeconds = (endTime - startTime) / 1000;
        const bitsPerSecond = FILE_SIZE_BITS / durationSeconds;
        const kbps = bitsPerSecond / 1024;
        return kbps;
    } catch (error) {
        console.error('Speed test failed:', error);
        return 0; // Return 0 on error
    }
};

export const isSlowConnection = (speedKbps) => {
    // 3G speeds are typically between 200 and 700 kbps.
    // We'll consider anything below 700 kbps as slow.
    return speedKbps > 0 && speedKbps < 700;
};
