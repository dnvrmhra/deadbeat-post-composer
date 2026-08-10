import type { Event } from "../types/Event";

const PLATFORMS = ["Twitter", "Instagram", "LinkedIn", "Facebook"];

const TITLES = [
  "Brand Identity Launch Announcement",
  "Minimalist Design System Showcase",
  "Real-Time Social Post Validation Demo",
  "Stateless JWT Security Architecture",
  "Role-Based Access Control Overview",
  "Interactive Calendar Scheduler Update",
  "Redux Toolkit Normalization Article",
  "Memoized Reselect Performance Benchmark",
  "Chandigarh Design Studio Showcase",
  "Deadbeat Brand Aesthetic Highlight",
];

export function generateEvents(count: number = 100): Event[] {
  const events: Event[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  for (let i = 0; i < count; i++) {
    const dayOffset = Math.floor(Math.random() * 60) - 15;
    const eventDate = new Date(year, month, today.getDate() + dayOffset);

    const yearStr = eventDate.getFullYear();
    const monthStr = String(eventDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(eventDate.getDate()).padStart(2, "0");
    const formattedDate = `${yearStr}-${monthStr}-${dayStr}`;

    const hour = Math.floor(Math.random() * 12) + 9;
    const minute = Math.random() > 0.5 ? "00" : "30";
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    const formattedTime = `${displayHour}:${minute} ${period}`;

    const platform = PLATFORMS[i % PLATFORMS.length];
    const titleTemplate = TITLES[i % TITLES.length];

    events.push({
      id: `event-${i + 1}`,
      title: `${titleTemplate} #${i + 1}`,
      date: formattedDate,
      time: formattedTime,
      platform,
      content: `Scheduled social post content for ${platform} channel. Target launch date: ${formattedDate}.`,
      status: i % 3 === 0 ? "scheduled" : i % 3 === 1 ? "draft" : "published",
    });
  }

  return events;
}
