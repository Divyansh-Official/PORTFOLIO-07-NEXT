import { useEffect, useRef } from "react";
import qualification from "../data/Qualifications.json";

export default function StringProgressReveal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef  = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img  = imgRef.current;
    if (!wrap || !img) return;

    // Custom attributes with hyphens can't be JSX props — set them imperatively
    wrap.setAttribute("string",          "progress");
    wrap.setAttribute("string-enter-vp", "top");
    wrap.setAttribute("string-exit-vp",  "bottom");

    img.setAttribute("string",       "lazy");
    img.setAttribute("string-lazy",  "https://picsum.photos/707/549");

    const init = () => {
      const ST = (window as any).StringTune;
      if (!ST) return;
      const st = ST.StringTune.getInstance();
      (window as any).StringTuneContext = st;
      st.use(ST.StringLazy);
      st.use(ST.StringProgress);
      st.start(0);
    };

    if ((window as any).StringTune) {
      // Script already loaded (HMR / cached) — init immediately
      init();
    } else if (!document.getElementById("string-tune-cdn")) {
      const s  = document.createElement("script");
      s.id     = "string-tune-cdn";
      s.src    = "https://unpkg.com/@fiddle-digital/string-tune@1.1.55/dist/index.js";
      s.async  = true;
      s.onload = init;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <>
      <style>{`
        @property --progress {
          syntax: '<number>';
          inherits: true;
          initial-value: 0;
        }

        @property --spotlight-angle {
          syntax: '<number>';
          inherits: true;
          initial-value: 0;
        }

        @property --spotlight-distance {
          syntax: '<number>';
          inherits: true;
          initial-value: 0;
        }

        :root {
          --vh: 1vh;
          --vw: 1vw;
          --c-white: #ffffff;
          --c-black: #000000;
          --c-grey-dark: #333333;
          --c-grey: #999999;
          --c-red: #FF5A37;

          --easing-function: cubic-bezier(0.86, 0, 0.31, 1);
          --easing-function-2: cubic-bezier(0.35, 0.35, 0, 1);
          --easing-timing: 1.5s;

          --g-gap: 0.4rem;
          --g-margin: calc(var(--g-gap) * 2);

          --mm: 0.64rem;
          --m: 0.8rem;
          --p: 1rem;
          --h6: 1.25rem;
          --h5: 1.563rem;
          --h4: 1.953rem;
          --h3: 2.441rem;
          --h2: 3.052rem;
          --h1: 3.815rem;
          --h0: 5.065rem;
          --large: max(6.331rem, 18vw);
        }

        @media (min-width: 1024px) {
          :root { --g-margin: calc(var(--g-gap) * 4); }
        }

        /* Responsive font-size utility classes from the original */
        .-h0  { font-size: var(--h0); }
        .-h1  { font-size: var(--h1); }
        .-h2  { font-size: var(--h2); }
        .-h3  { font-size: var(--h3); }

        @media (max-width: 1600px) {
          .-mid-h0  { font-size: var(--h0); }
          .-mid-h1  { font-size: var(--h1); }
          .-mid-h2  { font-size: var(--h2); }
          .-mid-h3  { font-size: var(--h3); }
        }

        @media (max-width: 1024px) {
          .-m-h0  { font-size: var(--h0); }
          .-m-h1  { font-size: var(--h1); }
          .-m-h2  { font-size: var(--h2); }
          .-m-h3  { font-size: var(--h3); }
        }

        .spr-note { color: var(--c-white); }

        .-w {
          display: grid;
          grid-template-columns: repeat(14, 1fr);
          grid-template-rows: repeat(2, 1fr);
          align-items: start;
          column-gap: var(--g-gap);
          position: relative;
          min-height: 1024px;
          margin-left: var(--g-margin);
          margin-right: var(--g-margin);
        }

        .-w p {
          grid-column-start: 3;
          grid-column-end: 13;
          grid-row-start: 1;
          justify-self: center;
          align-self: start;
          text-align: center;
          z-index: 40;
          margin-top: calc(var(--h1) * 2);
          padding-left: 10%;
          padding-right: 10%;
        }

        @media (min-width: 1024px) {
          .-w p {
            grid-column-start: 6;
            grid-column-end: 10;
          }
        }

        .-w .image-1 {
          grid-column-start: 1;
          grid-column-end: 15;
          grid-row-start: 1;
          align-self: center;
          height: calc(var(--vh, 1vh) * 40);
          position: sticky;
          top: calc(var(--vh, 1vh) * 30);
          margin-bottom: calc(var(--vh, 1vh) * 30);
          scale: calc(0.5 + var(--progress) * 0.5);
          clip-path: rect(
            calc(20% - var(--progress) * 20%)
            calc(90% + var(--progress) * 10%)
            calc(80% + var(--progress) * 20%)
            calc(10% - var(--progress) * 10%)
            round calc(var(--h3) - var(--progress) * var(--h3))
          );
          transform: translateZ(0);
        }

        @media (min-width: 1024px) {
          .-w .image-1 {
            grid-column-start: 3;
            grid-column-end: 13;
            top: calc(var(--vh, 1vh) * 15);
            margin-bottom: calc(var(--vh, 1vh) * 15);
            height: calc(var(--vh, 1vh) * 70);
            clip-path: rect(
              calc(20% - var(--progress) * 20%)
              calc(70% + var(--progress) * 30%)
              calc(80% + var(--progress) * 20%)
              calc(30% - var(--progress) * 30%)
              round calc(var(--h3) - var(--progress) * var(--h3))
            );
          }
        }

        .-w .image-1 img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .-w span.line {
          grid-column-start: 1;
          grid-column-end: 15;
          grid-row-start: 1;
          align-self: center;
          position: relative;
          display: block;
          height: 1px;
          background-color: var(--c-grey-dark);
          margin-top: calc(var(--vh, 1vh) * 30);
          opacity: 0.4;
        }

        @media (min-width: 1024px) {
          .-w span.line { margin-top: calc(var(--vh, 1vh) * 15); }
        }

        .-w .title {
          grid-column-start: ;
          grid-column-end: 15;
          grid-row-start: 1;
          align-self: end;
          text-align: center;
          position: relative;
        }
      `}</style>

      <div className="-w" ref={wrapRef}>
        {/* <p className="spr-note">
          Drawing was a language of thought — a way to understand motion, balance, and harmony.
        </p> */}
        <figure className="image-1">
          {/* string / string-lazy set via ref in useEffect — hyphens break JSX attribute syntax */}
          <img ref={imgRef} alt="StringTune" />
        </figure>
        {/* <span className="line" /> */}
        <h1 className="title -h0 -mid-h2 -m-h3" aria-hidden="true"> {qualification.University} </h1>
      </div>
    </>
  );
}





