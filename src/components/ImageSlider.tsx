import React from "react";

const ImageSlider: React.FC = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/ica-rubrik-black');
        @import url('https://fonts.cdnfonts.com/css/poppins');

        .banner {
          width: 100%;
          height: 100vh;
          text-align: center;
          overflow: hidden;
          position: relative;
        }

        .banner .slider {
          position: absolute;
          width: 200px;
          height: 250px;
          top: 10%;
          left: calc(50% - 100px);
          transform-style: preserve-3d;
          transform: perspective(1000px);
          animation: autoRun 20s linear infinite;
          z-index: 2;
        }

        .banner .slider .item {
          position: absolute;
          inset: 0 0 0 0;
          transform:
            rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg))
            translateZ(550px);
        }

        @keyframes autoRun {
          from {
            transform: perspective(1000px) rotateX(-16deg) rotateY(0deg);
          }
          to {
            transform: perspective(1000px) rotateX(-16deg) rotateY(360deg);
          }
        }

        .banner .slider .item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .banner .content {
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

        .banner .content h1 {
          font-family: ICA Rubrik;
          font-size: 16em;
          line-height: 1em;
          color: #25283B;
          position: relative;
        }

        .banner .content h1::after {
          position: absolute;
          inset: 0 0 0 0;
          content: attr(data-content);
          z-index: 2;
          -webkit-text-stroke: 2px #d2d2d2;
          color: transparent;
        }

        .banner .content .author {
          font-family: Poppins;
          text-align: right;
          max-width: 200px;
        }

        .banner .content h2 {
          font-size: 3em;
        }

        .banner .content .model {
          background-image: url(images/Model.png);
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

      <div className="banner">
        <div className="slider" style={{ "--quantity": 10 } as React.CSSProperties}>
          <div className="item">
            <img
              className="item"
              style={{ "--position": 1 } as React.CSSProperties}
              src="images/QualificationImageSliderImages/1.png"
              alt=""
            />
          </div>
          <div className="item">
            <img
              className="item"
              style={{ "--position": 2 } as React.CSSProperties}
              src="images/QualificationImageSliderImages/2.png"
              alt=""
            />
          </div>
          <div className="item">
            <img
              className="item"
              style={{ "--position": 3 } as React.CSSProperties}
              src="images/QualificationImageSliderImages/3.png"
              alt=""
            />
          </div>
          <div className="item">
            <img
              className="item"
              style={{ "--position": 4 } as React.CSSProperties}
              src="images/QualificationImageSliderImages/4.png"
              alt=""
            />
          </div>
          <div className="item">
            <img
              className="item"
              style={{ "--position": 5 } as React.CSSProperties}
              src="images/QualificationImageSliderImages/5.png"
              alt=""
            />
          </div>
          <div className="item">
            <img
              className="item"
              style={{ "--position": 6 } as React.CSSProperties}
              src="images/QualificationImageSliderImages/6.png"
              alt=""
            />
          </div>
          <div className="item">
            <img
              className="item"
              style={{ "--position": 7 } as React.CSSProperties}
              src="images/QualificationImageSliderImages/7.png"
              alt=""
            />
          </div>
          <div className="item">
            <img
              className="item"
              style={{ "--position": 8 } as React.CSSProperties}
              src="images/QualificationImageSliderImages/7.png"
              alt=""
            />
          </div>
          <div className="item">
            <img
              className="item"
              style={{ "--position": 9 } as React.CSSProperties}
              src="images/QualificationImageSliderImages/7.png"
              alt=""
            />
          </div>
          <div className="item">
            <img
              className="item"
              style={{ "--position": 10 } as React.CSSProperties}
              src="images/QualificationImageSliderImages/7.png"
              alt=""
            />
          </div>
        </div>

        <div className="content">
          <h1 data-content="CHANDIGARH UNIVERSITY">CHANDIGARH UNIVERSITY</h1>
          <div className="author">
            <h2>BE - CSE</h2>
            <p>2022 - 2026</p>
          </div>

          <div className="model"></div>
        </div>
      </div>
    </>
  );
};

export default ImageSlider;