import { useState, useMemo, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { selectAllPosts } from "../features/posts/selectors";
import { createDraft, updateDraft, deleteDraft } from "../features/posts/postsSlice";
import Calendar from "../components/Calendar";
import SearchBar from "../components/SearchBar";
import ScheduleModal from "../components/ScheduleModal";
import DeadbeatCursor from "../components/DeadbeatCursor";
import type { Event } from "../types/Event";

export default function CalendarPage() {
  const dispatch = useAppDispatch();
  const reduxPosts = useAppSelector(selectAllPosts);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const [customEvents, setCustomEvents] = useState<Event[]>([]);

  const reduxEvents: Event[] = useMemo(() => {
    return reduxPosts.map((p) => ({
      id: p.id,
      title: p.content.slice(0, 60).trim() || `${p.platform} Post`,
      date: p.date && p.date.includes("-") ? p.date.slice(0, 10) : new Date().toISOString().split("T")[0],
      time: "10:00 AM",
      platform: p.platform,
      content: p.content,
      image: p.image,
      status: "scheduled" as Event["status"],
    }));
  }, [reduxPosts]);

  const allEvents = useMemo(() => {
    return [...reduxEvents, ...customEvents];
  }, [reduxEvents, customEvents]);

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return allEvents;
    const q = search.toLowerCase();
    return allEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.platform.toLowerCase().includes(q) ||
        (e.content && e.content.toLowerCase().includes(q)) ||
        e.id.toLowerCase().includes(q)
    );
  }, [allEvents, search]);

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

  return (
    <>
      <DeadbeatCursor />
      <div style={{
        maxWidth: "1300px",
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
            <h1 style={{ fontSize: "2.2rem", fontWeight: 700, margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
              Post Scheduler
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", margin: 0 }}>
              Schedule and manage your posts across platforms. Drag posts to reschedule.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{
              padding: "8px 18px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-dark)",
              borderRadius: "8px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, lineHeight: 1 }}>{totalPosts}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {search ? "Results" : "Total"}
              </div>
            </div>
            <div style={{
              padding: "8px 18px",
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "8px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, lineHeight: 1, color: "#3b82f6" }}>{todayCount}</div>
              <div style={{ fontSize: "0.7rem", color: "#3b82f6", fontWeight: 600, marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
                padding: "10px 20px",
                background: "var(--text-primary)",
                color: "var(--bg-primary)",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              + Schedule Post
            </button>
          </div>
        </div>

        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Search by title, platform, content, or post ID..."
        />

        {allEvents.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 0 40px",
            color: "var(--text-secondary)",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.3 }}>[ ]</div>
            <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-primary)" }}>
              No posts scheduled yet
            </div>
            <div style={{ fontSize: "0.85rem" }}>
              Create a post in the Composer or click any date on the calendar to schedule one.
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
