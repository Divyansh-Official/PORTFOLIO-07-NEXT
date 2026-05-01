import FluidCursorTrail from "../components/cursor/fluidCursor/FluidCursorTrail";
import BasicNavigationBar from "../components/nav/navBar";
import info from "../data/information.json";

export default function Hero() {
  return (
    <section className="hero">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

        *, *::before, *::after {
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }

        h1 {
          font-family: "Inter", sans-serif;
          text-transform: uppercase;
          font-size: clamp(5rem, 18vw, 15rem);
          line-height: 0.9;
          letter-spacing: -0.04em;
          font-weight: 900;
        }

        .hero {
          width: 100%;
          height: 100svh;
          // padding: 2rem;
          // background-color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hero .header {
          display: flex;
          flex-direction: column;
        }

        .hero h1:nth-child(2) { align-self: flex-end; }
        .hero h1:nth-child(3) { align-self: center; }

        @media (max-width: 1000px) {
          .hero h1 {
            text-align: center;
            align-self: center !important;
          }
        }
      `}
      </style>

      <BasicNavigationBar />

      <div className="header">
        <h1>{info.creativeSlogan01}</h1>
        <h1>{info.creativeSlogan02}</h1>
        <h1>{info.creativeSlogan03}</h1>
      </div>

      <FluidCursorTrail />
    </section>
  );
}





// import FluidCursorTrail from "../components/cursor/fluidCursor/FluidCursorTrail";
// import info from "../data/information.json";

// export default function Hero() {
//   return (
//     <section className="hero">
//       <style>{`
//         @import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

//         *, *::before, *::after {
//           padding: 0;
//           margin: 0;
//           box-sizing: border-box;
//         }

//         h1 {
//           font-family: "Inter", sans-serif;
//           text-transform: uppercase;
//           font-size: clamp(3rem, 10vw, 15rem);
//           line-height: 0.9;
//           letter-spacing: -0.04em;
//           font-weight: 900;
//         }

//         .hero {
//           width: 100%;
//           height: 100svh;
//           padding: 2rem;
//           background-color: #ffffff;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           overflow: hidden;
//           position: relative;
//         }

//         .hero .header {
//           display: flex;
//           flex-direction: column;
//         }

//         .hero h1:nth-child(2) { align-self: flex-end; }
//         .hero h1:nth-child(3) { align-self: center; }

//         @media (max-width: 1000px) {
//           .hero h1 {
//             text-align: center;
//             align-self: center !important;
//           }
//         }
//       `}</style>

//       <div className="header">
//         <h1>{info.creativeSlogan01}</h1>
//         <h1>{info.creativeSlogan02}</h1>
//         <h1>{info.creativeSlogan03}</h1>
//       </div>

//       <FluidCursorTrail />
//     </section>
//   );
// }





// import FluidCursorTrail from "../components/cursor/fluidCursor/FluidCursorTrail";
// import BasicNavigationBar from "../components/nav/navBar";
// import info from "../data/information.json";

// export default function Hero() {
//   return (
//     <section className="hero">
//       <style>{`
//         @import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

//         *, *::before, *::after {
//           padding: 0;
//           margin: 0;
//           box-sizing: border-box;
//         }

//         h1 {
//           font-family: "Inter", sans-serif;
//           text-transform: uppercase;
//           font-size: clamp(3rem, 10vw, 15rem);
//           line-height: 0.9;
//           letter-spacing: -0.04em;
//           font-weight: 900;
//         }

//         .hero {
//           width: 100%;
//           height: 100svh;
//           padding: 2rem;
//           background-color: #ffffff;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           overflow: hidden;
//           position: relative;
//         }

//         .hero .header {
//           display: flex;
//           flex-direction: column;
//           position: relative;
//           z-index: 2;
//         }

//         .hero h1:nth-child(2) { align-self: flex-end; }
//         .hero h1:nth-child(3) { align-self: center; }

//         @media (max-width: 1000px) {
//           .hero h1 {
//             text-align: center;
//             align-self: center !important;
//           }
//         }
//       `}
//       </style>

//       <BasicNavigationBar />

//       <div className="header">
//         <h1>{info.creativeSlogan01}</h1>
//         <h1>{info.creativeSlogan02}</h1>
//         <h1>{info.creativeSlogan03}</h1>
//       </div>

//       <FluidCursorTrail />
//     </section>
//   );
// }





// import info from '../data/information.json';

// export default function Hero() {
//   return (
//     <section className="hero w-full h-screen relative overflow-hidden">

//       <style>
//         {`

//         @import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

//         * {
//           padding: 0;
//           box-sizing: border-box;
//           margin: 0; }

//         h1 {
//           text-transform: uppercase;
//           font-size: clamp(3rem, 10vw, 15rem);
//           line-height: 0.9;
//           letter-spacing: -4%;
//           font-weight: 900; 
//           font-family: "Inter"; }

//         .hero {
//           width: 100%;
//           height: 100svh;
//           padding: 2rem;
//           background-color: #ffffff;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           overflow: hidden;
//           position: relative; }

//         .hero .header {
//           flex-direction: column;
//           display: flex; }

//         .hero h1:nth-child(2) {
//           align-self: flex-end; }
        
//         .hero h1:nth-child(3) {
//           align-self: center; }

//         @media (max-width: 1000px) {
//           .hero h1 {
//           text-align: center;
//           align-self: center !important; }
//         }
        
//         `}
//       </style>

//       <section className="hero">
//         <div className="header">
//         <h1>{info.creativeSlogan01}</h1>
//         <h1>{info.creativeSlogan02}</h1>
//         <h1>{info.creativeSlogan03}</h1>
//       </div>
//       </section>

//     </section>
//   );
// }