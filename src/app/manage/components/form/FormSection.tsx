import React from 'react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <section className={cn("mt-8", className)}> {/* Default top margin, can be overridden */}
      <div>
        <h4 className="text-xl font-semibold tracking-tight text-foreground">
          {/* Uses global h4 style which includes mb-4 if not overridden by more specific selectors */}
          {title}
        </h4>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {/* Assuming global p style has leading-7, mb from h4 will create space */}
            {description}
          </p>
        )}
      </div>
      <div className="mt-4"> {/* Spacing between title/description block and content */}
        {children}
      </div>
    </section>
  );
}

export default FormSection;
