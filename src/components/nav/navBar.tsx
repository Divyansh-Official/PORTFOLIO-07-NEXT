import info from "../../data/information.json";
import icon from "../../data/icons.json";


export default function BasicNavigationBar() {
  return (
    <div className="">
        <nav className="w-full top-0 left-0 p-5 flex justify-between gap-10 z-[2]">
          <div className="nav-logo"> <a href=""> {info.name} </a> </div>

          <div className="nav-links flex gap-4">
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