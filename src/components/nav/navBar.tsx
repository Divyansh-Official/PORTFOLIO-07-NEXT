import info from "../../data/information.json";
import icon from "../../data/icons.json";


export default function BasicNavigationBar() {
  return (
    <div className="">

      <style>
        {`

        @media (max-width: 1000px) {
          .nav-links {
          flex-direction: column;
          gap: 0;
          align-items: flex-end; } 
          }

          // .navbar-container {
          // width: 100%;
          // padding-top: 10px;
          // position: relative;
          // z-index: 100;
        }
        
        `}
      </style>

        <nav className="w-full top-0 left-0 p-5 flex justify-between gap-10 z-[2]" style={{position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "2.5rem",
          padding: "1.25rem",}}>
          <div className="nav-logo uppercase"> <a href=""> {info.name} </a> </div>

          <div className="nav-links flex gap-4" style={{backgroundColor: "tranparent", padding: "30px", borderRadius: "15px", backgroundImage: "linear-gradient( 120deg, rgba(101, 11, 14, 1), rgba(101, 11, 14, 1) )" }}>
            <a href="/qualification">Qualification</a>
            <a href="/skills">Skills</a>
            <a href="/projects">Projects</a>
            <a href="/blogs">Blogs</a>
            <a href="/contact">Contact</a>
          </div>

          {/* <div className="">
            <img src={icon.menu} alt="Menu Icon" className="" />
          </div> */}
        </nav>
    </div>
  );
}