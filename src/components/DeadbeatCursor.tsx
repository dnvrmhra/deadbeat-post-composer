import { useEffect } from "react";

function DeadbeatCursor() {
  useEffect(() => {
    const cursor = document.getElementById("customCursor");
    const follower = document.getElementById("cursorFollower");

    if (!cursor || !follower) return;

    let mouseX = -200;
    let mouseY = -200;
    let posX = -200;
    let posY = -200;
    let animId: number;
    let hasMovedOnce = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!hasMovedOnce) {
        hasMovedOnce = true;
        posX = mouseX;
        posY = mouseY;
        cursor.style.opacity = "1";
        follower.style.opacity = "1";
      }

      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    };

    cursor.style.opacity = "0";
    follower.style.opacity = "0";
    cursor.style.transition = "opacity 0.15s ease";
    follower.style.transition = "opacity 0.15s ease, width 0.2s ease, height 0.2s ease";

    document.addEventListener("mousemove", handleMouseMove);

    function renderFollower() {
      if (!follower) return;
      posX += (mouseX - posX) * 0.15;
      posY += (mouseY - posY) * 0.15;
      follower.style.transform = `translate(${posX}px, ${posY}px) translate(-50%, -50%)`;
      animId = requestAnimationFrame(renderFollower);
    }
    renderFollower();

    const hoverables = document.querySelectorAll("a, button, .showcase-card, .service-card, .about-card, .platform-card, .draft-card");
    const handleMouseEnter = () => {
      if (follower) {
        follower.style.width = "54px";
        follower.style.height = "54px";
      }
    };
    const handleMouseLeave = () => {
      if (follower) {
        follower.style.width = "32px";
        follower.style.height = "32px";
      }
    };

    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
      hoverables.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div className="custom-cursor" id="customCursor"></div>
      <div className="custom-cursor-follower" id="cursorFollower"></div>
    </>
  );
}

export default DeadbeatCursor;
