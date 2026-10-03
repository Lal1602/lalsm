import "react";

/**
 * Types for the <ion-icon> web component loaded from the Ionicons CDN script.
 * Augmenting the "react" module (not a global namespace) is what makes React 19's
 * JSX checker pick the element up, so no call site needs a @ts-ignore.
 */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ion-icon": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name?: string;
        size?: string;
        color?: string;
        class?: string;
        slot?: string;
      };
    }
  }
}
