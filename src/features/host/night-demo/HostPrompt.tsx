import { forwardRef } from 'react';

interface HostPromptProps {
  actorLabel: string;
  prompt: string;
  repeatKey: number;
}

export const HostPrompt = forwardRef<HTMLHeadingElement, HostPromptProps>(
  function HostPrompt({ actorLabel, prompt, repeatKey }, ref) {
    return (
      <section className="host-prompt" aria-labelledby="active-host-prompt">
        <span className="host-prompt__label">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 10v4m4-7v10m4-13v16m4-12v8m4-6v4" />
          </svg>
          现在请念
        </span>
        <h1
          key={repeatKey}
          id="active-host-prompt"
          className={
            repeatKey > 0
              ? 'host-prompt__text is-repeated'
              : 'host-prompt__text'
          }
          ref={ref}
          tabIndex={-1}
        >
          {prompt}
        </h1>
        <p>{actorLabel}</p>
      </section>
    );
  },
);
