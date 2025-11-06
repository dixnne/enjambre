# Offline Maps - Quick Reference

## How to Test

1. **Start the app** with internet connection
2. **Grant location permission** when prompted
3. **Wait 2-3 seconds** after location is found
4. **Watch for download notification** in bottom-right corner
5. **Monitor progress**: "X / Y tiles (Z%)"
6. **Wait for success message**: "¡Mapa descargado!"
7. **Toggle offline mode** using the Online/Offline button in header
8. **Verify map still works** when offline

## Expected Behavior

### When Online
- Download starts automatically after location detection
- Progress notification shows tile count and percentage
- Download completes with success message
- Map remains fully functional

### When Offline
- Yellow "Modo sin conexión" badge appears
- Map continues to work using cached tiles
- Can view pins, navigate, zoom in/out
- 3km radius around original location is available

## Configuration

### Change Download Radius
**File**: `src/components/Map.jsx`
**Line**: ~90
```javascript
const latOffset = 5 / 111; // Change 3 to 5 for 5km radius
const lngOffset = 5 / (111 * Math.cos(center[0] * Math.PI / 180));
```

### Change Zoom Levels
**File**: `src/components/Map.jsx`
**Line**: ~110
```javascript
zoomlevels: [14, 15, 16] // Remove zoom 13 to reduce storage
```

### Change Parallel Downloads
**File**: `src/components/Map.jsx`
**Line**: ~109
```javascript
parallel: 5 // Reduce from 10 for stability
```

### Change Auto-Download Delay
**File**: `src/components/Map.jsx`
**Line**: ~178
```javascript
setTimeout(() => {
  offlineControl._saveTiles();
}, 5000); // Change from 2000 to 5000 for 5 second delay
```

## Troubleshooting

### Download doesn't start
- ✓ Check browser console for errors
- ✓ Verify online mode is enabled
- ✓ Check location permission granted
- ✓ Wait at least 2 seconds after location detection

### No tiles when offline
- ✓ Verify download completed (success message appeared)
- ✓ Check IndexedDB in browser DevTools
- ✓ Try clearing cache and re-downloading

### Download is slow
- ✓ Reduce `parallel` downloads (change 10 to 5)
- ✓ Remove higher zoom levels
- ✓ Reduce radius

### Storage quota exceeded
- ✓ Clear browser cache
- ✓ Reduce zoom levels to [13, 14, 15]
- ✓ Reduce radius to 2km or 1km

## Storage Estimates

| Radius | Zoom Levels | Approximate Tiles | Storage Size |
|--------|-------------|-------------------|--------------|
| 1 km   | 13-16       | ~85-130           | ~1-3 MB      |
| 2 km   | 13-16       | ~170-260          | ~3-7 MB      |
| 3 km   | 13-16       | ~340-530          | ~5-13 MB     |
| 5 km   | 13-16       | ~950-1450         | ~15-35 MB    |

| Zoom Levels | Detail Level | Use Case |
|-------------|--------------|----------|
| 13-14       | City view    | General navigation |
| 13-15       | Street view  | Neighborhood detail |
| 13-16       | Building level | Maximum detail |

## Key Events (for debugging)

Open browser console to see:
- `Download started:` when download begins
- `Download completed` when finished
- `Tiles removed from storage` when cache cleared

## Manual Download

Users can also manually download by clicking the download button in the map controls (top-left corner).

## Manual Cache Clear

Users can clear cached tiles by clicking the trash button in the map controls.

## Browser Support

- ✅ Chrome/Edge (Full support)
- ✅ Firefox (Full support)
- ✅ Safari (Full support)
- ✅ Mobile browsers (Full support)
- ❌ Internet Explorer (Not supported)

## API Reference

### leaflet.offline Events

**Important**: Events are fired on the `TileLayerOffline` instance (baseLayer), not the control!

```javascript
// Download lifecycle - attach to offlineLayer
offlineLayer.on('savestart', (e) => {
  // e.lengthToBeSaved contains total tiles to download
  // e.lengthLoaded, e.lengthSaved track progress
  console.log('Starting download of', e.lengthToBeSaved, 'tiles');
});

offlineLayer.on('loadtileend', (e) => {
  // Each tile loaded from server
  console.log('Loaded:', e.lengthLoaded, '/', e.lengthToBeSaved);
});

offlineLayer.on('savetileend', (e) => {
  // Each tile saved to IndexedDB
  console.log('Saved:', e.lengthSaved, '/', e.lengthToBeSaved);
});

offlineLayer.on('saveend', (e) => {
  // All tiles downloaded and saved
  console.log('Download complete!');
});

offlineLayer.on('tilesremoved', () => {
  // Tiles cleared from cache
  console.log('Cache cleared');
});
```

### Manual Control

```javascript
// Trigger download
offlineControl._saveTiles();

// Get storage info
import { getStorageInfo } from 'leaflet.offline';
const info = await getStorageInfo();
console.log(info);

// Clear all tiles
import { truncate } from 'leaflet.offline';
await truncate();
```

## Performance Tips

1. **Start with smaller radius** (1-2km) for testing
2. **Use fewer zoom levels** for faster downloads
3. **Reduce parallel downloads** if experiencing network issues
4. **Clear old tiles** regularly if storage is limited
5. **Download during WiFi** connection for faster speeds

## Documentation Links

- **Full Documentation**: See `OFFLINE_MAPS.md`
- **Implementation Details**: See `OFFLINE_MAP_IMPLEMENTATION.md`
- **leaflet.offline GitHub**: https://github.com/allartk/leaflet.offline
