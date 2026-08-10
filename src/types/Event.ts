export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  platform: string;
  content?: string;
  image?: string;
  status?: "scheduled" | "draft" | "published";
}
