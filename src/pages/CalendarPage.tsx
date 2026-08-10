import { useState, useMemo, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { selectAllPosts } from "../features/posts/selectors";
import { createDraft, updateDraft, deleteDraft } from "../features/posts/postsSlice";
import Calendar from "../components/Calendar";
import SearchBar from "../components/SearchBar";
import ScheduleModal from "../components/ScheduleModal";
import DeadbeatCursor from "../components/DeadbeatCursor";
import { TwitterIcon, InstagramIcon, LinkedinIcon, FacebookIcon } from "../components/SocialIcons";
import type { Event } from "../types/Event";

export default function CalendarPage() {
  const dispatch = useAppDispatch();
  const reduxPosts = useAppSelector(selectAllPosts);

  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const [customEvents, setCustomEvents] = useState<Event[]>([]);

  const reduxEvents: Event[] = useMemo(() => {
    return reduxPosts.map((p) => {
      const imgs = p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : undefined;
      return {
        id: p.id,
        title: p.content.slice(0, 60).trim() || `${p.platform} Post`,
        date: p.date && p.date.includes("-") ? p.date.slice(0, 10) : new Date().toISOString().split("T")[0],
        time: "10:00 AM",
        platform: p.platform,
        content: p.content,
        image: imgs ? imgs[0] : undefined,
        status: "scheduled" as Event["status"],
      };
    });
  }, [reduxPosts]);

  const allEvents = useMemo(() => {
    return [...reduxEvents, ...customEvents];
  }, [reduxEvents, customEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((e) => {
      const matchesPlatform = platformFilter === "All" || e.platform.toLowerCase() === platformFilter.toLowerCase();
      if (!matchesPlatform) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.platform.toLowerCase().includes(q) ||
        (e.content && e.content.toLowerCase().includes(q)) ||
        e.id.toLowerCase().includes(q)
      );
    });
  }, [allEvents, search, platformFilter]);

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const handleEventClick = useCallback((evt: Event) => {
    setSelectedEvent(evt);
    setIsModalOpen(true);
  }, []);

  const handleDateClick = useCallback((dateStr: string) => {
    setSelectedEvent(null);
    setSelectedDateStr(dateStr);
    setIsModalOpen(true);
  }, []);

  const handleEventDrop = useCallback(
    (eventId: string, newDateStr: string) => {
      const isRedux = reduxPosts.some((p) => p.id === eventId);
      if (isRedux) {
        dispatch(updateDraft({ id: eventId, changes: { date: newDateStr } }));
      } else {
        setCustomEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, date: newDateStr } : e))
        );
      }
    },
    [reduxPosts, dispatch]
  );

  const handleSaveModal = useCallback(
    (eventPayload: Event) => {
      if (selectedEvent) {
        const isRedux = reduxPosts.some((p) => p.id === selectedEvent.id);
        if (isRedux) {
          dispatch(updateDraft({
            id: selectedEvent.id,
            changes: {
              content: eventPayload.content || eventPayload.title,
              platform: eventPayload.platform,
              date: eventPayload.date,
            },
          }));
        } else {
          setCustomEvents((prev) =>
            prev.map((e) => (e.id === selectedEvent.id ? { ...eventPayload } : e))
          );
        }
      } else {
        dispatch(createDraft({
          platform: eventPayload.platform,
          content: eventPayload.content || eventPayload.title,
          date: eventPayload.date,
        }));
      }
    },
    [selectedEvent, reduxPosts, dispatch]
  );

  const handleDeleteEvent = useCallback(
    (eventId: string) => {
      const isRedux = reduxPosts.some((p) => p.id === eventId);
      if (isRedux) {
        dispatch(deleteDraft(eventId));
      } else {
        setCustomEvents((prev) => prev.filter((e) => e.id !== eventId));
      }
    },
    [reduxPosts, dispatch]
  );

  const totalPosts = filteredEvents.length;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCount = filteredEvents.filter((e) => e.date === todayStr).length;

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allEvents.length, Twitter: 0, Instagram: 0, LinkedIn: 0, Facebook: 0 };
    allEvents.forEach((e) => {
      if (counts[e.platform] !== undefined) counts[e.platform]++;
    });
    return counts;
  }, [allEvents]);

  return (
    <>
      <DeadbeatCursor />
      <div style={{
        maxWidth: "1340px",
        margin: "0 auto",
        padding: "100px 3vw 80px",
        color: "var(--text-primary)",
      }}>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "2.3rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>
                Post Scheduler
              </h1>
              <span style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "20px",
                background: "rgba(59,130,246,0.12)",
                color: "#3b82f6",
                border: "1px solid rgba(59,130,246,0.25)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                Interactive
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.93rem", margin: 0 }}>
              Visualise, filter, and drag-and-drop posts across your social media channels.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{
              padding: "8px 18px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-dark)",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, lineHeight: 1 }}>{totalPosts}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {search || platformFilter !== "All" ? "Filtered" : "Total Posts"}
              </div>
            </div>
            <div style={{
              padding: "8px 18px",
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "10px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, lineHeight: 1, color: "#3b82f6" }}>{todayCount}</div>
              <div style={{ fontSize: "0.68rem", color: "#3b82f6", fontWeight: 600, marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Today
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedEvent(null);
                setSelectedDateStr(new Date().toISOString().split("T")[0]);
                setIsModalOpen(true);
              }}
              style={{
                padding: "11px 22px",
                background: "var(--text-primary)",
                color: "var(--bg-primary)",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                transition: "transform 0.15s ease",
              }}
            >
              + Schedule Post
            </button>
          </div>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: "260px" }}>
            <SearchBar
              value={search}
              onChange={handleSearch}
              placeholder="Search scheduled posts by content, platform, date, or ID..."
            />
          </div>

          <div style={{
            display: "flex",
            gap: "6px",
            background: "var(--bg-card)",
            padding: "4px",
            borderRadius: "10px",
            border: "1px solid var(--border-dark)",
          }}>
            {[
              { id: "All", label: "All", icon: null, color: "var(--text-primary)" },
              { id: "Twitter", label: "X", icon: <TwitterIcon size={13} />, color: "#1d9bf0" },
              { id: "Instagram", label: "IG", icon: <InstagramIcon size={13} />, color: "#e1306c" },
              { id: "LinkedIn", label: "IN", icon: <LinkedinIcon size={13} />, color: "#0a66c2" },
              { id: "Facebook", label: "FB", icon: <FacebookIcon size={13} />, color: "#1877f2" },
            ].map((p) => {
              const active = platformFilter === p.id;
              const count = platformCounts[p.id] || 0;
              return (
                <button
                  key={p.id}
                  onClick={() => setPlatformFilter(p.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "7px",
                    border: "none",
                    background: active ? (p.id === "All" ? "var(--bg-secondary)" : `${p.color}20`) : "transparent",
                    color: active ? (p.id === "All" ? "var(--text-primary)" : p.color) : "var(--text-secondary)",
                    fontWeight: active ? 700 : 500,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {p.icon}
                  <span>{p.label}</span>
                  <span style={{
                    fontSize: "0.7rem",
                    opacity: 0.75,
                    padding: "1px 5px",
                    borderRadius: "10px",
                    background: "rgba(150,150,150,0.15)",
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {allEvents.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 0 40px",
            color: "var(--text-secondary)",
            background: "var(--bg-card)",
            borderRadius: "12px",
            border: "1px dashed var(--border-dark)",
            marginBottom: "24px",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.4 }}>📅</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-primary)" }}>
              No posts scheduled yet
            </div>
            <div style={{ fontSize: "0.85rem", maxWidth: "420px", margin: "0 auto 16px" }}>
              Create a post in the Composer or click any date cell below to add a scheduled post.
            </div>
          </div>
        )}

        <Calendar
          events={filteredEvents}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
          onEventDrop={handleEventDrop}
        />

        <ScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedEvent={selectedEvent}
          selectedDate={selectedDateStr}
          onSave={handleSaveModal}
          onDelete={handleDeleteEvent}
        />
      </div>
    </>
  );
}
