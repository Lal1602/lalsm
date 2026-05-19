/// <reference types="react" />

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      "ion-icon": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        name?: string;
        size?: string;
        color?: string;
        class?: string;
        slot?: string;
      };
    }
  }
}