// import { useEffect, useRef } from "react";

// export default function StringProgressReveal() {
//   const wrapRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const el = wrapRef.current;
//     if (!el) return;

//     el.setAttribute("string",          "progress");
//     el.setAttribute("string-enter-vp", "top");
//     el.setAttribute("string-exit-vp",  "bottom");

//     if (!document.getElementById("string-tune-cdn")) {
//       const s  = document.createElement("script");
//       s.id     = "string-tune-cdn";
//       s.src    = "https://unpkg.com/@fiddle-digital/string-tune@1.1.55/dist/index.js";
//       s.async  = true;
//       s.onload = () => {
//         const ST  = (window as any).StringTune;
//         const st  = ST.StringTune.getInstance();
//         (window as any).StringTuneContext = st;
//         st.use(ST.StringLazy);
//         st.use(ST.StringProgress);
//         st.start(0);
//       };
//       document.head.appendChild(s);
//     }
//   }, []);

//   return (
//     <>
//       <style>{`
//         @property --progress {
//           syntax: '<number>';
//           inherits: true;
//           initial-value: 0;
//         }

//         @property --spotlight-angle {
//           syntax: '<number>';
//           inherits: true;
//           initial-value: 0;
//         }

//         @property --spotlight-distance {
//           syntax: '<number>';
//           inherits: true;
//           initial-value: 0;
//         }

//         :root {
//           --vh: 1vh;
//           --vw: 1vw;
//           --c-white: #ffffff;
//           --c-black: #000000;
//           --c-black-rgb: 0, 0, 0;
//           --c-grey-dark: #333333;
//           --c-grey-dark-rgba: 51, 51, 51;
//           --c-grey: #999999;
//           --c-red: #FF5A37;

//           --easing-function: cubic-bezier(0.86, 0, 0.31, 1);
//           --easing-function-2: cubic-bezier(0.35, 0.35, 0, 1);
//           --easing-timing: 1.5s;

