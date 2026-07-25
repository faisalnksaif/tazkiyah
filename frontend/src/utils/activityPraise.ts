// Joyful phrases shown when a user logs an activity.
// Kept short so they fit a toast without wrapping.

type PraiseSet = { phrases: string[]; emoji: string };

const PRAISE_MAP: { keywords: string[]; set: PraiseSet }[] = [
  {
    keywords: ['dhikr', 'zikr', 'tasbeeh'],
    set: {
      emoji: '🤲',
      phrases: [
        'SubhanAllah — keep going!',
        'Beautiful remembrance!',
        'Your heart is being polished ✨',
        'Blessed dhikr logged!',
      ],
    },
  },
  {
    keywords: ['quran', 'qur', 'tilawah'],
    set: {
      emoji: '📖',
      phrases: [
        'MashaAllah — the Quran heals!',
        'Every letter is ten rewards 🌟',
        'Quran time — blessed!',
        'Keep reading, the angels listen!',
      ],
    },
  },
  {
    keywords: ['prayer', 'salah', 'salat'],
    set: {
      emoji: '🕌',
      phrases: [
        'Alhamdulillah — prayer logged!',
        'Standing before Allah — beautiful!',
        'Prayer is the pillar of deen 🌙',
        'MashaAllah, salah done!',
      ],
    },
  },
  {
    keywords: ['tahajjud'],
    set: {
      emoji: '🌙',
      phrases: [
        'SubhanAllah — Tahajjud! 🌙',
        'The best time to speak to Allah!',
        'While the world sleeps, you rise!',
      ],
    },
  },
  {
    keywords: ['charity', 'sadaqah', 'zakat'],
    set: {
      emoji: '💛',
      phrases: [
        'Sadaqah purifies — mashaAllah!',
        'Generosity logged 💛',
        'Your wealth grows through giving!',
      ],
    },
  },
  {
    keywords: ['woke', 'fajr', 'early'],
    set: {
      emoji: '🌅',
      phrases: [
        'Up before sunrise — barakah!',
        'Fajr warrior! 🌅',
        'The blessed early hours!',
      ],
    },
  },
  {
    keywords: ['exercise', 'workout'],
    set: {
      emoji: '💪',
      phrases: [
        'Strong body, strong worship!',
        'Keeping the trust of your body!',
        'Healthy Muslim — logged! 💪',
      ],
    },
  },
];

const GENERIC_PRAISE: PraiseSet = {
  emoji: '✨',
  phrases: [
    'Logged — keep it up!',
    'Every good deed counts!',
    'MashaAllah, stay consistent!',
    'One step closer today 🌟',
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export type ActivityPraise = { phrase: string; emoji: string };

export function getPraise(activityName: string): ActivityPraise {
  const lower = activityName.toLowerCase();
  const match = PRAISE_MAP.find((m) => m.keywords.some((k) => lower.includes(k)));
  const set = match?.set ?? GENERIC_PRAISE;
  return { phrase: pick(set.phrases), emoji: set.emoji };
}
