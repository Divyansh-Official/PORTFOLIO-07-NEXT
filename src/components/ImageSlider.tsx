import React from "react";

const QUANTITY = 10;

const images = [
  "/images/QualificationImageSliderImages/1.png",
  "/images/QualificationImageSliderImages/2.png",
  "/images/QualificationImageSliderImages/3.png",
  "/images/QualificationImageSliderImages/4.png",
  "/images/QualificationImageSliderImages/5.png",
  "/images/QualificationImageSliderImages/6.png",
  "/images/QualificationImageSliderImages/7.png",
  "/images/QualificationImageSliderImages/7.png",
  "/images/QualificationImageSliderImages/7.png",
  "/images/QualificationImageSliderImages/7.png",
];

const ImageSlider: React.FC = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/ica-rubrik-black');
        @import url('https://fonts.cdnfonts.com/css/poppins');

        .is-banner {
          width: 100%;
          height: 100vh;
          text-align: center;
          overflow: hidden;
          position: relative;
        }

        .is-banner .is-slider {
          position: absolute;
          width: 200px;
          height: 250px;
          top: 10%;
          left: calc(50% - 100px);
          transform-style: preserve-3d;
          transform: perspective(1000px);
          animation: isAutoRun 20s linear infinite;
          z-index: 2;
        }

        .is-banner .is-slider .is-item {
          position: absolute;
          inset: 0 0 0 0;
          transform:
            rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg))
            translateZ(550px);
        }

        @keyframes isAutoRun {
          from {
            transform: perspective(1000px) rotateX(-16deg) rotateY(0deg);
          }
          to {
            transform: perspective(1000px) rotateX(-16deg) rotateY(360deg);
          }
        }

        .is-banner .is-slider .is-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
        }

        .is-banner .is-content {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: min(1400px, 100vw);
          height: max-content;
          padding-bottom: 100px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          z-index: 1;
        }

        .is-banner .is-content h1 {
          font-family: 'ICA Rubrik', sans-serif;
          font-size: 16em;
          line-height: 1em;
        //   color: #25283B;
        color: #713d46;
          position: relative;
        }

        .is-banner .is-content h1::after {
          position: absolute;
          inset: 0 0 0 0;
          content: attr(data-content);
          z-index: 2;
          -webkit-text-stroke: 2px #d2d2d2;
          color: transparent;
        }

        .is-banner .is-content .is-author {
          font-family: 'Poppins', sans-serif;
          text-align: right;
          max-width: 200px;
        }

        .is-banner .is-content h2 {
          font-size: 3em;
        }

        .is-banner .is-content .is-model {
          background-image: url('/images/Model.png');
          width: 100%;
          height: 75vh;
          position: absolute;
          bottom: 0;
          left: 0;
          background-size: auto 130%;
          background-repeat: no-repeat;
          background-position: top center;
          z-index: 1;
        }
      `}</style>

      <div className="is-banner bg-[#2E0D13]">
        <div
          className="is-slider"
          style={{ "--quantity": QUANTITY } as React.CSSProperties}
        >
          {images.map((src, index) => (
            <div
              className="is-item"
              key={index}
              style={{ "--position": index + 1 } as React.CSSProperties}
            >
              <img src={src} alt="" />
            </div>
          ))}
        </div>

        <div className="is-content">
          <h1 data-content="CHANDIGARH UNIVERSITY">CHANDIGARH UNIVERSITY</h1>
          <div className="is-author">
            <h2>BE - CSE</h2>
            <p>2022 - 2026</p>
          </div>

          <div className="is-model"></div>
        </div>
      </div>
    </>
  );
};

export default ImageSlider;