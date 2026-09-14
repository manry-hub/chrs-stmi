export function calculateEffectiveMinutes(startTimeInput: any, endTimeInput: any): number {
  // Toggle for business hours feature
  const isBusinessHoursEnabled = process.env.NEXT_PUBLIC_ENABLE_BUSINESS_HOURS === "true";

  let start = new Date(startTimeInput);
  let end = new Date(endTimeInput);
  
  if (startTimeInput?.seconds) start = new Date(startTimeInput.seconds * 1000);
  if (endTimeInput?.seconds) end = new Date(endTimeInput.seconds * 1000);
  else if (typeof startTimeInput?.toDate === "function") start = startTimeInput.toDate();
  else if (typeof endTimeInput?.toDate === "function") end = endTimeInput.toDate();

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) return 0;

  // If disabled, just return the raw minutes difference
  if (!isBusinessHoursEnabled) {
    return (end.getTime() - start.getTime()) / (1000 * 60);
  }

  let effectiveMinutes = 0;
  let current = new Date(start);

  // Safeguard against infinite loops (max 30 days)
  const maxIterations = 30 * 24 * 60; 
  let iterations = 0;

  while (current < end && iterations < maxIterations) {
    const hour = current.getHours();
    const minute = current.getMinutes();
    
    // Aturan Jam Kerja Efektif:
    // 1. Istirahat jam 12:00 - 12:59 (jam 12 sampai jam 1)
    // 2. Di luar jam kerja (sebelum 06:00 pagi dan setelah 16:30 sore) tidak dihitung argo
    
    const isBreakTime = hour === 12;
    const isOffHours = hour < 6 || hour > 16 || (hour === 16 && minute >= 30);
    
    if (!isBreakTime && !isOffHours) {
      effectiveMinutes++;
    }

    // Tambah 1 menit
    current.setMinutes(current.getMinutes() + 1);
    iterations++;
  }

  return effectiveMinutes;
}
