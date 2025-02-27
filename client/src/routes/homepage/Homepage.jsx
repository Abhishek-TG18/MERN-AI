import { Link } from "react-router-dom";
import "./homepage.css";
import { TypeAnimation } from "react-type-animation";
import { useState } from "react";


const Homepage = () => {
  const [typingStatus, setTypingStatus] = useState("human1");

  return (
   
   
    <div className="homepage">
      <img src="/orbital.png" alt="" className="orbital" />
      <div className="left">
        <h1>MERN AI</h1>
        <h2>Supercharge your creativity and productivity</h2>
        <h3>
        MERN AI combines the power of the MERN stack with AI capabilities to build smart applications. It uses AI to enhance user experiences and automation within web apps.
        </h3>
        <div className="link">
        <Link to="/dashboard">Explore AI Intellligence</Link>
        <Link to="/genimg">Inspire with AI image</Link>
        </div>
       
      </div>
      <div className="right">
        <div className="imgContainer">
          <div className="bgContainer">
            <div className="bg"></div>
          </div>
          <img src="/bot.png" alt="" className="bot" />
          <div className="chat">
            <img
              src={
                typingStatus === "human1"
                  ? "/human1.jpeg"
                  : typingStatus === "human2"
                  ? "/human2.jpeg"
                  : "bot.png"
              }
              alt=""
            />
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                "Human:We produce food for Mice",
                2000,
                () => {
                  setTypingStatus("bot");
                },
                "Bot:We produce food for Hamsters",
                2000,
                () => {
                  setTypingStatus("human2");
                },
                "Human2:We produce food for Guinea Pigs",
                2000,
                () => {
                  setTypingStatus("bot");
                },
                "Bot:We produce food for Chinchillas",
                2000,
                () => {
                  setTypingStatus("human1");
                },
              ]}
              wrapper="span"
              repeat={Infinity}
              cursor={true}
              omitDeletionAnimation={true}
            />
          </div>
        </div>
      </div>
      
      <div className="terms">
        <img src="/logo.png" alt="" />
        <div className="links">
          <Link to="/">Terms of Service</Link>
          <span>|</span>
          <Link to="/">Privacy Policy</Link>
        </div>
      </div>
      
    </div>

 
   


  );
};

export default Homepage;

