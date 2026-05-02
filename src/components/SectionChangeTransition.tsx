import BasicNavigationBar from "./nav/navBar";

export default function SectionChangeTransition() {
    return (
        <>
        <div className="transitionContainer">
            <div className="transition-row row-1">
                <div className="block"></div>
                <div className="block"></div>
                <div className="block"></div>
                <div className="block"></div>
                <div className="block"></div>
            </div>

            <div className="transition-row row-2">
                <div className="block"></div>
                <div className="block"></div>
                <div className="block"></div>
                <div className="block"></div>
                <div className="block"></div>
            </div>
        </div>

        <BasicNavigationBar />
        </>
    )
}