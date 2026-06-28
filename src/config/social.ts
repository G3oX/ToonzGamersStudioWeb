export interface SocialLink {
  key: string;
  label: string;
  href: string;
  icon: string;
}

export interface SocialLinksConfig {
  links: SocialLink[];
}

// URLs sourced from linktr.ee/ToonzGamers_Studio
// Rendered links use target="_blank" and rel="noopener noreferrer".
export const socialLinks: SocialLinksConfig = {
  links: [
    {
      key: "twitter",
      label: "Síguenos en X (Twitter)",
      href: "https://x.com/G3oX",
      icon: "twitter",
    },
    {
      key: "bluesky",
      label: "Síguenos en Bluesky",
      href: "https://bsky.app/profile/g3ox.bsky.social",
      icon: "bluesky",
    },
    {
      key: "youtube",
      label: "Suscríbete en YouTube",
      href: "https://www.youtube.com/@ToonzGamersStudio?sub_confirmation=1",
      icon: "youtube",
    },
    {
      key: "twitch",
      label: "Síguenos en Twitch",
      href: "https://www.twitch.tv/toonzgamers",
      icon: "twitch",
    },
    {
      key: "discord",
      label: "Únete a nuestro Discord",
      href: "https://discord.gg/YpN6PFqgGt",
      icon: "discord",
    },
  ],
};
