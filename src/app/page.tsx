import SlideImagesHome from "@/components/home/Slide-images-home";
import Navbar from "@/components/navbar";
import { fetchAllCategory } from "@/services/api";
import { CategoryDetailResponse, CustomApiError } from "@/types/interfaces";
import { Suspense } from "react";

export const revalidate = 10
export default async function Home() {
  const category: CategoryDetailResponse | CustomApiError = await fetchAllCategory(); 
  const activeIconNav: string = 'home'; 
  if ('statusCode' in category) {
    console.error("Error fetching category:", category.message);
    return (
      <div className="w-full flex flex-col items-center min-h-screen overflow-x-hidden">
        <Suspense fallback={<div>Loading...</div>}>
            <Navbar activeIconNav={activeIconNav} />
        </Suspense>
        <main className="flex items-center flex-col">
          <p className="text-red-500">Failed to load categories: {category.message}</p>
        </main>
      </div>
    );
  }
  const imageCategory: string[] = category.data.map(cat => cat.img_category);
  return (
    <div className="w-full flex flex-col items-center min-h-screen overflow-x-hidden">
      <Suspense fallback={<div>Loading...</div>}>
          <Navbar activeIconNav={activeIconNav} />
      </Suspense>
      <main className="flex items-center flex-col" >
        <SlideImagesHome imageCategory={imageCategory} />

        <section className={`flex flex-col lg:flex-row w-full px-[clamp(2rem,10vw,16rem)] py-[6rem] bg-[#93540D] gap-[clamp(1rem,8vw,12rem)]`}>
          <div className={`flex flex-col w-[clamp(10rem,47vw,75rem)] gap-[0.8rem]`}>
            <h2 className={`font-bold !text-[clamp(1rem,2.8vw,4rem)]`}>Connecting Farmers with Smart Solutions</h2>
            <div className={`flex flex-row gap-[clamp(1rem,2.5vw,4rem)]`}>
              <img src={`/sheltercow.webp`} className={`object-cover object-center w-[clamp(10rem,47%,35rem)] h-[clamp(20rem,40vw,50rem)] rounded-[1rem]`} />
              <img src={`cow.webp`} className={`object-cover object-center w-[clamp(10rem,47%,35rem)] rounded-[1rem] h-[clamp(20rem,40vw,50rem)]`} />
            </div>
          </div>
          
          <div className={`w-[clamp(25rem,20vw,45rem)] flex flex-col gap-[clamp(2rem,2.5vw,4rem)]`}>
            <p className={`!text-[clamp(0.8rem,0.7vw,1.5rem)] font-light`}>SmaFarm empowers livestock owners with trusted care solutions and a seamless digital marketplace making livestock management smarter, simpler, and more efficient.</p>
            <div className={`flex flex-col`}>
              <h2 className={`font-bold !text-[clamp(1rem,2.8vw,4rem)]`}>12</h2>
              <h3 className={`font-bold !text-[clamp(1rem,2vw,3rem)]`}>Breeders</h3>
              <p className={`!text-[clamp(0.8rem,0.7vw,1.5rem)] font-light`}>We have registered breeders on our platform who are ready to provide quality care for your livestock.</p>
            </div>

            <div className={`flex flex-col`}>
              <h2 className={`font-bold !text-[clamp(1rem,2.8vw,4rem)]`}>100%</h2>
              <h3 className={`font-bold !text-[clamp(1rem,2vw,3rem)]`}>Customer satisfaction</h3>
              <p className={`!text-[clamp(0.8rem,0.7vw,1.5rem)] font-light`}>We create solutions that breeders trust and realy on.</p>
            </div>

            <div className={`flex flex-col`}>
              <h2 className={`font-bold !text-[clamp(1rem,2.8vw,4rem)]`}>200</h2>
              <h3 className={`font-bold !text-[clamp(1rem,2vw,3rem)]`}>Livestocks</h3>
              <p className={`!text-[clamp(0.8rem,0.7vw,1.5rem)] font-light`}>We offer high-quality livestock for purchase.</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
