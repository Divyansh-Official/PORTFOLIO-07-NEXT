import FluidImageWrapper from '@/src/components/cursor/fluidCursor/FluidImageWrapper';
import BasicNavigationBar from '@/src/components/nav/navBar';

export default function Hero() {
  return (
    <section>
      <div className="preloader-reavler">
        <h1> My Name Is Divyansh</h1>
      </div>

      <FluidImageWrapper className="w-full h-full h-screen">
        <BasicNavigationBar />
      </FluidImageWrapper>
    </section>
  );
}