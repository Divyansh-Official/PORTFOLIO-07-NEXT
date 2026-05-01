import Hero from "./hero/Hero";
import info from "../data/information.json";
import loader from "../lottieFiles/Loader.json";
import server from "../lottieFiles/Server.json";
import wifi from "../lottieFiles/Wifi.json";
import deadpool from "../lottieFiles/Deadpool.json";
import Lottie from "lottie-react";

export default function SplashScreen() {
  return (
    <div className="">
      <div className="preloader-backdrop"> 
        <div className="pb-row">
          <div className="pb-col">
            <p> {info.creativeFirstName} </p>
            <p> {info.creativeLastName} </p>
          </div>
          <div className="pb-col">
            <p> REBOOTING THE PLATFORM </p>
            <p> .::.:::.::.:::.::. </p>
          </div>
          <div className="pb-col">
            <p> 役割 // {info.creativeRole} </p>
          </div>
          <div className="pb-col">
            <p> COMBINING THE PACKAGES </p>
            <p> //.////..//..///.// </p>
            <p> </p>
          </div>
          <div className="pb-col">
            <p> {info.creativeLocationCity} </p>
            <p> {info.creativeLocationState} </p>
          </div>
        </div>

        <div className="pb-row">
          <div className="pb-col">
              <p> LOADING ASSETS </p>
              <p> DEBUGGING PORTFOLIO </p>
              <p> CREATING THE PAGES </p>
          </div>
          <div className="pb-col">
            <p> {info.creativeFieldsTop} </p>
            <p> {info.creativeFieldsBottom} </p>
          </div>
          <div className="pb-col">
              <p> ESTABLISHING CONNECTION </p>
                <Lottie
                animationData={loader}
                loop={true}
                autoplay={true} />
          </div>
          <div className="pb-col">
            <Lottie
            animationData={server}
            loop={true}
            autoplay={true} />
            <p> FINALIZING THE EXPERIENCE </p>
          </div>
          <div className="pb-col">
            <p> ------------------ </p>
            <p> ------------------ </p>
          </div>
          <div className="pb-col">
            <p> @ Copyright 2026 </p>
            <p> {info.name} </p>
          </div>
        </div>
      </div>

      <div className="preloader">
        <div className="p-row">
          <p> INITIALIZING </p>
        </div>
        <div className="p-row">
          <div className="p-col">
            <div className="p-sub-col">
              <p> GRAPHIC LOADER </p>
              <p> SEQUENCIAL OPTIMISATION </p>
            </div>
            <div className="p-sub-col">
              <p> SIGNAL // SCAN </p>
              <p> INTERNAL LAYERS </p>
            </div>
          </div>
          <div className="p-col">
            <Lottie
            animationData={wifi}
            loop={true}
            autoplay={true} />
          </div>
        </div>

        <div className="preloader-btn-container">
          <Lottie id="pbc-logo"
          animationData={deadpool}
          loop={true}
          autoplay={true} />
          <p id="pbc-label"> ENGAGE </p>
          <p id="pbc-outro-label"> INITIALIZATION COMPLETED </p>

          <div className="pbc-svg-strokes">
            <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="stroke-track" cx="160" cy="160" r="155" stroke="#2b2b2b" strokeWidth="2" strokeDasharray="974" strokeDashoffset="974" />
            <circle className="stroke-progress" cx="160" cy="160" r="155" stroke="#fff" strokeWidth="2" strokeDasharray="974" strokeDashoffset="974" />
            </svg>
          </div>
        </div>
      </div>

      <section> <Hero /> </section>

    </div>
  );
}