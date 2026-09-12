import type { NightStepTone } from '../../../mocks/night-demo/types';

export function NightIllustration({ tone }: { tone: NightStepTone }) {
  return (
    <div
      className={`night-illustration night-illustration--${tone}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" role="presentation">
        <path
          className="night-illustration__halo"
          d="M60 8a52 52 0 1 1 0 104A52 52 0 0 1 60 8Z"
        />
        {tone === 'guard' ? (
          <>
            <path d="M60 25 88 36v21c0 18-11 32-28 39-17-7-28-21-28-39V36l28-11Z" />
            <path
              className="night-illustration__detail"
              d="M60 42v34M44 57h32"
            />
          </>
        ) : null}
        {tone === 'wolf' ? (
          <>
            <path d="m27 39 20 8 13-18 13 18 20-8-8 29c-3 14-12 24-25 24S38 82 35 68l-8-29Z" />
            <path
              className="night-illustration__detail"
              d="m44 65 9 4m23-4-9 4M53 80h14"
            />
          </>
        ) : null}
        {tone === 'seer' ? (
          <>
            <path d="M19 60s15-25 41-25 41 25 41 25-15 25-41 25S19 60 19 60Z" />
            <circle
              className="night-illustration__detail-fill"
              cx="60"
              cy="60"
              r="14"
            />
            <circle
              className="night-illustration__spark"
              cx="66"
              cy="54"
              r="4"
            />
          </>
        ) : null}
        {tone === 'witch' ? (
          <>
            <path d="M46 24h28l-6 20 19 34c5 9-1 18-11 18H44c-10 0-16-9-11-18l19-34-6-20Z" />
            <path
              className="night-illustration__detail"
              d="M47 70h27M44 81h33M49 32h22"
            />
          </>
        ) : null}
        {tone === 'summary' ? (
          <>
            <rect x="31" y="25" width="58" height="70" rx="13" />
            <path
              className="night-illustration__detail"
              d="m43 48 6 6 11-12M43 71l6 6 11-12M66 50h11M66 73h11"
            />
          </>
        ) : null}
        {tone === 'complete' ? (
          <>
            <path d="M60 21 70 47l27 2-21 17 7 27-23-15-23 15 7-27-21-17 27-2 10-26Z" />
            <path className="night-illustration__detail" d="m47 61 9 9 18-21" />
          </>
        ) : null}
        {tone === 'moon' || tone === 'dawn' ? (
          <>
            <path d="M78 25c-7 6-11 15-11 25 0 19 15 34 34 34h3C95 94 82 100 68 100a40 40 0 1 1 10-75Z" />
            <path
              className="night-illustration__spark"
              d="m37 31 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"
            />
          </>
        ) : null}
      </svg>
    </div>
  );
}
