// src/pages/Landing.tsx
//import { useEffect } from 'react';

console.log("⚡ USANDO CÓDIGO ACTUALIZADO ⚡");


const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

const Landing = () => {
  const handleLogin = () => {

    window.location.href = `${API_BASE}/oauth/login?project_id=yeka`;
   
  };
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-white px-6 py-12">
      {/* Text Left */}
      <div className="md:w-1/2 text-center md:text-left space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Your ideas, synced.<br />With Yeka.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-md mx-auto md:mx-0">
          ChatGPT meets Google Drive. Brainstorm, organize and store — instantly. 
        </p>
        <button
          onClick={handleLogin}
          className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg"
        >
          Start with Google Drive
        </button>
      </div>

      {/* Illustration Right */}
      <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
        <img
          src={`${import.meta.env.BASE_URL}ideas-yeka.png`}
          alt="Yeka demo"
          className="max-w-xs md:max-w-md"
        />
      </div>
    </div>
  );
};

export default Landing;
