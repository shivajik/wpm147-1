import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/app-layout";

/**
 * Validates if a website ID from URL params is valid
 * @param websiteId - The website ID from URL params
 * @returns true if valid, false if invalid
 */
export function isValidWebsiteId(websiteId: string | undefined): boolean {
  return !!(websiteId && websiteId !== 'undefined' && websiteId !== 'null' && !isNaN(Number(websiteId)));
}

/**
 * React component that renders an invalid website ID error page
 * @param websiteId - The invalid website ID to display
 */
export function InvalidWebsiteIdPage({ websiteId }: { websiteId: string | undefined }) {
  const [, setLocation] = useLocation();
  
  return (
    <AppLayout title="Invalid Website" defaultOpen={false}>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Invalid Website ID</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The website ID "{websiteId}" is not valid.
        </p>
        <Button onClick={() => setLocation('/websites')}>
          Back to Websites
        </Button>
      </div>
    </AppLayout>
  );
}