// src/components/Page.tsx
import { FC } from "react";
import SmartFarmAdvisorPage from "./driver/SmartfarmAdvisorPage";

const Page: FC = () => {
  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-gray-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="mb-3 bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          🌱 Smart AgroTech Advisor
        </h1>
        <p className="text-lg text-gray-400 sm:text-xl">
          Optimize your farming with AI-powered insights.
        </p>
      </div>
      <SmartFarmAdvisorPage />
    </div>
  );
};

export default Page;
