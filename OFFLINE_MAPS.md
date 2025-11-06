# Offline Map Download Feature

## Overview
The app now automatically downloads map tiles for offline use when the user has an internet connection. This ensures the map remains functional even without connectivity.

## How It Works

### Automatic Download
- **Trigger**: Starts automatically 2 seconds after location is detected AND user is online
- **Coverage**: 3km radius around the user's current location
- **Zoom Levels**: Downloads tiles for zoom levels 13, 14, 15, and 16
- **Parallel Downloads**: Downloads 10 tiles simultaneously for faster completion

### Manual Download
- Users can manually trigger download using the download button added by leaflet.offline
- Located in the map controls (top-left corner)

### Storage
- Tiles are stored in the browser's IndexedDB
- Persistent across sessions
- Can be cleared manually if needed

## User Experience

### During Download
1. **Download Notification** appears in bottom-right corner showing:
   - Progress indicator with spinner
   - Tile count: "X / Y tiles (Z%)"
   - Coverage info: "Radio de 3 km"
   - Zoom levels being downloaded
   - Progress bar with smooth animations

2. **Download Progress Updates** in real-time as tiles are downloaded

3. **Completion Notification** shows for 5 seconds:
   - Green success message
   - "¡Mapa descargado!"
   - "Disponible sin conexión"

### When Offline
- **Offline Mode Indicator** appears in top-left corner
- Yellow badge with lightbulb icon
- "Modo sin conexión" text
- Map continues to work using cached tiles

## Technical Implementation

### Key Components

#### Map.jsx
- Uses `leaflet.offline` library (v3.1.0)
- `tileLayerOffline`: Offline-capable tile layer
- `savetiles`: Control for downloading/managing tiles

#### Configuration
```javascript
{
  saveText: 'Descargar Mapa',
  rmText: 'Eliminar',
  maxZoom: 16,
  saveWhatYouSee: false,
  bounds: calculated_3km_bounds,
  parallel: 10,
  zoomlevels: [13, 14, 15, 16],
  alwaysDownload: false
}
```

#### Bounds Calculation
```javascript
const getBoundsFor3kmRadius = (center) => {
  // 1 degree latitude ≈ 111km
  const latOffset = 3 / 111; // 3km in degrees
  const lngOffset = 3 / (111 * Math.cos(center[0] * Math.PI / 180));
  
  return L.latLngBounds(
    [center[0] - latOffset, center[1] - lngOffset],
    [center[0] + latOffset, center[1] + lngOffset]
  );
};
```

### Events Handled

1. **`savestart`**: Fired when download begins
   - Sets `isDownloading` to true
   - Records total tile count from `e.lengthToBeSaved`
   - Resets progress counter

2. **`loadtileend`**: Fired after each tile is loaded
   - Increments progress counter
   - Updates UI with new progress

3. **`savetileend`**: Fired after each tile is saved to IndexedDB
   - Used for additional tracking if needed

4. **`saveend`**: Fired when all tiles are downloaded
   - Sets `isDownloading` to false
   - Shows completion notification
   - Marks download as complete

5. **`tilesremoved`**: Fired when tiles are deleted
   - Resets download flag
   - Allows re-download if needed

### State Management

```javascript
const [isDownloading, setIsDownloading] = useState(false);
const [downloadProgress, setDownloadProgress] = useState(0);
const [downloadTotal, setDownloadTotal] = useState(0);
const [showDownloadComplete, setShowDownloadComplete] = useState(false);
const hasDownloadedRef = useRef(false);
```

### Auto-Download Logic

1. **On Initial Load**:
   - Location is detected
   - Bounds are calculated for 3km radius
   - If online and not already downloaded: start download after 2s delay

2. **On Reconnection**:
   - When `isOnline` changes from false to true
   - If location exists and download hasn't happened: trigger download
   - Recalculates bounds if needed

## Storage Size

### Estimated Storage
- **Zoom 13**: ~4-9 tiles (very low resolution)
- **Zoom 14**: ~16-25 tiles
- **Zoom 15**: ~64-100 tiles
- **Zoom 16**: ~256-400 tiles

**Total**: Approximately 340-534 tiles for 3km radius

### Storage Calculation
- Average tile size: ~15-25 KB
- Total storage: ~5-13 MB per 3km radius download

## Browser Compatibility

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **IndexedDB**: Required (supported in all modern browsers)
- **Offline PWA**: Works perfectly in Progressive Web Apps

## Troubleshooting

### Download Not Starting
1. Check browser console for errors
2. Verify `isOnline` is true
3. Ensure location permission is granted
4. Check IndexedDB quota (browser settings)

### Tiles Not Loading Offline
1. Verify tiles were downloaded (check IndexedDB in DevTools)
2. Check `hasDownloadedRef.current` value
3. Look for `tilesremoved` event in console

### Performance Issues
1. Reduce `parallel` downloads (currently 10)
2. Reduce zoom levels (remove zoom 16 if needed)
3. Reduce radius (modify bounds calculation)

## Future Improvements

- [ ] Allow users to select download radius
- [ ] Show storage usage in UI
- [ ] Option to download multiple areas
- [ ] Automatic cleanup of old tiles
- [ ] Update tiles when location changes significantly
- [ ] Background download without blocking UI
- [ ] Download progress in service worker
- [ ] Offline pin creation queue

## Configuration Options

### Adjust Download Radius
Edit the `getBoundsFor3kmRadius` function:
```javascript
const radiusKm = 5; // Change from 3 to 5 for 5km radius
const latOffset = radiusKm / 111;
const lngOffset = radiusKm / (111 * Math.cos(center[0] * Math.PI / 180));
```

### Adjust Zoom Levels
Edit the `zoomlevels` option:
```javascript
zoomlevels: [14, 15, 16] // Remove zoom 13 to save space
```

### Adjust Parallel Downloads
Edit the `parallel` option:
```javascript
parallel: 5 // Reduce from 10 to 5 for slower but more stable download
```

### Adjust Auto-Download Delay
Edit the timeout in `onLocationFound`:
```javascript
setTimeout(() => {
  offlineControl._saveTiles();
}, 5000); // Change from 2000 to 5000 for 5 second delay
```
