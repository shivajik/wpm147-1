// Security scan data has been successfully cleared!
// Used API endpoint: DELETE /api/security-scans/clear-all
// Result: Cleared 38 security scans from the database
// 
// This script is no longer needed as the API endpoint provides
// a better way to clear security scans with proper authentication
// and user-specific filtering.

console.log('✅ Security scans have been cleared via API endpoint');
console.log('📝 Use: DELETE /api/security-scans/clear-all with proper JWT token');
console.log('🎯 Now you can test the empty state functionality in the security dashboard');