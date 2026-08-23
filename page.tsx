"use client";

import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import { cityLandmarks } from "./data/cityLandmarks";

export default function Home() {
  const [city, setCity] = useState("");
  const [inputCity, setInputCity] = useState("");
  const [description, setDescription] = useState("");
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [windSpeed, setWindSpeed] = useState(0); 
  const [videoUrl, setVideoUrl] = useState("");
  //console.log(process.env.NEXT_PUBLIC_PEXELS_API_KEY);

async function getVideoFromPexels(searchQuery: string) {
  console.log("Pexels Search:", searchQuery);

  const response = await fetch(
    `https://api.pexels.com/videos/search?query=${searchQuery}landmark&per_page=15`,
    {
      headers: {
        Authorization:
          process.env.NEXT_PUBLIC_PEXELS_API_KEY!,
      },
    }
  );

  const data = await response.json();
  console.log("Pexels videos found:", data.videos?.length);
  const horizontalVideo = data.videos?.find(
    (video: any) => video.width > video.height
  );

  if (!horizontalVideo) {
    return null;
  }

  const highestQuality = horizontalVideo.video_files.reduce(
    (best: any, current: any) =>
      current.width > best.width ? current : best
  );

  return highestQuality.link;
}

useEffect(() => {
  // Don't fetch weather when the website is opened
  // and no city has been searched yet.
  if (!city) return;

  async function fetchWeather() {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );

      const data = await response.json();

      // If the city doesn't exist
      if (!data.main) {
        alert("City not found");
        return;
      }

      // Get landmark for the searched city
      const landmark =
        cityLandmarks[city.toLowerCase()] || city;

      console.log("Landmark:", landmark);

      // Clear previous video while loading the new one
      setVideoUrl("");

      // Get a new video from Pexels
      const video = await getVideoFromPexels(landmark);

      console.log("Video URL:", video);

      // Update weather details
      setTemperature(data.main.temp);
      setHumidity(data.main.humidity);
      setWindSpeed(data.wind.speed);
      setDescription(data.weather[0].description);

      // Update background video
      if (video) {
        setVideoUrl(video);
      }

    } catch (error) {
      console.error("Error fetching weather:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  fetchWeather();

}, [city]);

  return (
  <main className="relative h-screen w-screen overflow-hidden">
   {videoUrl ? (
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src={videoUrl} type="video/mp4" />
  </video>
) : (
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage:
        "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb')",
    }}
  />
)}

<div className="absolute inset-0 bg-black/40" />
<div className="relative z-10 flex flex-col items-center mt-10">
  <h1 className="text-4xl font-bold text-white mb-6">
  Weather Dashboard
  </h1>

  <SearchBar
  city={inputCity}
  setCity={(value) =>
    setInputCity(
      value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    )
  }
  onSearch={() =>
    setCity(
      inputCity.charAt(0).toUpperCase() +
      inputCity.slice(1).toLowerCase()
    )
  }
/>
</div>
<div className="absolute z-10 bottom-8 right-8">
  {city && (
  <WeatherCard
    city={city}
    temperature={temperature}
    humidity={humidity}
    windSpeed={windSpeed}
    description={description}
  />
)}
</div>
</main>
);
}