import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import HeroStage from "./HeroStage";

/** Server entry for the hero: reads the data, hands plain values to the client stage. */
export default function Hero() {
  return (
    <HeroStage
      name={profile.name}
      affiliation="Informatics Engineering, PENS Surabaya"
      lede="Hello! I'm Bilal, an Informatics Engineering student at EPIS (PENS) in Surabaya. Crafting immersive web experiences with modern technologies like Three.js and React."
      archive={projects.length}
      lat={profile.coordinates.lat}
      lon={profile.coordinates.lon}
    />
  );
}