//           --g-gap: 0.4rem;
//           --g-margin: calc(var(--g-gap) * 2);

//           --mm: 0.64rem;
//           --m: 0.8rem;
//           --p: 1rem;
//           --h6: 1.25rem;
//           --h5: 1.563rem;
//           --h4: 1.953rem;
//           --h3: 2.441rem;
//           --h2: 3.052rem;
//           --h1: 3.815rem;
//           --h0: 5.065rem;
//           --large: max(6.331rem, 18vw);
//         }

//         @media (min-width: 1024px) {
//           :root { --g-margin: calc(var(--g-gap) * 4); }
//         }

//         .spr-note {
//           color: var(--c-white);
//         }

//         .-w {
//           display: grid;
//           grid-template-columns: repeat(14, 1fr);
//           grid-template-rows: repeat(2, 1fr);
//           align-items: start;
//           column-gap: var(--g-gap);
//           position: relative;
//           min-height: 1024px;
//           margin-left: var(--g-margin);
//           margin-right: var(--g-margin);
//         }

//         .-w p {
//           grid-column-start: 3;
//           grid-column-end: 13;
//           grid-row-start: 1;
//           justify-self: center;
//           align-self: start;
//           text-align: center;
//           z-index: 40;
//           margin-top: calc(var(--h1) * 2);
//           padding-left: 10%;
//           padding-right: 10%;
//         }

//         @media (min-width: 1024px) {
//           .-w p {
//             grid-column-start: 6;
//             grid-column-end: 10;
//           }
//         }

//         .-w .image-1 {
//           grid-column-start: 1;
//           grid-column-end: 15;
//           grid-row-start: 1;
//           align-self: center;
//           height: calc(var(--vh, 1vh) * 40);
//           position: sticky;
//           top: calc(var(--vh, 1vh) * 30);
//           margin-bottom: calc(var(--vh, 1vh) * 30);
//           scale: calc(0.5 + var(--progress) * 0.5);
//           clip-path: rect(
//             calc(20% - var(--progress) * 20%)
//             calc(90% + var(--progress) * 10%)
//             calc(80% + var(--progress) * 20%)
//             calc(10% - var(--progress) * 10%)
//             round calc(var(--h3) - var(--progress) * var(--h3))
//           );
//           transform: translateZ(0);
//         }

//         @media (min-width: 1024px) {
//           .-w .image-1 {
//             grid-column-start: 3;
//             grid-column-end: 13;
//             top: calc(var(--vh, 1vh) * 15);
//             margin-bottom: calc(var(--vh, 1vh) * 15);
//             height: calc(var(--vh, 1vh) * 70);
//             clip-path: rect(
//               calc(20% - var(--progress) * 20%)
//               calc(70% + var(--progress) * 30%)
//               calc(80% + var(--progress) * 20%)
//               calc(30% - var(--progress) * 30%)
//               round calc(var(--h3) - var(--progress) * var(--h3))
//             );
//           }
//         }

//         .-w .image-1 img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }

//         .-w span.line {
//           grid-column-start: 1;
//           grid-column-end: 15;
//           grid-row-start: 1;
//           align-self: center;
//           position: relative;
//           display: block;
//           height: 1px;
//           background-color: var(--c-grey-dark);
//           margin-top: calc(var(--vh, 1vh) * 30);
//           opacity: 0.4;
//         }

//         @media (min-width: 1024px) {
//           .-w span.line {
//             margin-top: calc(var(--vh, 1vh) * 15);
//           }
//         }

//         .-w .title {
//           grid-column-start: 1;
//           grid-column-end: 15;
//           grid-row-start: 1;
//           align-self: end;
//           text-align: center;
//           position: relative;
//         }
//       `}</style>

//       <div className="-w" ref={wrapRef}>
//         {/* <p className="spr-note">
//           Drawing was a language of thought — a way to understand motion, balance, and harmony.
//         </p> */}
//         <figure className="image-1">
//           <img
//             string="lazy"
//             string-lazy="https://picsum.photos/707/549"
//             alt="StringTune"
//           />
//         </figure>
//         {/* <span className="line" /> */}
//         <h1 className="title -h0 -mid-h2 -m-h3" aria-hidden="true">Balance</h1>
//       </div>
//     </>
//   );
// }