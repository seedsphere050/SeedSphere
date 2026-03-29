import Hero from "./Hero";
import Discover from "./Discover";
import DailyTip from "./DailyTip";
import MasterGarden from "./MasterGarden";

export default function Home() {
  return (
    <div>
      <Hero />
      <Discover />
      <MasterGarden />
      <DailyTip />
    </div>
  );
}
