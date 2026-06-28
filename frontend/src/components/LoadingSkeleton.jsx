import React from 'react';

export const CardSkeleton = () => (
  <div className="glassmorphism p-6 rounded-2xl animate-pulse flex flex-col gap-3">
    <div className="h-6 w-1/3 bg-slate-700/50 rounded-md"></div>
    <div className="h-10 w-2/3 bg-slate-700/50 rounded-md"></div>
    <div className="h-4 w-1/2 bg-slate-700/50 rounded-md mt-2"></div>
  </div>
);

export const ListSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    {[1, 2, 3].map((n) => (
      <div key={n} className="flex items-center justify-between p-4 glassmorphism rounded-xl">
        <div className="flex flex-col gap-2 w-1/2">
          <div className="h-5 w-3/4 bg-slate-700/50 rounded"></div>
          <div className="h-3 w-1/2 bg-slate-700/50 rounded"></div>
        </div>
        <div className="h-8 w-20 bg-slate-700/50 rounded-lg"></div>
      </div>
    ))}
  </div>
);

export const ChatSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse p-4">
    <div className="flex items-start gap-3 max-w-[70%]">
      <div className="h-8 w-8 rounded-full bg-slate-700/50 flex-shrink-0"></div>
      <div className="flex flex-col gap-2 w-full">
        <div className="h-4 bg-slate-700/50 rounded w-full"></div>
        <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
      </div>
    </div>
    <div className="flex items-start gap-3 max-w-[70%] self-end flex-row-reverse">
      <div className="h-8 w-8 rounded-full bg-slate-700/50 flex-shrink-0"></div>
      <div className="flex flex-col gap-2 w-full items-end">
        <div className="h-4 bg-slate-700/50 rounded w-full"></div>
        <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
      </div>
    </div>
    <div className="flex items-start gap-3 max-w-[70%]">
      <div className="h-8 w-8 rounded-full bg-slate-700/50 flex-shrink-0"></div>
      <div className="flex flex-col gap-2 w-full">
        <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

const LoadingSkeleton = {
  Card: CardSkeleton,
  List: ListSkeleton,
  Chat: ChatSkeleton
};

export default LoadingSkeleton;
