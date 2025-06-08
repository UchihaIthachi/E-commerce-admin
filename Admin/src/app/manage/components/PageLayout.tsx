import React from 'react';

interface PageLayoutProps {
  title: string;
  description?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageLayout({ title, description, headerActions, children }: PageLayoutProps) {
  return (
    <div className="flex flex-col flex-1 h-full"> {/* Ensure PageLayout takes available space */}
      <header className="bg-background sticky top-0 z-10"> {/* Optional: make header sticky */}
        <div className="px-6 pt-6"> {/* Consistent horizontal and top padding for title area */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground"> {/* Removed border-b and pb-2 for more control here, assuming global h2 has them but we might not want border on sticky header */}
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {headerActions && <div className="mt-4 md:mt-0">{headerActions}</div>}
          </div>
          <hr className="mt-4 mb-0 border-border" /> {/* Separator line */}
        </div>
      </header>
      <main className="flex-1 p-6 overflow-y-auto"> {/* Adjusted padding to p-6 for content area, consistent with CardContent */}
        {children}
      </main>
    </div>
  );
}

export default PageLayout;
