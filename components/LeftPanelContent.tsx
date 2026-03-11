"use client";
import React from "react";

interface LeftPanelContentProps {
  step: number;
}

const CONTENT = [
  {
    heading: (
      <>
        <span className="text-orange-400">Become an</span>{" "}
        <span className="text-gray-800">Affiliate</span>{" "}
        <span className="text-gray-800">Marketer</span>
      </>
    ),
    body: "with high-converting affiliate offers, reliable tracking & on-time payments",
  },
  {
    heading: (
      <>
        <span className="text-orange-400">Become an</span>{" "}
        <span className="text-gray-800">Affiliate</span>{" "}
        <span className="text-gray-800">Marketer</span>
      </>
    ),
    body: "with high-converting affiliate offers, reliable tracking & on-time payments",
  },
  {
    heading: (
      <>
        <span className="text-orange-400">Multiply</span>{" "}
        <span className="text-gray-800">your</span>{" "}
        <span className="text-gray-800">Earnings</span>
      </>
    ),
    body: "We are giving you the opportunity to do less and earn more",
  },
  {
    heading: (
      <>
        <span className="text-orange-400">Multiply</span>{" "}
        <span className="text-gray-800">your</span>{" "}
        <span className="text-gray-800">Earnings</span>
      </>
    ),
    body: "We are giving you the opportunity to do less and earn more",
  },
  {
    heading: (
      <>
        <span className="text-orange-400">Join</span>{" "}
        <span className="text-gray-800">the winning</span>{" "}
        <span className="text-gray-800">team</span>
      </>
    ),
    body: "We are giving you the opportunity to do less and earn more",
  },
];

export default function LeftPanelContent({ step }: LeftPanelContentProps) {
  const content = CONTENT[Math.min(step - 1, CONTENT.length - 1)];
  return (
    <div className="relative z-10 p-8 flex flex-col justify-center h-full">
      <h1 className="text-4xl font-bold leading-tight mb-3">{content.heading}</h1>
      <p className="text-gray-600 text-base leading-relaxed">{content.body}</p>
    </div>
  );
}