import StringProgressReveal from "../components/StringProgressReveal";

interface QualificationProps {
  contentRef: React.RefObject<HTMLElement | null>;
}

export default function Introduction({ contentRef }: QualificationProps) {
    return (
        <>

        <style>
        {`

        .hero-content {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 125svh;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .string-progress-reveal {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 125svh;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .hero-content h2 {
         width: 75%;
         color: #fc2f2f;
        }

        @media (max-width: 1000px) {
         .hero-content h2 {
           width: calc(100% - 4rem);
         }
        }

        
        `}
        </style>

        <section className="qualification">
             <div
          className="hero-content"
          ref={contentRef as React.RefObject<HTMLDivElement>}
        >
          <h2>Introduction</h2>
        </div>

        </section>
        </>
    )
}