import Banner from "@/components/well-being/banner";
import Health from "@/components/well-being/Health";
import Wrapper from "@/layout/Wrapper";
import React from "react";

export default function BlankPage() {
  return (
    <>
    <Banner />
    <Health />
   { /*
     <Wrapper>
        <div className="w-96 h-96 border-2 border-gray-200 dark:border-gray-700 rounded-3xl py-7 p-6 flex items-start justify-start relative">
          <div className="py-1 px-4 font-medium absolute -top-4 left-7 bg-yellow-200 text-yellow-600 rounded-full text-sm">💡 TIP</div>
            <h1 className="text-2xl font-semibold dark:text-white">Does your back hurts?</h1>
        </div>
    </Wrapper>
    */ } 
    </>
  );
}
