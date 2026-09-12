/**
 * Utilities for geofencing and calculating distance between GPS coordinates.
 */

// Koordinat Politeknik STMI Jakarta
export const STMI_COORDINATES = {
    lat: -6.1714,
    lng: 106.8687
};

// Radius toleransi dalam meter (cukup luas untuk mencakup GPS drift)
export const STMI_RADIUS_METERS = 150;

/**
 * Menghitung jarak antara dua koordinat menggunakan rumus Haversine.
 * Mengembalikan jarak dalam meter.
 */
export function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Radius bumi dalam meter
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
}

/**
 * Mengecek apakah koordinat yang diberikan berada di dalam kawasan STMI.
 */
export function isWithinSTMI(lat: number, lng: number): boolean {
    const distance = getDistanceInMeters(lat, lng, STMI_COORDINATES.lat, STMI_COORDINATES.lng);
    return distance <= STMI_RADIUS_METERS;
}
