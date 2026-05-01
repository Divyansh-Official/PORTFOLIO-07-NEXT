import BasicNavigationBar from "../../nav/navBar";

export default function Hero() {
  return (
    <>
    <style>
      {`

      @import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

      * {
      padding: 0;
      box-sizing: border-box;
      margin: 0; }

      // h1 {
      //   font-family: "Inter";
      //   text-transform: uppercase;
      //   font-size: clamp(3rem, 10vw, 15rem);
      //   line-height: 0.9;
      //   letter-spacing: -4%;
      //   font-weight: 900; }
        
        a {
          text-decoration: none;
          text-transform: uppercase;
          font-family: "DM Mono";
          font-size: 0.85rem;
          font-weight: 500;
          color: #000;
          display: inline-block; }

        #fluid {
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 100;
          mix-blend-mode: difference;
          position: fixed; }

        // @media (max-width: 1000px) {
        //   .nav-links {
        //   flex-direction: column;
        //   gap: 0;
        //   align-items: flex-end; } 

        // .hero h1 {
        //   text-align: center;
        //   align-self: center !important; }
        // }

        





      `}
    </style>

    <div className="nav" > <BasicNavigationBar /> </div>
    <div className="hero"> <Hero /> </div>

    <canvas className="fluid" />
    
    </>
)};