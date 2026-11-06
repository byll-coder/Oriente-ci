/**
 * Animation Fluide Rare "Liquid Glass Inertia & Smooth Pop"
 * OrienteCI Interactive Engine
 */

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".js-rare-card, .liquid-glass-card");

  cards.forEach((card) => {
    // Physique de réfraction lumineuse au survol
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;
      card.style.backgroundImage = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)`;
    });

    // Inertie de retour élastique
    card.addEventListener("mouseleave", () => {
      card.style.transition =
        "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-image 0.5s ease";
      card.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)";
      card.style.backgroundImage = "none";
    });

    card.addEventListener("mouseenter", () => {
      card.style.transition = "transform 0.15s ease-out";
    });
  });
});
