// Komponenten, die in allen MDX-Inhalten ohne Import verfügbar sind.
import QuickAnswer from '../components/QuickAnswer.astro';
import Callout from '../components/Callout.astro';
import ProductTeaser from '../components/ProductTeaser.astro';
import PicksBox from '../components/PicksBox.astro';
import FlaecheCalculator from '../components/FlaecheCalculator.astro';
import StationCalculator from '../components/StationCalculator.astro';
import KostenCalculator from '../components/KostenCalculator.astro';

export const mdxComponents = { QuickAnswer, Callout, ProductTeaser, PicksBox, FlaecheCalculator, StationCalculator, KostenCalculator };
